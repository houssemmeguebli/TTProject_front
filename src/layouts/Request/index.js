import React, { useState, useEffect } from 'react';
import {
  Card,
  IconButton,
  Container,
  Typography,
  Button,
  Grid, TextField, InputAdornment,
} from "@mui/material";
import { Add, Delete, Edit, Visibility } from "@mui/icons-material";
import ArgonBox from '../../components/ArgonBox';
import ArgonTypography from '../../components/ArgonTypography';
import DashboardLayout from '../../examples/LayoutContainers/DashboardLayout';
import DashboardNavbar from '../../examples/Navbars/DashboardNavbar';
import Footer from '../../examples/Footer';
import RequestService from '../../_services/RequestService';
import UserService from '../../_services/ProjectManagerService';
import { makeStyles } from '@mui/styles';
import Pagination from '@mui/material/Pagination';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import SearchIcon from '@mui/icons-material/Search';
import { differenceInDays, format, parseISO } from "date-fns";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import ListItemText from "@mui/material/ListItemText";
import ListItem from "@mui/material/ListItem";
import List from "@mui/material/List";

const requestService = new RequestService();
const bgImage = "https://raw.githubusercontent.com/creativetimofficial/public-assets/master/argon-dashboard-pro/assets/img/profile-layout-header.jpg";


const useStyles = makeStyles((theme) => ({
  dialogTitle: {
    backgroundColor: '#1976d2',
    color: 'white',
    textAlign: 'center',
    padding: theme.spacing(2),
  },
  dialogContent: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),

  },
  listItem: {
    marginBottom: theme.spacing(2),
  },
  listItemTextPrimary: {
    fontWeight: 'bold'
  },
  approved: {
    color: theme.palette.success.main,
  },
  rejected: {
    color: theme.palette.error.main,
  },
  card: {
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
    margin: theme.spacing(2),
    borderRadius: '12px',
  },
  quickLinkButton: {
    padding: '12px',
    borderRadius: '8px',
    transition: 'background-color 0.3s, color 0.3s',
    backgroundColor: '#ffffff',
    color: '#1976d2',
    '&:hover': {
      backgroundColor: '#1976d2',
      color: '#ffffff',
    },
  },

  tableContainer: {
    overflowX: 'auto',
    margin: '1%',
    '& table': {
      width: '100%',
      borderCollapse: 'collapse',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      '& th, td': {
        border: '1px solid #ddd',
        padding: theme.spacing(2),
        textAlign: 'left',
        transition: 'background-color 0.3s',
      },
      '& th': {
        backgroundColor: '#1976d2',
        color: '#fff',
        fontWeight: 'bold',
      },
      '& tbody tr:nth-child(even)': {
        backgroundColor: '#f9f9f9',
      },
      '& tbody tr:hover': {
        backgroundColor: '#f1f1f1',
      },
    },
  },
  statusCell: {
    width:'125px',
    fontWeight: '600',
    padding: '12px 20px',
    textAlign: 'center',
    borderRadius: '5px',
    justifyContent:"center",
    color: '#fff',
    transition: 'background-color 0.3s, transform 0.2s',
    display: 'inline-block',
    fontSize: '16px',
    textTransform: 'uppercase',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  statusPending: {
    backgroundColor: '#ff9800', // Bright orange for pending
    '&:hover': {
      backgroundColor: '#fb8c00', // Darker orange on hover
    },
  },
  statusApproved: {
    backgroundColor: '#4caf50', // Vibrant green for approved
    '&:hover': {
      backgroundColor: '#388e3c', // Darker green on hover
    },
  },
  statusUpdated: {
    backgroundColor: '#2196f3', // Bright blue for updated
    '&:hover': {
      backgroundColor: '#1976d2', // Darker blue on hover
    },
  },
  statusRejected: {
    backgroundColor: '#f44336', // Bright red for rejected
    '&:hover': {
      backgroundColor: '#d32f2f', // Darker red on hover
    },
  },

  pagination: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: theme.spacing(2),
  },
  addButton: {
    marginBottom: theme.spacing(2),
    color: '#ffffff',
    backgroundColor: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: '#303f9f',
    },
  },
  importantNotes: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[100],
    borderRadius: '8px',
  },
  summarySection: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(2),
    //backgroundColor: theme.palette.grey[200],
    borderRadius: '8px',
    borderColor:'black'
  },
  statsItem: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.white,
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
  },
}));

const Status = {
  0: 'Pending',
  1: 'Approved',
  2: 'Updated',
  3: 'Rejected',
};

