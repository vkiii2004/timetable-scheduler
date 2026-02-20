const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const Teacher = require('./models/Teacher');
const Room = require('./models/Room');
const Lab = require('./models/Lab');
const Section = require('./models/Section');
const TimeSlot = require('./models/TimeSlot');
const Registration = require('./models/Registration');

// Sample data
const sampleTeachers = [
  {
    name: 'Dr. John Smith',
    email: 'john.smith@university.edu',
    department: 'Computer Science',
    subjects: ['Data Structures', 'Algorithms', 'Database Systems'],
    maxHoursPerWeek: 40,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  },
  {
    name: 'Prof. Sarah Johnson',
    email: 'sarah.johnson@university.edu',
    department: 'Mathematics',
    subjects: ['Calculus', 'Linear Algebra', 'Statistics'],
    maxHoursPerWeek: 35,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
  },
  {
    name: 'Dr. Michael Brown',
    email: 'michael.brown@university.edu',
    department: 'Physics',
    subjects: ['Mechanics', 'Thermodynamics', 'Electromagnetism'],
    maxHoursPerWeek: 40,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  },
];

const sampleRooms = [
  {
    roomNumber: 'CS101',
    roomName: 'Computer Science Lab 1',
    capacity: 30,
    roomType: 'Classroom',
    floor: 1,
    building: 'Computer Science Building',
    facilities: ['Projector', 'Whiteboard', 'Air Conditioning'],
  },
  {
    roomNumber: 'CS102',
    roomName: 'Computer Science Lab 2',
    capacity: 25,
    roomType: 'Classroom',
    floor: 1,
    building: 'Computer Science Building',
    facilities: ['Projector', 'Whiteboard', 'Air Conditioning'],
  },
  {
    roomNumber: 'MATH201',
    roomName: 'Mathematics Lecture Hall',
    capacity: 50,
    roomType: 'Lecture Hall',
    floor: 2,
    building: 'Mathematics Building',
    facilities: ['Projector', 'Blackboard', 'Air Conditioning'],
  },
];

const sampleLabs = [
  {
    labNumber: 'CSL101',
    labName: 'Programming Lab',
    capacity: 25,
    labType: 'Computer Lab',
    floor: 1,
    building: 'Computer Science Building',
    equipment: [
      { name: 'Desktop Computers', quantity: 25 },
      { name: 'Projector', quantity: 1 },
    ],
    software: ['Visual Studio Code', 'Python', 'Java', 'MySQL'],
  },
  {
    labNumber: 'PHYL101',
    labName: 'Physics Laboratory',
    capacity: 20,
    labType: 'Physics Lab',
    floor: 1,
    building: 'Physics Building',
    equipment: [
      { name: 'Oscilloscope', quantity: 10 },
      { name: 'Multimeter', quantity: 20 },
    ],
    software: ['LabVIEW', 'MATLAB'],
  },
];

const sampleSections = [
  {
    sectionName: 'CS-A',
    department: 'Computer Science',
    year: 2,
    semester: 3,
    strength: 30,
    subjects: [
      {
        subjectName: 'Data Structures',
        subjectCode: 'CS201',
        credits: 4,
        hoursPerWeek: 3,
        isLab: false,
      },
      {
        subjectName: 'Data Structures Lab',
        subjectCode: 'CS201L',
        credits: 1,
        hoursPerWeek: 2,
        isLab: true,
      },
    ],
  },
  {
    sectionName: 'MATH-A',
    department: 'Mathematics',
    year: 1,
    semester: 1,
    strength: 40,
    subjects: [
      {
        subjectName: 'Calculus I',
        subjectCode: 'MATH101',
        credits: 4,
        hoursPerWeek: 4,
        isLab: false,
      },
    ],
  },
];

