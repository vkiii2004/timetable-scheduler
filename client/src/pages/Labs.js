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
  Science,
} from '@mui/icons-material';
import { labsAPI } from '../services/api';

const Labs = () => {
  const [labs, setLabs] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingLab, setEditingLab] = useState(null);
  const [formData, setFormData] = useState({
    labNumber: '',
    labName: '',
    capacity: 1,
    labType: 'Computer Lab',
    floor: 1,
    building: '',
    equipment: [],
    software: [],
  });
  const [equipmentInput, setEquipmentInput] = useState({ name: '', quantity: 1 });
  const [softwareInput, setSoftwareInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const labTypes = ['Computer Lab', 'Physics Lab', 'Chemistry Lab', 'Biology Lab', 'Engineering Lab', 'Language Lab'];

  useEffect(() => {
    fetchLabs();
  }, []);

  const fetchLabs = async () => {
    try {
      const response = await labsAPI.getAll();
      setLabs(response.data);
    } catch (error) {
      showSnackbar('Error fetching labs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleClose = () => {
    setOpen(false);
    setEditingLab(null);
    setFormData({
      labNumber: '',
      labName: '',
      capacity: 1,
      labType: 'Computer Lab',
      floor: 1,
      building: '',
      equipment: [],
      software: [],
    });
    setEquipmentInput({ name: '', quantity: 1 });
    setSoftwareInput('');
  };

  const handleEdit = (lab) => {
    setEditingLab(lab);
    setFormData({
      labNumber: lab.labNumber,
      labName: lab.labName,
      capacity: lab.capacity,
      labType: lab.labType,
      floor: lab.floor,
      building: lab.building,
      equipment: lab.equipment,
      software: lab.software,
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingLab) {
        await labsAPI.update(editingLab._id, formData);
        showSnackbar('Lab updated successfully');
      } else {
        await labsAPI.create(formData);
        showSnackbar('Lab created successfully');
      }
      fetchLabs();
      handleClose();
    } catch (error) {
      showSnackbar('Error saving lab', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lab?')) {
      try {
        await labsAPI.delete(id);
        showSnackbar('Lab deleted successfully');
        fetchLabs();
      } catch (error) {
        showSnackbar('Error deleting lab', 'error');
      }
    }
  };

  const addEquipment = () => {
    if (equipmentInput.name.trim()) {
      setFormData({
        ...formData,
        equipment: [...formData.equipment, { ...equipmentInput }],
      });
      setEquipmentInput({ name: '', quantity: 1 });
    }
  };

  const removeEquipment = (index) => {
    setFormData({
      ...formData,
      equipment: formData.equipment.filter((_, i) => i !== index),
    });
  };

  const addSoftware = () => {
    if (softwareInput.trim()) {
      setFormData({
        ...formData,
        software: [...formData.software, softwareInput.trim()],
      });
      setSoftwareInput('');
    }
  };

  const removeSoftware = (index) => {
    setFormData({
      ...formData,
      software: formData.software.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom>
          Loading Labs...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Labs
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpen(true)}
        >
          Add Lab
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Lab Number</TableCell>
              <TableCell>Lab Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Capacity</TableCell>
              <TableCell>Floor</TableCell>
              <TableCell>Building</TableCell>
              <TableCell>Equipment</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {labs.map((lab) => (
              <TableRow key={lab._id}>
                <TableCell>{lab.labNumber}</TableCell>
                <TableCell>{lab.labName}</TableCell>
                <TableCell>
                  <Chip label={lab.labType} size="small" />
                </TableCell>
                <TableCell>{lab.capacity}</TableCell>
                <TableCell>{lab.floor}</TableCell>
                <TableCell>{lab.building}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {lab.equipment.map((item, index) => (
                      <Chip key={index} label={`${item.name} (${item.quantity})`} size="small" />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(lab)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(lab._id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Lab Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingLab ? 'Edit Lab' : 'Add New Lab'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Lab Number"
              value={formData.labNumber}
              onChange={(e) => setFormData({ ...formData, labNumber: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Lab Name"
              value={formData.labName}
              onChange={(e) => setFormData({ ...formData, labName: e.target.value })}
              fullWidth
              required
            />
            <FormControl fullWidth>
              <InputLabel>Lab Type</InputLabel>
              <Select
                value={formData.labType}
                onChange={(e) => setFormData({ ...formData, labType: e.target.value })}
                label="Lab Type"
              >
                {labTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
              fullWidth
              required
              inputProps={{ min: 1 }}
            />
            <TextField
              label="Floor"
              type="number"
              value={formData.floor}
              onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) })}
              fullWidth
              required
            />
            <TextField
              label="Building"
              value={formData.building}
              onChange={(e) => setFormData({ ...formData, building: e.target.value })}
              fullWidth
              required
            />
            
            {/* Equipment */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Equipment
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  label="Equipment Name"
                  value={equipmentInput.name}
                  onChange={(e) => setEquipmentInput({ ...equipmentInput, name: e.target.value })}
                  size="small"
                />
                <TextField
                  label="Quantity"
                  type="number"
                  value={equipmentInput.quantity}
                  onChange={(e) => setEquipmentInput({ ...equipmentInput, quantity: parseInt(e.target.value) })}
                  size="small"
                  inputProps={{ min: 1 }}
                />
                <Button onClick={addEquipment} variant="outlined">
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {formData.equipment.map((item, index) => (
                  <Chip
                    key={index}
                    label={`${item.name} (${item.quantity})`}
                    onDelete={() => removeEquipment(index)}
                    size="small"
                  />
                ))}
              </Box>
            </Box>

            {/* Software */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Software
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  label="Add Software"
                  value={softwareInput}
                  onChange={(e) => setSoftwareInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSoftware()}
                  size="small"
                />
                <Button onClick={addSoftware} variant="outlined">
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {formData.software.map((software, index) => (
                  <Chip
                    key={index}
                    label={software}
                    onDelete={() => removeSoftware(index)}
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
            {editingLab ? 'Update' : 'Create'}
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

export default Labs;

