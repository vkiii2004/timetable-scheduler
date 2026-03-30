import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Chip,
  Alert,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { registrationsAPI, sectionsAPI, teachersAPI, roomsAPI, labsAPI, timeSlotsAPI } from '../services/api';

const Registrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [sections, setSections] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [labs, setLabs] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingRegistration, setEditingRegistration] = useState(null);
  const [formData, setFormData] = useState({
    section: '',
    subject: {
      subjectName: '',
      subjectCode: '',
      credits: 1,
      hoursPerWeek: 1,
      isLab: false,
    },
    teacher: '',
    room: '',
    lab: '',
    timeSlots: [],
    semester: '',
    academicYear: '',
    priority: 1,
  });
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchData = useCallback(async () => {
    try {
      const [registrationsRes, sectionsRes, teachersRes, roomsRes, labsRes, timeSlotsRes] = await Promise.all([
        registrationsAPI.getAll(),
        sectionsAPI.getAll(),
        teachersAPI.getAll(),
        roomsAPI.getAll(),
        labsAPI.getAll(),
        timeSlotsAPI.getAll(),
      ]);
      setRegistrations(registrationsRes.data);
      setSections(sectionsRes.data);
      setTeachers(teachersRes.data);
      setRooms(roomsRes.data);
      setLabs(labsRes.data);
      setTimeSlots(timeSlotsRes.data);
    } catch (error) {
      setSnackbar({ open: true, message: 'Error fetching data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleClose = () => {
    setOpen(false);
    setEditingRegistration(null);
    setFormData({
      section: '',
      subject: {
        subjectName: '',
        subjectCode: '',
        credits: 1,
        hoursPerWeek: 1,
        isLab: false,
      },
      teacher: '',
      room: '',
      lab: '',
      timeSlots: [],
      semester: '',
      academicYear: '',
      priority: 1,
    });
  };

  const handleEdit = (registration) => {
    setEditingRegistration(registration);
    setFormData({
      section: registration.section._id,
      subject: registration.subject,
      teacher: registration.teacher._id,
      room: registration.room?._id || '',
      lab: registration.lab?._id || '',
      timeSlots: registration.timeSlots.map(ts => ts._id),
      semester: registration.semester,
      academicYear: registration.academicYear,
      priority: registration.priority,
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingRegistration) {
        await registrationsAPI.update(editingRegistration._id, formData);
        showSnackbar('Registration updated successfully');
      } else {
        await registrationsAPI.create(formData);
        showSnackbar('Registration created successfully');
      }
      fetchData();
      handleClose();
    } catch (error) {
      showSnackbar('Error saving registration', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this registration?')) {
      try {
        await registrationsAPI.delete(id);
        showSnackbar('Registration deleted successfully');
        fetchData();
      } catch (error) {
        showSnackbar('Error deleting registration', 'error');
      }
    }
  };

  const handleApprove = async (id) => {
    try {
      await registrationsAPI.approve(id);
      showSnackbar('Registration approved successfully');
      fetchData();
    } catch (error) {
      showSnackbar('Error approving registration', 'error');
    }
  };

  const handleReject = async (id) => {
    try {
      await registrationsAPI.reject(id);
      showSnackbar('Registration rejected successfully');
      fetchData();
    } catch (error) {
      showSnackbar('Error rejecting registration', 'error');
    }
  };

  const toggleTimeSlot = (timeSlotId) => {
    setFormData({
      ...formData,
      timeSlots: formData.timeSlots.includes(timeSlotId)
        ? formData.timeSlots.filter(id => id !== timeSlotId)
        : [...formData.timeSlots, timeSlotId],
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Rejected':
        return 'error';
      case 'Pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom>
          Loading Registrations...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Registrations
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpen(true)}
        >
          Add Registration
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Section</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Teacher</TableCell>
              <TableCell>Room/Lab</TableCell>
              <TableCell>Time Slots</TableCell>
              <TableCell>Semester</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {registrations.map((registration) => (
              <TableRow key={registration._id}>
                <TableCell>{registration.section.sectionName}</TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {registration.subject.subjectName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {registration.subject.subjectCode}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{registration.teacher.name}</TableCell>
                <TableCell>
                  {registration.room ? registration.room.roomNumber : 
                   registration.lab ? registration.lab.labNumber : 'Not Assigned'}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {registration.timeSlots.map((timeSlot, index) => (
                      <Chip 
                        key={index} 
                        label={`${timeSlot.day} ${timeSlot.startTime}-${timeSlot.endTime}`} 
                        size="small" 
                      />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>{registration.semester}</TableCell>
                <TableCell>
                  <Chip 
                    label={registration.status} 
                    color={getStatusColor(registration.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(registration)}>
                    <Edit />
                  </IconButton>
                  {registration.status === 'Pending' && (
                    <>
                      <IconButton onClick={() => handleApprove(registration._id)}>
                        <CheckCircle color="success" />
                      </IconButton>
                      <IconButton onClick={() => handleReject(registration._id)}>
                        <Cancel color="error" />
                      </IconButton>
                    </>
                  )}
                  <IconButton onClick={() => handleDelete(registration._id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Registration Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingRegistration ? 'Edit Registration' : 'Add New Registration'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Section</InputLabel>
              <Select
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                label="Section"
              >
                {sections.map((section) => (
                  <MenuItem key={section._id} value={section._id}>
                    {section.sectionName} - {section.department}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Subject Name"
                value={formData.subject.subjectName}
                onChange={(e) => setFormData({
                  ...formData,
                  subject: { ...formData.subject, subjectName: e.target.value }
                })}
                fullWidth
                required
              />
              <TextField
                label="Subject Code"
                value={formData.subject.subjectCode}
                onChange={(e) => setFormData({
                  ...formData,
                  subject: { ...formData.subject, subjectCode: e.target.value }
                })}
                fullWidth
                required
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Credits"
                type="number"
                value={formData.subject.credits}
                onChange={(e) => setFormData({
                  ...formData,
                  subject: { ...formData.subject, credits: parseInt(e.target.value) }
                })}
                fullWidth
                required
                inputProps={{ min: 1 }}
              />
              <TextField
                label="Hours Per Week"
                type="number"
                value={formData.subject.hoursPerWeek}
                onChange={(e) => setFormData({
                  ...formData,
                  subject: { ...formData.subject, hoursPerWeek: parseInt(e.target.value) }
                })}
                fullWidth
                required
                inputProps={{ min: 1 }}
              />
            </Box>

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.subject.isLab}
                  onChange={(e) => setFormData({
                    ...formData,
                    subject: { ...formData.subject, isLab: e.target.checked }
                  })}
                />
              }
              label="Is Lab Subject"
            />

            <FormControl fullWidth>
              <InputLabel>Teacher</InputLabel>
              <Select
                value={formData.teacher}
                onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                label="Teacher"
              >
                {teachers.map((teacher) => (
                  <MenuItem key={teacher._id} value={teacher._id}>
                    {teacher.name} - {teacher.department}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {formData.subject.isLab ? (
              <FormControl fullWidth>
                <InputLabel>Lab</InputLabel>
                <Select
                  value={formData.lab}
                  onChange={(e) => setFormData({ ...formData, lab: e.target.value })}
                  label="Lab"
                >
                  {labs.map((lab) => (
                    <MenuItem key={lab._id} value={lab._id}>
                      {lab.labNumber} - {lab.labName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <FormControl fullWidth>
                <InputLabel>Room</InputLabel>
                <Select
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  label="Room"
                >
                  {rooms.map((room) => (
                    <MenuItem key={room._id} value={room._id}>
                      {room.roomNumber} - {room.roomName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Time Slots
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {timeSlots.map((timeSlot) => (
                  <Chip
                    key={timeSlot._id}
                    label={`${timeSlot.day} ${timeSlot.startTime}-${timeSlot.endTime}`}
                    onClick={() => toggleTimeSlot(timeSlot._id)}
                    color={formData.timeSlots.includes(timeSlot._id) ? 'primary' : 'default'}
                    variant={formData.timeSlots.includes(timeSlot._id) ? 'filled' : 'outlined'}
                    size="small"
                  />
                ))}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Semester"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="Academic Year"
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                fullWidth
                required
              />
            </Box>

            <TextField
              label="Priority"
              type="number"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
              fullWidth
              inputProps={{ min: 1, max: 5 }}
              helperText="Higher number = higher priority"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingRegistration ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Registrations;

