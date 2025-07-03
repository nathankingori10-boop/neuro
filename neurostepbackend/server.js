const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
console.log('DB_HOST:', process.env.DB_HOST);



const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.SECRET_KEY;

// Middleware
app.use(cors());
app.use(express.json()); // Use the built-in body parser
let latestDoctorCommand = {
  message: "",
  servoAngle: 90
};

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false,
  },
});


db.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL database.');
});

// Root Route for Debugging
app.get('/', (req, res) => {
  res.send('Welcome to Neurostep Backend');
});

// Logging Middleware for Debugging
app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url}`);
  next();
});
app.get('/api/ml-predictions', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5001/predict');
    res.json(response.data);
  } catch (error) {
    console.error('Error communicating with ML backend:', error.message);
    res.status(500).json({ error: 'Failed to fetch predictions' });
  }
})


// API to Receive Sensor Data from ESP and Store in Database
app.post('/api/upload-sensor-data', (req, res) => {
  const { temperature, pulse, longitude, latitude, fallStatus } = req.body;

  if (
    temperature === undefined ||
    pulse === undefined ||
    longitude === undefined ||
    latitude === undefined ||
    fallStatus === undefined
  ) {
    return res.status(400).json({ error: 'Missing required sensor data.' });
  }

  // Helper function to insert a reading
  const insertReading = (sensorType, value) => {
    return new Promise((resolve, reject) => {
      // Find the sensor ID
      const sensorQuery = 'SELECT id FROM sensors WHERE sensor_type = ? LIMIT 1';
      db.query(sensorQuery, [sensorType], (err, results) => {
        if (err) return reject(err);
        if (results.length === 0) return reject(new Error(`Sensor type ${sensorType} not found.`));

        const sensorId = results[0].id;

        // Insert into sensor_readings
        const insertQuery = 'INSERT INTO sensor_readings (sensor_id, value) VALUES (?, ?)';
        db.query(insertQuery, [sensorId, value], (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    });
  };

  // Insert all readings
  Promise.all([
    insertReading('Temperature', temperature),
    insertReading('Pulse', pulse),
    insertReading('Longitude', longitude),
    insertReading('Latitude', latitude),
    insertReading('FallStatus', fallStatus),
  ])
    .then(() => {
      res.status(201).json({ success: true, message: 'Sensor data uploaded successfully.' });
    })
    .catch((err) => {
      console.error('Error inserting sensor data:', err);
      res.status(500).json({ error: 'Failed to insert sensor data.' });
    });
});

// Endpoint to update message and angle from doctor
app.post('/api/doctor-command', (req, res) => {
  const { message, servoAngle } = req.body;

  if (servoAngle === undefined && message === undefined) {
    return res.status(400).json({ error: 'At least message or servoAngle must be provided.' });
  }

  if (message !== undefined) {
    latestDoctorCommand.message = message;
  }
  if (servoAngle !== undefined) {
    latestDoctorCommand.servoAngle = servoAngle;
  }

  res.json({ success: true });
});


// Endpoint for ESP32 to fetch latest command
app.get('/api/doctor-command', (req, res) => {
  res.json(latestDoctorCommand);
});


// User Registration
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(query, [username, hashedPassword], (err) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Error registering user.' });
      }
      res.status(201).json({ success: true, message: 'User registered successfully.' });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error.' });
  }
});

// User Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const query = 'SELECT * FROM users WHERE username = ?';
  db.query(query, [username], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(400).json({ error: 'User not found.' });
    }

    try {
      const isValidPassword = await bcrypt.compare(password, results[0].password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials.' });
      }

      const token = jwt.sign({ id: results[0].id }, SECRET_KEY, { expiresIn: '1h' });
      res.json({ success: true, token });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error.' });
    }
  });
});

// API Route for Sensor Data
app.get('/api/sensor-data', (req, res) => {
  const query = `
    SELECT 
      sr.value AS sensorValue,
      sr.timestamp AS timestamp,
      s.sensor_name AS sensorName,
      s.sensor_type AS sensorType,
      s.location
    FROM sensor_readings sr
    JOIN sensors s ON sr.sensor_id = s.id
    ORDER BY sr.timestamp DESC
    LIMIT 50; -- Adjust limit as needed
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching sensor data:', err);
      return res.status(500).json({ error: 'Error fetching sensor data.' });
    }

    const data = results.map((row) => ({
      sensorValue: row.sensorValue,
      timestamp: new Date(row.timestamp).toLocaleString(),
      sensorName: row.sensorName,
      sensorType: row.sensorType,
      location: row.location,
    }));

    res.json({ data });
  });
});

// Notifications Route
app.get('/api/notifications', (req, res) => {
  const query = `
    SELECT 
      sr.value AS sensorValue,
      s.sensor_type AS sensorType
    FROM sensor_readings sr
    JOIN sensors s ON sr.sensor_id = s.id
    ORDER BY sr.timestamp DESC
    LIMIT 50;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching notifications:', err);
      return res.status(500).json({ error: 'Error fetching notifications.' });
    }

    const notifications = results.reduce((acc, row) => {
      if (row.sensorType === 'Temperature' && row.sensorValue > 40) {
        acc.push({ message: 'Too high temperature!', type: 'alert' });
      } else if (row.sensorType === 'Temperature' && row.sensorValue < 15) {
        acc.push({ message: 'Too low temperature!', type: 'alert' });
      } else if (row.sensorType === 'Pulse' && row.sensorValue < 60) {
        acc.push({ message: 'Very low pulses!', type: 'warning' });
      } else if (row.sensorType === 'Pulse' && row.sensorValue > 130) {
        acc.push({ message: 'Very High pulses!', type: 'warning' });
      } else if (row.sensorType === 'Fall Status' && row.sensorValue > 1) {
        acc.push({ message: 'User fallen', type: 'warning' });
      } else if ((row.sensorType === 'Latitude' || row.sensorType === 'Longitude') && row.sensorValue < 40) {
        acc.push({ message: 'Location out of range', type: 'alert' });
      }
      return acc;
    }, []);

    res.json({ notifications });
  });
});
app.get('/api/sensor-readings', (req, res) => {
  const query = `
    SELECT s.sensor_type, sr.value 
    FROM sensors s
    JOIN sensor_readings sr ON s.id = sr.sensor_id
    WHERE sr.timestamp = (
      SELECT MAX(timestamp) 
      FROM sensor_readings 
      WHERE sensor_id = s.id
    )
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching sensor readings:', err);
      return res.status(500).send('Internal server error');
    }

    const data = results.reduce((acc, row) => {
      acc[row.sensor_type.toLowerCase().replace(' ', '')] = row.value;
      return acc;
    }, {});

    res.json(data);
  });
});


// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
