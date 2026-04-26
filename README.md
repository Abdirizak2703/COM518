# PlacesToStay

Full-stack TypeScript application with a session-based Express API, SQLite database, and React + Leaflet frontend.

The current UI includes live room availability, property images, amenities, facilities, a saved traveler profile, and periodic refresh for active searches.
It now also uses a travel-site style header with top-right login, and separate Home, Features, Search, Offers, and Booking views inside the single-page app.

## Folder Structure

- `backend/` - Express API, DAO layer, middleware, controllers, SQLite setup
- `frontend/` - React TypeScript UI with Fetch API and Leaflet map

## Backend Setup

1. Open terminal in `backend`.
2. Install dependencies:
   - `npm install`
3. Copy environment file and set values:
   - `copy .env.example .env`
4. Initialize database and seed sample data:
   - `npm run db:init`
5. Create your first user (one-time setup):
   - `npm run user:create -- --username owner --password "YourStrong#Password123" --admin`
6. Start server:
   - `npm run dev`

Runs on `http://localhost:4000` by default.

## Frontend Setup

1. Open a second terminal in `frontend`.
2. Install dependencies:
   - `npm install`
3. Copy env file (optional if using default backend URL):
   - `copy .env.example .env`
4. Start client:
   - `npm run dev`

Runs on `http://localhost:5173` by default.

## API Endpoints

- `GET /accommodation?location=`
- `GET /accommodation?location=&type=`
- `POST /login`
- `GET /session`
- `POST /logout`
- `POST /book`

Booking request body:

```json
{
  "accID": 1,
  "date": "260501",
  "npeople": 2,
  "apiID": "0x574144"
}
```

## Notes

- TypeScript strict mode is enabled for backend and frontend.
- API returns meaningful 400, 401, 404, 409 errors.
- SQL queries use parameter binding to prevent SQL injection.
- Accommodation cards show room availability, image gallery previews, amenities, facilities, and map popups with the same live data.
- Active search results refresh every 30 seconds while the page is open.

## Database Setup (SQLite)

SQLite is an embedded (inbuilt) database engine, so you do not need to install a separate DB server.

1. Make sure `DB_PATH` is set in `backend/.env` (default is `./data/placestostay.db`).
2. Run `npm run db:init` inside `backend`.
3. This command will:
   - Create the DB file if it does not exist.
   - Create tables and indexes.
   - Seed sample accommodation and availability data.

## One-Time User Creation Script

Run from `backend`:

- `npm run user:create -- --username <username> --password "<strong-password>" [--admin]`

Strong password policy:

- Minimum 12 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- No whitespace

The script validates username/password, hashes the password with bcrypt, and inserts the user securely.

The database file is created under `backend/data/` and can be copied between machines for backup or local environments.

## Run Tests

From `backend`, run:

- `npm test`

This runs end-to-end style API tests for login/session, booking success, booking conflict, and logout flow.
