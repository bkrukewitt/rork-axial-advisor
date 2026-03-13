# Axial Advisor — Complete Redesign with Simpler Layout, AI Chat & Admin Mode

## What's Changing

A full redesign with a cleaner, simpler look inspired by the mockup. The multi-step wizard goes away in favor of a single-page settings form. Calibration tips become a "Quick Tips" section. An AI-powered expert chat is added. A hidden admin mode lets you customize all recommendation data and content from within the app. Supabase powers the backend for syncing settings data.

---

## Features

### Settings Advisor (Main Screen — Left Toggle)
- **Single-page form** with dropdowns for Combine Model, Header Type, Crop Type, and Moisture Level
- Tap **"Show Settings"** to instantly see recommended concave, rotor speed, fan speed, sieve settings
- Results appear inline below the form — no multi-step wizard, no sheet
- **Quick Tips section** at the bottom with scrollable cards (e.g. "Troubleshoot Cracked Grain", "Reduce Rotor Loss", "Calibration Reminders")
- Tips content is editable from admin mode

### Ask the Expert (Main Screen — Right Toggle)
- **Quick-tap issue buttons** at the top (e.g. "Seeing Cracked Grain", "High Rotor Loss", "Starter Settings for Wet Corn")
- Tapping a quick issue instantly shows expert-written guidance in a chat-style bubble
- **Free-text chat input** at the bottom — type any harvest question and get an AI-powered response
- Chat history persists during the session

### Logs Tab
- View history of past settings lookups and saved field configurations
- Save and compare setups by field name
- Quick notes on sample quality per run

### More Tab
- App disclaimers and about info
- Hidden admin access (long-press the app version 5 times to unlock)
- Settings for notifications, units, preferences

### Hidden Admin Mode (Passcode-Protected)
- **Edit Recommendation Data**: Modify rotor speed ranges, concave clearances, fan speeds, sieve openings per crop/moisture combination
- **Edit Tips & Content**: Add, remove, or rewrite quick tips, troubleshooting advice, and quick-tap chat topics
- **Edit Quick Issues**: Customize the "Ask the Expert" quick-tap buttons and their preset responses
- All changes sync to Supabase so they persist across devices and app updates
- Admin panel uses a simple passcode entry (you set it once)

### Supabase Backend
- Stores recommendation data tables (rotor speeds, concave ranges, fan speeds, etc.)
- Stores tips, troubleshooting content, and quick-tap chat responses
- App fetches latest data on launch, caches locally for offline use
- Admin mode writes changes back to Supabase
- You'll need to provide your Supabase project URL and API key

---

## Design

- **Clean, white background** with a red accent color (Case IH-inspired)
- **Segmented control** at the top of the main screen toggles between "Settings Advisor" and "Ask the Expert"
- **Bottom tab bar** with 4 tabs: Settings, Chat, Logs, More — with red tint
- Dropdown pickers use native iOS menu style — simple, not cluttered
- Chat bubbles: user messages on the right (red), expert responses on the left (light gray)
- Quick Tips as horizontally scrollable cards with icons
- Large touch targets throughout for in-cab glove use
- Dark mode supported automatically

---

## Screens

1. **Settings Advisor** — Dropdowns for combine config → "Show Settings" button → inline results + Quick Tips
2. **Ask the Expert** — Quick-tap issue chips + chat interface with AI responses
3. **Logs** — List of saved setups with field names, dates, and quality notes
4. **More** — About, disclaimers, preferences, hidden admin trigger
5. **Admin Panel** — Passcode entry → tabbed editor for recommendation data, tips, and chat content

---

## App Icon
- Keep the existing app icon (no changes)
