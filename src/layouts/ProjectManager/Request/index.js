import React, { useState, useEffect } from 'react';
import {
  Card,
  IconButton,
  Container,
  Typography,
  Button,
  Grid,
  TextField,
  InputAdornment,
  Box,
  Paper,
  CircularProgress,
  TableCell,
  TableRow,
  TableHead,
  Table,
  TableContainer,
  TableBody,
} from "@mui/material";
import { Add, Delete, Edit, PictureAsPdf, Visibility } from "@mui/icons-material";
import ArgonBox from '../../../components/ArgonBox';
import ArgonTypography from '../../../components/ArgonTypography';
import DashboardLayout from '../../../examples/LayoutContainers/DashboardLayout';
import DashboardNavbar from '../../../examples/Navbars/DashboardNavbar';
import Footer from '../../../examples/Footer';
import RequestService from '../../../_services/RequestService';
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
import ProjectManagerService from "../../../_services/ProjectManagerService";
import clsx from "clsx";
import { blue, red } from "@mui/material/colors";
import MenuItem from "@mui/material/MenuItem";
import jsPDF from "jspdf";
import 'jspdf-autotable';
const requestService = new RequestService();
const UserService = new ProjectManagerService();
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
      borderRadius: '3px',
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
      backgroundColor: '#1976d2',
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
  filterContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
}));

