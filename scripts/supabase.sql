-- Supabase schema for Car Rental App (December 2025)
-- Run this in the Supabase SQL Editor for your project

-- Enable UUID extension if not present
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- Cars table: fleet catalog
create table if not exists public.cars (
  id uuid primary key default uuid_generate_v4(),
  make text not null,
  model text not null,
  color text not null,
  image_url text
);

-- Ensure column exists for projects created before this change
alter table public.cars add column if not exists image_url text;

-- Bookings table: one-day rentals
create table if not exists public.bookings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null,
  car_id uuid not null references public.cars(id) on delete cascade,
  booking_date date not null,
  renter_name text not null,
  expected_return_date date,
  inserted_at timestamp with time zone not null default now(),
  unique (car_id, booking_date)
);

-- Trigger: set expected_return_date to booking_date if not provided
create or replace function public.set_expected_return_date()
returns trigger
language plpgsql
as $$
begin
  if new.expected_return_date is null then
    -- 3-day rental window: start day + 2 days (inclusive)
    new.expected_return_date := new.booking_date + interval '2 days';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_set_expected_return_date on public.bookings;
create trigger trg_set_expected_return_date
before insert on public.bookings
for each row execute function public.set_expected_return_date();

-- Prevent overlapping bookings for the same car across the 3-day window
create or replace function public.prevent_overlapping_bookings()
returns trigger
language plpgsql
as $$
begin
  if exists (
    select 1
    from public.bookings b
    where b.car_id = new.car_id
      and daterange(b.booking_date, b.expected_return_date + interval '1 day', '[]') &&
          daterange(new.booking_date, coalesce(new.expected_return_date, new.booking_date + interval '2 days') + interval '1 day', '[]')
  ) then
    raise exception 'Overlapping booking for this car in the selected period.' using errcode = '23505';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_overlap on public.bookings;
create trigger trg_prevent_overlap
before insert on public.bookings
for each row execute function public.prevent_overlapping_bookings();

-- RLS
alter table public.cars enable row level security;
alter table public.bookings enable row level security;

-- Policies: allow read for all, write for authenticated
do $$ begin
  perform 1 from pg_policies where schemaname = 'public' and tablename = 'cars' and policyname = 'Cars are readable by everyone';
  if not found then
    create policy "Cars are readable by everyone" on public.cars for select using (true);
  end if;
end $$;

do $$ begin
  perform 1 from pg_policies where schemaname = 'public' and tablename = 'bookings' and policyname = 'Bookings readable by owner';
  if not found then
    create policy "Bookings readable by owner" on public.bookings for select using (auth.uid() = user_id);
  end if;
end $$;

do $$ begin
  perform 1 from pg_policies where schemaname = 'public' and tablename = 'bookings' and policyname = 'Bookings insert by authenticated';
  if not found then
    create policy "Bookings insert by authenticated" on public.bookings for insert with check (auth.role() = 'authenticated');
  end if;
end $$;

-- RPC: available_cars(day date) returns cars not booked on the given day
create or replace function public.available_cars(day date)
returns setof public.cars
language sql
stable
as $$
  select c.*
  from public.cars c
  where not exists (
    select 1 from public.bookings b
    where b.car_id = c.id
      and day >= b.booking_date
      and day <= (b.expected_return_date)
  )
  order by c.id;
$$;

-- Seed at least 20 cars
insert into public.cars (make, model, color, image_url) values
  ('Toyota','Corolla','Blue','https://images.unsplash.com/photo-1549924231-f129b911e442?q=80&w=1200&auto=format'),
  ('Toyota','Camry','White','https://images.unsplash.com/photo-1550355291-bbee04a92027?q=80&w=1200&auto=format'),
  ('Honda','Civic','Black','https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=1200&auto=format'),
  ('Honda','Accord','Silver','https://images.unsplash.com/photo-1549921296-3a6b3f1b5f77?q=80&w=1200&auto=format'),
  ('Nissan','Altima','Red','https://images.unsplash.com/photo-1549921296-3b4a1b2d6e77?q=80&w=1200&auto=format'),
  ('Ford','Focus','Grey','https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format'),
  ('Ford','Fusion','Blue','https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1200&auto=format'),
  ('Chevrolet','Malibu','White','https://images.unsplash.com/photo-1511396275275-5a9e3b81d1af?q=80&w=1200&auto=format'),
  ('Hyundai','Elantra','Black','https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format'),
  ('Kia','Optima','Silver','https://images.unsplash.com/photo-1541447271487-09612b3f49e9?q=80&w=1200&auto=format'),
  ('Volkswagen','Jetta','Blue','https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1200&auto=format'),
  ('Subaru','Impreza','Green','https://images.unsplash.com/photo-1619767886558-efdc259cde1e?q=80&w=1200&auto=format'),
  ('Mazda','Mazda3','Red','https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=1200&auto=format'),
  ('BMW','3 Series','White','https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=1200&auto=format'),
  ('Mercedes','C-Class','Black','https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1200&auto=format'),
  ('Audi','A4','Grey','https://images.unsplash.com/photo-1549921296-3a6b3f1b5f77?q=80&w=1200&auto=format'),
  ('Lexus','IS','Blue','https://images.unsplash.com/photo-1571607385410-7001f6c06bbd?q=80&w=1200&auto=format'),
  ('Tesla','Model 3','White','https://images.unsplash.com/photo-1549924231-f129b911e442?q=80&w=1200&auto=format'),
  ('Volvo','S60','Silver','https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1200&auto=format'),
  ('Peugeot','508','Blue','https://images.unsplash.com/photo-1504215680853-026ed2a45def?q=80&w=1200&auto=format')
on conflict do nothing;

-- Optional: sample bookings across December 2025 for demo visibility
-- This inserts a few scattered bookings to demonstrate availability
with sample_days as (
  select unnest(array['2025-12-03','2025-12-05','2025-12-10','2025-12-15','2025-12-20','2025-12-24','2025-12-28']::date[]) as d
),
car_ids as (
  select id from public.cars limit 7
)
insert into public.bookings (user_id, car_id, booking_date, renter_name)
select
  -- Use a random UUID as placeholder; real inserts will use auth.uid()
  gen_random_uuid(),
  c.id,
  s.d,
  'Demo Renter'
from car_ids c
join sample_days s on true
on conflict do nothing;

-- Normalize any existing bookings to 3-day window
update public.bookings
set expected_return_date = booking_date + interval '2 days'
where expected_return_date is null or expected_return_date = booking_date;


