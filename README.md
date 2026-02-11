# Vehicle Service Record Database

A full-stack web application for managing vehicle service records, appointments, and support tickets. Built with Node.js, Express, Sequelize ORM, and Neon PostgreSQL.

## Features

- **Admin Portal** -- Manage vehicles, service records, appointments, and tickets
- **Customer Portal** -- Search vehicles, book appointments, raise tickets
- **Bike & Car Dashboards** -- Separate views filtered by vehicle type
- **40 Bikes + 5 Cars** pre-loaded with sample data
- **Service Records** -- Track maintenance, repairs, inspections with technician and spares info
- **Appointments** -- Book, confirm, complete, or cancel service appointments
- **Tickets** -- Raise issues, track status (Open / In Progress / Closed)
- **Dashboard Stats** -- Real-time counts and recent activity overview

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | HTML, CSS (beige & dark grey theme), Vanilla JS |
| Backend  | Node.js, Express                    |
| ORM      | Sequelize                           |
| Database | Neon PostgreSQL (cloud)             |
| Auth     | Session-based (sessionStorage)      |

## Project Structure

```
.
├── index.html          # Login page (Admin / Customer portal)
├── dashboard.html      # Main dashboard with all sections
├── server.js           # Express REST API server
├── models.js           # Sequelize models & associations
├── seed.js             # Database seeder script
├── database.sql        # Raw SQL schema + seed data
├── package.json        # Dependencies & scripts
├── .env                # Neon PostgreSQL connection string
├── css/
│   └── styles.css      # Beige & dark grey themed stylesheet
└── js/
    ├── database.js     # API client helpers (fetch wrappers)
    ├── auth.js         # Authentication & session management
    ├── vehicles.js     # Vehicle CRUD & search
    ├── services.js     # Service record CRUD & rendering
    ├── appointments.js # Appointment system
    └── tickets.js      # Ticket / query system
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- A [Neon](https://neon.tech/) PostgreSQL database

### Setup

1. **Clone or download** the project

2. **Configure the database connection** -- edit `.env`:
   ```
   DATABASE_URL=postgresql://your_user:your_password@your-host.neon.tech/your_database?sslmode=require
   PORT=3000
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Seed the database** (creates tables and inserts sample data):
   ```bash
   npm run seed
   ```

5. **Start the server**:
   ```bash
   npm start
   ```

6. **Open** [http://localhost:3000](http://localhost:3000)

## Demo Credentials

| Username | Password  | Role     |
|----------|-----------|----------|
| admin    | admin123  | Admin    |
| john     | john123   | Customer |
| jane     | jane123   | Customer |

## API Endpoints

### Auth
| Method | Endpoint           | Description        |
|--------|--------------------|--------------------|
| POST   | /api/auth/login    | Login              |

### Vehicles
| Method | Endpoint                  | Description               |
|--------|---------------------------|---------------------------|
| GET    | /api/vehicles             | List vehicles (filter by type) |
| GET    | /api/vehicles/count       | Count vehicles             |
| GET    | /api/vehicles/brands      | Get distinct brands        |
| GET    | /api/vehicles/models      | Get models for a brand     |
| GET    | /api/vehicles/search      | Search by brand/model/id   |
| GET    | /api/vehicles/:id         | Get vehicle by ID          |
| POST   | /api/vehicles             | Add vehicle                |
| PUT    | /api/vehicles/:id         | Update vehicle             |
| DELETE | /api/vehicles/:id         | Delete vehicle + records   |

### Service Records
| Method | Endpoint                  | Description               |
|--------|---------------------------|---------------------------|
| GET    | /api/services             | List service records       |
| GET    | /api/services/count       | Count records              |
| GET    | /api/services/recent      | Recent records             |
| GET    | /api/services/:id         | Get record by ID           |
| POST   | /api/services             | Add service record         |
| PUT    | /api/services/:id         | Update record              |
| DELETE | /api/services/:id         | Delete record              |

### Appointments
| Method | Endpoint                  | Description               |
|--------|---------------------------|---------------------------|
| GET    | /api/appointments         | List appointments          |
| GET    | /api/appointments/count   | Count appointments         |
| POST   | /api/appointments         | Book appointment           |
| PUT    | /api/appointments/:id     | Update status              |
| DELETE | /api/appointments/:id     | Cancel/delete              |

### Tickets
| Method | Endpoint                  | Description               |
|--------|---------------------------|---------------------------|
| GET    | /api/tickets              | List tickets               |
| GET    | /api/tickets/count        | Count tickets              |
| GET    | /api/tickets/recent       | Recent tickets             |
| POST   | /api/tickets              | Raise ticket               |
| PUT    | /api/tickets/:id          | Update status              |
| DELETE | /api/tickets/:id          | Delete ticket              |

### Other
| Method | Endpoint    | Description                        |
|--------|-------------|------------------------------------|
| POST   | /api/reset  | Reset database to initial state    |

> Most list/count endpoints support `?vehicleType=Bike` or `?vehicleType=Car` filtering.

## Database Schema

Five tables: **users**, **vehicles**, **service_records**, **appointments**, **tickets**.

See `database.sql` for the full schema and seed data, or `models.js` for the Sequelize model definitions.

## License

MIT
