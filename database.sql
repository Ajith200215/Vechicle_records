-- ============================================
-- Vehicle Service Record Database
-- Neon PostgreSQL Schema + Seed Data
-- ============================================

-- Drop tables (reverse dependency order)
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS service_records CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- TABLE: users
-- ============================================
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'customer'
);

-- ============================================
-- TABLE: vehicles
-- ============================================
CREATE TABLE vehicles (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  vehicle_id VARCHAR(100) UNIQUE NOT NULL
);

-- ============================================
-- TABLE: service_records
-- ============================================
CREATE TABLE service_records (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER REFERENCES vehicles(id),
  service_type VARCHAR(100),
  service_date DATE,
  service_interval VARCHAR(100),
  mileage INTEGER,
  next_service_date DATE,
  description TEXT,
  cost NUMERIC(10,2) DEFAULT 0,
  technician_name VARCHAR(255),
  spares_changed TEXT,
  notes TEXT
);

-- ============================================
-- TABLE: appointments
-- ============================================
CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER REFERENCES vehicles(id),
  user_id INTEGER REFERENCES users(id),
  appointment_date DATE NOT NULL,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: tickets
-- ============================================
CREATE TABLE tickets (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER REFERENCES vehicles(id),
  user_id INTEGER REFERENCES users(id),
  issue TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'Open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- SEED DATA: users
-- Passwords are stored as plain text (demo only)
-- ============================================
INSERT INTO users (username, password, full_name, role) VALUES
  ('admin', 'admin123', 'Admin User', 'admin'),
  ('john',  'john123',  'John Doe',   'customer'),
  ('jane',  'jane123',  'Jane Smith', 'customer');

-- ============================================
-- SEED DATA: vehicles (40 Bikes + 5 Cars)
-- ============================================
INSERT INTO vehicles (type, brand, model, vehicle_id) VALUES
  -- Royal Enfield (7)
  ('Bike', 'Royal Enfield', 'Classic 350',        'KA-01-AB-1234'),
  ('Bike', 'Royal Enfield', 'Bullet 350',         'KA-02-CD-5678'),
  ('Bike', 'Royal Enfield', 'Meteor 350',         'TN-03-EF-9012'),
  ('Bike', 'Royal Enfield', 'Hunter 350',         'MH-04-GH-3456'),
  ('Bike', 'Royal Enfield', 'Himalayan 450',      'DL-05-IJ-7890'),
  ('Bike', 'Royal Enfield', 'Continental GT 650', 'KA-06-KL-2345'),
  ('Bike', 'Royal Enfield', 'Interceptor 650',    'TN-07-MN-6789'),
  -- Bajaj (5)
  ('Bike', 'Bajaj', 'Pulsar NS200', 'KA-08-OP-0123'),
  ('Bike', 'Bajaj', 'Pulsar 220F',  'MH-09-QR-4567'),
  ('Bike', 'Bajaj', 'Dominar 400',  'DL-10-ST-8901'),
  ('Bike', 'Bajaj', 'Pulsar RS200', 'KA-11-UV-2345'),
  ('Bike', 'Bajaj', 'Avenger 220',  'TN-12-WX-6789'),
  -- KTM (5)
  ('Bike', 'KTM', 'Duke 200',      'KA-13-YZ-0123'),
  ('Bike', 'KTM', 'Duke 390',      'MH-14-AB-4567'),
  ('Bike', 'KTM', 'RC 200',        'DL-15-CD-8901'),
  ('Bike', 'KTM', 'RC 390',        'KA-16-EF-2345'),
  ('Bike', 'KTM', 'Adventure 390', 'TN-17-GH-6789'),
  -- TVS (5)
  ('Bike', 'TVS', 'Apache RTR 200', 'KA-18-IJ-0123'),
  ('Bike', 'TVS', 'Apache RR 310',  'MH-19-KL-4567'),
  ('Bike', 'TVS', 'Raider 125',     'DL-20-MN-8901'),
  ('Bike', 'TVS', 'Ntorq 125',      'KA-21-OP-2345'),
  ('Bike', 'TVS', 'Jupiter 125',    'TN-22-QR-6789'),
  -- Honda (5)
  ('Bike', 'Honda', 'CB300R',    'KA-23-ST-0123'),
  ('Bike', 'Honda', 'Hornet 2.0','MH-24-UV-4567'),
  ('Bike', 'Honda', 'Shine 125', 'DL-25-WX-8901'),
  ('Bike', 'Honda', 'Activa 6G', 'KA-26-YZ-2345'),
  ('Bike', 'Honda', 'SP 125',    'TN-27-AB-6789'),
  -- Yamaha (5)
  ('Bike', 'Yamaha', 'MT-15 V2',     'KA-28-CD-0123'),
  ('Bike', 'Yamaha', 'R15 V4',       'MH-29-EF-4567'),
  ('Bike', 'Yamaha', 'FZ-S V4',      'DL-30-GH-8901'),
  ('Bike', 'Yamaha', 'Fascino 125',  'KA-31-IJ-2345'),
  ('Bike', 'Yamaha', 'Ray ZR 125',   'TN-32-KL-6789'),
  -- Suzuki (4)
  ('Bike', 'Suzuki', 'Gixxer 250',     'KA-33-MN-0123'),
  ('Bike', 'Suzuki', 'V-Strom SX',     'MH-34-OP-4567'),
  ('Bike', 'Suzuki', 'Access 125',     'DL-35-QR-8901'),
  ('Bike', 'Suzuki', 'Burgman Street', 'KA-36-ST-2345'),
  -- Hero (4)
  ('Bike', 'Hero', 'Xtreme 160R',   'TN-37-UV-6789'),
  ('Bike', 'Hero', 'Xpulse 200',    'KA-38-WX-0123'),
  ('Bike', 'Hero', 'Splendor Plus', 'MH-39-YZ-4567'),
  ('Bike', 'Hero', 'Pleasure Plus', 'DL-40-AB-8901'),
  -- Cars (5)
  ('Car', 'Maruti Suzuki', 'Swift',  'KA-01-MA-1111'),
  ('Car', 'Maruti Suzuki', 'Baleno', 'MH-02-MB-2222'),
  ('Car', 'Hyundai',       'i20',    'TN-03-HC-3333'),
  ('Car', 'Hyundai',       'Creta',  'DL-04-HD-4444'),
  ('Car', 'Tata',          'Nexon',  'KA-05-TE-5555');

-- ============================================
-- SEED DATA: appointments
-- ============================================
INSERT INTO appointments (vehicle_id, user_id, appointment_date, notes, status) VALUES
  (1, 2, '2026-02-15', 'Regular service needed', 'Pending'),
  (8, 3, '2026-02-20', 'Engine vibration issue', 'Confirmed');

-- ============================================
-- SEED DATA: tickets
-- ============================================
INSERT INTO tickets (vehicle_id, user_id, issue, status) VALUES
  (1,  2, 'Bike making strange noise from engine',  'Open'),
  (8,  3, 'Brake pads need replacement',            'Open'),
  (13, 2, 'Headlight flickering intermittently',    'In Progress');
