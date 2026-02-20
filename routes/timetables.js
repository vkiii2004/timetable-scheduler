const express = require('express');
const router = express.Router();
const Timetable = require('../models/Timetable');
const Registration = require('../models/Registration');
const Section = require('../models/Section');
const Teacher = require('../models/Teacher');
const Room = require('../models/Room');
const Lab = require('../models/Lab');
const TimeSlot = require('../models/TimeSlot');
const { body, validationResult } = require('express-validator');

// Get all timetables
router.get('/', async (req, res) => {
  try {
    const timetables = await Timetable.find()
      .populate('sections')
      .populate('schedule.teacher', 'name email')
      .populate('schedule.section', 'sectionName department')
      .populate('schedule.room', 'roomNumber roomName')
      .populate('schedule.lab', 'labNumber labName')
      .populate('schedule.timeSlot');
    res.json(timetables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get timetable by ID
router.get('/:id', async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id)
      .populate('sections')
      .populate('schedule.teacher', 'name email')
      .populate('schedule.section', 'sectionName department')
      .populate('schedule.room', 'roomNumber roomName')
      .populate('schedule.lab', 'labNumber labName')
      .populate('schedule.timeSlot');
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate timetable
router.post('/generate', [
  body('name').notEmpty().withMessage('Timetable name is required'),
  body('semester').notEmpty().withMessage('Semester is required'),
  body('academicYear').notEmpty().withMessage('Academic year is required'),
  body('sections').isArray({ min: 1 }).withMessage('At least one section is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, semester, academicYear, sections } = req.body;

    // Get approved registrations for the specified sections
    const norm = (v) => (typeof v === 'string' ? v.trim() : v);
    const semesterRegex = new RegExp(`^${norm(semester).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    const yearRegex = new RegExp(`^${norm(academicYear).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

    const registrations = await Registration.find({
      section: { $in: sections },
      semester: { $regex: semesterRegex },
      academicYear: { $regex: yearRegex },
      status: 'Approved'
    }).populate(['section', 'teacher', 'room', 'lab', 'timeSlots']);

    if (registrations.length === 0) {
      return res.status(400).json({ message: 'No approved registrations found for the specified criteria' });
    }

    // Get all time slots
    const timeSlots = await TimeSlot.find({ isActive: true }).sort({ day: 1, startTime: 1 });
    
    // Get all rooms and labs
    const rooms = await Room.find({ isActive: true });
    const labs = await Lab.find({ isActive: true });

    // Generate timetable using conflict-free algorithm
    const { schedule, conflicts } = await generateTimetable(registrations, timeSlots, rooms, labs);

    // Create timetable document
    const timetable = new Timetable({
      name,
      semester,
      academicYear,
      sections,
      schedule,
      conflicts,
      status: conflicts.length > 0 ? 'Draft' : 'Generated'
    });

    await timetable.save();
    await timetable.populate([
      'sections',
      'schedule.teacher',
      'schedule.section',
      'schedule.room',
      'schedule.lab',
      'schedule.timeSlot'
    ]);

    res.status(201).json(timetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper function to generate timetable
async function generateTimetable(registrations, timeSlots, rooms, labs) {
  const schedule = [];
  const conflicts = [];
  // Track used time slots per section to prevent a section having two classes at the same time
  const usedSlotsBySection = new Map(); // key: `${sectionId}:${timeSlotId}` -> true
  const teacherSchedule = new Map(); // Track teacher availability
  const roomSchedule = new Map(); // Track room availability
  const labSchedule = new Map(); // Track lab availability
  const sectionDayLoad = new Map(); // key: `${sectionId}:${day}` -> count
  const sectionLibraryDay = new Map(); // key: `${sectionId}:${day}` -> boolean

  // Sort registrations by priority (higher priority first)
  registrations.sort((a, b) => b.priority - a.priority);

  for (const registration of registrations) {
    const { section, subject, teacher, timeSlots: requestedSlots } = registration;
    const isLab = Boolean(subject?.isLab);
    const isLibrary = subject?.subjectName?.toLowerCase() === 'library';
    const hours = Number(subject?.hoursPerWeek || 1);
    const sessionLengthHours = isLab ? 2 : 1; // per our fixed slots
    let sessionsNeeded = Math.max(1, Math.ceil(hours / sessionLengthHours));

    while (sessionsNeeded > 0) {
      // Find available time slots for this occurrence
      let availableSlots = findAvailableSlots(
        requestedSlots,
        timeSlots,
        usedSlotsBySection,
        teacherSchedule,
        roomSchedule,
        labSchedule,
        section,
        teacher,
        isLab
      );

      // For Library, restrict to at most 1 session per day for a section
      if (isLibrary) {
        availableSlots = availableSlots.filter(s => !sectionLibraryDay.get(`${section._id.toString()}:${s.day}`));
      }

      // Prefer days with fewer assignments for this section to distribute across the week
      availableSlots.sort((a, b) => {
        const keyA = `${section._id.toString()}:${a.day}`;
        const keyB = `${section._id.toString()}:${b.day}`;
        const loadA = sectionDayLoad.get(keyA) || 0;
        const loadB = sectionDayLoad.get(keyB) || 0;
        if (loadA !== loadB) return loadA - loadB;
        return a.startTime.localeCompare(b.startTime);
      });

      if (availableSlots.length === 0) {
        // Force-place: pick earliest slot not used by this section
        const fallbackTimeSlot = timeSlots.find(ts => !usedSlotsBySection.has(`${section._id.toString()}:${ts._id.toString()}`));
        if (!fallbackTimeSlot) {
          conflicts.push({
            type: 'No Available Slots',
            description: `No available time slots (even after fallback) for ${subject.subjectName} - ${section.sectionName}`,
            affectedItems: [registration]
          });
          break;
        }
        availableSlots.push({
          timeSlotId: fallbackTimeSlot._id.toString(),
          day: fallbackTimeSlot.day,
          startTime: fallbackTimeSlot.startTime,
          endTime: fallbackTimeSlot.endTime
        });
      }

      // Try available slots until we find one with a free room/lab
      let assignedSlot = null;
      let timeSlot = null;
      let assignedRoom = null;
      let assignedLab = null;
      for (const candidate of availableSlots) {
        const ts = timeSlots.find(t => t._id.toString() === candidate.timeSlotId);
        if (!ts) continue;
        if (isLab) {
          const lab = findAvailableLab(labs, candidate, labSchedule, section.strength);
          if (lab) {
            assignedSlot = candidate;
            timeSlot = ts;
            assignedLab = lab;
            labSchedule.set(`${lab._id.toString()}:${candidate.timeSlotId}`, true);
            break;
          }
        } else {
          const room = findAvailableRoom(rooms, candidate, roomSchedule, section.strength);
          assignedSlot = candidate;
          timeSlot = ts;
          if (room) {
            assignedRoom = room;
            roomSchedule.set(`${room._id.toString()}:${candidate.timeSlotId}`, true);
          }
          break;
        }
      }
      if (!assignedSlot) {
        // Force into first time slot; mark conflict
        const fallbackTimeSlot = timeSlots[0];
        if (!fallbackTimeSlot) {
          conflicts.push({
            type: 'No Available Slots',
            description: `No time slots defined to force-place ${subject.subjectName} - ${section.sectionName}`,
            affectedItems: [registration]
          });
          break;
        }
        assignedSlot = {
          timeSlotId: fallbackTimeSlot._id.toString(),
          day: fallbackTimeSlot.day,
          startTime: fallbackTimeSlot.startTime,
          endTime: fallbackTimeSlot.endTime
        };
        timeSlot = fallbackTimeSlot;
        if (isLab) {
          assignedLab = labs[0] || null;
          conflicts.push({
            type: 'Lab Conflict',
            description: `Forced placement with potentially overlapping lab for ${subject.subjectName} - ${section.sectionName}`,
            affectedItems: [registration]
          });
        } else {
          assignedRoom = rooms[0] || null;
          conflicts.push({
            type: 'Room Conflict',
            description: `Forced placement with potentially overlapping room for ${subject.subjectName} - ${section.sectionName}`,
            affectedItems: [registration]
          });
        }
      } else {
        if (!isLab && !assignedRoom) {
          conflicts.push({
            type: 'Room Conflict',
            description: `No free room; placed ${subject.subjectName} - ${section.sectionName} without room in ${timeSlot.day} ${timeSlot.startTime}-${timeSlot.endTime}`,
            affectedItems: [registration]
          });
        }
        if (isLab && !assignedLab) {
          assignedLab = labs[0] || null;
          conflicts.push({
            type: 'Lab Conflict',
            description: `No free lab; forced placement for ${subject.subjectName} - ${section.sectionName} in ${timeSlot.day} ${timeSlot.startTime}-${timeSlot.endTime}`,
            affectedItems: [registration]
          });
        }
      }

      // Add to schedule
      schedule.push({
        day: timeSlot.day,
        timeSlot: timeSlot._id,
        section: section._id,
        subject: {
          subjectName: subject.subjectName,
          subjectCode: subject.subjectCode,
          credits: subject.credits,
          isLab: subject.isLab
        },
        teacher: teacher._id,
        room: assignedRoom ? assignedRoom._id : null,
        lab: assignedLab ? assignedLab._id : null,
        isLab: subject.isLab
      });

      // Mark slot as used for this section and update loads
      usedSlotsBySection.set(`${section._id.toString()}:${assignedSlot.timeSlotId}`, true);
      const dayKey = `${section._id.toString()}:${timeSlot.day}`;
      sectionDayLoad.set(dayKey, (sectionDayLoad.get(dayKey) || 0) + 1);
      if (isLibrary) sectionLibraryDay.set(dayKey, true);
      if (!teacherSchedule.has(teacher._id)) teacherSchedule.set(teacher._id, []);
      teacherSchedule.get(teacher._id).push(assignedSlot.timeSlotId);

      sessionsNeeded -= 1;
    }
  }

  // Final pass: fill remaining lecture slots with existing lecture subjects (round-robin per section)
  const lectureSlots = timeSlots.filter(ts => ts.slotType === 'Lecture');
  const regsBySection = new Map();
  for (const r of registrations) {
    if (r.subject?.isLab) continue;
    const sid = r.section._id.toString();
    if (!regsBySection.has(sid)) regsBySection.set(sid, []);
    regsBySection.get(sid).push(r);
  }
  for (const [sectionId, lectureRegs] of regsBySection.entries()) {
    if (lectureRegs.length === 0) continue;
    let rrIdx = 0;
    for (const ts of lectureSlots) {
      const slotKey = `${sectionId}:${ts._id.toString()}`;
      if (usedSlotsBySection.has(slotKey)) continue;
      const reg = lectureRegs[rrIdx % lectureRegs.length];
      rrIdx += 1;
      const section = reg.section;
      const teacher = reg.teacher;
      let assignedRoom = findAvailableRoom(rooms, { timeSlotId: ts._id.toString() }, roomSchedule, section.strength) || null;
      if (assignedRoom) {
        roomSchedule.set(`${assignedRoom._id.toString()}:${ts._id.toString()}`, true);
      } else {
        assignedRoom = rooms[0] || null;
        conflicts.push({
          type: 'Room Conflict',
          description: `Forced placement without free room for ${reg.subject.subjectName} - ${section.sectionName} in ${ts.day} ${ts.startTime}-${ts.endTime}`,
          affectedItems: [reg]
        });
      }
      schedule.push({
        day: ts.day,
        timeSlot: ts._id,
        section: section._id,
        subject: {
          subjectName: reg.subject.subjectName,
          subjectCode: reg.subject.subjectCode,
          credits: reg.subject.credits,
          isLab: false,
        },
        teacher: teacher._id,
        room: assignedRoom ? assignedRoom._id : null,
        lab: null,
        isLab: false,
      });
      usedSlotsBySection.set(slotKey, true);
      const dayKey = `${sectionId}:${ts.day}`;
      sectionDayLoad.set(dayKey, (sectionDayLoad.get(dayKey) || 0) + 1);
      if (!teacherSchedule.has(teacher._id)) teacherSchedule.set(teacher._id, []);
      teacherSchedule.get(teacher._id).push(ts._id.toString());
    }
  }

  return { schedule, conflicts };
}

// Helper function to find available time slots
function findAvailableSlots(requestedSlots, timeSlots, usedSlotsBySection, teacherSchedule, roomSchedule, labSchedule, section, teacher, isLab) {
  const availableSlots = [];
  const slotsToCheck = (Array.isArray(requestedSlots) && requestedSlots.length > 0)
    ? requestedSlots
    : timeSlots.map(ts => ts._id);
  
  for (const requestedSlot of slotsToCheck) {
    const timeSlot = timeSlots.find(ts => ts._id.toString() === requestedSlot.toString());
    if (!timeSlot) continue;

    // Check if this section already has a class in this time slot
    if (usedSlotsBySection.has(`${section._id.toString()}:${timeSlot._id.toString()}`)) continue;

    // Check teacher availability
    if (teacherSchedule.has(teacher._id) && 
        teacherSchedule.get(teacher._id).includes(timeSlot._id.toString())) continue;

    // Do not pre-check room/lab here; we will pick a free room/lab during assignment
    availableSlots.push({
      timeSlotId: timeSlot._id.toString(),
      day: timeSlot.day,
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime
    });
  }

  return availableSlots;
}

// Helper function to find available room
function findAvailableRoom(rooms, timeSlot, roomSchedule, requiredCapacity) {
  // Allow multiple rooms per slot; block only if that specific room is busy at the slot
  return rooms.find(room => !roomSchedule.has(`${room._id.toString()}:${timeSlot.timeSlotId}`));
}

// Helper function to find available lab
function findAvailableLab(labs, timeSlot, labSchedule, requiredCapacity) {
  return labs.find(lab => !labSchedule.has(`${lab._id.toString()}:${timeSlot.timeSlotId}`));
}

// Update timetable
router.put('/:id', async (req, res) => {
  try {
    const timetable = await Timetable.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate([
      'sections',
      'schedule.teacher',
      'schedule.section',
      'schedule.room',
      'schedule.lab',
      'schedule.timeSlot'
    ]);
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete timetable
router.delete('/:id', async (req, res) => {
  try {
    const timetable = await Timetable.findByIdAndDelete(req.params.id);
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }
    res.json({ message: 'Timetable deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Publish timetable
router.patch('/:id/publish', async (req, res) => {
  try {
    const timetable = await Timetable.findByIdAndUpdate(
      req.params.id,
      { status: 'Published' },
      { new: true }
    ).populate([
      'sections',
      'schedule.teacher',
      'schedule.section',
      'schedule.room',
      'schedule.lab',
      'schedule.timeSlot'
    ]);
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

