# Car Rental App (Expo + Supabase)

This app lets users sign up/login, search available cars, book a car for that day, and view their own rentals.

## Quick start

1) Install dependencies

```bash
npm install
```

2) Configure Supabase

- Create a Supabase project.
- In the SQL Editor, run `scripts/supabase.sql` to create tables, policies, the `available_cars(date)` RPC, and seed a 20‑car fleet with sample December bookings.
- Put your project URL and anon key in `app.config.ts` under `extra.EXPO_PUBLIC_SUPABASE_URL` and `extra.EXPO_PUBLIC_SUPABASE_ANON_KEY`.

3) Start the app

```bash
npm run start
```

Open the app, sign up or log in, pick a date (Dec 2025), search, and book. The My Rentals tab shows your bookings with expected return dates.

## Features

- Email/password auth with Supabase
- Fleet of ≥20 cars (seeded) including make, model, color
- Search available cars
- Confirm one‑day rentals and store renter name
- View your rentals; no payment flow

## Database overview

![alt text](https://github.com/saiwaiyanphyo/DES427_CarRental_app/blob/main/supabase-schema-wclqzkbzttfybddadhtj.png)

- `bookings` — one‑day bookings; unique `(car_id, booking_date)`; `expected_return_date` defaults to `booking_date`
- `cars` — catalog of vehicles
- RPC `available_cars(day)` — returns cars not booked on `day`

