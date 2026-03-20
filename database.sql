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


-- ============================================
-- 1. DML, CONSTRAINTS, AND SETS
-- ============================================

-- DML: Insert a new service record (INSERT)
INSERT INTO service_records (vehicle_id, service_type, service_date, description, cost, technician_name) 
VALUES (1, 'Maintenance', CURRENT_DATE, 'Oil change and chain lube', 1500.00, 'Mike');

-- DML: Update ticket status (UPDATE)
UPDATE tickets SET status = 'In Progress' WHERE issue LIKE '%noise%';

-- Constraint: Add a check constraint to ensure service cost is not negative
ALTER TABLE service_records ADD CONSTRAINT chk_cost_positive CHECK (cost >= 0);

-- Sets: Find users who have BOTH a ticket AND an appointment (INTERSECT)
SELECT user_id FROM tickets
INTERSECT
SELECT user_id FROM appointments;

-- Sets: Find vehicles that have appointments BUT NO service records yet (EXCEPT)
SELECT vehicle_id FROM appointments
EXCEPT
SELECT vehicle_id FROM service_records;


-- ============================================
-- 2. COMPLEX QUERIES: SUBQUERIES, JOINS, AND VIEWS
-- ============================================

-- View: Create a comprehensive view of all pending appointments
CREATE OR REPLACE VIEW pending_appointments_vw AS
SELECT 
    a.id AS appointment_id,
    a.appointment_date,
    u.full_name AS customer_name,
    v.brand,
    v.model,
    v.vehicle_id AS registration_number
FROM appointments a
JOIN users u ON a.user_id = u.id
JOIN vehicles v ON a.vehicle_id = v.id
WHERE a.status = 'Pending';

-- Subquery: Find vehicles that have a service cost higher than the average service cost
SELECT v.brand, v.model, sr.cost
FROM service_records sr
JOIN vehicles v ON sr.vehicle_id = v.id
WHERE sr.cost > (SELECT AVG(cost) FROM service_records);

-- Join & Aggregation: Get all vehicles and their total number of tickets
SELECT v.vehicle_id, v.brand, v.model, COUNT(t.id) AS total_tickets
FROM vehicles v
LEFT JOIN tickets t ON v.id = t.vehicle_id
GROUP BY v.id, v.vehicle_id, v.brand, v.model
ORDER BY total_tickets DESC;


-- ============================================
-- 3. FUNCTIONS, TRIGGERS, CURSORS, AND EXCEPTION HANDLING
-- ============================================

-- Cursor & Exception Handling: Function to calculate total lifetime service cost safely
CREATE OR REPLACE FUNCTION get_total_vehicle_cost(p_vehicle_id INTEGER) 
RETURNS NUMERIC AS $$
DECLARE
    total_cost NUMERIC := 0;
    current_cost NUMERIC;
    service_cursor CURSOR FOR SELECT cost FROM service_records WHERE vehicle_id = p_vehicle_id;
BEGIN
    OPEN service_cursor;
    LOOP
        FETCH service_cursor INTO current_cost;
        EXIT WHEN NOT FOUND;
        
        -- Exception Handling block
        BEGIN
            IF current_cost IS NOT NULL THEN
                total_cost := total_cost + current_cost;
            END IF;
        EXCEPTION
            WHEN numeric_value_out_of_range THEN
                RAISE NOTICE 'Skipping out-of-range cost value.';
            WHEN OTHERS THEN
                RAISE NOTICE 'An error occurred while summing costs: %', SQLERRM;
        END;
    END LOOP;
    CLOSE service_cursor;
    
    RETURN total_cost;
END;
$$ LANGUAGE plpgsql;

-- Trigger & Function: Automatically update an "updated_at" timestamp on the tickets table
ALTER TABLE tickets ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

CREATE OR REPLACE FUNCTION update_ticket_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ticket_update
BEFORE UPDATE ON tickets
FOR EACH ROW
EXECUTE FUNCTION update_ticket_timestamp();


