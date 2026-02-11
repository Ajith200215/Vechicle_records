/* ============================================
   seed.js - Database Seeder
   Populates Neon PostgreSQL with sample data
   Run: npm run seed
   ============================================ */

const { sequelize, User, Vehicle, ServiceRecord, Appointment, Ticket } = require('./models');

async function seed() {
  try {
    console.log('Connecting to Neon PostgreSQL...');
    await sequelize.authenticate();
    console.log('Connected successfully.');

    // Drop & recreate all tables
    console.log('Syncing tables (force)...');
    await sequelize.sync({ force: true });

    // --- Users ---
    console.log('Seeding users...');
    const admin = await User.create({ username: 'admin', password: 'admin123', full_name: 'Admin User', role: 'admin' });
    const john = await User.create({ username: 'john', password: 'john123', full_name: 'John Doe', role: 'customer' });
    const jane = await User.create({ username: 'jane', password: 'jane123', full_name: 'Jane Smith', role: 'customer' });

    // --- Bikes (from CSV dataset) ---
    console.log('Seeding vehicles...');
    const bikes = await Vehicle.bulkCreate([
      { type: 'Bike', brand: 'Royal Enfield', model: 'Bullet 350', vehicle_id: 'BK-RE-001' },
      { type: 'Bike', brand: 'Royal Enfield', model: 'Meteor 350', vehicle_id: 'BK-RE-002' },
      { type: 'Bike', brand: 'Royal Enfield', model: 'Himalayan', vehicle_id: 'BK-RE-003' },
      { type: 'Bike', brand: 'Royal Enfield', model: 'Interceptor 650', vehicle_id: 'BK-RE-004' },
      { type: 'Bike', brand: 'Royal Enfield', model: 'Continental GT 650', vehicle_id: 'BK-RE-005' },
      { type: 'Bike', brand: 'Royal Enfield', model: 'Super Meteor 650', vehicle_id: 'BK-RE-006' },
      { type: 'Bike', brand: 'Honda', model: 'CB Shine', vehicle_id: 'BK-HN-001' },
      { type: 'Bike', brand: 'Honda', model: 'CB350R', vehicle_id: 'BK-HN-002' },
      { type: 'Bike', brand: 'Honda', model: 'Hness CB350', vehicle_id: 'BK-HN-003' },
      { type: 'Bike', brand: 'Honda', model: 'Activa 125', vehicle_id: 'BK-HN-004' },
      { type: 'Bike', brand: 'Yamaha', model: 'R1', vehicle_id: 'BK-YM-001' },
      { type: 'Bike', brand: 'Yamaha', model: 'MT-09', vehicle_id: 'BK-YM-002' },
      { type: 'Bike', brand: 'Yamaha', model: 'FZ-25', vehicle_id: 'BK-YM-003' },
      { type: 'Bike', brand: 'Bajaj', model: 'Pulsar 150', vehicle_id: 'BK-BJ-001' },
      { type: 'Bike', brand: 'Bajaj', model: 'Pulsar NS200', vehicle_id: 'BK-BJ-002' },
      { type: 'Bike', brand: 'Bajaj', model: 'Dominar 400', vehicle_id: 'BK-BJ-003' },
      { type: 'Bike', brand: 'KTM', model: '200 Duke', vehicle_id: 'BK-KT-001' },
      { type: 'Bike', brand: 'KTM', model: '390 Duke', vehicle_id: 'BK-KT-002' },
      { type: 'Bike', brand: 'KTM', model: 'RC 390', vehicle_id: 'BK-KT-003' },
      { type: 'Bike', brand: 'TVS', model: 'Apache RTR 200 4V', vehicle_id: 'BK-TV-001' },
      { type: 'Bike', brand: 'TVS', model: 'Ntorq 125', vehicle_id: 'BK-TV-002' },
      { type: 'Bike', brand: 'TVS', model: 'Jupiter', vehicle_id: 'BK-TV-003' },
      { type: 'Bike', brand: 'Hero', model: 'Splendor Plus', vehicle_id: 'BK-HR-001' },
      { type: 'Bike', brand: 'Hero', model: 'XPulse 200', vehicle_id: 'BK-HR-002' },
      { type: 'Bike', brand: 'Hero', model: 'Glamour 125', vehicle_id: 'BK-HR-003' },
      { type: 'Bike', brand: 'Kawasaki', model: 'Ninja 300', vehicle_id: 'BK-KW-001' },
      { type: 'Bike', brand: 'Kawasaki', model: 'Z900', vehicle_id: 'BK-KW-002' },
      { type: 'Bike', brand: 'Suzuki', model: 'Gixxer SF 250', vehicle_id: 'BK-SZ-001' },
      { type: 'Bike', brand: 'Suzuki', model: 'Hayabusa', vehicle_id: 'BK-SZ-002' },
      { type: 'Bike', brand: 'Jawa', model: 'Jawa 42', vehicle_id: 'BK-JW-001' },
      { type: 'Bike', brand: 'Jawa', model: 'Perak', vehicle_id: 'BK-JW-002' },
      { type: 'Bike', brand: 'Ducati', model: 'Panigale V4', vehicle_id: 'BK-DC-001' },
      { type: 'Bike', brand: 'Ducati', model: 'Scrambler 800', vehicle_id: 'BK-DC-002' },
      { type: 'Bike', brand: 'Husqvarna', model: 'Svartpilen 401', vehicle_id: 'BK-HQ-001' },
      { type: 'Bike', brand: 'Triumph', model: 'Trident 660', vehicle_id: 'BK-TR-001' },
      { type: 'Bike', brand: 'Harley-Davidson', model: 'Sportster S', vehicle_id: 'BK-HD-001' },
      { type: 'Bike', brand: 'BMW', model: 'G 310 R', vehicle_id: 'BK-BM-001' },
      { type: 'Bike', brand: 'Aprilia', model: 'RS 660', vehicle_id: 'BK-AP-001' },
      { type: 'Bike', brand: 'Benelli', model: 'Imperiale 400', vehicle_id: 'BK-BN-001' },
      { type: 'Bike', brand: 'Zontes', model: '350R', vehicle_id: 'BK-ZN-001' },
    ]);

    // --- Cars ---
    const cars = await Vehicle.bulkCreate([
      { type: 'Car', brand: 'Maruti Suzuki', model: 'Swift', vehicle_id: 'CR-MS-001' },
      { type: 'Car', brand: 'Hyundai', model: 'Creta', vehicle_id: 'CR-HY-002' },
      { type: 'Car', brand: 'Tata', model: 'Nexon', vehicle_id: 'CR-TT-003' },
      { type: 'Car', brand: 'Honda', model: 'City', vehicle_id: 'CR-HN-004' },
      { type: 'Car', brand: 'Toyota', model: 'Innova', vehicle_id: 'CR-TY-005' },
    ]);

    // --- Sample Appointments ---
    console.log('Seeding appointments...');
    await Appointment.bulkCreate([
      { vehicle_id: bikes[0].id, user_id: john.id, appointment_date: '2026-03-10', notes: 'Need chain lubrication and general checkup', status: 'Pending' },
      { vehicle_id: cars[0].id, user_id: jane.id, appointment_date: '2026-03-15', notes: 'AC not cooling, need inspection', status: 'Confirmed' },
    ]);

    // --- Sample Tickets ---
    console.log('Seeding tickets...');
    await Ticket.bulkCreate([
      { vehicle_id: bikes[0].id, user_id: john.id, issue: 'Engine making unusual noise after last service', status: 'Open' },
      { vehicle_id: cars[1].id, user_id: jane.id, issue: 'Infotainment system not responding', status: 'In Progress' },
      { vehicle_id: cars[0].id, user_id: john.id, issue: 'Brake squeaking issue resolved', status: 'Closed' },
    ]);

    console.log('');
    console.log('Database seeded successfully!');
    console.log(`  Users: 3 (admin, john, jane)`);
    console.log(`  Bikes: ${bikes.length}`);
    console.log(`  Cars: ${cars.length}`);
    console.log(`  Appointments: 2`);
    console.log(`  Tickets: 3`);
    console.log(`  Service Records: 0 (admin adds them)`);

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
}

seed();
