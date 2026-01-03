-- Database Schema for GlobeTrotter

DROP TABLE IF EXISTS "stop_activities" CASCADE;
DROP TABLE IF EXISTS "trip_stops" CASCADE;
DROP TABLE IF EXISTS "trips" CASCADE;
DROP TABLE IF EXISTS "activities" CASCADE;
DROP TABLE IF EXISTS "cities" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS "saved_cities" CASCADE;

-- 1. Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user', -- 'user', 'admin'
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Cities Table (Seeded)
CREATE TABLE cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    region VARCHAR(100) -- 'Europe', 'Asia', etc.
);

-- 3. Activities Table (Seeded)
CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    city_id INTEGER REFERENCES cities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50), -- 'sightseeing', 'food', 'adventure', 'culture'
    cost DECIMAL(10, 2) DEFAULT 0,
    description TEXT,
    image_url TEXT,
    location_address TEXT,
    duration_minutes INTEGER DEFAULT 60
);

-- 4. Trips Table
CREATE TABLE trips (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    start_date DATE,
    end_date DATE,
    cover_photo_url TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    public_slug VARCHAR(255) UNIQUE, -- For verify public sharing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Trip Stops (Cities in a trip)
CREATE TABLE trip_stops (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
    city_id INTEGER REFERENCES cities(id) ON DELETE CASCADE,
    arrival_date TIMESTAMP WITH TIME ZONE,
    departure_date TIMESTAMP WITH TIME ZONE,
    order_index INTEGER NOT NULL, -- For drag-and-drop reordering
    notes TEXT
);

-- 6. Stop Activities (Activities assigned to a stop)
CREATE TABLE stop_activities (
    id SERIAL PRIMARY KEY,
    stop_id INTEGER REFERENCES trip_stops(id) ON DELETE CASCADE,
    activity_id INTEGER REFERENCES activities(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMP WITH TIME ZONE, -- specific time
    notes TEXT
);

-- 7. Saved Cities (User bookmarks)
CREATE TABLE saved_cities (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    city_id INTEGER REFERENCES cities(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, city_id)
);

-- 8. Custom Expenses (For budget breakdown beyond simple activities)
-- e.g. Flight costs, Hotel costs not tied to specific activity
CREATE TABLE trip_expenses (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL, -- 'transport', 'accommodation', 'food', 'other'
    amount DECIMAL(10, 2) NOT NULL,
    description VARCHAR(255),
    date DATE
);

-- 9. Activity Assignments (Optional detailed mapping if stop_activities isn't enough, but stop_activities covers it)
-- We can treat stop_activities as the link.

-- Indexes for performance
CREATE INDEX idx_activities_city ON activities(city_id);
CREATE INDEX idx_trip_stops_trip ON trip_stops(trip_id);
CREATE INDEX idx_trips_user ON trips(user_id);
