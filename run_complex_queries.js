/* ============================================
   run_complex_queries.js
   Runnable script to execute the complex SQL 
   queries against the Neon PostgreSQL database.
   Run: node run_complex_queries.js
   ============================================ */

require('dotenv').config();
const { sequelize } = require('./models');

async function runQueries() {
  try {
    console.log('Connecting to Neon PostgreSQL...');
    await sequelize.authenticate();
    console.log('Connected successfully.\n');

    console.log('--- 1. SETS & DML ---');
    
    // Constraint: Add check if it doesn't already exist
    try {
      await sequelize.query('ALTER TABLE appointments ADD CONSTRAINT chk_future_appointment CHECK (appointment_date >= CURRENT_DATE);');
      console.log('✅ Added CHK_FUTURE_APPOINTMENT constraint');
    } catch (e) {
      console.log('⚠️ chk_future_appointment constraint already exists or failed:', e.message);
    }

    try {
      await sequelize.query('ALTER TABLE service_records ADD CONSTRAINT chk_cost_positive CHECK (cost >= 0);');
      console.log('✅ Added CHK_COST_POSITIVE constraint');
    } catch (e) {
      console.log('⚠️ chk_cost_positive constraint already exists or failed:', e.message);
    }

    // Set Intersection
    const [intersectResult] = await sequelize.query(`
      SELECT user_id FROM tickets
      INTERSECT
      SELECT user_id FROM appointments;
    `);
    console.log(`✅ Users with both tickets AND appointments (INTERSECT):`, intersectResult);

    console.log('\n--- 2. VIEWS, SUBQUERIES & JOINS ---');

    // Create View
    await sequelize.query(`
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
    `);
    console.log('✅ View created: pending_appointments_vw');

    // Select from view
    const [viewData] = await sequelize.query('SELECT * FROM pending_appointments_vw;');
    console.log('📊 Pending Appointments View Data:', viewData.length ? viewData : 'No pending appointments');

    // Join and Aggregation
    const [joinResult] = await sequelize.query(`
      SELECT v.vehicle_id, v.brand, v.model, COUNT(t.id) AS total_tickets
      FROM vehicles v
      LEFT JOIN tickets t ON v.id = t.vehicle_id
      GROUP BY v.id, v.vehicle_id, v.brand, v.model
      ORDER BY total_tickets DESC
      LIMIT 3;
    `);
    console.log('✅ Top 3 Vehicles by ticket count (JOIN):', joinResult);


    console.log('\n--- 3. FUNCTIONS, TRIGGERS & CURSORS ---');

    console.log('Creating PL/pgSQL function: change_user_password...');
    await sequelize.query(`
      CREATE OR REPLACE FUNCTION change_user_password(
          p_username VARCHAR,
          p_new_password VARCHAR
      ) RETURNS BOOLEAN AS $$
      DECLARE
          v_user_id INTEGER;
      BEGIN
          SELECT id INTO STRICT v_user_id FROM users WHERE username = p_username;
          UPDATE users SET password = p_new_password WHERE id = v_user_id;
          RETURN TRUE;
      EXCEPTION
          WHEN NO_DATA_FOUND THEN
              RAISE NOTICE 'User % does not exist.', p_username;
              RETURN FALSE;
          WHEN TOO_MANY_ROWS THEN
              RAISE NOTICE 'Multiple users found.';
              RETURN FALSE;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('✅ Function change_user_password created');

    console.log('Testing Exception Handling Function...');
    // This calls the function via SELECT
    const [funcResult] = await sequelize.query(`
      SELECT change_user_password('admin', 'newadminpass') AS password_changed;
    `);
    console.log('✅ Test function output (Admin password changed):', funcResult[0]);
    
    // Revert password
    await sequelize.query(`SELECT change_user_password('admin', 'admin123');`);
    console.log('✅ Reverted Admin password to original values.');

    console.log('\nExecution of complex queries completed!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Execution failed:', error.message);
    process.exit(1);
  }
}

runQueries();