const Status = {
  0: 'Pending',
  1: 'Approved',
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
        const id = data.employeeId || data.userId;  // Check for employeeId first, fallback to userId
        if (id) {
          acc[id] = `${data.firstName} ${data.lastName}`;
        } else {
          console.warn('No employeeId or userId found in response:', data);
        }
        return acc;
      }, {});
      setUserMap(users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };


  const fetchRequests = async () => {
    try {
      const result = await requestService.getAllRequests();

      if (result && Array.isArray(result.$values)) {
        console.log('Requests:', result.$values); // Log the requests

        // Extract userIds (employeeIds) and projectManagerIds, filter out undefined/null values
        const userIds = result.$values.map(request => request.employeeId).filter(id => id !== undefined && id !== null);
        const managerIds = result.$values.map(request => request.projectManagerId).filter(id => id !== undefined && id !== null);

        // Combine both arrays into a single array of unique IDs
        const combinedIds = Array.from(new Set([...userIds, ...managerIds]));

        // Fetch user details for all unique IDs
        await fetchUsers(combinedIds);

        setRequestsData(result.$values);
      } else {
        console.error('Expected an array of requests, received:', result);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
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


  const filteredRequests = requestsData.filter((request) => {
    const userName = userMap[request.employeeId]?.toLowerCase() || '';

    // Filter by status if a status filter is applied
    const statusMatches = filterStatus === 'all' || Status[request.status] === filterStatus;

    // Filter by name if a search query is present
    const nameMatches = userName.includes(searchQuery.toLowerCase());

    return statusMatches && nameMatches;
  });

  const currentRequests = filteredRequests.slice(indexOfFirstRequest, indexOfLastRequest);

  const getBusinessDaysCount = (startDate, endDate) => {
    let count = 0;
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
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
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Requests Report", 14, 25);
    doc.setFontSize(11);
    doc.text(`Generated on: ${format(new Date(), "dd-MM-yyyy")}`, 14, 35);

    // Add a horizontal line below the header
    doc.setLineWidth(0.5);
    doc.line(14, 40, 196, 40);

    const tableColumn = [
      "Request ID", "Employee Name", "Treated By",
      "Start Date", "End Date", "Duration",
      "Employee Comment", "Manager Note", "Status"
    ];
    const tableRows = [];

    // Data collection for the table
    let totalDuration = 0;
    requestsData.forEach(request => {
      const startDate = parseISO(request.startDate);
      const endDate = parseISO(request.endDate);
      const duration = getBusinessDaysCount(startDate, endDate);

      const requestData = [
        request.requestId,
        userMap[request.employeeId] || "N/A",
        userMap[request.projectManagerId] || "N/A",
        format(startDate, "dd-MM-yyyy"),
        format(endDate, "dd-MM-yyyy"),
        duration,
        request.note || "N/A",
        request.comment || "N/A",
        Status[request.status],
      ];

      tableRows.push(requestData);
      totalDuration += duration; // Calculating total duration
    });

    // Table with custom styles
    doc.autoTable({
      startY: 50, // Starting point
      head: [tableColumn],
      body: tableRows,
      theme: 'grid', // Styling theme for the table
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [0, 57, 107], textColor: [255, 255, 255] }, // Custom header color
      alternateRowStyles: { fillColor: [240, 240, 240] }, // Alternating row colors
      margin: { top: 10 },
    });

    // Display total requests and total duration below the table
    const finalY = doc.previousAutoTable.finalY + 10; // Get the position after the table
    doc.setFontSize(12);
    doc.text(`Total Requests: ${requestsData.length}`, 14, finalY);

    // Add a footer with page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10, { align: 'right' });
    }

    // Convert the document to a Blob and open in a new tab
    const pdfBlob = doc.output('blob');
    const blobURL = URL.createObjectURL(pdfBlob);
    window.open(blobURL);
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
          <ArgonBox
            display="flex"
            flexDirection={{ xs: 'column', sm: 'row' }} // Stack vertically on small screens, row on larger screens
            justifyContent="space-between"
            alignItems="center"
            p={3}
          >
            {/* Title on the left */}
            <Typography variant="h4" sx={{ mb: { xs: 2, sm: 0 } }}>
              Requests Table
            </Typography>

            {/* Buttons on the right */}
            <Box
              display="flex"
              flexDirection={{ xs: 'column', sm: 'row' }} // Stack vertically on small screens, row on larger screens
              gap={2}
              justifyContent="flex-end"
              alignItems="center"


              sx={{
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              <Button
                variant="contained"
                color="primary"
                startIcon={<PictureAsPdf />}
                className={classes.addButton}
                onClick={generatePDF}
                sx={{
                  width: { xs: "100%", sm: "auto" }, // Full width on small screens, auto on larger
                }}
              >
                Export PDF
              </Button>
              <Link to="/add" style={{ textDecoration: "none" }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Add />}
                  className={classes.addButton}

                  sx={{
                    width: { xs: "100%", sm: "auto" }, // Full width on small screens, auto on larger
                  }}
                >
                  New Request
                </Button>
              </Link>
            </Box>
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
                No  Requests
              </Typography>
              <Typography variant="body1" style={{ marginTop: "15px", color: "#666" }}>
                At this moment, there are no  requests awaiting your review.
                Please check back periodically for new requests.
              </Typography>
              <Typography variant="body2" style={{ marginTop: "10px", color: "#999" }}>
                You can always add new requests or update existing ones through the provided forms.
              </Typography>
              <Link to="/add" style={{ textDecoration: 'none' }}>
                <Button variant="contained" color="white" style={{ marginTop: "20px", borderRadius: "8px",   }}>
                  Add New Request
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
                          <Typography variant="body1">{`Request ID: ${request.requestId}`}</Typography>
                          <Typography variant="body1">{`Treated by: ${userMap[request.projectManagerId]||"Not treated yet"}`}</Typography>
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
                          <IconButton
                            className={classes.actionButton}
                            color="secondary"
                            aria-label="edit"
                            onClick={() => handleUpdate(request.requestId)}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            className={classes.actionButton}
                            color="error"
                            aria-label="delete"
                            onClick={() => handleDelete(request.requestId)}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </ArgonBox>
                    </Card>
                  ))
                ) : (
                  <table>
                    <thead>
                    <tr>
                      <th style={{ textAlign: "center" ,width:"5px" }}>ID</th>
                      <th style={{ textAlign: "center" }}>Employee Name</th>
                      <th style={{ textAlign: "center" }}>Treated by</th>
                      <th style={{ textAlign: "center" }}>Period</th>
                      <th style={{ textAlign: "center" }}>Days</th>
                      <th style={{ textAlign: "center" }}>Status</th>
                      <th style={{ textAlign: "center" }}>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {currentRequests.map((request) => (
                      <tr key={request.requestId}>
                        <td style={{ textAlign: "center" }}>{request.requestId}</td>
                        <td style={{ textAlign: "center" }}>{userMap[request.employeeId]}</td>
                        <td style={{ textAlign: "center" }}>{userMap[request.projectManagerId] || "Not treated yet"}</td>
                        <td style={{ textAlign: "center" }}>
                          <span style={{ margin: "0 10px" }}>From</span>
                          <span style={{ fontWeight: "bold" }}>{format(new Date(request.startDate), "dd-MM-yyyy")}</span>
                          <span style={{ margin: "0 10px" }}>To</span>
                          <span style={{ fontWeight: "bold" }}>{format(new Date(request.endDate), "dd-MM-yyyy")}</span>
                        </td>
                        <td
                          style={{ textAlign: "center" }}>
                          {getBusinessDaysCount(parseISO(request.startDate), parseISO(request.endDate))}
                        </td>
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


                )}

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
                    Manage Employees
                  </Button>
                </Link>
              </Grid>
            </Grid>
          </ArgonBox>
        </Card>
      </ArgonBox>
      <Dialog open={openDialog} onClose={handleDialogClose} fullWidth maxWidth="md">
        <DialogTitle >Request Details</DialogTitle>
        <DialogContent dividers>
          {selectedRequest && (
            <TableContainer  className={classes.tableContainer}>
              <Table>
                <TableHead className={classes.tableHead}>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell className={classes.tableCell}>Employee Name</TableCell>
                    <TableCell className={classes.tableCell}>{userMap[selectedRequest.employeeId]}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={classes.tableCell}>Request ID</TableCell>
                    <TableCell className={classes.tableCell}>{selectedRequest.requestId}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={classes.tableCell}>Treated By</TableCell>
                    <TableCell className={classes.tableCell}>
                      {userMap[selectedRequest.projectManagerId] || 'Not treated yet'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={classes.tableCell}>Start Date</TableCell>
                    <TableCell className={classes.tableCell}>
                      {format(new Date(selectedRequest.startDate), 'dd-MM-yyyy')}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={classes.tableCell}>End Date</TableCell>
                    <TableCell className={classes.tableCell}>
                      {format(new Date(selectedRequest.endDate), 'dd-MM-yyyy')}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={classes.tableCell}>Duration</TableCell>
                    <TableCell className={classes.tableCell}>
                      {`${getBusinessDaysCount(parseISO(selectedRequest.startDate), parseISO(selectedRequest.endDate))} days`}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={classes.tableCell}>Employee Comment</TableCell>
                    <TableCell className={classes.tableCell}>
                      {selectedRequest.comment || 'No comment'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={classes.tableCell}>Manager Note</TableCell>
                    <TableCell className={classes.tableCell}>
                      {selectedRequest.note || 'No notes'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={classes.tableCell}>Status</TableCell>
                    <TableCell className={classes.tableCell}>
                      <Typography
                        className={
                          selectedRequest.status === 1 ? classes.approved :
                            selectedRequest.status === 2 ? classes.rejected : ''
                        }
                      >
                        {Status[selectedRequest.status]}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary" variant="contained" >
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Footer />

    </DashboardLayout>
  );
};

export default Index;
