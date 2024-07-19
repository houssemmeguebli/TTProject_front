import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Container, Paper, Typography, Grid, Button } from '@mui/material';
import { differenceInDays, parseISO } from 'date-fns';
import { makeStyles } from '@mui/styles';
import DashboardLayout from '../examples/LayoutContainers/DashboardLayout';
import RequestService from '../_services/RequestService';
import UserService from "../_services/ProjectManagerService";
import DashboardNavbar from "../examples/Navbars/DashboardNavbar";
import ArgonBox from "../components/ArgonBox";
import Footer from "../examples/Footer";

const requestService = new RequestService();
const bgImage = "https://raw.githubusercontent.com/creativetimofficial/public-assets/master/argon-dashboard-pro/assets/img/profile-layout-header.jpg";

const useStyles = makeStyles((theme) => ({
  upcomingEventsSection: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[100],
    borderRadius: '8px',
  },
  requestSummarySection: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[200],
    borderRadius: '8px',
  },
  tipsSection: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[100],
    borderRadius: '8px',
  },
  quickLinksSection: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[200],
    borderRadius: '8px',
  },
}));

const Calendar = () => {
  const classes = useStyles();
  const [events, setEvents] = useState([]);
  const [userMap, setUserMap] = useState({});

  const fetchUsers = async (userIds) => {
    try {
      const responses = await Promise.all(userIds.map(userId => UserService.getUserById(userId)));
      const users = responses.reduce((acc, data) => {
        if (data && data.userId) {
          acc[data.userId] = {
            firstName: data.firstName,
            lastName: data.lastName
          };
        }
        return acc;
      }, {});
      setUserMap(users);
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs :', error);
    }
  };

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const result = await requestService.getAllRequests();
        if (result && Array.isArray(result.$values)) {
          const requestsData = result.$values;
          await fetchUsers(requestsData.map(request => request.userId));

          const eventsData = requestsData.map(request => {
            const startDate = parseISO(request.startDate);
            const endDate = parseISO(request.endDate);
            const duration = differenceInDays(endDate, startDate);
            const user = userMap[request.userId] || { firstName: 'Unknown', lastName: '' };
            const statusColor = getStatusColor(request.status);
            const statusType = getStatusType(request.status);

            return {
              title: `${user.firstName} ${user.lastName} - ${statusType} - Duration: ${duration} days`,
              start: request.startDate,
              end: request.endDate,
              backgroundColor: statusColor,
              borderColor: statusColor,
            };
          });

          setEvents(eventsData);
        } else {
          console.error('Expected an array of requests, received:', result);
        }
      } catch (error) {
        console.error('Error fetching requests:', error);
      }
    };

    fetchRequests();
  }, [userMap]);

  const getStatusColor = (status) => {
    switch (status) {
      case 0: return '#ffeb3b'; // Pending
      case 1: return '#4caf50'; // Approved
      case 2: return '#2196f3'; // Updated
      case 3: return '#f44336'; // Rejected
      default: return '#9e9e9e'; // Default color
    }
  };

  const getStatusType = (status) => {
    switch (status) {
      case 0: return 'Pending';
      case 1: return 'Approved';
      case 2: return 'Updated';
      case 3: return 'Rejected';
      default: return 'Unknown';
    }
  };

  return (
    <DashboardLayout
      sx={{
        backgroundImage: ({ functions: { rgba, linearGradient }, palette: { gradients } }) =>
          `${linearGradient(rgba(gradients.info.main, 0.6), rgba(gradients.info.state, 0.6))}, url(${bgImage})`,
        backgroundPositionY: "50%",
      }}
    >
      <DashboardNavbar />
      <Container sx={{ padding: 4 }}>
        <Paper elevation={4} sx={{ padding: 3, borderRadius: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Calendar
          </Typography>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            sx={{ marginTop: 2 }}
          />

          {/* Upcoming Events Section */}
          <ArgonBox className={classes.upcomingEventsSection}>
            <Typography variant="h6">Upcoming Events</Typography>
            <ul>
              {events.slice(0, 5).map(event => (
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
                <Typography variant="body2">Total Requests: {events.length}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2">Approved: {events.filter(e => e.status === 1).length}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2">Pending: {events.filter(e => e.status === 0).length}</Typography>
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

          {/* Quick Links Section */}
          <ArgonBox className={classes.quickLinksSection}>
            <Typography variant="h6">Quick Links</Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Button variant="outlined" color="primary" fullWidth>
                  View All Requests
                </Button>
              </Grid>
              <Grid item xs={4}>
                <Button variant="outlined" color="primary" fullWidth>
                  Manage Users
                </Button>
              </Grid>
              <Grid item xs={4}>
                <Button variant="outlined" color="primary" fullWidth>
                  Generate Report
                </Button>
              </Grid>
            </Grid>
          </ArgonBox>
        </Paper>
      </Container>
      <Footer />

    </DashboardLayout>
  );
};

export default Calendar;
