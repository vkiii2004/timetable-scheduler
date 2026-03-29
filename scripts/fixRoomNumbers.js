const mongoose = require('mongoose');
require('dotenv').config();

const Room = require('../models/Room');

const ROOM_NUMBER_MIN = 201;
const ROOM_NUMBER_MAX = 230;

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/timetable-scheduler';
  await mongoose.connect(uri);

  const rooms = await Room.find({ isActive: true }).sort({ createdAt: 1 });
  if (rooms.length === 0) {
    console.log('No active rooms found.');
    await mongoose.connection.close();
    return;
  }

  const numberPool = [];
  for (let n = ROOM_NUMBER_MIN; n <= ROOM_NUMBER_MAX; n += 1) {
    numberPool.push(String(n));
  }
  const randomized = shuffle(numberPool);

  const updates = [];
  for (let i = 0; i < rooms.length; i += 1) {
    if (i >= randomized.length) break;
    updates.push(
      Room.findByIdAndUpdate(rooms[i]._id, { roomNumber: randomized[i] }, { new: true })
    );
  }
  await Promise.all(updates);

  if (rooms.length > randomized.length) {
    console.warn(`Updated first ${randomized.length} rooms only (range exhausted at 230).`);
  } else {
    console.log(`Updated ${updates.length} rooms with room numbers ${ROOM_NUMBER_MIN}-${ROOM_NUMBER_MAX}.`);
  }

  await mongoose.connection.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