const sampleTimeSlots = [
  { day: 'Monday', startTime: '09:00', endTime: '10:00', duration: 60, slotType: 'Lecture' },
  { day: 'Monday', startTime: '10:00', endTime: '11:00', duration: 60, slotType: 'Lecture' },
  { day: 'Monday', startTime: '11:00', endTime: '12:00', duration: 60, slotType: 'Lecture' },
  { day: 'Monday', startTime: '14:00', endTime: '16:00', duration: 120, slotType: 'Lab' },
  { day: 'Tuesday', startTime: '09:00', endTime: '10:00', duration: 60, slotType: 'Lecture' },
  { day: 'Tuesday', startTime: '10:00', endTime: '11:00', duration: 60, slotType: 'Lecture' },
  { day: 'Tuesday', startTime: '11:00', endTime: '12:00', duration: 60, slotType: 'Lecture' },
  { day: 'Tuesday', startTime: '14:00', endTime: '16:00', duration: 120, slotType: 'Lab' },
  { day: 'Wednesday', startTime: '09:00', endTime: '10:00', duration: 60, slotType: 'Lecture' },
  { day: 'Wednesday', startTime: '10:00', endTime: '11:00', duration: 60, slotType: 'Lecture' },
  { day: 'Wednesday', startTime: '11:00', endTime: '12:00', duration: 60, slotType: 'Lecture' },
  { day: 'Thursday', startTime: '09:00', endTime: '10:00', duration: 60, slotType: 'Lecture' },
  { day: 'Thursday', startTime: '10:00', endTime: '11:00', duration: 60, slotType: 'Lecture' },
  { day: 'Thursday', startTime: '11:00', endTime: '12:00', duration: 60, slotType: 'Lecture' },
  { day: 'Friday', startTime: '09:00', endTime: '10:00', duration: 60, slotType: 'Lecture' },
  { day: 'Friday', startTime: '10:00', endTime: '11:00', duration: 60, slotType: 'Lecture' },
  { day: 'Friday', startTime: '11:00', endTime: '12:00', duration: 60, slotType: 'Lecture' },
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/timetable-scheduler');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Teacher.deleteMany({});
    await Room.deleteMany({});
    await Lab.deleteMany({});
    await Section.deleteMany({});
    await TimeSlot.deleteMany({});
    await Registration.deleteMany({});
    console.log('Cleared existing data');

    // Insert sample data
    const teachers = await Teacher.insertMany(sampleTeachers);
    console.log(`Inserted ${teachers.length} teachers`);

    const rooms = await Room.insertMany(sampleRooms);
    console.log(`Inserted ${rooms.length} rooms`);

    const labs = await Lab.insertMany(sampleLabs);
    console.log(`Inserted ${labs.length} labs`);

    const timeSlots = await TimeSlot.insertMany(sampleTimeSlots);
    console.log(`Inserted ${timeSlots.length} time slots`);

    // Update sections with class teachers
    const updatedSections = sampleSections.map((section, index) => ({
      ...section,
      classTeacher: teachers[index % teachers.length]._id,
    }));

    const sections = await Section.insertMany(updatedSections);
    console.log(`Inserted ${sections.length} sections`);

    // Create a few Approved registrations so generation works immediately
    const semester = 'Sem I';
    const academicYear = '2025-2026';

    // Helper to pick a slot by exact start-end
    const getSlot = (start, end) => timeSlots.find(ts => ts.startTime === start && ts.endTime === end)?._id;

    const regDocs = [
      // CS-A: Data Structures (Lecture)
      {
        section: sections.find(s => s.sectionName === 'CS-A')._id,
        subject: { subjectName: 'Data Structures', subjectCode: 'CS201', credits: 4, hoursPerWeek: 3, isLab: false },
        teacher: teachers[0]._id,
        timeSlots: [getSlot('09:00', '10:00')].filter(Boolean),
        semester,
        academicYear,
        status: 'Approved'
      },
      // CS-A: Data Structures Lab (Lab)
      {
        section: sections.find(s => s.sectionName === 'CS-A')._id,
        subject: { subjectName: 'Data Structures Lab', subjectCode: 'CS201L', credits: 1, hoursPerWeek: 2, isLab: true },
        teacher: teachers[0]._id,
        timeSlots: [getSlot('14:00', '16:00')].filter(Boolean),
        lab: null,
        semester,
        academicYear,
        status: 'Approved'
      },
      // MATH-A: Calculus I (Lecture)
      {
        section: sections.find(s => s.sectionName === 'MATH-A')._id,
        subject: { subjectName: 'Calculus I', subjectCode: 'MATH101', credits: 4, hoursPerWeek: 4, isLab: false },
        teacher: teachers[1]._id,
        timeSlots: [getSlot('10:00', '11:00')].filter(Boolean),
        semester,
        academicYear,
        status: 'Approved'
      }
    ];

    // Filter out any with missing time slots
    const registrationsToInsert = regDocs.filter(r => r.timeSlots && r.timeSlots.length > 0);
    const regs = await Registration.insertMany(registrationsToInsert);
    console.log(`Inserted ${regs.length} registrations (Approved)`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\nSample data created:');
    console.log(`- ${teachers.length} teachers`);
    console.log(`- ${rooms.length} rooms`);
    console.log(`- ${labs.length} labs`);
    console.log(`- ${sections.length} sections`);
    console.log(`- ${timeSlots.length} time slots`);
    console.log(`- ${regs.length} approved registrations`);
    console.log('\nYou can now start the application and begin creating registrations!');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seeding function
seedDatabase();

