import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
} from '@mui/material';
import {
  People,
  MeetingRoom,
  Science,
  School,
  Schedule,
  Assignment,
  CalendarToday,
  TrendingUp,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  teachersAPI,
  roomsAPI,
  labsAPI,
  sectionsAPI,
  timeSlotsAPI,
  registrationsAPI,
  timetablesAPI,
} from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    teachers: 0,
    rooms: 0,
    labs: 0,
    sections: 0,
    timeSlots: 0,
    registrations: 0,
    timetables: 0,
  });
  const [recentTimetables, setRecentTimetables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [
        teachersRes,
        roomsRes,
        labsRes,
        sectionsRes,
        timeSlotsRes,
        registrationsRes,
        timetablesRes,
      ] = await Promise.all([
        teachersAPI.getAll(),
        roomsAPI.getAll(),
        labsAPI.getAll(),
        sectionsAPI.getAll(),
        timeSlotsAPI.getAll(),
        registrationsAPI.getAll(),
        timetablesAPI.getAll(),
      ]);

      setStats({
        teachers: teachersRes.data.length,
        rooms: roomsRes.data.length,
        labs: labsRes.data.length,
        sections: sectionsRes.data.length,
        timeSlots: timeSlotsRes.data.length,
        registrations: registrationsRes.data.length,
        timetables: timetablesRes.data.length,
      });

      setRecentTimetables(timetablesRes.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Teachers',
      value: stats.teachers,
      icon: <People />,
      color: '#1976d2',
      path: '/teachers',
    },
    {
      title: 'Rooms',
      value: stats.rooms,
      icon: <MeetingRoom />,
      color: '#388e3c',
      path: '/rooms',
    },
    {
      title: 'Labs',
      value: stats.labs,
      icon: <Science />,
      color: '#f57c00',
      path: '/labs',
    },
    {
      title: 'Sections',
      value: stats.sections,
      icon: <School />,
      color: '#7b1fa2',
      path: '/sections',
    },
    {
      title: 'Time Slots',
      value: stats.timeSlots,
      icon: <Schedule />,
      color: '#d32f2f',
      path: '/timeslots',
    },
    {
      title: 'Registrations',
      value: stats.registrations,
      icon: <Assignment />,
      color: '#455a64',
      path: '/registrations',
    },
    {
      title: 'Timetables',
      value: stats.timetables,
      icon: <CalendarToday />,
      color: '#0288d1',
      path: '/timetables',
    },
  ];

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
          Loading Dashboard...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Statistics Cards */}
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={card.title}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
              onClick={() => navigate(card.path)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      backgroundColor: card.color,
                      color: 'white',
                      borderRadius: 1,
                      p: 1,
                      mr: 2,
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Typography variant="h6" component="div">
                    {card.title}
                  </Typography>
                </Box>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Recent Timetables */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="div">
                Recent Timetables
              </Typography>
              <Button
                variant="outlined"
                startIcon={<TrendingUp />}
                onClick={() => navigate('/timetables')}
              >
                View All
              </Button>
            </Box>
            {recentTimetables.length > 0 ? (
              <List>
                {recentTimetables.map((timetable) => (
                  <ListItem
                    key={timetable._id}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'action.hover' },
                    }}
                    onClick={() => navigate(`/timetables/${timetable._id}`)}
                  >
                    <ListItemIcon>
                      <CalendarToday />
                    </ListItemIcon>
                    <ListItemText
                      primary={timetable.name}
                      secondary={`${timetable.semester} - ${timetable.academicYear}`}
                    />
                    <Chip
                      label={timetable.status}
                      color={getStatusColor(timetable.status)}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No timetables created yet.
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" component="div" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<CalendarToday />}
                onClick={() => navigate('/timetables')}
                fullWidth
              >
                Generate Timetable
              </Button>
              <Button
                variant="outlined"
                startIcon={<Assignment />}
                onClick={() => navigate('/registrations')}
                fullWidth
              >
                Manage Registrations
              </Button>
              <Button
                variant="outlined"
                startIcon={<People />}
                onClick={() => navigate('/teachers')}
                fullWidth
              >
                Add Teacher
              </Button>
              <Button
                variant="outlined"
                startIcon={<School />}
                onClick={() => navigate('/sections')}
                fullWidth
              >
                Add Section
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;

