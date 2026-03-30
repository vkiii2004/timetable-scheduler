import React from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box, Typography, Card, CardContent, Chip } from '@mui/material';

// Fixed timetable columns derived from the provided image
// Includes Short Break and Lunch Break as dedicated columns
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
// Fixed class labels order requested by the user
const CLASS_LABELS = ['BE(A)', 'BE(B)', 'TE(A)', 'TE(B)', 'TE(C)', 'SE(A)', 'SE(B)', 'SE(C)'];

// Each entry is either a time range or a break marker
const COLUMNS = [
  { key: '09:00-10:00', type: 'slot', start: '09:00', end: '10:00', title: '09:00 – 10:00' },
  { key: '10:00-11:00', type: 'slot', start: '10:00', end: '11:00', title: '10:00 – 11:00' },
  { key: 'short-break', type: 'break', title: 'Short Break' },
  { key: '11:15-12:15', type: 'slot', start: '11:15', end: '12:15', title: '11:15 – 12:15' },
  { key: '12:15-01:15', type: 'slot', start: '12:15', end: '13:15', title: '12:15 – 01:15' },
  { key: 'lunch-break', type: 'break', title: 'Lunch Break' },
  { key: '02:00-03:00', type: 'slot', start: '14:00', end: '15:00', title: '02:00 – 03:00' },
  { key: '03:00-04:00', type: 'slot', start: '15:00', end: '16:00', title: '03:00 – 04:00' },
];

function findItemForCell(schedule, day, sectionId, start, end) {
  if (!schedule) return null;
  return schedule.find(item =>
    item.day === day &&
    String(item.section?._id || item.section) === String(sectionId) &&
    item.timeSlot?.startTime === start &&
    item.timeSlot?.endTime === end
  ) || null;
}

export default function TimetableGrid({ timetable }) {
  const sections = (timetable?.sections || []).slice();
  const schedule = timetable?.schedule || [];

  // Map fixed class labels to actual section ids by matching sectionName
  const sectionIdByLabel = new Map();
  for (const label of CLASS_LABELS) {
    const match = sections.find(s => s.sectionName === label);
    if (match) sectionIdByLabel.set(label, match._id);
  }

  return (
    <Paper sx={{ p: 2 }}>
      <TableContainer>
        <Table size="small" sx={{ tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 120, fontWeight: 'bold' }}>Day</TableCell>
              <TableCell sx={{ width: 160, fontWeight: 'bold' }}>Class</TableCell>
              {COLUMNS.map(col => (
                <TableCell key={`head-${col.key}`} align="center" sx={{ fontWeight: 'bold' }}>
                  {col.title}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {DAYS.map((day) => (
              <React.Fragment key={`day-${day}`}>
                {CLASS_LABELS.map((label, idx) => {
                  const sectionId = sectionIdByLabel.get(label) || null;
                  return (
                    <TableRow key={`${day}-${label}`}>
                      {idx === 0 && (
                        <TableCell
                          rowSpan={CLASS_LABELS.length}
                          sx={{ p: 0, backgroundColor: '#fafafa', borderRight: '1px solid #eee' }}
                        >
                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: `${CLASS_LABELS.length * 60}px`,
                            fontWeight: 'bold'
                          }}>
                            {day}
                          </Box>
                        </TableCell>
                      )}
                      <TableCell sx={{ fontWeight: 'bold' }}>{label}</TableCell>
                      {COLUMNS.map(col => {
                        if (col.type === 'break') {
                          return (
                            <TableCell key={`${day}-${label}-${col.key}`} align="center" sx={{ backgroundColor: '#f5f5f5' }}>
                              {idx === 0 && (
                                <Typography variant="caption" color="text.secondary">{col.title}</Typography>
                              )}
                            </TableCell>
                          );
                        }

                        if (!sectionId) {
                          return <TableCell key={`${day}-${label}-${col.key}`} />;
                        }

                        const item = findItemForCell(schedule, day, sectionId, col.start, col.end);
                        return (
                          <TableCell key={`${day}-${label}-${col.key}`} sx={{ p: 0.5, minHeight: 60 }}>
                            {item ? (
                              <Card sx={{ backgroundColor: item.isLab ? '#e3f2fd' : '#f3e5f5', border: '1px solid #ddd' }}>
                                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                                  <Typography variant="caption" fontWeight="bold" display="block">
                                    {item.subject?.subjectName}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    {item.teacher?.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    {item.room ? item.room.roomNumber : item.lab ? item.lab.labNumber : 'TBA'}
                                  </Typography>
                                  {item.isLab && <Chip label="Lab" size="small" color="secondary" />}
                                </CardContent>
                              </Card>
                            ) : null}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ mt: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Note: Grid shows Monday–Friday only. Breaks follow the provided format.
        </Typography>
      </Box>
    </Paper>
  );
}


