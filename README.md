# Car Rental App (Expo + Supabase)

This app lets users sign up/login, search available cars, book a car for that day, and view their own rentals.

## Quick start

1) Install dependencies

```bash
npm install
```

2) Configure Supabase

- Create a Supabase project.
- In the SQL Editor, run `scripts/supabase.sql` to create tables, policies, the `available_cars(date)` RPC, and seed a 20‑car fleet.
- Put your project URL and anon key in `app.config.ts` under `extra.EXPO_PUBLIC_SUPABASE_URL` and `extra.EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- Create a bucket `car-images` in Supabase and insert to `car` table. ( all images credit to rightful owners )

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

# MIT License

# Copyright (c) 2025 saiwaiyanphyo

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
