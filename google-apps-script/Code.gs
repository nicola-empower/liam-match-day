/**
 * =====================================================
 * LIAM'S APP - Google Sheets Backend (v2)
 * =====================================================
 * 
 * CHANGES v2:
 * - Uses client-provided date for sync (fixes timezone issues)
 * - Improved row clearing logic
 * 
 * SETUP:
 * Paste this into Code.gs and Deploy -> New Version
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
      Logger.log('Sheet not found, creating new one...');
    }
  }
  
  const ss = SpreadsheetApp.create(SPREADSHEET_NAME);
  PROPS.setProperty('SHEET_ID', ss.getId());
  setupSheets(ss);
  return ss;
}

function setupSheets(ss) {
  const defaultSheet = ss.getSheets()[0];
  defaultSheet.setName('DailyTasks');
  defaultSheet.appendRow(['date', 'taskId', 'title', 'completed', 'points', 'timeOfDay', 'emoji', 'colorClass', 'category']);
  defaultSheet.setFrozenRows(1);
  defaultSheet.getRange('1:1').setFontWeight('bold');
  
  const seizureSheet = ss.insertSheet('SeizureLog');
  seizureSheet.appendRow(['date', 'count']);
  seizureSheet.setFrozenRows(1);
  
  const historySheet = ss.insertSheet('PointsHistory');
  historySheet.appendRow(['date', 'totalPoints']);
  historySheet.setFrozenRows(1);
  
  const calendarSheet = ss.insertSheet('CalendarEvents');
  calendarSheet.appendRow(['date', 'title', 'startTime', 'endTime', 'location', 'description']);
  calendarSheet.setFrozenRows(1);
  
  const configSheet = ss.insertSheet('Config');
  configSheet.appendRow(['key', 'value']);
  configSheet.setFrozenRows(1);
}

// ========== WEB APP HANDLERS ==========

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || 'getAll';
    let result;
    
    switch (action) {
      case 'getAll': result = getAllData(); break;
      case 'getCalendar': result = getCalendarEvents(); break;
      default: result = getAllData();
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
      case 'syncAll': result = syncAllData(payload.data); break;
      case 'addEvent': result = addCalendarEvent(payload.event); break;
      case 'addRecurring': result = addDailyRecurringEvent(payload.title, payload.timeStr); break;
      default: result = { message: 'Unknown action: ' + action };
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
  // Return last 2 days of tasks to be safe with timezones
  // Client can filter what it needs
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const tasks = [];
  
  // Return everything (client filters) or maybe just recent?
  // Let's return everything for today/yesterday/tomorrow to be safe
  // Actually, returning ALL tasks might be too heavy eventually, but for now it's fine
  // Optimisation: Return last 50 rows?
  const startRow = Math.max(1, data.length - 100);
  
  for (let i = startRow; i < data.length; i++) {
    const task = {};
    headers.forEach((h, idx) => { task[h] = data[i][idx]; });
    tasks.push(task);
  }
  
  return tasks;
}

function syncAllData(appState) {
  const ss = getOrCreateSpreadsheet();
  
  // CRITICAL FIX: Use client date if provided, fallback to server date
  const targetDate = appState.clientDate || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  
  // Sync tasks
  if (appState.tasks) {
    const taskSheet = ss.getSheetByName('DailyTasks');
    
    // Clear rows validation matches TARGET DATE
    clearRowsForDate(taskSheet, targetDate);
    
    // Write tasks with TARGET DATE
    appState.tasks.forEach(function(task) {
      taskSheet.appendRow([
        targetDate, // Use the client's date
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
    updateOrAppendRow(historySheet, targetDate, [targetDate, appState.points]);
  }
  
  return { synced: true, targetDate: targetDate };
}

// ----- HELPERS -----

function clearRowsForDate(sheet, dateStr) {
  const data = sheet.getDataRange().getValues();
  // Delete from bottom up
  for (let i = data.length - 1; i >= 1; i--) {
    // Column 0 is date
    // Check if cell matches dateStr (handle Date objects too)
    const cellValue = data[i][0];
    const cellStr = (cellValue instanceof Date) 
      ? Utilities.formatDate(cellValue, Session.getScriptTimeZone(), 'yyyy-MM-dd') 
      : String(cellValue);
      
    if (cellStr === dateStr) {
      sheet.deleteRow(i + 1);
    }
  }
}

function updateOrAppendRow(sheet, keyValue, rowData) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    const cellValue = data[i][0];
    const cellStr = (cellValue instanceof Date) 
      ? Utilities.formatDate(cellValue, Session.getScriptTimeZone(), 'yyyy-MM-dd') 
      : String(cellValue);
    
    if (cellStr === String(keyValue)) {
      for (let j = 0; j < rowData.length; j++) {
        sheet.getRange(i + 1, j + 1).setValue(rowData[j]);
      }
      return;
    }
  }
  sheet.appendRow(rowData);
}

// ----- OTHER GETTERS -----

function getSeizureHistory() {
  const ss = getOrCreateSpreadsheet();
  return getDataAsObjects(ss.getSheetByName('SeizureLog'));
}

function getPointsHistory() {
  const ss = getOrCreateSpreadsheet();
  return getDataAsObjects(ss.getSheetByName('PointsHistory'));
}

function getDataAsObjects(sheet) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const results = [];
  for (let i = 1; i < data.length; i++) {
    const obj = {};
    headers.forEach((h, idx) => {
       const val = data[i][idx];
       obj[h] = (val instanceof Date) 
         ? Utilities.formatDate(val, Session.getScriptTimeZone(), 'yyyy-MM-dd') 
         : val;
    });
    results.push(obj);
  }
  return results;
}

function getCalendarEvents() {
  try {
    const now = new Date();
    const twoWeeksLater = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const events = CalendarApp.getDefaultCalendar().getEvents(now, twoWeeksLater);
    
    return events.map(function(event) {
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
  } catch (e) {
    return [];
  }
}

function addCalendarEvent(evt) {
  try {
    const cal = CalendarApp.getDefaultCalendar();
    const startTime = new Date(evt.startTime);
    const endTime = new Date(evt.endTime);
    
    const event = cal.createEvent(evt.title, startTime, endTime, {
      description: evt.description,
      location: evt.location
    });
    
    // Add default popup reminder 15 mins before
    event.addPopupReminder(15);
    
    return { id: event.getId(), status: 'created' };
  } catch (e) {
    return { error: e.toString() };
  }
}

function addDailyRecurringEvent(title, timeStr) {
  try {
    const cal = CalendarApp.getDefaultCalendar();
    const recurrence = CalendarApp.newRecurrence().addDailyRule();
    
    // Parse time string "HH:mm"
    const [hours, minutes] = timeStr.split(':');
    const startTime = new Date();
    startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    // If time has passed today, start tomorrow
    if (startTime < new Date()) {
      startTime.setDate(startTime.getDate() + 1);
    }
    
    // 15 minute duration
    const endTime = new Date(startTime.getTime() + 15 * 60 * 1000);
    
    const series = cal.createEventSeries(title, startTime, endTime, recurrence);
    
    // Add default popup reminder 0 mins before (at time of event)
    // Note: Series objects don't support addPopupReminder directly in all API versions, 
    // but we can try. If it fails, the user can set default calendar settings.
    // Actually createEventSeries returns CalendarEventSeries, which DOES NOT have addPopupReminder.
    // We have to rely on user's default settings or just the event existence.
    // Alternatively, we can't easily set reminders on series via Apps Script without advanced API.
    // Let's stick to just creating the event. The phone will see it.
    
    return { id: series.getId(), status: 'created' };
  } catch (e) {
    return { error: e.toString() };
  }
}
