const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const mongoose = require('mongoose');
require('dotenv').config();

const Teacher = require('../models/Teacher');
const Room = require('../models/Room');
const Lab = require('../models/Lab');
const Section = require('../models/Section');
const TimeSlot = require('../models/TimeSlot');
const Registration = require('../models/Registration');

function parseTimeLabel(label) {
  if (!label) return null;
  // Accept formats like "09:00 – 10:00" or "09:00-10:00"
  const norm = String(label).replace(/\s+–\s+|\s*-\s*/g, '-').trim();
  const m = norm.match(/^(\d{2}:\d{2})-(\d{2}:\d{2})$/);
  if (!m) return null;
  const [ , startTime, endTime ] = m;
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const duration = (eh * 60 + em) - (sh * 60 + sm);
  return { startTime, endTime, duration };
}

function parseCellValue(val) {
  if (!val) return null;
  const s = String(val).trim();
  if (!s || /^library$/i.test(s)) return { subjectName: 'Library', teacherCode: null, roomCode: 'Library' };
  // Patterns like: "DBMS(NMN)-232" or "VLSI(MSS)-239-C"
  const m = s.match(/^([A-Za-z0-9 &+./-]+?)\s*\(([^)]+)\)\s*-\s*([A-Za-z0-9-]+)$/);
  if (m) {
    return { subjectName: m[1].trim(), teacherCode: m[2].trim(), roomCode: m[3].trim() };
  }
  // Fallback: subject only
  return { subjectName: s, teacherCode: null, roomCode: null };
}

async function main() {
  const filePath = path.resolve(process.cwd(), 'data.xlsx');
  if (!fs.existsSync(filePath)) {
    console.error('data.xlsx not found in project root. Place your Excel file at ./data.xlsx');
    process.exit(1);
  }

  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/timetable-scheduler';
  await mongoose.connect(MONGODB_URI);

  // Read workbook
  const wb = xlsx.readFile(filePath, { cellText: false, cellDates: false });
  // Use the first sheet by default
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(ws, { header: 1, defval: '' });

  // Heuristic: find header row containing time columns (look for HH:MM in cells)
  let headerRowIdx = -1;
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const matches = r.filter(c => parseTimeLabel(String(c).replace(/\s+/g, ' ').trim())).length;
    if (matches >= 2) { headerRowIdx = i; break; }
  }
  if (headerRowIdx === -1) {
    console.error('Could not detect time header row. Ensure a row has time ranges like 09:00 – 10:00');
    process.exit(1);
  }

  const header = rows[headerRowIdx];
  // Build timeSlots from header columns (skip first 1-2 columns for Day/Class)
  // Attempt to detect first time column by scanning for first parseable label
  const timeCols = [];
  header.forEach((cell, idx) => {
    const t = parseTimeLabel(String(cell).replace(/\s+/g, ' ').trim());
    if (t) timeCols.push({ idx, ...t });
  });
  if (timeCols.length === 0) {
    console.error('No time slot columns detected.');
    process.exit(1);
  }

  // Create or reuse time slots
  const slotIdByKey = new Map();
  for (const tc of timeCols) {
    const key = `${tc.startTime}-${tc.endTime}`;
    let slot = await TimeSlot.findOne({ startTime: tc.startTime, endTime: tc.endTime });
    if (!slot) {
      slot = new TimeSlot({ day: 'Monday', startTime: tc.startTime, endTime: tc.endTime, duration: tc.duration, slotType: 'Lecture', isActive: true });
      await slot.save();
    }
    slotIdByKey.set(key, slot._id);
  }

  // Collect unique entities
  const teacherCodes = new Set();
  const rooms = new Set();
  const sections = new Set(['BE(A)', 'BE(B)', 'TE(A)', 'TE(B)', 'TE(C)', 'SE(A)', 'SE(B)', 'SE(C)']);

  // Scan body: assume first column is Day (spanning), second column is Class, remaining are time columns
  for (let r = headerRowIdx + 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length === 0) continue;
    const day = String(row[0] || '').trim() || null; // might be empty when merged; we still process
    const cls = String(row[1] || '').trim();
    if (cls) sections.add(cls);
    for (const tc of timeCols) {
      const cell = row[tc.idx];
      const parsed = parseCellValue(cell);
      if (parsed?.teacherCode) teacherCodes.add(parsed.teacherCode);
      if (parsed?.roomCode) rooms.add(parsed.roomCode);
    }
  }

  // Upsert Teachers (placeholder data with code as name)
  for (const code of teacherCodes) {
    const existing = await Teacher.findOne({ name: code });
    if (!existing) {
      await Teacher.create({ name: code, email: `${code.toLowerCase()}@example.edu`, department: 'TBD', subjects: [], maxHoursPerWeek: 40, availableDays: ['Monday','Tuesday','Wednesday','Thursday','Friday'] });
    }
  }

  // Upsert Rooms
  for (const rn of rooms) {
    const existing = await Room.findOne({ roomNumber: rn });
    if (!existing) {
      await Room.create({ roomNumber: rn, roomName: rn, capacity: 40, roomType: 'Classroom', floor: 1, building: 'Main', facilities: [] });
    }
  }

  // Upsert Sections
  for (const sec of sections) {
    const existing = await Section.findOne({ sectionName: sec });
    if (!existing) {
      await Section.create({ sectionName: sec, department: 'Engineering', year: 1, semester: 'Sem I', strength: 40, subjects: [] });
    }
  }

  console.log('Excel scan completed. Teachers/Rooms/Sections ensured.');
  console.log('Next, create registrations as needed based on your timetable logic.');

  await mongoose.connection.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});


