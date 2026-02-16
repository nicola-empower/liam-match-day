/**
 * =====================================================
 * LIAM'S APP - Google Sheets Backend
 * =====================================================
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to https://script.google.com
 * 2. Create a new project called "Liam's App Backend"
 * 3. Paste this entire file into Code.gs
 * 4. Click Deploy > New Deployment
 * 5. Type: Web App
 * 6. Execute as: Me
 * 7. Who has access: Anyone
 * 8. Click Deploy and copy the Web App URL
 * 9. Paste the URL into the .env file as VITE_SYNC_URL
 * 
 * The script will auto-create the spreadsheet on first run.
 * =====================================================
 */

// ========== CONFIG ==========
const SPREADSHEET_NAME = "Liam's App Data";
const PROPS = PropertiesService.getScriptProperties();

// ========== SHEET SETUP ==========

function getOrCreateSpreadsheet() {
  let ssId = PROPS.getProperty('SHEET_ID');
  
  if (ssId) {
    try {
      return SpreadsheetApp.openById(ssId);
    } catch (e) {
      // Sheet was deleted, create a new one
      Logger.log('Sheet not found, creating new one...');
    }
  }
  
  // Create new spreadsheet
  const ss = SpreadsheetApp.create(SPREADSHEET_NAME);
  PROPS.setProperty('SHEET_ID', ss.getId());
  
  // Create sheets
  setupSheets(ss);
  
  Logger.log('Created spreadsheet: ' + ss.getUrl());
  return ss;
}

function setupSheets(ss) {
  // Rename default Sheet1
  const defaultSheet = ss.getSheets()[0];
  defaultSheet.setName('DailyTasks');
  defaultSheet.appendRow(['date', 'taskId', 'title', 'completed', 'points', 'timeOfDay', 'emoji', 'colorClass', 'category']);
  defaultSheet.setFrozenRows(1);
  defaultSheet.getRange('1:1').setFontWeight('bold');
  
  // Seizure Log
  const seizureSheet = ss.insertSheet('SeizureLog');
  seizureSheet.appendRow(['date', 'count']);
  seizureSheet.setFrozenRows(1);
  seizureSheet.getRange('1:1').setFontWeight('bold');
  
  // Points History
  const historySheet = ss.insertSheet('PointsHistory');
  historySheet.appendRow(['date', 'totalPoints']);
  historySheet.setFrozenRows(1);
  historySheet.getRange('1:1').setFontWeight('bold');
  
  // Calendar Events (populated by sync)
  const calendarSheet = ss.insertSheet('CalendarEvents');
  calendarSheet.appendRow(['date', 'title', 'startTime', 'endTime', 'location', 'description']);
  calendarSheet.setFrozenRows(1);
  calendarSheet.getRange('1:1').setFontWeight('bold');
  
  // Config sheet for metadata
  const configSheet = ss.insertSheet('Config');
  configSheet.appendRow(['key', 'value']);
  configSheet.appendRow(['lastSync', new Date().toISOString()]);
  configSheet.appendRow(['appVersion', '1.0']);
  configSheet.setFrozenRows(1);
  configSheet.getRange('1:1').setFontWeight('bold');
}

// ========== WEB APP HANDLERS ==========

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || 'getAll';
    let result;
    
    switch (action) {
      case 'getAll':
        result = getAllData();
        break;
      case 'getTasks':
        result = getTodaysTasks();
        break;
      case 'getCalendar':
        result = getCalendarEvents();
        break;
      case 'getSeizures':
        result = getSeizureHistory();
        break;
      case 'getHistory':
        result = getPointsHistory();
        break;
      default:
        result = getAllData();
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, data: result }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    let result;
    
    switch (action) {
      case 'syncAll':
        result = syncAllData(payload.data);
        break;
      case 'completeTask':
        result = updateTaskCompletion(payload.taskId, true, payload.date);
        break;
      case 'uncompleteTask':
        result = updateTaskCompletion(payload.taskId, false, payload.date);
        break;
      case 'logSeizure':
        result = updateSeizureCount(payload.date, payload.count);
        break;
      case 'savePoints':
        result = savePointsHistory(payload.date, payload.points);
        break;
      default:
        result = { message: 'Unknown action: ' + action };
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, data: result }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ========== DATA OPERATIONS ==========

function getAllData() {
  const tasks = getTodaysTasks();
  const seizures = getSeizureHistory();
  const history = getPointsHistory();
  const calendar = getCalendarEvents();
  
  return {
    tasks: tasks,
    seizureHistory: seizures,
    pointsHistory: history,
    calendarEvents: calendar,
    lastSync: new Date().toISOString()
  };
}

// ----- TASKS -----

function getTodaysTasks() {
  const ss = getOrCreateSpreadsheet();
  const sheet = ss.getSheetByName('DailyTasks');
  const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const todaysTasks = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === today) {
      const task = {};
      headers.forEach((h, idx) => { task[h] = data[i][idx]; });
      todaysTasks.push(task);
    }
  }
  
  return todaysTasks;
}

