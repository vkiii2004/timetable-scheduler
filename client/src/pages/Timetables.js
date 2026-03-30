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
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Delete,
  Visibility,
  Publish,
  AutoAwesome,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { timetablesAPI, sectionsAPI } from '../services/api';

const Timetables = () => {
  const navigate = useNavigate();
  const [timetables, setTimetables] = useState([]);
  const [sections, setSections] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    semester: '',
    academicYear: '',
    sections: [],
  });
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchData = useCallback(async () => {
    try {
      const [timetablesRes, sectionsRes] = await Promise.all([
        timetablesAPI.getAll(),
        sectionsAPI.getAll(),
      ]);
      setTimetables(timetablesRes.data);
      setSections(sectionsRes.data);
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
    setFormData({
      name: '',
      semester: '',
      academicYear: '',
      sections: [],
    });
  };

  const handleGenerate = async () => {
    try {
      const response = await timetablesAPI.generate(formData);
      showSnackbar('Timetable generated successfully');
      fetchData();
      handleClose();
      navigate(`/timetables/${response.data._id}`);
    } catch (error) {
      const serverMessage =
        error?.response?.data?.message ||
        (Array.isArray(error?.response?.data?.errors)
          ? error.response.data.errors.map(e => e.msg).join(', ')
          : null);
      showSnackbar(serverMessage || 'Error generating timetable', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this timetable?')) {
      try {
        await timetablesAPI.delete(id);
        showSnackbar('Timetable deleted successfully');
        fetchData();
      } catch (error) {
        showSnackbar('Error deleting timetable', 'error');
      }
    }
  };

  const handlePublish = async (id) => {
    try {
      await timetablesAPI.publish(id);
      showSnackbar('Timetable published successfully');
      fetchData();
    } catch (error) {
      showSnackbar('Error publishing timetable', 'error');
    }
  };

  const toggleSection = (sectionId) => {
    setFormData({
      ...formData,
      sections: formData.sections.includes(sectionId)
        ? formData.sections.filter(id => id !== sectionId)
        : [...formData.sections, sectionId],
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Published':
        return 'success';
      case 'Generated':
        return 'info';
      case 'Draft':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom>
          Loading Timetables...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Timetables
        </Typography>
        <Button
          variant="contained"
          startIcon={<AutoAwesome />}
          onClick={() => setOpen(true)}
        >
          Generate Timetable
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Semester</TableCell>
              <TableCell>Academic Year</TableCell>
              <TableCell>Sections</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Conflicts</TableCell>
              <TableCell>Generated At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {timetables.map((timetable) => (
              <TableRow key={timetable._id}>
                <TableCell>
                  <Typography variant="body1" fontWeight="bold">
                    {timetable.name}
                  </Typography>
                </TableCell>
                <TableCell>{timetable.semester}</TableCell>
                <TableCell>{timetable.academicYear}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {timetable.sections.map((section, index) => (
                      <Chip 
                        key={index} 
                        label={section.sectionName} 
                        size="small" 
                      />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={timetable.status} 
                    color={getStatusColor(timetable.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={timetable.conflicts.length} 
                    color={timetable.conflicts.length > 0 ? 'error' : 'success'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(timetable.generatedAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => navigate(`/timetables/${timetable._id}`)}>
                    <Visibility />
                  </IconButton>
                  {timetable.status === 'Generated' && (
                    <IconButton onClick={() => handlePublish(timetable._id)}>
                      <Publish color="success" />
                    </IconButton>
                  )}
                  <IconButton onClick={() => handleDelete(timetable._id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Generate Timetable Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Generate New Timetable
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Timetable Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
              placeholder="e.g., Fall 2024 Timetable"
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Semester"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                fullWidth
                required
                placeholder="e.g., Fall 2024"
              />
              <TextField
                label="Academic Year"
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                fullWidth
                required
                placeholder="e.g., 2024-2025"
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Select Sections
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {sections.map((section) => (
                  <FormControlLabel
                    key={section._id}
                    control={
                      <Checkbox
                        checked={formData.sections.includes(section._id)}
                        onChange={() => toggleSection(section._id)}
                      />
                    }
                    label={`${section.sectionName} - ${section.department} (Year ${section.year}, Sem ${section.semester})`}
                  />
                ))}
              </Box>
            </Box>

            <Alert severity="info">
              The system will automatically generate a timetable based on approved registrations for the selected sections.
              Conflicts will be reported if any scheduling issues are found.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            onClick={handleGenerate} 
            variant="contained"
            disabled={!formData.name || !formData.semester || !formData.academicYear || formData.sections.length === 0}
          >
            Generate Timetable
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

export default Timetables;

