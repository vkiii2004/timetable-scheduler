import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Teachers from './pages/Teachers';
import Rooms from './pages/Rooms';
import Labs from './pages/Labs';
import Sections from './pages/Sections';
import TimeSlots from './pages/TimeSlots';
import Registrations from './pages/Registrations';
import Timetables from './pages/Timetables';
import TimetableView from './pages/TimetableView';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/teachers" element={<Teachers />} />
              <Route path="/rooms" element={<Rooms />} />
              <Route path="/labs" element={<Labs />} />
              <Route path="/sections" element={<Sections />} />
              <Route path="/timeslots" element={<TimeSlots />} />
              <Route path="/registrations" element={<Registrations />} />
              <Route path="/timetables" element={<Timetables />} />
              <Route path="/timetables/:id" element={<TimetableView />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;

