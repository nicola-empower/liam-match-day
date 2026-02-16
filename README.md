# ⚽ Liam's Match Day — Gamified Independent Living App

> A bespoke Progressive Web App (PWA) designed to support a young person with epilepsy and additional needs to develop independence through task management, health monitoring, and real-time football integration — all wrapped in a gamified, football-themed interface.

**Built by [Nicola / Your Studio Name]** | React + TypeScript + Vite | Google Sheets Cloud Backend

---

## 📋 Table of Contents

- [Overview](#-overview)
- [The Problem](#-the-problem)
- [The Solution](#-the-solution)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Setup & Installation](#-setup--installation)
- [Google Sheets Backend Setup](#-google-sheets-backend-setup)
- [Environment Variables](#-environment-variables)
- [Case Study](#-case-study)
- [Cost Breakdown](#-cost-breakdown)

---

## 🎯 Overview

**Liam's Match Day** transforms daily household tasks, medication reminders, and health tracking into a football-themed game. Instead of a boring checklist, Liam earns points like a football player earns performance stats — completing tasks moves him closer to unlocking PlayStation credits (his "contract bonus").

The app is designed with a **"left-hand first"** interface philosophy, with large touch targets and simplified interactions suitable for users with motor coordination challenges.

---

## 🔴 The Problem

Young people with epilepsy and learning difficulties often struggle with:
- **Routine adherence** — forgetting medication, hygiene tasks, and household chores
- **Motivation** — traditional task lists feel like work, not engagement
- **Health tracking** — seizure logging is often paper-based and inconsistent
- **Appointment management** — missing GP visits, specialist appointments, and social activities
- **Carer visibility** — parents/carers have no real-time insight into daily progress

---

## ✅ The Solution

A PWA that lives on Liam's phone like a native app, featuring:
- 🏟️ **Football-themed gamification** that makes tasks feel like match-day rituals
- ☁️ **Cloud sync to Google Sheets** so data persists across devices and sessions
- 📅 **Google Calendar integration** pulling appointments directly into the app
- 🟥 **Seizure monitoring** with simple +/- buttons and history tracking
- ⚽ **Live football scores** from the API-Football API for Celtic, Falkirk, and Stenhousemuir
- 🔔 **Push notifications** for medication reminders

---

## 🏆 Features

### Core Task Management
| Feature | Description |
|---------|-------------|
| **Hero Button Cards** | Large, colourful task cards with emojis — designed for easy tapping |
| **Morning / Evening / Anytime** | Tasks grouped by time of day with clear visual separation |
| **Undo Button** | Every completed task has an undo arrow in case of accidental taps |
| **Points System** | Each task earns points (2–20 pts), tracked across sessions |
| **PlayStation Contract** | Visual progress tracker — complete enough tasks to earn PlayStation credits |
| **Pitch Progress Bar** | Animated football pitch showing overall daily completion |

### Health Monitoring — "Red Card Report" 🟥
| Feature | Description |
|---------|-------------|
| **Seizure Logger** | Simple +/- buttons to log seizures throughout the day |
| **Daily Count** | Large, prominent display of today's seizure count |
| **History Graph** | Mini bar chart showing the last 5 days of seizure activity |
| **Motivational Messages** | Context-sensitive encouragement ("Take it easy, gaffer.") |

### Live Football Integration ⚽
| Feature | Description |
|---------|-------------|
| **Match Carousel** | Scrollable cards showing upcoming/recent fixtures |
| **Multi-Team Support** | Tracks Celtic, Falkirk, and Stenhousemuir simultaneously |
| **Match Centre Modal** | Tap a match for detailed lineups, formations, and stats |
| **Score Display** | Shows live scores, final results, and upcoming kick-off times |
| **API-Football Integration** | Real data from the API-Football v3 endpoint |

### Cloud Sync & Calendar ☁️
| Feature | Description |
|---------|-------------|
| **Google Sheets Backend** | All data syncs to a Google Spreadsheet in real-time |
| **Two-Way Sync** | Push on every task completion, pull on app load |
| **Auto-Save** | Debounced sync (2s) to avoid API spam |
| **Offline Fallback** | Works without internet using localStorage, syncs when back online |
| **Google Calendar** | Reads next 14 days of appointments from Liam's calendar |
| **Carer Visibility** | Parents can view the Sheet in real-time to monitor progress |

### Gamification Widgets 🎮
| Feature | Description |
|---------|-------------|
| **Weather Widget** | Real-time local weather ("Pitch Conditions") via OpenWeatherMap |
| **Form Guide** | Visual W/D/L streak indicator to track daily consistency |
| **Manager's Team Talk** | Rotating motivational quotes in football manager style |

### Additional Features
| Feature | Description |
|---------|-------------|
| **PWA Support** | Installable on phone home screen, works offline |
| **Push Notifications** | Medication reminders at scheduled times |
| **Travel / Away Days** | Google Maps integration for navigating to new locations |
| **Trophy Room** | Rewards page celebrating achievements |
| **Responsive Design** | Optimised for mobile-first, works on tablet and desktop |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + TypeScript |
| **Build Tool** | Vite |
| **Styling** | Tailwind CSS (custom football theme) |
| **State Management** | Zustand (with localStorage persistence) |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Backend** | Google Apps Script (serverless) |
| **Database** | Google Sheets (via Apps Script Web App) |
| **Calendar** | Google Calendar API (via Apps Script) |
| **Football API** | API-Football v3 (RapidAPI) |
| **Weather API** | OpenWeatherMap |
| **PWA** | Vite PWA Plugin + Service Workers |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│              Liam's Phone (PWA)             │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐ │
│  │  Zustand  │  │  Sync    │  │  Football │ │
│  │  Store    │──│  Service │  │  API      │ │
│  └────┬─────┘  └────┬─────┘  └─────┬─────┘ │
│       │              │              │       │
│  localStorage   fetch/POST     fetch/GET    │
└───────┼──────────────┼──────────────┼───────┘
        │              │              │
        ▼              ▼              ▼
   [Offline      [Google Apps    [API-Football
    Cache]        Script]         v3 API]
                    │
            ┌───────┼───────┐
            ▼       ▼       ▼
      [Google    [Google   [Config
       Sheet]   Calendar]   Tab]
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- A Google account (for Sheets backend)
- API keys for API-Football and OpenWeatherMap (optional)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/liam-match-day.git
cd liam-match-day

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

### Production Build

```bash
npm run build
npm run preview
```

---

## ☁️ Google Sheets Backend Setup

1. Go to [Google Apps Script](https://script.google.com)
2. Create a new project → Name it **"Liam's App Backend"**
3. Paste the contents of `google-apps-script/Code.gs`
4. Run the `initialSetup` function (creates the spreadsheet automatically)
5. **Deploy → New Deployment → Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Copy the Web App URL into `.env` as `VITE_SYNC_URL`
7. (Optional) Run `createDailyTrigger` to auto-refresh calendar events every 6 hours

### Sheet Structure
The script auto-creates 5 tabs:
- **DailyTasks** — Today's task completion status
- **SeizureLog** — Daily seizure counts with date history
- **PointsHistory** — Score archive for form guide
- **CalendarEvents** — Upcoming appointments from Google Calendar
- **Config** — Sync metadata and app version

---

## 🔐 Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_FOOTBALL_KEY=your_api_football_key
VITE_OPENWEATHER_API_KEY=your_openweather_key
VITE_SYNC_URL=https://script.google.com/macros/s/your-deployment-id/exec
```

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_FOOTBALL_KEY` | Optional | API-Football key for live scores (falls back to mock data) |
| `VITE_OPENWEATHER_API_KEY` | Optional | OpenWeatherMap key for weather widget |
| `VITE_SYNC_URL` | Recommended | Google Apps Script Web App URL for cloud sync |

---

## 📖 Case Study

### Client Brief
> *"My son Liam has epilepsy and additional needs. He's trying to live more independently but struggles with routine, medication, and household tasks. He loves Celtic and Falkirk. Can you make something that helps him without feeling like a chore?"*

### Approach
1. **Discovery** — Understanding Liam's daily routine, triggers, interests, and abilities
2. **Design Philosophy** — "Left-hand first" interface with large touch targets, high contrast, and minimal cognitive load
3. **Gamification Strategy** — Tasks reframed as match-day rituals; points as performance stats; PlayStation credits as contract bonuses
4. **Health Integration** — Seizure monitoring built directly into the dashboard for immediate access
5. **Carer Visibility** — Google Sheets backend allows parents to monitor progress in real-time without intrusive surveillance

### Outcomes
- ✅ Tasks completed consistently through gamified motivation
- ✅ Seizure data captured reliably for medical appointments
- ✅ Medication reminders reduce missed doses
- ✅ Google Calendar integration ensures appointments aren't missed
- ✅ Carer has real-time visibility via shared Google Sheet
- ✅ Liam engages with the app because it's about football, not chores

### Key Design Decisions
| Decision | Rationale |
|----------|-----------|
| PWA over native app | No app store submission needed; instant updates; works offline |
| Football theming | Leverages existing passion to drive engagement |
| Google Sheets backend | Free, familiar to carers, no server costs, real-time visibility |
| Large "Hero" buttons | Accommodates motor coordination challenges |
| Undo button on every task | Prevents frustration from accidental taps |
| Auto-save + cloud sync | No "save" button to forget; data survives battery death |

---

## 💷 Cost Breakdown

### What This Would Cost to Commission

This pricing reflects what a freelance developer or small studio in the UK would charge to build this application from scratch for a new client.

#### Development Costs

| Phase | Description | Hours | Rate | Cost |
|-------|-------------|-------|------|------|
| **Discovery & Planning** | Requirements gathering, user research, accessibility audit | 8 | £75/hr | **£600** |
| **UI/UX Design** | Wireframes, design system, component library, responsive layouts | 12 | £75/hr | **£900** |
| **Core App Development** | React + TypeScript scaffold, routing, state management, PWA setup | 16 | £85/hr | **£1,360** |
| **Task Management System** | Task cards, points system, progress tracking, undo functionality | 12 | £85/hr | **£1,020** |
| **Gamification Engine** | Football theming, widgets, animations, motivational content | 10 | £85/hr | **£850** |
| **Health Monitoring** | Seizure logger, history tracking, daily counts | 6 | £85/hr | **£510** |
| **Football API Integration** | API-Football setup, match carousel, match centre modal | 10 | £85/hr | **£850** |
| **Cloud Backend** | Google Apps Script, Sheets sync, 2-way data flow | 10 | £85/hr | **£850** |
| **Calendar Integration** | Google Calendar reading, event display, appointment sync | 6 | £85/hr | **£510** |
| **Push Notifications** | Service worker, notification scheduling, permission handling | 4 | £85/hr | **£340** |
| **Weather Integration** | OpenWeatherMap API, widget design | 3 | £85/hr | **£255** |
| **Testing & Polish** | Cross-device testing, accessibility checks, performance optimisation | 8 | £75/hr | **£600** |
| **Deployment & Handover** | Production build, documentation, client training | 4 | £75/hr | **£300** |

#### Summary

| | |
|---|---|
| **Total Development Hours** | ~109 hours |
| **Total Development Cost** | **£8,945** |
| **Ongoing Maintenance** (optional) | £150–£300/month |
| **API Costs** | £0–£10/month (free tiers available) |
| **Hosting** | £0 (static hosting on Netlify/Vercel) |

#### Value Breakdown by Feature Module

| Module | Standalone Value | Notes |
|--------|-----------------|-------|
| Task Management PWA | £3,280 | Core app with gamification |
| Health Monitoring Dashboard | £1,360 | Seizure tracking + history |
| Live Sports Integration | £1,700 | API setup + match centre |
| Cloud Backend + Calendar | £1,660 | Google Sheets + Calendar sync |
| Design System + Accessibility | £1,500 | Custom theme + a11y compliance |
| **Total Portfolio Value** | **£9,500** | |

> **Note:** This pricing is for a bespoke, one-off build. A productised version (SaaS) serving multiple families would be priced differently, with subscription models of £15–£30/month per family.

---

## 📄 Licence

This project was built as a bespoke solution. All rights reserved.

---

## 🙏 Acknowledgements

- [API-Football](https://www.api-football.com/) for live Scottish football data
- [OpenWeatherMap](https://openweathermap.org/) for weather data
- [Lucide Icons](https://lucide.dev/) for the icon library
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Zustand](https://github.com/pmndrs/zustand) for state management
- Celtic FC, Falkirk FC, and Stenhousemuir FC for the inspiration ⚽
