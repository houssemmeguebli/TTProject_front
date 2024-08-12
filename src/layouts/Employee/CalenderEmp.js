import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Container, Paper, Typography, Grid, FormControl, InputLabel, Select, MenuItem, Card } from "@mui/material";
import { format, parseISO } from 'date-fns';
import { makeStyles } from '@mui/styles';

import AuthService from "../../_services/AuthService";
import EmployeeService from "../../_services/EmployeeService";
import DashboardLayout from "../../examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "../../examples/Navbars/DashboardNavbar";
import ArgonBox from "../../components/ArgonBox";
import Footer from "../../examples/Footer";

const requestService = new EmployeeService();
const authService = new AuthService();
const bgImage = "https://raw.githubusercontent.com/creativetimofficial/public-assets/master/argon-dashboard-pro/assets/img/profile-layout-header.jpg";

const useStyles = makeStyles((theme) => ({
  upcomingEventsSection: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.default,
    borderRadius: '8px',
    boxShadow: theme.shadows[3],
  },
  requestSummarySection: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.paper,
    borderRadius: '8px',
    boxShadow: theme.shadows[3],
  },
  tipsSection: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.default,
    borderRadius: '8px',
    boxShadow: theme.shadows[3],
  },
  calendarContainer: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderRadius: '8px',
    boxShadow: theme.shadows[5],
  },
  calendar: {
    borderRadius: '8px',
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.default,
    boxShadow: theme.shadows[2],
  },
  eventPending: {
    backgroundColor: '#ffaa3b !important',
    borderColor: '#ffaa3b !important',
    opacity: 0.9,
  },
  eventApproved: {
    backgroundColor: '#4caf50 !important',
    borderColor: '#4caf50 !important',
    opacity: 0.9,
  },
  eventRejected: {
    backgroundColor: '#f44336 !important',
    borderColor: '#f44336 !important',
    opacity: 0.9,
  },
  event: {
    borderRadius: '5px',
    borderWidth: '2px',
    borderStyle: 'solid',
    padding: '2px',
  },
}));

const getBusinessDaysCount = (startDate, endDate) => {
  let count = 0;
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Exclude Saturdays (6) and Sundays (0)
      count++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return count;
};

const CalendarEmp = () => {
  const classes = useStyles();
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const currentUserId = authService.getCurrentUser().id;

  useEffect(() => {
    const fetchUserAndRequests = async () => {
      try {
        const userResponse = await requestService.getEmployeeById(currentUserId);
        setUser({
          firstName: userResponse.firstName,
          lastName: userResponse.lastName,
        });

        const result = await requestService.getRequestsByEmployeeId(currentUserId);
        if (result && Array.isArray(result.$values)) {
          const requestsData = result.$values;

          const eventsData = requestsData.reduce((acc, request) => {
            const startDate = parseISO(request.startDate);
            const endDate = parseISO(request.endDate);

            const businessDays = getBusinessDaysCount(startDate, endDate);
            const statusClass = getStatusClass(request.status);
            const statusType = getStatusType(request.status);

            acc.push({
              title: `${statusType} (${businessDays} days)`,
              start: startDate.toISOString(),
              end: endDate.toISOString(),
              className: `${statusClass} ${classes.event}`,
              status: request.status,
            });

            return acc;
          }, []);

          setEvents(eventsData);
        } else {
          console.error('Expected an array of requests, received:', result);
        }
      } catch (error) {
        console.error('Error fetching user or requests:', error);
      }
    };

    fetchUserAndRequests();
  }, [currentUserId]);

  const getStatusClass = (status) => {
    switch (status) {
      case 0: return classes.eventPending;
      case 1: return classes.eventApproved;
      case 3: return classes.eventRejected;
      default: return '';
    }
  };

  const getStatusType = (status) => {
    switch (status) {
      case 0: return 'Pending';
      case 1: return 'Approved';
      case 3: return 'Rejected';
      default: return 'Unknown';
    }
  };

  const handleFilterChange = (event) => {
    setFilterStatus(event.target.value);
  };

  const filteredEvents = events.filter(event =>
    filterStatus === 'all' || event.status === parseInt(filterStatus)
  );

  const approvedRequests = filteredEvents.filter(e => e.className.includes(classes.eventApproved)).length;
  const pendingRequests = filteredEvents.filter(e => e.className.includes(classes.eventPending)).length;

  return (
    <DashboardLayout
      sx={{
        backgroundImage: ({ functions: { rgba, linearGradient }, palette: { gradients } }) =>
          `${linearGradient(rgba(gradients.info.main, 0.6), rgba(gradients.info.state, 0.6))}, url(${bgImage})`,
        backgroundPositionY: "50%",
      }}
    >
      <DashboardNavbar />
      <Container sx={{ padding: 1 }}>
        <Card elevation={4} sx={{ padding: { xs: 2, sm: 3, md: 4 }, borderRadius: 2 }}>
          <Grid item xs={12} sm={4}>
            <FormControl  sx={{  width: { xs: "100%", sm: "50%", md: "30%" },
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: theme => theme.palette.primary.main,
                },
                '&:hover fieldset': {
                  borderColor: theme => theme.palette.primary.dark,
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme => theme.palette.primary.dark,
                },
                '& .MuiInputBase-input': {
                  width: '100% !important',
                },
              },
            }}>
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={filterStatus}
                onChange={handleFilterChange}
                label="Status Filter"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="0">Pending</MenuItem>
                <MenuItem value="1">Approved</MenuItem>
                <MenuItem value="3">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <div className={classes.calendarContainer}>
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={filteredEvents}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              dayCellDidMount={(info) => {
                if (info.date.getDay() === 0 || info.date.getDay() === 6) {
                  info.el.style.backgroundColor = '#f5f5f5';
                }
              }}
              className={classes.calendar}
            />
          </div>

          <ArgonBox className={classes.upcomingEventsSection}>
            <Typography variant="h6">Upcoming Events</Typography>
            <ul>
              {filteredEvents.slice(0, 5).map(event => (
                <li key={event.start}>
                  <Typography variant="body2">
                    {event.title} on {format(new Date(event.start), 'dd-MM-yyyy')}
                  </Typography>
                </li>
              ))}
            </ul>
          </ArgonBox>

          <ArgonBox className={classes.requestSummarySection}>
            <Typography variant="h6">Request Summary</Typography>
            <Grid container spacing={2}>

              <Grid item xs={12} sm={4}>
                <Typography variant="body2">Total Requests: {filteredEvents.length}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2">Approved: {approvedRequests}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2">Pending: {pendingRequests}</Typography>
              </Grid>
            </Grid>
          </ArgonBox>

          <ArgonBox className={classes.tipsSection}>
            <Typography variant="h6">Tips for Using the Calendar</Typography>
            <Typography variant="body2">
              - Utilize color codes to quickly identify the status of events.<br />
              - Review your calendar regularly to keep track of upcoming tasks and events.<br />
              - Customize the calendar view to suit your preference (daily, weekly, monthly).<br />
            </Typography>
          </ArgonBox>

        </Card>
      </Container>
      <Footer />
    </DashboardLayout>
  );
};

export default CalendarEmp;
