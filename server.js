/* ============================================
   server.js - Express API Server
   Serves REST API + static frontend files
   ============================================ */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize, User, Vehicle, ServiceRecord, Appointment, Ticket } = require('./models');
const { Op } = require('sequelize');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/index.html', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/dashboard.html', (req, res) => res.sendFile(path.join(__dirname, 'dashboard.html')));

/* ============================================
   AUTH ROUTES
   ============================================ */

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Login attempt:', { username, password, bodyType: typeof req.body, body: req.body });
    const user = await User.findOne({
      where: { username, password },
      attributes: ['id', 'username', 'full_name', 'role']
    });
    console.log('User found:', user ? user.toJSON() : null);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    res.json(user);
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, full_name } = req.body;
    
    // Check if username already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // Create the user with 'customer' role
    const newUser = await User.create({
      username,
      password,
      full_name,
      role: 'customer' // Default role
    });

    // Don't send password back
    const { password: _, ...userWithoutPassword } = newUser.toJSON();
    
    res.status(201).json(userWithoutPassword);
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ============================================
   VEHICLE ROUTES
   ============================================ */

// GET /api/vehicles?type=Bike
app.get('/api/vehicles', async (req, res) => {
  try {
    const where = {};
    if (req.query.type) where.type = req.query.type;
    const vehicles = await Vehicle.findAll({ where, order: [['type', 'ASC'], ['brand', 'ASC'], ['model', 'ASC']] });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/vehicles/count?type=Bike
app.get('/api/vehicles/count', async (req, res) => {
  try {
    const where = {};
    if (req.query.type) where.type = req.query.type;
    const count = await Vehicle.count({ where });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/vehicles/brands?type=Bike
app.get('/api/vehicles/brands', async (req, res) => {
  try {
    const where = {};
    if (req.query.type) where.type = req.query.type;
    const brands = await Vehicle.findAll({
      where,
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('brand')), 'brand']],
      order: [['brand', 'ASC']],
      raw: true
    });
    res.json(brands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/vehicles/models?brand=Honda&type=Bike
app.get('/api/vehicles/models', async (req, res) => {
  try {
    const where = {};
    if (req.query.brand) where.brand = req.query.brand;
    if (req.query.type) where.type = req.query.type;
    const models = await Vehicle.findAll({
      where,
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('model')), 'model']],
      order: [['model', 'ASC']],
      raw: true
    });
    res.json(models);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/vehicles/search?brand=X&model=Y&vehicle_id=Z
app.get('/api/vehicles/search', async (req, res) => {
  try {
    const { brand, model, vehicle_id } = req.query;
    const vehicle = await Vehicle.findOne({
      where: {
        brand,
        model,
        vehicle_id: sequelize.where(
          sequelize.fn('LOWER', sequelize.col('vehicle_id')),
          vehicle_id.toLowerCase()
        )
      }
    });
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/vehicles/:id
app.get('/api/vehicles/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) return res.status(404).json({ error: 'Not found' });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/vehicles
app.post('/api/vehicles', async (req, res) => {
  try {
    const { type, brand, model, vehicle_id } = req.body;
    // Check duplicate
    const existing = await Vehicle.findOne({ where: { vehicle_id } });
    if (existing) return res.status(409).json({ error: 'A vehicle with this ID already exists.' });
    const vehicle = await Vehicle.create({ type, brand, model, vehicle_id });
    res.status(201).json(vehicle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/vehicles/:id
app.put('/api/vehicles/:id', async (req, res) => {
  try {
    const { type, brand, model, vehicle_id } = req.body;
    // Check duplicate (excluding self)
    const existing = await Vehicle.findOne({ where: { vehicle_id, id: { [Op.ne]: req.params.id } } });
    if (existing) return res.status(409).json({ error: 'Another vehicle with this ID already exists.' });
    await Vehicle.update({ type, brand, model, vehicle_id }, { where: { id: req.params.id } });
    const updated = await Vehicle.findByPk(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/vehicles/:id (cascades)
app.delete('/api/vehicles/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await ServiceRecord.destroy({ where: { vehicle_id: id } });
    await Appointment.destroy({ where: { vehicle_id: id } });
    await Ticket.destroy({ where: { vehicle_id: id } });
    await Vehicle.destroy({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================
   SERVICE RECORD ROUTES
   ============================================ */

// Helper to format service records with vehicle info
function formatServiceRecord(r) {
  const json = r.toJSON();
  if (json.Vehicle) {
    json.brand = json.Vehicle.brand;
    json.model = json.Vehicle.model;
    json.vid = json.Vehicle.vehicle_id;
    json.vehicle_type = json.Vehicle.type;
    delete json.Vehicle;
  }
  return json;
}

// GET /api/services?vehicleId=1 OR ?vehicleType=Bike
app.get('/api/services', async (req, res) => {
  try {
    const where = {};
    const vehicleWhere = {};
    if (req.query.vehicleId) where.vehicle_id = req.query.vehicleId;
    if (req.query.vehicleType) vehicleWhere.type = req.query.vehicleType;

    const records = await ServiceRecord.findAll({
      where,
      include: [{ model: Vehicle, where: Object.keys(vehicleWhere).length ? vehicleWhere : undefined, attributes: ['brand', 'model', 'vehicle_id', 'type'] }],
      order: [['service_date', 'DESC']]
    });
    res.json(records.map(formatServiceRecord));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/services/count?vehicleType=Bike&serviceType=Maintenance
app.get('/api/services/count', async (req, res) => {
  try {
    const where = {};
    if (req.query.serviceType) where.service_type = req.query.serviceType;

    const includeOpts = { model: Vehicle, attributes: [] };
    if (req.query.vehicleType) includeOpts.where = { type: req.query.vehicleType };

    const count = await ServiceRecord.count({ where, include: [includeOpts] });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/services/recent?vehicleType=Bike&limit=5
app.get('/api/services/recent', async (req, res) => {
  try {
    const vehicleWhere = {};
    if (req.query.vehicleType) vehicleWhere.type = req.query.vehicleType;
    const limit = parseInt(req.query.limit) || 5;

    const records = await ServiceRecord.findAll({
      include: [{ model: Vehicle, where: Object.keys(vehicleWhere).length ? vehicleWhere : undefined, attributes: ['brand', 'model', 'vehicle_id', 'type'] }],
      order: [['service_date', 'DESC']],
      limit
    });
    res.json(records.map(formatServiceRecord));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/services/:id
app.get('/api/services/:id', async (req, res) => {
  try {
    const record = await ServiceRecord.findByPk(req.params.id);
    if (!record) return res.status(404).json({ error: 'Not found' });
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/services
app.post('/api/services', async (req, res) => {
  try {
    const record = await ServiceRecord.create(req.body);
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/services/:id
app.put('/api/services/:id', async (req, res) => {
  try {
    await ServiceRecord.update(req.body, { where: { id: req.params.id } });
    const updated = await ServiceRecord.findByPk(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/services/:id
app.delete('/api/services/:id', async (req, res) => {
  try {
    await ServiceRecord.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================
   APPOINTMENT ROUTES
   ============================================ */

// GET /api/appointments?userId=1&vehicleType=Car
app.get('/api/appointments', async (req, res) => {
  try {
    const where = {};
    if (req.query.userId) where.user_id = req.query.userId;

    const vehicleWhere = {};
    if (req.query.vehicleType) vehicleWhere.type = req.query.vehicleType;

    const appointments = await Appointment.findAll({
      where,
      include: [
        { model: Vehicle, attributes: ['brand', 'model', 'vehicle_id', 'type'], where: vehicleWhere },
        { model: User, attributes: ['full_name', 'username'] }
      ],
      order: [['appointment_date', 'ASC']]
    });

    // Flatten for frontend compatibility
    const result = appointments.map(a => {
      const json = a.toJSON();
      if (json.Vehicle) {
        json.brand = json.Vehicle.brand;
        json.model = json.Vehicle.model;
        json.vid = json.Vehicle.vehicle_id;
        json.vehicle_type = json.Vehicle.type;
        delete json.Vehicle;
      }
      if (json.User) {
        json.full_name = json.User.full_name;
        json.username = json.User.username;
        delete json.User;
      }
      return json;
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/appointments/count?userId=1&vehicleType=Car
app.get('/api/appointments/count', async (req, res) => {
  try {
    const where = { status: { [Op.ne]: 'Cancelled' } };
    if (req.query.userId) where.user_id = req.query.userId;

    const includeOpts = [];
    if (req.query.vehicleType) {
      includeOpts.push({ model: Vehicle, attributes: [], where: { type: req.query.vehicleType } });
    }
    const count = await Appointment.count({ where, include: includeOpts });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/appointments
app.post('/api/appointments', async (req, res) => {
  try {
    const appointment = await Appointment.create({ ...req.body, status: 'Pending' });
    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/appointments/:id
app.put('/api/appointments/:id', async (req, res) => {
  try {
    await Appointment.update(req.body, { where: { id: req.params.id } });
    const updated = await Appointment.findByPk(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/appointments/:id
app.delete('/api/appointments/:id', async (req, res) => {
  try {
    await Appointment.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================
   TICKET ROUTES
   ============================================ */

// GET /api/tickets?userId=1&vehicleType=Car
app.get('/api/tickets', async (req, res) => {
  try {
    const where = {};
    if (req.query.userId) where.user_id = req.query.userId;

    const vehicleWhere = {};
    if (req.query.vehicleType) vehicleWhere.type = req.query.vehicleType;

    const tickets = await Ticket.findAll({
      where,
      include: [
        { model: Vehicle, attributes: ['brand', 'model', 'vehicle_id', 'type'], where: vehicleWhere },
        { model: User, attributes: ['full_name', 'username'] }
      ],
      order: [
        [sequelize.literal(`CASE status WHEN 'Open' THEN 1 WHEN 'In Progress' THEN 2 WHEN 'Closed' THEN 3 END`), 'ASC'],
        ['created_at', 'DESC']
      ]
    });

    const result = tickets.map(t => {
      const json = t.toJSON();
      if (json.Vehicle) {
        json.brand = json.Vehicle.brand;
        json.model = json.Vehicle.model;
        json.vid = json.Vehicle.vehicle_id;
        json.vehicle_type = json.Vehicle.type;
        delete json.Vehicle;
      }
      if (json.User) {
        json.full_name = json.User.full_name;
        json.username = json.User.username;
        delete json.User;
      }
      return json;
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tickets/count?userId=1&status=open&vehicleType=Car
app.get('/api/tickets/count', async (req, res) => {
  try {
    const where = {};
    if (req.query.userId) where.user_id = req.query.userId;
    if (req.query.status === 'open') where.status = { [Op.ne]: 'Closed' };

    const includeOpts = [];
    if (req.query.vehicleType) {
      includeOpts.push({ model: Vehicle, attributes: [], where: { type: req.query.vehicleType } });
    }
    const count = await Ticket.count({ where, include: includeOpts });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tickets/recent?userId=1&limit=5&vehicleType=Car
app.get('/api/tickets/recent', async (req, res) => {
  try {
    const where = {};
    if (req.query.userId) where.user_id = req.query.userId;
    const limit = parseInt(req.query.limit) || 5;

    const vehicleWhere = {};
    if (req.query.vehicleType) vehicleWhere.type = req.query.vehicleType;

    const tickets = await Ticket.findAll({
      where,
      include: [
        { model: Vehicle, attributes: ['brand', 'model', 'vehicle_id', 'type'], where: vehicleWhere },
        { model: User, attributes: ['full_name', 'username'] }
      ],
      order: [['id', 'DESC']],
      limit
    });

    const result = tickets.map(t => {
      const json = t.toJSON();
      if (json.Vehicle) {
        json.brand = json.Vehicle.brand;
        json.model = json.Vehicle.model;
        json.vid = json.Vehicle.vehicle_id;
        delete json.Vehicle;
      }
      if (json.User) {
        json.full_name = json.User.full_name;
        delete json.User;
      }
      return json;
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tickets
app.post('/api/tickets', async (req, res) => {
  try {
    const ticket = await Ticket.create({ ...req.body, status: 'Open' });
    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/tickets/:id
app.put('/api/tickets/:id', async (req, res) => {
  try {
    await Ticket.update(req.body, { where: { id: req.params.id } });
    const updated = await Ticket.findByPk(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/tickets/:id
app.delete('/api/tickets/:id', async (req, res) => {
  try {
    await Ticket.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================
   RESET / SEED ROUTE
   ============================================ */

// POST /api/reset - Re-seed the database
app.post('/api/reset', async (req, res) => {
  try {
    // Drop and recreate all tables
    await sequelize.sync({ force: true });

    // Re-seed users
    const admin = await User.create({ username: 'admin', password: 'admin123', full_name: 'Admin User', role: 'admin' });
    const john = await User.create({ username: 'john', password: 'john123', full_name: 'John Doe', role: 'customer' });
    const jane = await User.create({ username: 'jane', password: 'jane123', full_name: 'Jane Smith', role: 'customer' });

    // Re-seed bikes
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

    const cars = await Vehicle.bulkCreate([
      { type: 'Car', brand: 'Maruti Suzuki', model: 'Swift', vehicle_id: 'CR-MS-001' },
      { type: 'Car', brand: 'Hyundai', model: 'Creta', vehicle_id: 'CR-HY-002' },
      { type: 'Car', brand: 'Tata', model: 'Nexon', vehicle_id: 'CR-TT-003' },
      { type: 'Car', brand: 'Honda', model: 'City', vehicle_id: 'CR-HN-004' },
      { type: 'Car', brand: 'Toyota', model: 'Innova', vehicle_id: 'CR-TY-005' },
    ]);

    await Appointment.bulkCreate([
      { vehicle_id: bikes[0].id, user_id: john.id, appointment_date: '2026-03-10', notes: 'Need chain lubrication and general checkup', status: 'Pending' },
      { vehicle_id: cars[0].id, user_id: jane.id, appointment_date: '2026-03-15', notes: 'AC not cooling, need inspection', status: 'Confirmed' },
    ]);

    await Ticket.bulkCreate([
      { vehicle_id: bikes[0].id, user_id: john.id, issue: 'Engine making unusual noise after last service', status: 'Open' },
      { vehicle_id: cars[1].id, user_id: jane.id, issue: 'Infotainment system not responding', status: 'In Progress' },
      { vehicle_id: cars[0].id, user_id: john.id, issue: 'Brake squeaking issue resolved', status: 'Closed' },
    ]);

    res.json({ success: true, message: 'Database reset and re-seeded successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================
   START SERVER
   ============================================ */

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Connected to Neon PostgreSQL.');

    // Sync tables (creates if not exist, does NOT drop)
    await sequelize.sync();
    console.log('Tables synced.');

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
