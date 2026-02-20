const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const Teacher = require('../models/Teacher');
const Room = require('../models/Room');
const Lab = require('../models/Lab');
const Section = require('../models/Section');
const TimeSlot = require('../models/TimeSlot');
const Registration = require('../models/Registration');

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const FIXED_SLOTS = [
  { startTime: '09:00', endTime: '10:00', duration: 60, slotType: 'Lecture' },
  { startTime: '10:00', endTime: '11:00', duration: 60, slotType: 'Lecture' },
  { startTime: '11:15', endTime: '12:15', duration: 60, slotType: 'Lecture' },
  { startTime: '12:15', endTime: '13:15', duration: 60, slotType: 'Lecture' },
  { startTime: '14:00', endTime: '15:00', duration: 60, slotType: 'Lecture' },
  { startTime: '14:00', endTime: '16:00', duration: 120, slotType: 'Lab' },
  { startTime: '15:00', endTime: '16:00', duration: 60, slotType: 'Lecture' },
];

function toSectionName(yearKey, divKey) {
  return `${yearKey}(${divKey})`;
}

async function ensureTimeSlots() {
  const ids = [];
  for (const day of DAYS) {
    for (const slot of FIXED_SLOTS) {
      const existing = await TimeSlot.findOne({ day, startTime: slot.startTime, endTime: slot.endTime });
      if (existing) { ids.push(existing._id); continue; }
      const created = await TimeSlot.create({ day, ...slot, isActive: true });
      ids.push(created._id);
    }
  }
  return ids;
}

async function upsertTeachers(teacherMap) {
  const codeToId = new Map();
  for (const [code, info] of Object.entries(teacherMap)) {
    const name = info.name || code;
    let doc = await Teacher.findOne({ name });
    if (!doc) {
      doc = await Teacher.create({
        name,
        email: `${code.toLowerCase()}@example.edu`,
        department: 'CSE',
        subjects: info.subjects || [],
        maxHoursPerWeek: info.max_load || 12,
        availableDays: DAYS,
        isActive: true,
      });
    }
    codeToId.set(code, doc._id);
  }
  // Ensure Librarian teacher exists (for Library periods)
  let librarian = await Teacher.findOne({ name: 'Librarian' });
  if (!librarian) {
    librarian = await Teacher.create({
      name: 'Librarian',
      email: 'librarian@example.edu',
      department: 'Library',
      subjects: ['Library'],
      maxHoursPerWeek: 20,
      availableDays: DAYS,
      isActive: true,
    });
  }
  codeToId.set('LIB', librarian._id);
  return codeToId;
}

async function upsertLabs(labsJson) {
  for (const [labName, meta] of Object.entries(labsJson)) {
    const labNumber = labName;
    const capacity = meta.batch_size || 20;
    const existing = await Lab.findOne({ labNumber });
    if (!existing) {
      await Lab.create({
        labNumber,
        labName,
        capacity,
        labType: 'Computer Lab',
        floor: 1,
        building: 'Main',
        equipment: [],
        software: [],
        isActive: true,
      });
    }
  }
}

async function upsertRoomsFromLabs(labsJson) {
  for (const [labName] of Object.entries(labsJson)) {
    const roomNumber = labName; // treat lab name as a room code for display
    const existing = await Room.findOne({ roomNumber });
    if (!existing) {
      await Room.create({ roomNumber, roomName: labName, capacity: 40, roomType: 'Classroom', floor: 1, building: 'Main', facilities: [] });
    }
  }
}

async function upsertSections(yearsJson) {
  const nameToId = new Map();
  const yearMap = { SE: 2, TE: 3, BE: 4 };
  for (const [yearKey, yearObj] of Object.entries(yearsJson)) {
    const divisions = yearObj.divisions || {};
    for (const [divKey] of Object.entries(divisions)) {
      const sectionName = toSectionName(yearKey, divKey);
      let sec = await Section.findOne({ sectionName });
      if (!sec) {
        sec = await Section.create({ sectionName, department: 'CSE', year: yearMap[yearKey] || 1, semester: 1, strength: 60, subjects: [], isActive: true });
      }
      nameToId.set(sectionName, sec._id);
    }
  }
  return nameToId;
}

function pickTeacherIdForSubject(sectionInfo, teachersMap, teacherCodeToId, subjectName) {
  // Prefer teacher listed in section's teachers that can handle the subject per global teachers map
  if (Array.isArray(sectionInfo.teachers)) {
    for (const tCode of sectionInfo.teachers) {
      const tInfo = teachersMap[tCode];
      if (tInfo && Array.isArray(tInfo.subjects) && tInfo.subjects.some(s => s.toLowerCase().includes(subjectName.toLowerCase()))) {
        return teacherCodeToId.get(tCode) || null;
      }
    }
  }
  // Fallback: first teacher that mentions the subject
  for (const [tCode, tInfo] of Object.entries(teachersMap)) {
    if (Array.isArray(tInfo.subjects) && tInfo.subjects.some(s => s.toLowerCase().includes(subjectName.toLowerCase()))) {
      return teacherCodeToId.get(tCode) || null;
    }
  }
  return null;
}