const Index = () => {
  const classes = useStyles();
  const [requestsData, setRequestsData] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);


  useEffect(() => {
    fetchRequests();
  }, []);


  const fetchRequests = async () => {
    try {
      const result = await requestService.getAllRequests();

      if (result && Array.isArray(result.$values)) {
        setRequestsData(result.$values);
        await fetchUsers(result.$values.map(request => request.userId));
      } else {
        console.error('Expected an array of requests, received:', result);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };
  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setOpenDialog(true);
  };
  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const fetchUsers = async (userIds) => {
    try {
      const responses = await Promise.all(userIds.map(userId => UserService.getUserById(userId)));
      const users = responses.reduce((acc, data) => {
        if (data && data.userId) {
          acc[data.userId] = `${data.firstName} ${data.lastName}`;
        } else {
          console.warn('No userId found in response:', data);
        }
        return acc;
      }, {});
      setUserMap(users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleDelete = async (requestId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await requestService.deleteRequest(requestId);
        setRequestsData(requestsData.filter(request => request.requestId !== requestId));
        Swal.fire({
          title: "Deleted!",
          text: "Your request has been deleted.",
          icon: "success",
        });
      } catch (error) {
        console.error('Error deleting request:', error);
        Swal.fire({
          title: "Error!",
          text: "There was a problem deleting your request.",
          icon: "error",
        });
      }
    }
  };

  const handleUpdate = (requestId) => {
    navigate(`/editRequest/${requestId}`);
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const indexOfLastRequest = currentPage * rowsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - rowsPerPage;
  //const currentRequests = requestsData.slice(indexOfFirstRequest, indexOfLastRequest);

  const getRequestStats = () => {
    const stats = {
      total: requestsData.length,
      approved: requestsData.filter(req => req.status === 1).length,
      pending: requestsData.filter(req => req.status === 0).length,
      rejected: requestsData.filter(req => req.status === 3).length,
      updated: requestsData.filter(req => req.status === 2).length,
    };
    return stats;
  };

  const stats = getRequestStats();
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredRequests = requestsData.filter(request => {
    const userName = userMap[request.userId]?.toLowerCase() || '';
    return userName.includes(searchQuery.toLowerCase());
  });

  const currentRequests = filteredRequests.slice(indexOfFirstRequest, indexOfLastRequest);

  return (

    <DashboardLayout
      sx={{
        backgroundImage: ({ functions: { rgba, linearGradient }, palette: { gradients } }) =>
          `${linearGradient(rgba(gradients.info.main, 0.6), rgba(gradients.info.state, 0.6))}, url(${bgImage})`,
        backgroundPositionY: "50%",
      }}
    >
      <DashboardNavbar />

      <ArgonBox py={3} className={classes.card}>
        <Card>
          <ArgonBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
            <ArgonTypography variant="h6" fontWeight="medium">Table of Requests</ArgonTypography>
            <Link to="/add" style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                color="primary"
                className={classes.addButton}
                startIcon={<Add />}
              >
                New Request
              </Button>
            </Link>
          </ArgonBox>
          {currentRequests.length === 0 ? (
            <div style={{
              textAlign: "center",
              marginTop: "50px",
              padding: "30px",
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              maxWidth: "700px",
              marginLeft: "auto",
              marginRight: "auto"
            }}>
              <Typography variant="h5" style={{ fontWeight: 600, color: "#333" }}>
                No Pending Requests
              </Typography>
              <Typography variant="body1" style={{ marginTop: "15px", color: "#666" }}>
                At this moment, there are no pending requests awaiting your review.
                Please check back periodically for new requests.
              </Typography>
              <Typography variant="body2" style={{ marginTop: "10px", color: "#999" }}>
                You can always add new requests or update existing ones through the provided forms.
              </Typography>
              <Link to="/add" style={{ textDecoration: 'none' }}>
              <Button variant="contained" color="primary" style={{ marginTop: "20px", borderRadius: "8px" }}>
                Add New Request
              </Button>
              </Link>
            </div>
          ) : (
            <>
          <ArgonBox className={classes.tableContainer}>
            <ArgonBox className="search-input-container" mb={2}>
              <TextField
                variant="outlined"
                placeholder="Search by  Name"
                value={searchQuery}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon style={{ color: '#1976d2' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '20px',
                    transition: 'border-color 0.3s, box-shadow 0.3s',
                    '&:hover fieldset': {
                      borderColor: '#1976d2',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1976d2',
                      boxShadow: '0 0 5px rgba(25, 118, 210, 0.5)',
                    },
                  },
                }}
              />
            </ArgonBox>

            <table>
              <thead>
              <tr>
                <th>Employee Name</th>
                <th style={{ textAlign: "center" }}>Period</th>
                <th style={{ textAlign: "center" }}>Days</th>
                <th style={{ textAlign: "center" }}>Status</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
              </thead>
              <tbody>
              {currentRequests.map((request) => (
                <tr key={request.requestId}>
                  <td>{userMap[request.userId]}</td>
                  <td style={{ textAlign: "center" ,  }}>
                    <span style={{ margin: "0 10px", }}>From</span>
                    <span style={{fontWeight: "bold"}}>{format(new Date(request.startDate), 'dd-MM-yyyy')}</span>
                    <span style={{ margin: "0 10px" }}>To</span>
                    <span style={{fontWeight: "bold"}}>{format(new Date(request.endDate), 'dd-MM-yyyy')}</span>
                  </td>
                  <td style={{ textAlign: "center" }}>{differenceInDays(parseISO(request.endDate), parseISO(request.startDate))+1}</td>
                  <td style={{ textAlign: "center" }}>
                      <span
                        className={`${classes.statusCell} ${classes[`status${Status[request.status]}`]}`}
                      >
                        {Status[request.status]}
                      </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <IconButton
                      aria-label="View"
                      onClick={() => handleViewDetails(request)}
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      onClick={() => handleUpdate(request.requestId)}
                      color="primary"
                      aria-label="Edit request"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(request.requestId)}
                      color="secondary"
                      aria-label="Delete request"
                    >
                      <Delete />
                    </IconButton>

                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </ArgonBox>
            </>
          )}
          <Container className={classes.pagination}>
            <Pagination
              count={Math.ceil(requestsData.length / rowsPerPage)}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
            />
          </Container>

          <ArgonBox className={classes.summarySection}>
            <Grid container spacing={2} justifyContent="space-between">
              <Grid item xs={12} sm={2}>
                <div className={classes.statsItem}>
                  <Typography variant="h6">Total Requests</Typography>
                  <Typography variant="body1">{stats.total}</Typography>
                </div>
              </Grid>
              <Grid item xs={12} sm={2}>
                <div className={classes.statsItem}>
                  <Typography variant="h6">Approved</Typography>
                  <Typography variant="body1">{stats.approved}</Typography>
                </div>
              </Grid>
              <Grid item xs={12} sm={2}>
                <div className={classes.statsItem}>
                  <Typography variant="h6">Rejected</Typography>
                  <Typography variant="body1">{stats.rejected}</Typography>
                </div>
              </Grid>

              <Grid item xs={12} sm={2}>
                <div className={classes.statsItem}>
                  <Typography variant="h6">Pending</Typography>
                  <Typography variant="body1">{stats.pending}</Typography>
                </div>
              </Grid>

            </Grid>
          </ArgonBox>


          <div className={classes.importantNotes}>
            <Typography variant="h6">Important Information:</Typography>
            <Typography variant="body2">
              - Requests should be reviewed within 24 hours to ensure timely processing.
              <br />
              - Ensure that all required fields are filled out before submission.
              <br />
              - Users can only have one pending request at a time.
              <br />
              - Status updates are automatically recorded for audit purposes.
            </Typography>
          </div>


          <ArgonBox className={classes.summarySection}>
            <Typography variant="h6" style={{ fontWeight: 'bold', marginBottom: '16px' }}>
              Quick Links:
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Link to="/calendar" style={{ textDecoration: 'none' }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    className={classes.quickLinkButton}
                  >
                    View Calendar
                  </Button>
                </Link>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Link to="/EmployeeProfiles" style={{ textDecoration: 'none' }}>
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  className={classes.quickLinkButton}
                >
                  Manage Users
                </Button>
                </Link>
              </Grid>
            </Grid>
          </ArgonBox>
        </Card>
      </ArgonBox>
      <Dialog open={openDialog} onClose={handleDialogClose} fullWidth maxWidth="md" >
        <DialogTitle className={classes.dialogTitle} style={{ color: "white"  }}>Request Details</DialogTitle>
        <DialogContent dividers >
          {selectedRequest && (
            <List >
              <ListItem className={classes.listItem} >
                <ListItemText style={{ textAlign: "center" }}
                  primary="Employee Name"
                  secondary={userMap[selectedRequest.userId]}
                />
              </ListItem >
              <ListItem className={classes.listItem} style={{ textAlign: "center" }}>
                <ListItemText
                  primary="Start Date"
                  secondary={format(new Date(selectedRequest.startDate), 'dd-MM-yyyy')}
                />
              </ListItem>
              <ListItem className={classes.listItem} style={{ textAlign: "center" }}>
                <ListItemText
                  primary="End Date"
                  secondary={format(new Date(selectedRequest.endDate), 'dd-MM-yyyy')}
                />
              </ListItem>
              <ListItem className={classes.listItem} style={{ textAlign: "center" }}>
                <ListItemText
                  primary="Duration"
                  secondary={`${differenceInDays(parseISO(selectedRequest.endDate), parseISO(selectedRequest.startDate)) + 1} days`}
                />
              </ListItem>
              <ListItem className={classes.listItem} style={{ textAlign: "center" }}>
                <ListItemText
                  primary="Employee Comment"
                  secondary={selectedRequest.comment || 'No comment'}
                />
              </ListItem>
              <ListItem className={classes.listItem} style={{ textAlign: "center" }}>
                <ListItemText
                  primary="Update Reason"
                  secondary={selectedRequest.note || 'No updates'}
                />
              </ListItem>
              <ListItem className={classes.listItem} style={{ textAlign: "center" }}>
                <ListItemText
                  primary="Status"
                  secondary={
                    <Typography
                      className={
                        selectedRequest.status === 1 ? classes.approved : selectedRequest.status === 2 ? classes.rejected : ''
                      }
                    >
                      {Status[selectedRequest.status]}
                    </Typography>
                  }
                />
              </ListItem>
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Footer />
    </DashboardLayout>
  );
};

export default Index;
