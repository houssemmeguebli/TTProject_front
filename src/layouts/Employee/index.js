import React, { useState, useEffect } from 'react';
import { Add, Delete, Edit, Visibility } from "@mui/icons-material";
import { makeStyles } from '@mui/styles';
import Pagination from '@mui/material/Pagination';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import SearchIcon from '@mui/icons-material/Search';
import EmployeeService from "../../_services/EmployeeService";
import ArgonTypography from "../../components/ArgonTypography";
import Footer from "../../examples/Footer";
import ArgonBox from "../../components/ArgonBox";
import DashboardNavbar from "../../examples/Navbars/DashboardNavbar";
import DashboardLayout from "../../examples/LayoutContainers/DashboardLayout";
import {
  Button,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Card,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import {  format, parseISO } from "date-fns";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import DialogActions from "@mui/material/DialogActions";
import AuthService from "../../_services/AuthService";
import RequestService from "../../_services/RequestService";
import ProjectManagerService from "../../_services/ProjectManagerService";
import clsx from "clsx";
import MenuItem from "@mui/material/MenuItem";

const employeeService = new EmployeeService();
const authService = new AuthService();
const bgImage = "https://raw.githubusercontent.com/creativetimofficial/public-assets/master/argon-dashboard-pro/assets/img/profile-layout-header.jpg";
const requestService = new RequestService();
const UserService = new ProjectManagerService();
const useStyles = makeStyles((theme) => ({


  addButton: {
    marginBottom: theme.spacing(2),
    color: '#ffffff',
    backgroundColor: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: '#303f9f',
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
    width: "125px",
    fontWeight: 600,
    padding: "12px 20px",
    textAlign: "center",
    borderRadius: "5px",
    justifyContent: "center",
    color: "#fff",
    transition: "background-color 0.3s, transform 0.2s",
    display: "inline-block",
    fontSize: "16px",
    textTransform: "uppercase",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      fontSize: "12px",
      padding: "10px 15px",
    },
  },
  statusPending: {
    backgroundColor: '#ff9800',
    '&:hover': {
      backgroundColor: '#fb8c00',
    },
  },
  statusApproved: {
    backgroundColor: '#4caf50',
    '&:hover': {
      backgroundColor: '#388e3c',
    },
  },
  statusUpdated: {
    backgroundColor: '#2196f3',
    '&:hover': {
      backgroundColor: '#1976d2',
    },
  },
  statusRejected: {
    backgroundColor: '#f44336',
    '&:hover': {
      backgroundColor: '#d32f2f',
    },
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: theme.spacing(2),
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
  card: {
    margin: theme.spacing(2),
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[3],
    backgroundColor: theme.palette.background.paper,
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
  },
  cardContent: {
    marginTop: theme.spacing(1),
  },
  cardActions: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: theme.spacing(2),
    flexWrap: "wrap",
  },
}));

const Status = {
  0: 'Pending',
  1: 'Approved',
  3: 'Rejected',
};

