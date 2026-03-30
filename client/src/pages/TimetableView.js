import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Box, Paper, Chip, Alert, Button, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import {
  CalendarToday,
  Schedule,
  People,
  MeetingRoom,
  Science,
  School,
  Warning,
  CheckCircle,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { timetablesAPI } from '../services/api';
import TimetableGrid from '../components/TimetableGrid';

const TimetableView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [conflictsOpen, setConflictsOpen] = useState(false);

  const fetchTimetable = useCallback(async () => {
    if (!id) return;
    try {
      const response = await timetablesAPI.getById(id);
      setTimetable(response.data);
    } catch (error) {
      console.error('Error fetching timetable:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTimetable();
  }, [fetchTimetable]);

  const getConflictIcon = (type) => {
    switch (type) {
      case 'Teacher Conflict':
        return <People color="error" />;
      case 'Room Conflict':
        return <MeetingRoom color="error" />;
      case 'Lab Conflict':
        return <Science color="error" />;
      case 'Section Conflict':
        return <School color="error" />;
      default:
        return <Warning color="error" />;
    }
  };

  const formatDate = (d) => {
    const dt = new Date(d);
    const dd = String(dt.getDate()).padStart(2, '0');
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const yyyy = dt.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const getWeekEndingFriday = () => {
    const base = timetable?.generatedAt ? new Date(timetable.generatedAt) : new Date();
    const day = base.getDay(); // 0 Sun ... 6 Sat
    const diffToFriday = (5 - day + 7) % 7; // 5 => Friday
    const friday = new Date(base);
    friday.setDate(base.getDate() + diffToFriday);
    return formatDate(friday);
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom>
          Loading Timetable...
        </Typography>
      </Container>
    );
  }

  if (!timetable) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error">
          Timetable not found
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 3 }}>
        {/* Header styled like the sample sheet */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              AY: {timetable.academicYear}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Sem: {timetable.semester}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Master Time Table
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              w.e.f.: {getWeekEndingFriday()}
            </Typography>
            <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
              <Button variant="outlined" onClick={() => window.print()}>Print</Button>
            </Box>
          </Box>
        </Paper>

        <Typography variant="h5" gutterBottom>
          {timetable.name}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {timetable.semester} - {timetable.academicYear}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Chip 
            label={timetable.status} 
            color={timetable.status === 'Published' ? 'success' : 'info'}
            icon={<CalendarToday />}
          />
          <Chip 
            label={`${timetable.sections.length} Sections`}
            color="primary"
            icon={<School />}
          />
          <Chip 
            label={`${timetable.schedule.length} Classes`}
            color="secondary"
            icon={<Schedule />}
          />
          {timetable.conflicts.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<Warning />}
              onClick={() => setConflictsOpen(true)}
            >
              {timetable.conflicts.length} Conflicts
            </Button>
          )}
        </Box>
      </Box>

      {/* Timetable Grid (Mon–Fri with breaks) */}
      <TimetableGrid timetable={timetable} />

      {/* Conflicts Dialog */}
      <Dialog open={conflictsOpen} onClose={() => setConflictsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning color="error" />
            Timetable Conflicts
          </Box>
        </DialogTitle>
        <DialogContent>
          {timetable.conflicts.length > 0 ? (
            <List>
              {timetable.conflicts.map((conflict, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    {getConflictIcon(conflict.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={conflict.type}
                    secondary={conflict.description}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
              <CheckCircle color="success" />
              <Typography>No conflicts found!</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConflictsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Back Button */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/timetables')}
        >
          Back to Timetables
        </Button>
      </Box>
    </Container>
  );
};

export default TimetableView;

