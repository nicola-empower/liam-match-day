/**
 * Sync Service - Connects PWA to Google Sheets backend via Apps Script
 * 
 * Features:
 * - Push task/seizure state to Google Sheets
 * - Pull saved state and calendar events on app load
 * - Debounced sync to avoid spamming the API
 * - Graceful offline fallback
 */

const SYNC_URL = import.meta.env.VITE_SYNC_URL;

export interface CalendarEvent {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    description: string;
    isAllDay: boolean;
}

interface SyncResponse {
    success: boolean;
    data?: {
        tasks: any[];
        seizureHistory: { date: string; count: number }[];
        pointsHistory: { date: string; points: number }[];
        calendarEvents: CalendarEvent[];
        lastSync: string;
    };
    error?: string;
}

// ========== FETCH FROM SHEET ==========

export async function fetchFromSheet(): Promise<SyncResponse['data'] | null> {
    if (!SYNC_URL) {
        console.warn('[Sync] No VITE_SYNC_URL configured — skipping cloud sync.');
        return null;
    }

    try {
        const response = await fetch(`${SYNC_URL}?action=getAll`, {
            method: 'GET',
            headers: { 'Content-Type': 'text/plain' },
        });

        if (!response.ok) {
            console.error('[Sync] GET failed:', response.status);
            return null;
        }

        const result: SyncResponse = await response.json();

        if (result.success && result.data) {
            console.log('[Sync] ✅ Data pulled from sheet:', {
                tasks: result.data.tasks?.length || 0,
                seizures: result.data.seizureHistory?.length || 0,
                calendar: result.data.calendarEvents?.length || 0,
            });
            return result.data;
        } else {
            console.error('[Sync] API error:', result.error);
            return null;
        }
    } catch (error) {
        console.error('[Sync] Network error (offline?):', error);
        return null;
    }
}

// ========== PUSH TO SHEET ==========

interface AppState {
    tasks: any[];
    points: number;
    seizureHistory: { date: string; count: number }[];
    history: { date: string; points: number }[];
}

export async function pushToSheet(state: AppState): Promise<boolean> {
    if (!SYNC_URL) {
        return false;
    }

    try {
        const response = await fetch(SYNC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({
                action: 'syncAll',
                data: {
                    tasks: state.tasks,
                    points: state.points,
                    seizureHistory: state.seizureHistory,
                    history: state.history,
                },
            }),
        });

        if (!response.ok) {
            console.error('[Sync] POST failed:', response.status);
            return false;
        }

        const result = await response.json();
        if (result.success) {
            console.log('[Sync] ✅ Data pushed to sheet at', result.data?.timestamp);
            return true;
        } else {
            console.error('[Sync] Push error:', result.error);
            return false;
        }
    } catch (error) {
        console.error('[Sync] Push failed (offline?):', error);
        return false;
    }
}

// ========== DEBOUNCED SYNC ==========

let syncTimer: ReturnType<typeof setTimeout> | null = null;

export function debouncedPush(state: AppState, delayMs = 2000): void {
    if (syncTimer) {
        clearTimeout(syncTimer);
    }

    syncTimer = setTimeout(() => {
        pushToSheet(state);
        syncTimer = null;
    }, delayMs);
}

// ========== CALENDAR ONLY ==========

export async function fetchCalendarEvents(): Promise<CalendarEvent[]> {
    if (!SYNC_URL) return [];

    try {
        const response = await fetch(`${SYNC_URL}?action=getCalendar`);
        if (!response.ok) return [];

        const result = await response.json();
        if (result.success && result.data) {
            return result.data;
        }
    } catch (error) {
        console.error('[Sync] Calendar fetch failed:', error);
    }
    return [];
}

// ========== STATUS HELPERS ==========

export function isSyncEnabled(): boolean {
    return !!SYNC_URL;
}