function syncAllData(appState) {
  const ss = getOrCreateSpreadsheet();
  const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  
  // Sync tasks
  if (appState.tasks) {
    const taskSheet = ss.getSheetByName('DailyTasks');
    
    // Clear today's rows first
    clearTodaysRows(taskSheet, today);
    
    // Write all tasks for today
    appState.tasks.forEach(function(task) {
      taskSheet.appendRow([
        today,
        task.id,
        task.title,
        task.completed || false,
        task.points || 0,
        task.timeOfDay || 'anytime',
        task.emoji || '',
        task.colorClass || '',
        task.category || 'other'
      ]);
    });
  }
  
  // Sync seizure data
  if (appState.seizureHistory) {
    const seizureSheet = ss.getSheetByName('SeizureLog');
    appState.seizureHistory.forEach(function(entry) {
      updateOrAppendRow(seizureSheet, entry.date, [entry.date, entry.count]);
    });
  }
  
  // Save points history
  if (appState.points !== undefined) {
    const historySheet = ss.getSheetByName('PointsHistory');
    updateOrAppendRow(historySheet, today, [today, appState.points]);
  }
  
  // Update last sync time
  const configSheet = ss.getSheetByName('Config');
  updateOrAppendRow(configSheet, 'lastSync', ['lastSync', new Date().toISOString()]);
  
  return { synced: true, timestamp: new Date().toISOString() };
}

function updateTaskCompletion(taskId, completed, date) {
  const ss = getOrCreateSpreadsheet();
  const sheet = ss.getSheetByName('DailyTasks');
  const targetDate = date || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === targetDate && data[i][1] === taskId) {
      sheet.getRange(i + 1, 4).setValue(completed); // Column D = completed
      return { taskId: taskId, completed: completed };
    }
  }
  
  return { taskId: taskId, message: 'Task not found for today' };
}

// ----- SEIZURES -----

function getSeizureHistory() {
  const ss = getOrCreateSpreadsheet();
  const sheet = ss.getSheetByName('SeizureLog');
  const data = sheet.getDataRange().getValues();
  const history = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) {
      history.push({
        date: Utilities.formatDate(new Date(data[i][0]), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
        count: data[i][1] || 0
      });
    }
  }
  
  return history;
}

function updateSeizureCount(date, count) {
  const ss = getOrCreateSpreadsheet();
  const sheet = ss.getSheetByName('SeizureLog');
  updateOrAppendRow(sheet, date, [date, count]);
  return { date: date, count: count };
}

// ----- POINTS HISTORY -----

function getPointsHistory() {
  const ss = getOrCreateSpreadsheet();
  const sheet = ss.getSheetByName('PointsHistory');
  const data = sheet.getDataRange().getValues();
  const history = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) {
      history.push({
        date: Utilities.formatDate(new Date(data[i][0]), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
        points: data[i][1] || 0
      });
    }
  }
  
  return history;
}

function savePointsHistory(date, points) {
  const ss = getOrCreateSpreadsheet();
  const sheet = ss.getSheetByName('PointsHistory');
  updateOrAppendRow(sheet, date, [date, points]);
  return { date: date, points: points };
}

// ----- CALENDAR -----

function getCalendarEvents() {
  try {
    const now = new Date();
    const twoWeeksLater = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    
    const calendar = CalendarApp.getDefaultCalendar();
    const events = calendar.getEvents(now, twoWeeksLater);
    
    const eventList = events.map(function(event) {
      return {
        title: event.getTitle(),
        date: Utilities.formatDate(event.getStartTime(), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
        startTime: Utilities.formatDate(event.getStartTime(), Session.getScriptTimeZone(), 'HH:mm'),
        endTime: Utilities.formatDate(event.getEndTime(), Session.getScriptTimeZone(), 'HH:mm'),
        location: event.getLocation() || '',
        description: event.getDescription() || '',
        isAllDay: event.isAllDayEvent()
      };
    });
    
    // Also write to sheet for reference
    const ss = getOrCreateSpreadsheet();
    const sheet = ss.getSheetByName('CalendarEvents');
    
    // Clear old data (keep header)
    if (sheet.getLastRow() > 1) {
      sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clear();
    }
    
    eventList.forEach(function(evt) {
      sheet.appendRow([evt.date, evt.title, evt.startTime, evt.endTime, evt.location, evt.description]);
    });
    
    return eventList;
    
  } catch (error) {
    Logger.log('Calendar error: ' + error);
    return [];
  }
}

// ========== HELPER FUNCTIONS ==========

function clearTodaysRows(sheet, today) {
  const data = sheet.getDataRange().getValues();
  // Delete from bottom up to avoid row shift issues
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][0] === today) {
      sheet.deleteRow(i + 1);
    }
  }
}

function updateOrAppendRow(sheet, keyValue, rowData) {
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    const cellValue = data[i][0];
    // Handle both string and Date comparisons
    const cellStr = (cellValue instanceof Date) 
      ? Utilities.formatDate(cellValue, Session.getScriptTimeZone(), 'yyyy-MM-dd') 
      : String(cellValue);
    
    if (cellStr === String(keyValue)) {
      // Update existing row
      for (let j = 0; j < rowData.length; j++) {
        sheet.getRange(i + 1, j + 1).setValue(rowData[j]);
      }
      return;
    }
  }
  
  // Append new row
  sheet.appendRow(rowData);
}

// ========== MANUAL TRIGGERS ==========

/**
 * Run this once manually to set up the spreadsheet.
 * After running, check the Logs (View > Execution log) for the sheet URL.
 */
function initialSetup() {
  const ss = getOrCreateSpreadsheet();
  Logger.log('✅ Spreadsheet ready: ' + ss.getUrl());
  Logger.log('📋 Sheet ID: ' + ss.getId());
  Logger.log('Now deploy this script as a Web App!');
}

/**
 * Optional: Set up a daily trigger to refresh calendar events.
 */
function createDailyTrigger() {
  ScriptApp.newTrigger('getCalendarEvents')
    .timeBased()
    .everyHours(6)
    .create();
  Logger.log('✅ Calendar refresh trigger created (every 6 hours)');
}