-- ============================================
-- MORE QUERIES: DML, CONSTRAINTS, SETS
-- ============================================

-- Constraint: Ensure appointment dates cannot be placed in the past
ALTER TABLE appointments ADD CONSTRAINT chk_future_appointment CHECK (appointment_date >= CURRENT_DATE);

-- DML: Delete cancelled appointments older than 1 year
DELETE FROM appointments WHERE status = 'Cancelled' AND appointment_date < CURRENT_DATE - INTERVAL '1 year';

-- Sets: Get a combined unique list of all vehicles that have EITHER a ticket OR an appointment (UNION)
SELECT vehicle_id FROM tickets
UNION
SELECT vehicle_id FROM appointments;


-- ============================================
-- MORE QUERIES: SUBQUERIES, JOINS, VIEWS
-- ============================================

-- View & Subquery in JOIN: Create a view for customer service histories 
CREATE OR REPLACE VIEW customer_service_history_vw AS
SELECT 
    u.id AS customer_id,
    u.full_name,
    v.brand,
    v.model,
    v.vehicle_id,
    sr.service_type,
    sr.service_date,
    sr.cost
FROM users u
JOIN vehicles v ON v.id IN (SELECT vehicle_id FROM appointments WHERE user_id = u.id)
JOIN service_records sr ON sr.vehicle_id = v.id;

-- Subquery with IN: Find vehicles that have had more than 2 service records globally
SELECT brand, model, vehicle_id 
FROM vehicles 
WHERE id IN (
    SELECT vehicle_id 
    FROM service_records 
    GROUP BY vehicle_id 
    HAVING COUNT(*) > 2
);

-- Multiple INNER JOINS: Find all open tickets with vehicle details and the assigned user
SELECT 
    t.issue, 
    t.created_at, 
    v.brand, 
    v.model, 
    u.full_name AS reported_by
FROM tickets t
INNER JOIN vehicles v ON t.vehicle_id = v.id
INNER JOIN users u ON t.user_id = u.id
WHERE t.status = 'Open'
ORDER BY t.created_at DESC;


-- ============================================
-- MORE QUERIES: FUNCTIONS, TRIGGERS, CURSORS, EXCEPTION HANDLING
-- ============================================

-- Function & Strict Exception Handling: Safely change a user's password







) RETURNS BOOLEAN AS $$
DECLARE
    v_user_id INTEGER;
BEGIN
    -- Try to find the user using STRICT to enforce finding exactly one row
    SELECT id INTO STRICT v_user_id FROM users WHERE username = p_username;
    
    -- Update the password
    UPDATE users SET password = p_new_password WHERE id = v_user_id;
    RETURN TRUE;
    
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RAISE NOTICE 'User % does not exist. Password not changed.', p_username;
        RETURN FALSE;
    WHEN TOO_MANY_ROWS THEN
        RAISE NOTICE 'Multiple users found with username % (should be impossible due to UNIQUE).', p_username;
        RETURN FALSE;
    WHEN OTHERS THEN
        RAISE NOTICE 'An unexpected error occurred: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Trigger, Cursor & Exception Handling: Prevent booking an appointment if a vehicle has an unresolved "Open" ticket
CREATE OR REPLACE FUNCTION check_unresolved_tickets()
RETURNS TRIGGER AS $$
DECLARE
    ticket_count INTEGER;
    ticket_cursor CURSOR FOR 
        SELECT COUNT(*) FROM tickets 
        WHERE vehicle_id = NEW.vehicle_id AND status = 'Open';
BEGIN
    OPEN ticket_cursor;
    FETCH ticket_cursor INTO ticket_count;
    CLOSE ticket_cursor;
    
    IF ticket_count > 0 THEN
        -- Exception Handling: abort the insert using RAISE EXCEPTION
        RAISE EXCEPTION 'Cannot book an appointment: Vehicle has % unresolved open ticket(s).', ticket_count;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_appointment
BEFORE INSERT ON appointments
FOR EACH ROW
EXECUTE FUNCTION check_unresolved_tickets();
