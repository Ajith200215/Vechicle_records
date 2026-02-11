/* ============================================
   models.js - Sequelize Models & DB Connection
   Neon PostgreSQL via Sequelize ORM
   ============================================ */

require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

// Connect to Neon PostgreSQL
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: false
});

/* ---------- User Model ---------- */
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  full_name: { type: DataTypes.STRING, allowNull: false },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { isIn: [['admin', 'customer']] }
  }
}, {
  tableName: 'users',
  timestamps: false
});

/* ---------- Vehicle Model ---------- */
const Vehicle = sequelize.define('Vehicle', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { isIn: [['Bike', 'Car']] }
  },
  brand: { type: DataTypes.STRING, allowNull: false },
  model: { type: DataTypes.STRING, allowNull: false },
  vehicle_id: { type: DataTypes.STRING, unique: true, allowNull: false }
}, {
  tableName: 'vehicles',
  timestamps: false
});

/* ---------- ServiceRecord Model ---------- */
const ServiceRecord = sequelize.define('ServiceRecord', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  vehicle_id: { type: DataTypes.INTEGER, allowNull: false },
  service_type: {
    type: DataTypes.STRING,
    defaultValue: 'Maintenance',
    validate: { isIn: [['Inspection', 'Repair', 'Maintenance']] }
  },
  service_date: { type: DataTypes.DATEONLY, allowNull: false },
  service_interval: { type: DataTypes.STRING, allowNull: true },
  mileage: { type: DataTypes.STRING, allowNull: true },
  next_service_date: { type: DataTypes.DATEONLY, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: false },
  cost: { type: DataTypes.FLOAT, defaultValue: 0 },
  technician_name: { type: DataTypes.STRING, allowNull: true },
  spares_changed: { type: DataTypes.TEXT, allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true }
}, {
  tableName: 'service_records',
  timestamps: false
});

/* ---------- Appointment Model ---------- */
const Appointment = sequelize.define('Appointment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  vehicle_id: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  appointment_date: { type: DataTypes.DATEONLY, allowNull: false },
  notes: { type: DataTypes.TEXT, allowNull: true },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Pending',
    validate: { isIn: [['Pending', 'Confirmed', 'Completed', 'Cancelled']] }
  },
  created_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
}, {
  tableName: 'appointments',
  timestamps: false
});

/* ---------- Ticket Model ---------- */
const Ticket = sequelize.define('Ticket', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  vehicle_id: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  issue: { type: DataTypes.TEXT, allowNull: false },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Open',
    validate: { isIn: [['Open', 'In Progress', 'Closed']] }
  },
  created_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
}, {
  tableName: 'tickets',
  timestamps: false
});

/* ---------- Associations ---------- */
Vehicle.hasMany(ServiceRecord, { foreignKey: 'vehicle_id', onDelete: 'CASCADE' });
ServiceRecord.belongsTo(Vehicle, { foreignKey: 'vehicle_id' });

Vehicle.hasMany(Appointment, { foreignKey: 'vehicle_id' });
Appointment.belongsTo(Vehicle, { foreignKey: 'vehicle_id' });

Vehicle.hasMany(Ticket, { foreignKey: 'vehicle_id' });
Ticket.belongsTo(Vehicle, { foreignKey: 'vehicle_id' });

User.hasMany(Appointment, { foreignKey: 'user_id' });
Appointment.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Ticket, { foreignKey: 'user_id' });
Ticket.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
  sequelize,
  User,
  Vehicle,
  ServiceRecord,
  Appointment,
  Ticket
};