async function createApprovedRegistrations(data, sectionNameToId, teacherCodeToId, anyLectureSlotId) {
  const semester = 'Sem I';
  const academicYear = '2025-2026';

  // Build broad availability: all lecture slots Mon–Fri, and all lab slots Mon–Fri
  const allLectureSlots = await TimeSlot.find({
    day: { $in: DAYS },
    duration: { $in: [60] }
  }).select('_id').lean();
  const lectureSlotIds = allLectureSlots.map(s => s._id);

  const allLabSlots = await TimeSlot.find({
    day: { $in: DAYS },
    startTime: '14:00',
    endTime: '16:00'
  }).select('_id').lean();
  const labSlotIds = allLabSlots.map(s => s._id);

  for (const [yearKey, yearObj] of Object.entries(data.years)) {
    const divisions = yearObj.divisions || {};
    for (const [divKey, sectionInfo] of Object.entries(divisions)) {
      const sectionName = toSectionName(yearKey, divKey);
      const sectionId = sectionNameToId.get(sectionName);
      if (!sectionId) continue;

      const subjects = sectionInfo.subjects || [];
      for (const subj of subjects) {
        const teacherId = pickTeacherIdForSubject(sectionInfo, data.teachers, teacherCodeToId, subj);
        if (!teacherId) continue;
        const reg = new Registration({
          section: sectionId,
          subject: { subjectName: subj, subjectCode: subj.toUpperCase(), credits: 3, hoursPerWeek: 3, isLab: false },
          teacher: teacherId,
          timeSlots: lectureSlotIds.length ? lectureSlotIds : [anyLectureSlotId].filter(Boolean),
          semester,
          academicYear,
          status: 'Approved',
        });
        await reg.save();
      }

      const labs = sectionInfo.labs || [];
      for (const labName of labs) {
        const meta = data.labs[labName];
        if (!meta) continue;
        const linked = meta.linked_subject || labName;
        const teacherId = meta.teacher ? (teacherCodeToId.get(meta.teacher) || null) : null;
        if (!teacherId) continue;
        // pick a lab slot 14:00-16:00 (created above)
        const reg = new Registration({
          section: sectionId,
          subject: { subjectName: labName, subjectCode: linked.toUpperCase(), credits: 1, hoursPerWeek: 2, isLab: true },
          teacher: teacherId,
          timeSlots: labSlotIds.length ? labSlotIds : [anyLectureSlotId].filter(Boolean),
          semester,
          academicYear,
          status: 'Approved',
        });
        await reg.save();
      }

      // Add Library: 2 sessions per week, lectures, assign Librarian
      const librarianId = teacherCodeToId.get('LIB');
      if (librarianId) {
        for (let i = 0; i < 2; i++) {
          const libReg = new Registration({
            section: sectionId,
            subject: { subjectName: 'Library', subjectCode: 'LIB', credits: 0, hoursPerWeek: 1, isLab: false },
            teacher: librarianId,
            timeSlots: lectureSlotIds.length ? lectureSlotIds : [anyLectureSlotId].filter(Boolean),
            semester,
            academicYear,
            status: 'Approved',
            priority: 1,
          });
          await libReg.save();
        }
      }
    }
  }
}

async function main() {
  const filePath = path.resolve(process.cwd(), 'data.json');
  if (!fs.existsSync(filePath)) {
    console.error('Place your JSON at ./data.json');
    process.exit(1);
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(raw);

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/timetable-scheduler';
  await mongoose.connect(uri);

  // Ensure core refs
  await ensureTimeSlots();
  await upsertLabs(data.labs || {});
  await upsertRoomsFromLabs(data.labs || {});
  const teacherCodeToId = await upsertTeachers(data.teachers || {});
  const sectionNameToId = await upsertSections(data.years || {});

  // Pick any lecture timeslot id (Monday 09:00-10:00)
  const anyLectureSlot = await TimeSlot.findOne({ day: 'Monday', startTime: '09:00', endTime: '10:00' });
  const anyLectureSlotId = anyLectureSlot ? anyLectureSlot._id : null;

  if (anyLectureSlotId) {
    await createApprovedRegistrations(data, sectionNameToId, teacherCodeToId, anyLectureSlotId);
  } else {
    console.warn('No lecture slot found to assign to registrations. Skipping registrations.');
  }

  console.log('✅ Import complete.');
  await mongoose.connection.close();
}

main().catch(err => { console.error(err); process.exit(1); });


