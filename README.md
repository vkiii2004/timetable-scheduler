# Timetable Scheduler - MERN Stack Application

A comprehensive timetable scheduling system built with the MERN stack (MongoDB, Express.js, React, Node.js) that allows educational institutions to manage teachers, rooms, labs, sections, time slots, and generate optimized timetables.

## Features

### Core Functionality
- **Teacher Management**: Add, edit, and manage teacher information including subjects, availability, and working hours
- **Room Management**: Manage classroom and lecture hall information with capacity and facilities
- **Lab Management**: Handle laboratory resources with equipment and software details
- **Section Management**: Organize student sections with subjects and class teachers
- **Time Slot Management**: Define available time slots for scheduling
- **Registration Management**: Register subjects for sections with teachers and time preferences
- **Timetable Generation**: Automatically generate conflict-free timetables
- **Conflict Detection**: Identify and report scheduling conflicts
- **Timetable Visualization**: View generated timetables in a calendar format

### Key Features
- ✅ **Conflict-Free Scheduling**: Intelligent algorithm to avoid teacher, room, and lab conflicts
- ✅ **Priority-Based Assignment**: Assign priority levels to registrations
- ✅ **Multi-Section Support**: Generate timetables for multiple sections simultaneously
- ✅ **Lab and Theory Separation**: Handle both theoretical and practical classes
- ✅ **Real-time Conflict Detection**: Immediate feedback on scheduling issues
- ✅ **Responsive Design**: Modern UI that works on all devices
- ✅ **Status Management**: Track timetable status (Draft, Generated, Published)

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Express Validator** - Input validation
- **CORS** - Cross-origin resource sharing

### Frontend
- **React** - UI library
- **Material-UI (MUI)** - Component library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Emotion** - CSS-in-JS styling

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Backend Setup

1. **Navigate to the project directory**
   ```bash
   cd timetable-scheduler
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/timetable-scheduler
   JWT_SECRET=your_jwt_secret_key_here
   PORT=5000
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Start the backend server**
   ```bash
   npm run server
   ```
   The server will start on `http://localhost:5000`

### Frontend Setup

1. **Navigate to the client directory**
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the React development server**
   ```bash
   npm start
   ```
   The frontend will start on `http://localhost:3000`

### Running Both Together

From the root directory, you can run both backend and frontend simultaneously:
```bash
npm run dev
```

## Usage Guide

### 1. Setting Up Basic Data

#### Add Teachers
- Navigate to "Teachers" section
- Click "Add Teacher"
- Fill in teacher details including subjects, department, and availability
- Set maximum hours per week

#### Add Rooms
- Go to "Rooms" section
- Add classroom information including capacity, floor, and facilities
- Specify room type (Classroom, Lecture Hall, etc.)

#### Add Labs
- Visit "Labs" section
- Add laboratory details including equipment and software
- Set capacity and lab type

#### Create Sections
- Go to "Sections" section
- Add student sections with subjects and class teachers
- Define semester and year information

#### Define Time Slots
- Navigate to "Time Slots"
- Create available time slots for each day
- Set duration and slot type

### 2. Managing Registrations

#### Create Registrations
- Go to "Registrations" section
- Click "Add Registration"
- Select section, subject, and teacher
- Choose appropriate room or lab
- Select preferred time slots
- Set priority level

#### Approve Registrations
- Review pending registrations
- Approve or reject based on availability
- Only approved registrations are used for timetable generation

### 3. Generating Timetables

#### Generate New Timetable
- Navigate to "Timetables" section
- Click "Generate Timetable"
- Enter timetable name, semester, and academic year
- Select sections to include
- Click "Generate Timetable"

#### Review and Publish
- View generated timetable
- Check for any conflicts
- Resolve conflicts if necessary
- Publish the timetable when ready

### 4. Viewing Timetables

#### Timetable Display
- Click on any timetable to view details
- See the complete schedule in calendar format
- View conflicts and resolve them
- Export or print timetables

## API Endpoints

### Teachers
- `GET /api/teachers` - Get all teachers
- `POST /api/teachers` - Create new teacher
- `PUT /api/teachers/:id` - Update teacher
- `DELETE /api/teachers/:id` - Delete teacher

### Rooms
- `GET /api/rooms` - Get all rooms
- `POST /api/rooms` - Create new room
- `PUT /api/rooms/:id` - Update room
- `DELETE /api/rooms/:id` - Delete room

### Labs
- `GET /api/labs` - Get all labs
- `POST /api/labs` - Create new lab
- `PUT /api/labs/:id` - Update lab
- `DELETE /api/labs/:id` - Delete lab

### Sections
- `GET /api/sections` - Get all sections
- `POST /api/sections` - Create new section
- `PUT /api/sections/:id` - Update section
- `DELETE /api/sections/:id` - Delete section

### Time Slots
- `GET /api/timeslots` - Get all time slots
- `POST /api/timeslots` - Create new time slot
- `PUT /api/timeslots/:id` - Update time slot
- `DELETE /api/timeslots/:id` - Delete time slot

### Registrations
- `GET /api/registrations` - Get all registrations
- `POST /api/registrations` - Create new registration
- `PUT /api/registrations/:id` - Update registration
- `DELETE /api/registrations/:id` - Delete registration
- `PATCH /api/registrations/:id/approve` - Approve registration
- `PATCH /api/registrations/:id/reject` - Reject registration

### Timetables
- `GET /api/timetables` - Get all timetables
- `GET /api/timetables/:id` - Get specific timetable
- `POST /api/timetables/generate` - Generate new timetable
- `PUT /api/timetables/:id` - Update timetable
- `DELETE /api/timetables/:id` - Delete timetable
- `PATCH /api/timetables/:id/publish` - Publish timetable

## Database Schema

### Teacher
- name, email, department
- subjects array
- maxHoursPerWeek
- availableDays, availableTimeSlots
- isActive

### Room
- roomNumber, roomName, capacity
- roomType, floor, building
- facilities array
- isActive

### Lab
- labNumber, labName, capacity
- labType, floor, building
- equipment array, software array
- isActive

### Section
- sectionName, department
- year, semester, strength
- subjects array
- classTeacher reference
- isActive

### TimeSlot
- day, startTime, endTime
- duration, slotType
- isActive

### Registration
- section, subject, teacher
- room, lab, timeSlots
- semester, academicYear
- status, priority

### Timetable
- name, semester, academicYear
- sections array
- schedule array
- conflicts array
- status, generatedBy, generatedAt

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please create an issue in the repository or contact the development team.

## Future Enhancements

- [ ] User authentication and authorization
- [ ] Email notifications for timetable changes
- [ ] Mobile app development
- [ ] Advanced reporting and analytics
- [ ] Integration with student information systems
- [ ] Automated conflict resolution
- [ ] Bulk import/export functionality
- [ ] Multi-language support
