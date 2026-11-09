# FoodFinder — MVP Overview

## App Summary

FoodFinder helps Stony Brook University students find campus events offering free food. It improves on the school's CampusGroups event discovery experience by bringing food-related events into a focused catalog and showing events currently happening on a campus map.

The MVP will be a **Progressive Web App (PWA)** with a mobile-friendly interface that students can access through a browser and install on their phones. Event information will come from CampusGroups through an automated scraping process.

## User Flow and Experience

1. **Create an account or sign in.** Students use their school email address to access their account. The proposed MVP includes email verification to confirm access to that address.
2. **Browse events.** Students land on a catalog of events offering free food, with the event name, food information when available, date, time, and location visible at a glance.
3. **Narrow the results.** Students filter events by food type, event type, time, or campus area to find something that fits their preferences and schedule.
4. **View event details.** Selecting an event opens its description, organizer, food information, schedule, location, and original CampusGroups listing. Any registration requirements or attendance restrictions available from the source should appear here.
5. **Explore the live map.** Students switch to a campus map to see events currently in progress. Tapping an event marker opens a popup with its key details and a link to the full event view.
6. **Choose an event to attend.** Students use the displayed time and location to decide where to go. The map updates as events start and end throughout the day.

## MVP Feature Outline

### 1. Free-Food Event Catalog

**Purpose:** Provide one place to discover upcoming and ongoing campus events offering free food.

- Scrape CampusGroups event listings and identify events that advertise free food.
- Store the source event ID or URL, title, description, organizer, start and end times, location, and food details when available.
- Display events in a readable catalog, ordered by start time, with ongoing events clearly labeled.
- Refresh source information regularly and update existing records without creating duplicates.
- Show missing food or location details as unspecified rather than guessing.
- Include an event details view and a link to the original listing.

### 2. Event Filters

**Purpose:** Help students quickly find relevant events.

| Filter | Intended behavior |
| --- | --- |
| Food type | Filter by available categories, such as vegetarian, halal, gluten-free, kosher, when the listing provides enough information. |
| Event type | Filter by categories such as club meetings, social events, or workshops. |
| Time | Find events happening now or within a selected date or time range. |
| Location | Filter by campus area; West Campus and East Campus are proposed initial options. |

- Allow multiple filters to be combined and cleared easily.
- Keep selected filters consistent when switching between the catalog and map; the map additionally limits results to ongoing events.
- Show a helpful empty state when no events match.

### 3. Live Campus Map

**Purpose:** Show where students can find an event happening right now.

- Place event markers at campus locations using mapped coordinates.
- Display an event while its start time has passed and its end time has not yet been reached.
- Add and remove markers automatically as events start and end, using Stony Brook's local time.
- Open a popup when a marker is tapped, showing the event name, food details when known, location, and end time.
- Allow students to open full event details from the popup.
- Keep events with unresolved locations in the catalog, while indicating that their map location is unavailable.

The map reflects scheduled event times. It does not confirm that food is still available.

### 4. Developer Dashboard

**Purpose:** Let the team test how the app behaves at different dates and times.

- Restrict access to authorized developers.
- Provide controls to select a simulated date and time.
- Apply that simulated clock to time-dependent catalog labels, filters, and map visibility in the test session.
- Clearly indicate when simulated time is active and provide a reset to the current time.
- Keep time simulation isolated from normal users and preserve the original event schedule.

### 5. School Email Accounts and User Database

**Purpose:** Support student accounts and distinguish regular users from developers.

- Allow account creation and sign-in using a Stony Brook school email address.
- Verify email ownership before activating the account.
- Store a user ID, email address, verification status, account creation date, and access role.
- Protect developer dashboard access through role-based authorization.

### 6. PWA and Mobile Experience

**Purpose:** Make FoodFinder convenient to use on a phone.

- Provide responsive catalog, filter, event details, and map screens.
- Support installation to the home screen on supported devices.
- Use touch-friendly controls and clear navigation between catalog and map views.
- Include loading, error, and empty states; clearly indicate when fresh event data cannot be loaded.

## Decisions to Finalize

- How reliably CampusGroups exposes food details, event categories, end times, and locations for scraping.
- How often to refresh event data and how to handle changed or canceled listings.
- Which food and event categories to support, and how to classify incomplete listings.
- Whether West/East Campus is sufficient or more location options are needed.
- Which school email domains to accept and whether browsing requires sign-in.
- How to handle listings without an end time, since live map visibility depends on it.
