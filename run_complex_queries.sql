-- ============================================
-- run_complex_queries.sql
-- Native PostgreSQL Runnable Script
-- You can run this file directly in any PostgreSQL 
-- tool like psql, pgAdmin, or Neon's SQL Editor.
-- ============================================

-- --------------------------------------------
-- 1. SETS & DML
-- --------------------------------------------

-- Add constraints (DO block to gracefully handle if they already exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_future_appointment'
    ) THEN
        ALTER TABLE appointments ADD CONSTRAINT chk_future_appointment CHECK (appointment_date >= CURRENT_DATE);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_cost_positive'
    ) THEN
        ALTER TABLE service_records ADD CONSTRAINT chk_cost_positive CHECK (cost >= 0);
    END IF;
END $$;

-- Set Intersection (finding users with both tickets and appointments)
SELECT user_id FROM tickets
INTERSECT
SELECT user_id FROM appointments;


-- --------------------------------------------
-- 2. VIEWS, SUBQUERIES & JOINS
-- --------------------------------------------

-- Create View
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

-- Check the View mapping explicitly
SELECT * FROM pending_appointments_vw;

-- Join and Aggregation (Top 3 vehicles by ticket count)
SELECT v.vehicle_id, v.brand, v.model, COUNT(t.id) AS total_tickets
FROM vehicles v
LEFT JOIN tickets t ON v.id = t.vehicle_id
GROUP BY v.id, v.vehicle_id, v.brand, v.model
ORDER BY total_tickets DESC
LIMIT 3;


-- --------------------------------------------
-- 3. FUNCTIONS, TRIGGERS & CURSORS
-- --------------------------------------------

-- Creating PL/pgSQL function: change_user_password
CREATE OR REPLACE FUNCTION change_user_password(
    p_username VARCHAR,
    p_new_password VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
    v_user_id INTEGER;
BEGIN
    -- using STRICT enforces finding EXACTLY ONE user match
    SELECT id INTO STRICT v_user_id FROM users WHERE username = p_username;
    
    -- Assign new payload securely
    UPDATE users SET password = p_new_password WHERE id = v_user_id;
    RETURN TRUE;
    
EXCEPTION
    -- Safe Exception Handling blocks
    WHEN NO_DATA_FOUND THEN
        RAISE NOTICE 'User % does not exist. Ignoring change.', p_username;
        RETURN FALSE;
    WHEN TOO_MANY_ROWS THEN
        RAISE NOTICE 'Critical Error: Multiple users found mapping to same name.';
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Testing Exception Handling Function via Native Select Output
SELECT change_user_password('admin', 'newadminpass') AS password_changed;

-- Automatically revert admin payload for continuous safety
SELECT change_user_password('admin', 'admin123') AS password_reverted;

-- Re-check password state if desired
SELECT username, password FROM users WHERE username = 'admin';