const Empolyee = () => {
  const classes = useStyles();
  const [requestsData, setRequestsData] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 700);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchRequests();
  }, []);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 700);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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

  const currentUser = authService.getCurrentUser();
  console.log("id :",currentUser.id);

  const fetchRequests = async () => {
    try {
      const employeeId = currentUser.id;
      const result = await employeeService.getRequestsByEmployeeId(employeeId);

      if (result && Array.isArray(result.$values)) {
        setRequestsData(result.$values);
        await fetchUsers(result.$values.map(request => request.employeeId));
      } else {
        console.error('Expected an array of requests, received:', result);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }finally {
      setLoading(false);
    }
  };

  if (loading) return <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh', // Full viewport height
      width: '100vw'  // Full viewport width
    }}
  >
    <CircularProgress />
  </Box>;

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
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
        await Swal.fire({
          title: "Deleted!",
          text: "Your request has been deleted.",
          icon: "success",
        });
      } catch (error) {
        console.error('Error deleting request:', error);
        await Swal.fire({
          title: "Error!",
          text: "There was a problem deleting your request.",
          icon: "error",
        });
      }
    }
  };

  const handleUpdate = (requestId) => {
    navigate(`/editRequestEmp/${requestId}`);
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const getRequestStats = () => {
    return {
      total: requestsData.length,
      approved: requestsData.filter(req => req.status === 1).length,
      pending: requestsData.filter(req => req.status === 0).length,
      rejected: requestsData.filter(req => req.status === 3).length,
      updated: requestsData.filter(req => req.status === 2).length,
    };
  };

  const stats = getRequestStats();

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredRequests = requestsData.filter((request) => {
    const userName = userMap[request.employeeId]?.toLowerCase() || '';

    // Filter by status if a status filter is applied
    const statusMatches = filterStatus === 'all' || Status[request.status] === filterStatus;

    // Filter by name if a search query is present
    const nameMatches = userName.includes(searchQuery.toLowerCase());

    return statusMatches && nameMatches;
  });
  const indexOfLastRequest = currentPage * rowsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - rowsPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirstRequest, indexOfLastRequest);

  const getBusinessDaysCount = (startDate, endDate) => {
    // Parse the dates if they are strings
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      console.error('Start date must be before end date.');
      return 0;
    }
    let count = 0;
    const currentDate = new Date(start);

    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return count;
  };
  const handleStatusChange = (event) => {
    setFilterStatus(event.target.value);
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
      <ArgonBox py={3} className={classes.card}>
        <Card>
          <ArgonBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
            <Typography variant="h4" >
              Requests Table
            </Typography>
            <Link to="/AddRequestEmp" style={{ textDecoration: 'none' }}>
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
     <ArgonBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
          <TextField
            select
            label="Filter Status"
            value={filterStatus}
            onChange={handleStatusChange}
            variant="outlined"
            sx={{
              width: { xs: "100%", sm: "70%", md: "20%" },
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
            }}
          >
            <MenuItem value="all">All</MenuItem>
            {Object.keys(Status).map((key) => (
              <MenuItem key={key} value={Status[key]}>
                {Status[key]}
              </MenuItem>
            ))}
          </TextField>
            <TextField
              variant="outlined"
              placeholder="Search by Name"
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon style={{ color: '#1976d2' }} />
                  </InputAdornment>
                ),
              }}
              style={{
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

          {currentRequests.length === 0 ? (
            <div style={{ textAlign: "center", marginTop: "50px", padding: "30px", backgroundColor: "#ffffff", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}>
              <Typography variant="h5" style={{ fontWeight: 500, color: "#333" }}>
                No Requests Available
              </Typography>
              <Typography variant="body1" style={{ marginTop: "15px", color: "#666" }}>
                There are currently no requests to display. Please check back later or create a new request as needed.
              </Typography>
              <Typography variant="body2" style={{ marginTop: "10px", color: "#999" }}>
                You can submit new requests at any time using the form below.
              </Typography>
              <Link to="/AddRequestEmp" style={{ textDecoration: 'none' }}>
              <Button variant="contained" color="primary" style={{ marginTop: "20px", borderRadius: "8px" }}>
                Create New Request
              </Button>
              </Link>
            </div>
          ) : (
            <>
          <ArgonBox className={classes.tableContainer}>
            {isMobile ? (
              currentRequests.map(request => (
                <Card key={request.requestId} className={classes.card}>
                  <ArgonBox p={2}>
                    <Box className={classes.cardHeader}>
                      <Typography variant="h6">{userMap[request.employeeId]}</Typography>
                      <Typography
                        className={clsx(classes.statusCell, classes[`status${Status[request.status]}`])}
                      >
                        {Status[request.status]}
                      </Typography>
                    </Box>
                    <Box className={classes.cardContent}>
                      <Typography variant="body1">{`Start Date: ${format(parseISO(request.startDate), "dd-MM-yyyy")}`}</Typography>
                      <Typography variant="body1">{`End Date: ${format(parseISO(request.endDate), "dd-MM-yyyy")}`}</Typography>
                      <Typography variant="body1">{`Days: ${getBusinessDaysCount(parseISO(request.startDate), parseISO(request.endDate))}`}</Typography>
                      <Typography variant="body1">{`Comment: ${request.comment || "No comments"}`}</Typography>
                    </Box>
                    <Box className={classes.cardActions}>
                      <IconButton
                        className={classes.actionButton}
                        color="primary"
                        aria-label="view details"
                        onClick={() => handleViewDetails(request)}
                      >
                        <Visibility />
                      </IconButton>
                      {request.status !== 1 && request.status !== 3 && (
                        <IconButton onClick={() => handleUpdate(request.requestId)}>
                          <Edit />
                        </IconButton>
                      )}
                      {request.status !== 1 && request.status !== 3 && (
                        <IconButton onClick={() => handleDelete(request.requestId)}>
                          <Delete />
                        </IconButton>
                      )}
                    </Box>
                  </ArgonBox>
                </Card>
              ))
            ) : (
            <table>
              <thead>
              <tr>
                <th>Employee</th>
                <th style={{ textAlign: "center" }}>Period</th>
                <th style={{ textAlign: "center" }}>Days</th>
                <th style={{ textAlign: "center" }}>Status</th>
                <th style={{ textAlign: "center" }}>Action</th>
              </tr>
              </thead>
              <tbody>
              {currentRequests.map((request) => (
                <tr key={request.requestId}>
                  <td>{userMap[request.employeeId]}</td>
                  <td style={{ textAlign: "center" }}>
                    <span style={{ margin: "0 10px" }}>From</span>
                    <span style={{ fontWeight: "bold" }}>{format(new Date(request.startDate), "dd-MM-yyyy")}</span>
                    <span style={{ margin: "0 10px" }}>To</span>
                    <span style={{ fontWeight: "bold" }}>{format(new Date(request.endDate), "dd-MM-yyyy")}</span>
                  </td>
                  <td
                    style={{ textAlign: "center" }}>
                    {getBusinessDaysCount(parseISO(request.startDate), parseISO(request.endDate)) }
                  </td>

                  <td style={{ textAlign: "center" }}>
                    <div className={`${classes.statusCell} ${classes[`status${Status[request.status]}`]}`}>
                      {Status[request.status]}
                    </div>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <IconButton
                      aria-label="View"
                      onClick={() => handleViewDetails(request)}
                    >
                      <Visibility />
                    </IconButton>

                    {request.status !== 1 && request.status !== 3 && (
                      <IconButton onClick={() => handleUpdate(request.requestId)}>
                        <Edit />
                      </IconButton>
                    )}
                    {request.status !== 1 && request.status !== 3 && (
                      <IconButton onClick={() => handleDelete(request.requestId)}>
                        <Delete />
                      </IconButton>
                    )}
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
            )}
            <Container className={classes.pagination}>
            <Pagination
                count={Math.ceil(filteredRequests.length / rowsPerPage)}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
              />
            </Container>

            <ArgonBox className={classes.summarySection}>
              <Grid container spacing={2} justifyContent="space-between">
                <Grid item xs={12} sm={2}>
                  <div className={classes.statsItem}>
                    <ArgonTypography variant="h5">{stats.total}</ArgonTypography>
                    <ArgonTypography variant="body2">Total Requests</ArgonTypography>
                  </div>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <div className={classes.statsItem}>
                    <ArgonTypography variant="h5">{stats.approved}</ArgonTypography>
                    <ArgonTypography variant="body2">Approved</ArgonTypography>
                  </div>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <div className={classes.statsItem}>
                    <ArgonTypography variant="h5">{stats.pending}</ArgonTypography>
                    <ArgonTypography variant="body2">Pending</ArgonTypography>
                  </div>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <div className={classes.statsItem}>
                    <ArgonTypography variant="h5">{stats.rejected}</ArgonTypography>
                    <ArgonTypography variant="body2">Rejected</ArgonTypography>
                  </div>
                </Grid>

              </Grid>
            </ArgonBox>
          </ArgonBox>
            </>
          )}

        </Card>
      </ArgonBox>
      <Footer />
      <Dialog open={openDialog} onClose={handleDialogClose} fullWidth maxWidth="md" >
        <DialogTitle className={classes.dialogTitle} style={{ color: "white" }}>Request Details</DialogTitle>
        <DialogContent dividers >
          {selectedRequest && (
            <List >
              <ListItem className={classes.listItem} >
                <ListItemText style={{ textAlign: "center" }}
                              primary="Employee Name"
                              secondary={userMap[selectedRequest.employeeId]}
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
                  secondary={`${getBusinessDaysCount(parseISO(selectedRequest.startDate), parseISO(selectedRequest.endDate)) } days`}
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

    </DashboardLayout>
  );
};

export default Empolyee;
