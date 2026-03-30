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
  School,
} from '@mui/icons-material';
import { sectionsAPI, teachersAPI } from '../services/api';

const Sections = () => {
  const [sections, setSections] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [formData, setFormData] = useState({
    sectionName: '',
    department: '',
    year: 1,
    semester: 1,
    strength: 1,
    subjects: [],
    classTeacher: '',
  });
  const [subjectInput, setSubjectInput] = useState({
    subjectName: '',
    subjectCode: '',
    credits: 1,
    hoursPerWeek: 1,
    isLab: false,
  });
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sectionsRes, teachersRes] = await Promise.all([
        sectionsAPI.getAll(),
        teachersAPI.getAll(),
      ]);
      setSections(sectionsRes.data);
      setTeachers(teachersRes.data);
    } catch (error) {
      showSnackbar('Error fetching data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleClose = () => {
    setOpen(false);
    setEditingSection(null);
    setFormData({
      sectionName: '',
      department: '',
      year: 1,
      semester: 1,
      strength: 1,
      subjects: [],
      classTeacher: '',
    });
    setSubjectInput({
      subjectName: '',
      subjectCode: '',
      credits: 1,
      hoursPerWeek: 1,
      isLab: false,
    });
  };

  const handleEdit = (section) => {
    setEditingSection(section);
    setFormData({
      sectionName: section.sectionName,
      department: section.department,
      year: section.year,
      semester: section.semester,
      strength: section.strength,
      subjects: section.subjects,
      classTeacher: section.classTeacher?._id || '',
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingSection) {
        await sectionsAPI.update(editingSection._id, formData);
        showSnackbar('Section updated successfully');
      } else {
        await sectionsAPI.create(formData);
        showSnackbar('Section created successfully');
      }
      fetchData();
      handleClose();
    } catch (error) {
      showSnackbar('Error saving section', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      try {
        await sectionsAPI.delete(id);
        showSnackbar('Section deleted successfully');
        fetchData();
      } catch (error) {
        showSnackbar('Error deleting section', 'error');
      }
    }
  };

  const addSubject = () => {
    if (subjectInput.subjectName.trim() && subjectInput.subjectCode.trim()) {
      setFormData({
        ...formData,
        subjects: [...formData.subjects, { ...subjectInput }],
      });
      setSubjectInput({
        subjectName: '',
        subjectCode: '',
        credits: 1,
        hoursPerWeek: 1,
        isLab: false,
      });
    }
  };

  const removeSubject = (index) => {
    setFormData({
      ...formData,
      subjects: formData.subjects.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom>
          Loading Sections...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Sections
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpen(true)}
        >
          Add Section
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Section Name</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Year</TableCell>
              <TableCell>Semester</TableCell>
              <TableCell>Strength</TableCell>
              <TableCell>Class Teacher</TableCell>
              <TableCell>Subjects</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sections.map((section) => (
              <TableRow key={section._id}>
                <TableCell>{section.sectionName}</TableCell>
                <TableCell>{section.department}</TableCell>
                <TableCell>{section.year}</TableCell>
                <TableCell>{section.semester}</TableCell>
                <TableCell>{section.strength}</TableCell>
                <TableCell>{section.classTeacher?.name || 'Not Assigned'}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {section.subjects.map((subject, index) => (
                      <Chip 
                        key={index} 
                        label={subject.subjectName} 
                        size="small"
                        color={subject.isLab ? 'secondary' : 'primary'}
                      />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(section)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(section._id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Section Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingSection ? 'Edit Section' : 'Add New Section'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Section Name"
              value={formData.sectionName}
              onChange={(e) => setFormData({ ...formData, sectionName: e.target.value })}
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
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Year"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                fullWidth
                required
                inputProps={{ min: 1, max: 5 }}
              />
              <TextField
                label="Semester"
                type="number"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                fullWidth
                required
                inputProps={{ min: 1, max: 8 }}
              />
            </Box>
            <TextField
              label="Strength"
              type="number"
              value={formData.strength}
              onChange={(e) => setFormData({ ...formData, strength: parseInt(e.target.value) })}
              fullWidth
              required
              inputProps={{ min: 1 }}
            />
            <FormControl fullWidth>
              <InputLabel>Class Teacher</InputLabel>
              <Select
                value={formData.classTeacher}
                onChange={(e) => setFormData({ ...formData, classTeacher: e.target.value })}
                label="Class Teacher"
              >
                {teachers.map((teacher) => (
                  <MenuItem key={teacher._id} value={teacher._id}>
                    {teacher.name} - {teacher.department}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {/* Subjects */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Subjects
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    label="Subject Name"
                    value={subjectInput.subjectName}
                    onChange={(e) => setSubjectInput({ ...subjectInput, subjectName: e.target.value })}
                    size="small"
                  />
                  <TextField
                    label="Subject Code"
                    value={subjectInput.subjectCode}
                    onChange={(e) => setSubjectInput({ ...subjectInput, subjectCode: e.target.value })}
                    size="small"
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    label="Credits"
                    type="number"
                    value={subjectInput.credits}
                    onChange={(e) => setSubjectInput({ ...subjectInput, credits: parseInt(e.target.value) })}
                    size="small"
                    inputProps={{ min: 1 }}
                  />
                  <TextField
                    label="Hours/Week"
                    type="number"
                    value={subjectInput.hoursPerWeek}
                    onChange={(e) => setSubjectInput({ ...subjectInput, hoursPerWeek: parseInt(e.target.value) })}
                    size="small"
                    inputProps={{ min: 1 }}
                  />
                  <FormControl size="small">
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={subjectInput.isLab}
                      onChange={(e) => setSubjectInput({ ...subjectInput, isLab: e.target.value })}
                      label="Type"
                    >
                      <MenuItem value={false}>Theory</MenuItem>
                      <MenuItem value={true}>Lab</MenuItem>
                    </Select>
                  </FormControl>
                  <Button onClick={addSubject} variant="outlined">
                    Add
                  </Button>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {formData.subjects.map((subject, index) => (
                  <Chip
                    key={index}
                    label={`${subject.subjectName} (${subject.subjectCode})`}
                    onDelete={() => removeSubject(index)}
                    size="small"
                    color={subject.isLab ? 'secondary' : 'primary'}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingSection ? 'Update' : 'Create'}
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

export default Sections;

