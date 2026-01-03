-- Database Schema for GlobeTrotter

DROP TABLE IF EXISTS "stop_activities" CASCADE;
DROP TABLE IF EXISTS "trip_stops" CASCADE;
DROP TABLE IF EXISTS "trip_expenses" CASCADE;
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
CREATE TABLE trip_expenses (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL, -- 'transport', 'accommodation', 'food', 'other'
    amount DECIMAL(10, 2) NOT NULL,
    description VARCHAR(255),
    date DATE
);

-- Indexes for performance
CREATE INDEX idx_activities_city ON activities(city_id);
CREATE INDEX idx_trip_stops_trip ON trip_stops(trip_id);
CREATE INDEX idx_trips_user ON trips(user_id);

-- Seed Data (Extended)
INSERT INTO cities (name, country, description, image_url, region) VALUES
('Paris', 'France', 'The City of Light.', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34', 'Europe'),
('Tokyo', 'Japan', 'A bustling metropolis mixing the ultramodern and the traditional.', 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26', 'Asia'),
('New York City', 'USA', 'The Big Apple.', 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9', 'North America'),
('London', 'UK', 'History and modernity.', 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad', 'Europe'),
('Rome', 'Italy', 'The Eternal City.', 'https://images.unsplash.com/photo-1552832230-c0197dd311b5', 'Europe'),
('Barcelona', 'Spain', 'Art and architecture.', 'https://images.unsplash.com/photo-1583422409516-2895a77efded', 'Europe'),
('Dubai', 'UAE', 'Luxury and skyscrapers.', 'https://images.unsplash.com/photo-1512453979798-5ea90b792d50', 'Asia'),
('Singapore', 'Singapore', 'Modern city-state island.', 'https://images.unsplash.com/photo-1525625293386-3f8f99389e81', 'Asia'),
('Bangkok', 'Thailand', 'Street life and shrines.', 'https://images.unsplash.com/photo-1508009603885-50cf7c579365', 'Asia'),
('Sydney', 'Australia', 'Harbour and beaches.', 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9', 'Oceania');

INSERT INTO activities (city_id, name, type, cost, description, image_url) VALUES
-- Paris
(1, 'Eiffel Tower', 'sightseeing', 35.00, 'Top floor access.', 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e'),
(1, 'Louvre Museum', 'culture', 22.00, 'Mona Lisa visit.', 'https://images.unsplash.com/photo-1499856871940-a09627c6dcf6'),
-- Tokyo
(2, 'Shibuya Crossing', 'sightseeing', 0.00, 'Famous scramble.', 'https://images.unsplash.com/photo-1542051841857-5f90071e7989'),
(2, 'TeamLab Planets', 'entertainment', 30.00, 'Digital art museum.', 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc'),
-- NYC
(3, 'Central Park', 'leisure', 0.00, 'Park walk.', 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9'),
(3, 'Broadway Show', 'entertainment', 150.00, 'Lion King.', 'https://images.unsplash.com/photo-1503095392237-73621405b685'),
-- London
(4, 'British Museum', 'culture', 0.00, 'Human history.', 'https://images.unsplash.com/photo-1568798547437-0639d6718cb4'),
(4, 'London Eye', 'sightseeing', 40.00, 'Observe London.', 'https://images.unsplash.com/photo-1589552940251-5121b65b53df'),
-- Dubai
(7, 'Burj Khalifa', 'sightseeing', 50.00, 'Tallest building.', 'https://images.unsplash.com/photo-1518684079-3c830dcef6c3'),
(7, 'Desert Safari', 'adventure', 80.00, 'Dune bashing.', 'https://images.unsplash.com/photo-1451337516015-6b6fcd1c56ab'),
-- Singapore
(8, 'Marina Bay Sands', 'leisure', 0.00, 'Iconic hotel view.', 'https://images.unsplash.com/photo-1525625293386-3f8f99389e81'),
(8, 'Gardens by the Bay', 'sightseeing', 25.00, 'Supertrees.', 'https://images.unsplash.com/photo-1557456170-0cf4f4d0d3ce');

-- Admin User
-- Email: admin@globetrotter.com
-- Password: admin123
INSERT INTO users (email, password_hash, name, role) VALUES 
('admin@globetrotter.com', '$2b$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGSCgCk9XzGJChzYtdslfF6', 'Admin User', 'admin');

-- Regular Test User
-- Email: user@globetrotter.com  
-- Password: user123
INSERT INTO users (email, password_hash, name, role) VALUES 
('user@globetrotter.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Test User', 'user');
