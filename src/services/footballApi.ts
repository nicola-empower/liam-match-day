// API-Football implementation
// Docs: https://www.api-football.com/documentation-v3

export interface Match {
    id: number;
    homeTeam: string;
    awayTeam: string;
    homeScore: number | null;
    awayScore: number | null;
    status: 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED';
    kickoffTime: string; // ISO string
    league: string;
}

const API_KEY = import.meta.env.VITE_API_FOOTBALL_KEY;
const BASE_URL = 'https://v3.football.api-sports.io';

// Team IDs (API-Football)
const TEAMS = {
    CELTIC: 50,
    FALKIRK: 243,
    STENHOUSEMUIR: 254 // Verified/Estimated ID
};

// Types for API Response (Simplified)
interface ApiFixture {
    fixture: {
        id: number;
        date: string;
        status: {
            short: string; // "NS", "1H", "FT"
        };
    };
    teams: {
        home: { name: string; winner: boolean | null };
        away: { name: string; winner: boolean | null };
    };
    goals: {
        home: number | null;
        away: number | null;
    };
    league: {
        name: string;
    };
}
// Extended Types for Match Details
export interface Player {
    id: number;
    name: string;
    number: number;
    pos: string;
    grid?: string;
}

export interface Lineup {
    team: { id: number; name: string; logo: string; colors?: any };
    formation: string;
    startXI: Player[];
    substitutes: Player[];
    coach: { name: string; photo?: string };
}

export interface MatchStats {
    team: { id: number; name: string; logo: string };
    statistics: { type: string; value: any }[];
}

export interface MatchDetails extends Match {
    lineups?: Lineup[];
    stats?: MatchStats[];
    venue?: { name: string; city: string };
    referee?: string;
}

// ... existing imports and consts

export const getUpcomingMatches = async (): Promise<Match[]> => {
    if (!API_KEY) {
        console.warn('[FootballAPI] No API key found, using mock data.');
        return getMockMatches();
    }

    try {
        // Free plan: use season + date range (no "next" param)
        const today = new Date();
        const from = today.toISOString().split('T')[0];
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + 30);
        const to = futureDate.toISOString().split('T')[0];

        // Current Scottish football season straddles years - use 2024 season
        const season = 2024;

        const promises = [TEAMS.CELTIC, TEAMS.FALKIRK, TEAMS.STENHOUSEMUIR].map(async (teamId) => {
            const url = `${BASE_URL}/fixtures?team=${teamId}&season=${season}&from=${from}&to=${to}`;
            console.log(`[FootballAPI] Fetching: ${url}`);
            const res = await fetch(url, {
                method: "GET",
                headers: {
                    "x-rapidapi-key": API_KEY,
                    "x-rapidapi-host": "v3.football.api-sports.io",
                },
            });
            if (!res.ok) {
                console.error(`[FootballAPI] Error ${res.status} for team ${teamId}`);
                return [];
            }
            const data = await res.json();
            console.log(`[FootballAPI] Team ${teamId}: ${data.response?.length || 0} fixtures found`);
            if (data.errors && Object.keys(data.errors).length > 0) {
                console.warn(`[FootballAPI] API Errors:`, data.errors);
            }
            return (data.response || []).map(transformFixture);
        });

        const results = await Promise.all(promises);
        const allMatches = results.flat().sort((a, b) => new Date(a.kickoffTime).getTime() - new Date(b.kickoffTime).getTime());

        // Deduplicate (e.g. Celtic vs Falkirk would appear in both team queries)
        const uniqueMatches = Array.from(new Map(allMatches.map(item => [item.id, item])).values());

        console.log(`[FootballAPI] Total unique fixtures: ${uniqueMatches.length}`);

        // If no future matches found, try getting recent results instead
        if (uniqueMatches.length === 0) {
            console.log('[FootballAPI] No upcoming matches, fetching recent results...');
            return getRecentResults();
        }

        return uniqueMatches;
    } catch (error) {
        console.error('[FootballAPI] Failed to fetch matches:', error);
        return getMockMatches();
    }
};

