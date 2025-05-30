# Ride Booking API with Socket.io

A real-time ride booking API built with Node.js, Express, Socket.io, and MongoDB.

## Features

- User authentication (Riders and Drivers)
- Real-time ride booking system
- JWT-based authentication
- Socket.io for real-time communication
- MongoDB for data persistence

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Update the `.env` file with your configuration
5. Start the  server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /auth/register` - Register as rider or driver
- `POST /auth/login` - Login and get JWT
- `POST /auth/validate-login` - Validate login credentials
- `POST /auth/refresh-token` - Refresh JWT token

### Rides
- `POST /rides` - Request a ride (Rider)
- `GET /rides/available` - Get available rides (Driver)
- `POST /rides/:id/accept` - Accept a ride (Driver)
- `POST /rides/:id/complete` - Complete a ride (Driver)
- `GET /rides/me` - View own rides

## Socket.io Events

### Client → Server
- `join` - Join room (rider:<id> or driver:<id>)
- `request-ride` - Rider creates ride
- `accept-ride` - Driver accepts ride
- `complete-ride` - Driver completes ride

### Server → Client
- `ride-requested` - To all drivers
- `ride-accepted` - To rider
- `ride-completed` - To rider

