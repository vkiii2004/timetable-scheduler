import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Schedule,
} from '@mui/icons-material';
import { timeSlotsAPI } from '../services/api';

const TimeSlots = () => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingTimeSlot, setEditingTimeSlot] = useState(null);
  const [formData, setFormData] = useState({
    day: 'Monday',
    startTime: '',
    endTime: '',
    duration: 60,
    slotType: 'Lecture',
  });
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const slotTypes = ['Lecture', 'Lab', 'Tutorial', 'Break'];

  useEffect(() => {
    fetchTimeSlots();
  }, []);

  const fetchTimeSlots = async () => {
    try {
      const response = await timeSlotsAPI.getAll();
      setTimeSlots(response.data);
    } catch (error) {
      showSnackbar('Error fetching time slots', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleClose = () => {
    setOpen(false);
    setEditingTimeSlot(null);
    setFormData({
      day: 'Monday',
      startTime: '',
      endTime: '',
      duration: 60,
      slotType: 'Lecture',
    });
  };

  const handleEdit = (timeSlot) => {
    setEditingTimeSlot(timeSlot);
    setFormData({
      day: timeSlot.day,
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,
      duration: timeSlot.duration,
      slotType: timeSlot.slotType,
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingTimeSlot) {
        await timeSlotsAPI.update(editingTimeSlot._id, formData);
        showSnackbar('Time slot updated successfully');
      } else {
        await timeSlotsAPI.create(formData);
        showSnackbar('Time slot created successfully');
      }
      fetchTimeSlots();
      handleClose();
    } catch (error) {
      showSnackbar('Error saving time slot', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this time slot?')) {
      try {
        await timeSlotsAPI.delete(id);
        showSnackbar('Time slot deleted successfully');
        fetchTimeSlots();
      } catch (error) {
        showSnackbar('Error deleting time slot', 'error');
      }
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom>
          Loading Time Slots...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Time Slots
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpen(true)}
        >
          Add Time Slot
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Day</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>End Time</TableCell>
              <TableCell>Duration (min)</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {timeSlots.map((timeSlot) => (
              <TableRow key={timeSlot._id}>
                <TableCell>
                  <Chip label={timeSlot.day} color="primary" />
                </TableCell>
                <TableCell>{timeSlot.startTime}</TableCell>
                <TableCell>{timeSlot.endTime}</TableCell>
                <TableCell>{timeSlot.duration}</TableCell>
                <TableCell>
                  <Chip label={timeSlot.slotType} size="small" />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(timeSlot)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(timeSlot._id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Time Slot Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTimeSlot ? 'Edit Time Slot' : 'Add New Time Slot'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Day</InputLabel>
              <Select
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                label="Day"
              >
                {days.map((day) => (
                  <MenuItem key={day} value={day}>
                    {day}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Start Time"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="End Time"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            
            <TextField
              label="Duration (minutes)"
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              fullWidth
              required
              inputProps={{ min: 30, max: 180 }}
            />
            
            <FormControl fullWidth>
              <InputLabel>Slot Type</InputLabel>
              <Select
                value={formData.slotType}
                onChange={(e) => setFormData({ ...formData, slotType: e.target.value })}
                label="Slot Type"
              >
                {slotTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingTimeSlot ? 'Update' : 'Create'}
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

export default TimeSlots;