// Fallback: get last 3 played matches per team
const getRecentResults = async (): Promise<Match[]> => {
    const today = new Date();
    const from = new Date(today);
    from.setDate(today.getDate() - 14);
    const fromStr = from.toISOString().split('T')[0];
    const toStr = today.toISOString().split('T')[0];

    const promises = [TEAMS.CELTIC, TEAMS.FALKIRK].map(async (teamId) => {
        const url = `${BASE_URL}/fixtures?team=${teamId}&season=2024&from=${fromStr}&to=${toStr}`;
        const res = await fetch(url, {
            method: "GET",
            headers: {
                "x-rapidapi-key": API_KEY!,
                "x-rapidapi-host": "v3.football.api-sports.io",
            },
        });
        if (!res.ok) return [];
        const data = await res.json();
        return (data.response || []).map(transformFixture);
    });

    const results = await Promise.all(promises);
    const allMatches = results.flat().sort((a, b) => new Date(b.kickoffTime).getTime() - new Date(a.kickoffTime).getTime());
    return Array.from(new Map(allMatches.map(item => [item.id, item])).values()).slice(0, 6);
};

// Mock data for when API is unavailable
const getMockMatches = (): Match[] => {
    const now = new Date();
    return [
        { id: 1, homeTeam: 'Celtic', awayTeam: 'Rangers', homeScore: null, awayScore: null, status: 'SCHEDULED', kickoffTime: new Date(now.getTime() + 86400000).toISOString(), league: 'Scottish Premiership' },
        { id: 2, homeTeam: 'Falkirk', awayTeam: 'Dunfermline', homeScore: null, awayScore: null, status: 'SCHEDULED', kickoffTime: new Date(now.getTime() + 172800000).toISOString(), league: 'Scottish Championship' },
        { id: 3, homeTeam: 'Stenhousemuir', awayTeam: 'Peterhead', homeScore: null, awayScore: null, status: 'SCHEDULED', kickoffTime: new Date(now.getTime() + 259200000).toISOString(), league: 'League One' },
    ];
};

export const getMatchDetails = async (fixtureId: number): Promise<MatchDetails | null> => {
    if (!API_KEY) return null;

    try {
        const response = await fetch(`${BASE_URL}/fixtures?id=${fixtureId}`, {
            method: "GET",
            headers: {
                "x-rapidapi-key": API_KEY,
                "x-rapidapi-host": "v3.football.api-sports.io",
            },
        });

        if (!response.ok) throw new Error("API Error");

        const data = await response.json();
        if (data.response && data.response.length > 0) {
            const fixture = data.response[0];
            const base = transformFixture(fixture);

            return {
                ...base,
                lineups: fixture.lineups?.map((l: any) => ({
                    team: l.team,
                    formation: l.formation,
                    startXI: l.startXI.map((p: any) => p.player),
                    substitutes: l.substitutes.map((p: any) => p.player),
                    coach: l.coach
                })),
                stats: fixture.statistics,
                venue: fixture.fixture.venue,
                referee: fixture.fixture.referee
            };
        }
    } catch (error) {
        console.error("Error fetching match details:", error);
    }
    return null;
}

// ... existing helper transformFixture

// Helper: Transform API data to our App Model
function transformFixture(f: ApiFixture): Match {
    let status: Match['status'] = 'SCHEDULED';
    if (['1H', '2H', 'HT', 'ET', 'P', 'BT'].includes(f.fixture.status.short)) status = 'LIVE';
    if (['FT', 'AET', 'PEN'].includes(f.fixture.status.short)) status = 'FINISHED';
    if (['PST', 'CANC', 'ABD'].includes(f.fixture.status.short)) status = 'POSTPONED';

    return {
        id: f.fixture.id,
        homeTeam: f.teams.home.name,
        awayTeam: f.teams.away.name,
        homeScore: f.goals.home,
        awayScore: f.goals.away,
        status,
        kickoffTime: f.fixture.date,
        league: f.league.name
    };
}
