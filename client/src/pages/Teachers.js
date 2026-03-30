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
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
} from '@mui/icons-material';
import { teachersAPI, timeSlotsAPI } from '../services/api';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    subjects: [],
    maxHoursPerWeek: 40,
    availableDays: [],
    availableTimeSlots: [],
  });
  const [subjectInput, setSubjectInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const fetchData = useCallback(async () => {
    try {
      const [teachersRes, timeSlotsRes] = await Promise.all([
        teachersAPI.getAll(),
        timeSlotsAPI.getAll(),
      ]);
      setTeachers(teachersRes.data);
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
    setEditingTeacher(null);
    setFormData({
      name: '',
      email: '',
      department: '',
      subjects: [],
      maxHoursPerWeek: 40,
      availableDays: [],
      availableTimeSlots: [],
    });
    setSubjectInput('');
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      department: teacher.department,
      subjects: teacher.subjects,
      maxHoursPerWeek: teacher.maxHoursPerWeek,
      availableDays: teacher.availableDays,
      availableTimeSlots: teacher.availableTimeSlots,
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingTeacher) {
        await teachersAPI.update(editingTeacher._id, formData);
        showSnackbar('Teacher updated successfully');
      } else {
        await teachersAPI.create(formData);
        showSnackbar('Teacher created successfully');
      }
      fetchData();
      handleClose();
    } catch (error) {
      showSnackbar('Error saving teacher', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        await teachersAPI.delete(id);
        showSnackbar('Teacher deleted successfully');
        fetchData();
      } catch (error) {
        showSnackbar('Error deleting teacher', 'error');
      }
    }
  };

  const addSubject = () => {
    if (subjectInput.trim()) {
      setFormData({
        ...formData,
        subjects: [...formData.subjects, subjectInput.trim()],
      });
      setSubjectInput('');
    }
  };

  const removeSubject = (index) => {
    setFormData({
      ...formData,
      subjects: formData.subjects.filter((_, i) => i !== index),
    });
  };

  const toggleDay = (day) => {
    setFormData({
      ...formData,
      availableDays: formData.availableDays.includes(day)
        ? formData.availableDays.filter(d => d !== day)
        : [...formData.availableDays, day],
    });
  };

  const toggleTimeSlot = (timeSlotId) => {
    setFormData({
      ...formData,
      availableTimeSlots: formData.availableTimeSlots.includes(timeSlotId)
        ? formData.availableTimeSlots.filter(id => id !== timeSlotId)
        : [...formData.availableTimeSlots, timeSlotId],
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom>
          Loading Teachers...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Teachers
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpen(true)}
        >
          Add Teacher
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Subjects</TableCell>
              <TableCell>Available Days</TableCell>
              <TableCell>Max Hours/Week</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teachers.map((teacher) => (
              <TableRow key={teacher._id}>
                <TableCell>{teacher.name}</TableCell>
                <TableCell>{teacher.email}</TableCell>
                <TableCell>{teacher.department}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {teacher.subjects.map((subject, index) => (
                      <Chip key={index} label={subject} size="small" />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {teacher.availableDays.map((day, index) => (
                      <Chip key={index} label={day} size="small" color="primary" />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>{teacher.maxHoursPerWeek}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(teacher)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(teacher._id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Teacher Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              fullWidth
              required
            />
            
            {/* Subjects */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Subjects
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  label="Add Subject"
                  value={subjectInput}
                  onChange={(e) => setSubjectInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSubject()}
                  size="small"
                />
                <Button onClick={addSubject} variant="outlined">
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {formData.subjects.map((subject, index) => (
                  <Chip
                    key={index}
                    label={subject}
                    onDelete={() => removeSubject(index)}
                    size="small"
                  />
                ))}
              </Box>
            </Box>

            <TextField
              label="Max Hours Per Week"
              type="number"
              value={formData.maxHoursPerWeek}
              onChange={(e) => setFormData({ ...formData, maxHoursPerWeek: parseInt(e.target.value) })}
              fullWidth
            />

            {/* Available Days */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Available Days
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {days.map((day) => (
                  <Chip
                    key={day}
                    label={day}
                    onClick={() => toggleDay(day)}
                    color={formData.availableDays.includes(day) ? 'primary' : 'default'}
                    variant={formData.availableDays.includes(day) ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            </Box>

            {/* Available Time Slots */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Available Time Slots
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {timeSlots.map((timeSlot) => (
                  <Chip
                    key={timeSlot._id}
                    label={`${timeSlot.day} ${timeSlot.startTime}-${timeSlot.endTime}`}
                    onClick={() => toggleTimeSlot(timeSlot._id)}
                    color={formData.availableTimeSlots.includes(timeSlot._id) ? 'primary' : 'default'}
                    variant={formData.availableTimeSlots.includes(timeSlot._id) ? 'filled' : 'outlined'}
                    size="small"
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingTeacher ? 'Update' : 'Create'}
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

export default Teachers;

