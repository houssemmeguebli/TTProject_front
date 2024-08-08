import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Container, Paper, Typography, Grid } from '@mui/material';
import { differenceInDays, parseISO } from 'date-fns';
import { makeStyles } from '@mui/styles';

import AuthService from "../../../_services/AuthService";
import RequestService from "../../../_services/RequestService";
import EmployeeService from "../../../_services/EmployeeService";
import DashboardLayout from "../../../examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "../../../examples/Navbars/DashboardNavbar";
import ArgonBox from "../../../components/ArgonBox";
import Footer from "../../../examples/Footer";

const requestService = new RequestService();
const authService = new AuthService();
const employeeService = new EmployeeService();
const bgImage = "https://raw.githubusercontent.com/creativetimofficial/public-assets/master/argon-dashboard-pro/assets/img/profile-layout-header.jpg";

const useStyles = makeStyles((theme) => ({
  upcomingEventsSection: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(3),
    backgroundColor: theme.palette.grey[100],
    borderRadius: '8px',
    boxShadow: theme.shadows[3],
  },
  requestSummarySection: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(3),
    backgroundColor: theme.palette.grey[200],
    borderRadius: '8px',
    boxShadow: theme.shadows[3],
  },
  tipsSection: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(3),
    backgroundColor: theme.palette.grey[100],
    borderRadius: '8px',
    boxShadow: theme.shadows[3],
  },
  quickLinksSection: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(3),
    backgroundColor: theme.palette.grey[200],
    borderRadius: '8px',
    boxShadow: theme.shadows[3],
  },
  eventPending: {
    backgroundColor: '#ffaa3b !important', // Use !important to override default styles
    borderColor: '#ffaa3b !important',
  },
  eventApproved: {
    backgroundColor: '#4caf50 !important',
    borderColor: '#4caf50 !important',
  },
  eventRejected: {
    backgroundColor: '#f44336 !important',
    borderColor: '#f44336 !important',
  },
  calendarContainer: {
    marginTop: theme.spacing(1),
    padding: theme.spacing(1),
    borderRadius: '8px',
    boxShadow: theme.shadows[5],
  },
  calendar: {
    borderRadius: '8px',
    border: `1px solid ${theme.palette.divider}`,
  },
}));

const CalendarEmp = () => {
  const classes = useStyles();
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);

  const currentUserId = authService.getCurrentUser().id;

  useEffect(() => {
    const fetchUserAndRequests = async () => {
      try {
        // Fetch the current user details
        const userResponse = await employeeService.getEmployeeById(currentUserId);
        setUser({
          firstName: userResponse.firstName,
          lastName: userResponse.lastName,
        });

        // Fetch the current user's requests
        const result = await employeeService.getRequestsByEmployeeId(currentUserId);
        if (result && Array.isArray(result.$values)) {
          const requestsData = result.$values;

          // Helper function to check if a date is a weekday
          const isWeekday = (date) => !(date.getDay() === 0 || date.getDay() === 6);

          // Generate events, excluding weekends
          const eventsData = requestsData.reduce((acc, request) => {
            const startDate = parseISO(request.startDate);
            const endDate = parseISO(request.endDate);

            // Generate dates between start and end
            for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
              if (isWeekday(date)) {
                const duration = differenceInDays(endDate, startDate) + 1; // +1 to include end date
                const statusClass = getStatusClass(request.status);
                const statusType = getStatusType(request.status);

                acc.push({
                  title: `${statusType} - ${duration} day${duration > 1 ? 's' : ''}`,
                  start: new Date(date).toISOString(),
                  end: new Date(date).toISOString(),
                  className: statusClass,
                });
              }
            }

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
      case 0: return classes.eventPending; // Pending
      case 1: return classes.eventApproved; // Approved
      case 3: return classes.eventRejected; // Rejected
      default: return ''; // Default class
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

  const filteredEvents = events.filter(event => {
    const startDate = new Date(event.start);
    return startDate.getDay() !== 0 && startDate.getDay() !== 6;
  });

  const approvedRequests = filteredEvents.filter(e => e.className === classes.eventApproved).length;
  const pendingRequests = filteredEvents.filter(e => e.className === classes.eventPending).length;

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
        <Paper elevation={4} sx={{ padding: 2, borderRadius: 2 }}>
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
                  info.el.style.backgroundColor = '#f5f5f5'; // Light gray for weekends
                }
              }}
              className={classes.calendar}
            />
          </div>

          {/* Upcoming Events Section */}
          <ArgonBox className={classes.upcomingEventsSection}>
            <Typography variant="h6">Upcoming Events</Typography>
            <ul>
              {filteredEvents.slice(0, 5).map(event => (
                <li key={event.start}>
                  <Typography variant="body2">{event.title} on {new Date(event.start).toLocaleDateString()}</Typography>
                </li>
              ))}
            </ul>
          </ArgonBox>

          {/* Request Summary Section */}
          <ArgonBox className={classes.requestSummarySection}>
            <Typography variant="h6">Request Summary</Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="body2">Total Requests: {filteredEvents.length}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2">Approved: {approvedRequests}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2">Pending: {pendingRequests}</Typography>
              </Grid>
            </Grid>
          </ArgonBox>

          {/* Tips for Using the Calendar */}
          <ArgonBox className={classes.tipsSection}>
            <Typography variant="h6">Tips for Using the Calendar</Typography>
            <Typography variant="body2">
              - Click on a date to create a new request.<br />
              - Hover over events for more details.<br />
              - Use the filters to find specific requests quickly.
            </Typography>
          </ArgonBox>
        </Paper>
      </Container>
      <Footer />
    </DashboardLayout>
  );
};

export default CalendarEmp;
