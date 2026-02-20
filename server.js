const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/timetable-scheduler';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/teachers', require('./routes/teachers'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/labs', require('./routes/labs'));
app.use('/api/sections', require('./routes/sections'));
app.use('/api/timeslots', require('./routes/timeslots'));
app.use('/api/registrations', require('./routes/registrations'));
app.use('/api/timetables', require('./routes/timetables'));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Timetable Scheduler API is running!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
