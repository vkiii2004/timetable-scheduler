const mongoose = require('mongoose');
require('dotenv').config();

const Teacher = require('../models/Teacher');
const Room = require('../models/Room');
const Lab = require('../models/Lab');
const Section = require('../models/Section');
const TimeSlot = require('../models/TimeSlot');
const Registration = require('../models/Registration');
const Timetable = require('../models/Timetable');

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/timetable-scheduler';
  await mongoose.connect(uri);

  await Promise.all([
    Teacher.deleteMany({}),
    Room.deleteMany({}),
    Lab.deleteMany({}),
    Section.deleteMany({}),
    TimeSlot.deleteMany({}),
    Registration.deleteMany({}),
    Timetable.deleteMany({}),
  ]);

  console.log('✅ All collections cleared.');
  await mongoose.connection.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});


