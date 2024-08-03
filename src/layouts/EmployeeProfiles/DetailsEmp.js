import React, { useEffect, useState } from 'react';
import {
  Card,
  Typography,
  Box,
  CircularProgress,
  Divider,
  Grid,
  Avatar,
  TextField,
  Button,
  ListItemText,
  ListItem,
  Select,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import {  useParams } from "react-router-dom";
import DashboardNavbar from "../../examples/Navbars/DashboardNavbar";
import DashboardLayout from "../../examples/LayoutContainers/DashboardLayout";
import EmployeeService from "../../_services/EmployeeService";
import AuthService from "../../_services/AuthService";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import Swal from "sweetalert2";
import MenuItem from "@mui/material/MenuItem";

const employeeService = new EmployeeService();
const authService = new AuthService();
const connectedUser = authService.getCurrentUser();
const bgImage =
  "https://raw.githubusercontent.com/creativetimofficial/public-assets/master/argon-dashboard-pro/assets/img/profile-layout-header.jpg";

const useStyles = makeStyles((theme) => ({
  card: {
    margin: theme.spacing(2),
    padding: theme.spacing(3),
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
    borderRadius: '16px',
    backgroundColor: '#ffffff',
  },
  sectionTitle: {
    marginBottom: theme.spacing(2),
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
  statisticsCard: {
    padding: theme.spacing(2),
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
    borderRadius: '16px',
    backgroundColor: '#f5f5f5',
    textAlign: 'center',
    margin: theme.spacing(3),
  },
  chip: {
    margin: theme.spacing(2),
  },
  section: {
    margin: theme.spacing(5, 0),
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    padding: theme.spacing(2),
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  profileAvatar: {
    width: 120,
    height: 120,
    borderRadius: '50%',
    border: `4px solid ${theme.palette.primary.main}`,
  },
  profileInfo: {
    marginLeft: theme.spacing(3),
  },
  profileField: {
    marginBottom: theme.spacing(2),
  },
  formControl: {
    marginBottom: theme.spacing(2),
  },
  cuteListItem: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(2),
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    marginBottom: theme.spacing(1),
    backgroundColor: '#f9f9f9',
  },
  cuteListItemText: {
    marginLeft: theme.spacing(2),
  },
  pieChartContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing(6),
  },
  barChartContainer: {
    marginTop: theme.spacing(6),
  },
  tableContainer: {
    marginTop: theme.spacing(3),
  },
  noRequestsBox: {
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.default,
    textAlign: 'center',
    border: `1px solid ${theme.palette.divider}`,
  },
}));
/*
const handleChangePasswordClick = () => {
  navigate(`/change-password/${connectedUser.id}`);
};

 */
const role = {
  0: 'Project Manager',
  1: 'Employee',
};

const Status = {
  0: 'Pending',
  1: 'Approved',
  2: 'Updated',
  3: 'Rejected',
};

const DetailsEmp = () => {
  const classes = useStyles();
  const { employeeId } = useParams();
  const [employee, setEmployee] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    role: '',
    department: '',
    position: '',
    dateOfbirth: '',
  });

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        const userid = currentUser.id;  // Get the current user's role

        let employeeData, requestData;

        // Fetch employee details using EmployeeService
        employeeData = await employeeService.getEmployeeById(employeeId || userid);
        setEmployee(employeeData);
        setFormData({
          firstName: employeeData.firstName,
          lastName: employeeData.lastName,
          email: employeeData.email,
          phoneNumber: employeeData.phoneNumber,
          role: employeeData.role,
          department: employeeData.department || '',
          position: employeeData.position || '',
          dateOfbirth: employeeData.dateOfbirth || '',
          userStatus:employeeData.userStatus,
        });

        // Fetch requests by employee ID
        try {
          requestData = await employeeService.getRequestsByEmployeeId(employeeId || userid);
          setRequests(requestData.$values || []);
        } catch (requestError) {
          console.warn('Error fetching requests:', requestError);
          setRequests([]); // Set requests to empty array if there's an error
        }

      } catch (error) {
        setError('Failed to fetch employee details');
        console.error('Error fetching employee details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeDetails();
  }, [employeeId]);


  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  console.log('FormData:', formData);

  const handleRoleChange = (e) => {
    setFormData({
      ...formData,
      role: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      console.log('Saving data:', formData);
      await employeeService.updateEmployee(employeeId, formData);
      setEditing(false); // Exit editing mode
      Swal.fire("Success!", "Employee details updated successfully!", "success");

    } catch (error) {
      console.error('Error updating employee details:', error);
      Swal.fire("Error!", "Failed to update employee details. Please try again.", "error");

    }
  };

  const calculateStatistics = () => {
    const totalRequests = requests.length;
    const requestStatusCounts = requests.reduce((acc, request) => {
      acc[request.status] = (acc[request.status] || 0) + 1;
      return acc;
    }, {});

    return {
      totalRequests,
      statusCounts: requestStatusCounts,
    };
  };

  const { totalRequests, statusCounts } = calculateStatistics();

  const pieChartData = Object.entries(statusCounts).map(([status, count]) => ({
    name: Status[status],
    value: count,
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <DashboardLayout
      sx={{
        backgroundImage: ({ functions: { rgba, linearGradient }, palette: { gradients } }) =>
          `${linearGradient(rgba(gradients.info.main, 0.6), rgba(gradients.info.state, 0.6))}, url(${bgImage})`,
        backgroundPositionY: "50%",
      }}
    >
      <DashboardNavbar />
      <Box p={4}>
        {/* Profile Information Section */}
        <Card className={classes.card}>
          <Box className={classes.profileHeader}>
            <Avatar
              src={employee?.profilePicture || "/path/to/default/avatar.jpg"}
              className={classes.profileAvatar}
            />
            <Box className={classes.profileInfo}>
              <Typography variant="h4">{`${employee?.firstName} ${employee?.lastName}`}</Typography>
              <Typography variant="body1" color="textSecondary">{employee?.email}</Typography>
              <Typography variant="body2" color="textSecondary">{employee?.phoneNumber}</Typography>
              <Typography variant="body2" color="textSecondary"><strong>Role:</strong> {role[employee?.role]}
              </Typography>
            </Box>
          </Box>
          <Divider />
          <Typography variant="h6" className={classes.sectionTitle}>Edit Profile Information</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="First Name"
                name="firstName"
                variant="outlined"
                fullWidth
                value={formData.firstName}
                onChange={handleInputChange}
                disabled={!editing}
                className={classes.formControl}
                InputLabelProps={{ shrink: true }}
                sx={{
                  marginTop: 1,
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
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Last Name"
                name="lastName"
                variant="outlined"
                fullWidth
                value={formData.lastName}
                onChange={handleInputChange}
                disabled={!editing}
                className={classes.formControl}
                InputLabelProps={{ shrink: true }}
                sx={{
                  marginTop: 1,
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
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Email"
                name="email"
                variant="outlined"
                fullWidth
                value={formData.email}
                onChange={handleInputChange}
                disabled={!editing}
                className={classes.formControl}
                InputLabelProps={{ shrink: true }}
                sx={{
                  marginTop: 1,
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
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Date of Birth"
                name="dateOfBirth"
                variant="outlined"
                fullWidth
                value={format(new Date(formData.dateOfbirth),  "yyyy-MM-dd")}
                onChange={handleInputChange}
                disabled={!editing}
                className={classes.formControl}
                InputLabelProps={{ shrink: true }}
                type="date"
                sx={{
                  marginTop: 1,
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
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Phone Number"
                name="phoneNumber"
                variant="outlined"
                fullWidth
                value={formData.phoneNumber}
                onChange={handleInputChange}
                disabled={!editing}
                className={classes.formControl}
                InputLabelProps={{ shrink: true }}
                sx={{
                  marginTop: 1,
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
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Department"
                name="department"
                variant="outlined"
                fullWidth
                value={formData.department}
                onChange={handleInputChange}
                disabled={!editing}
                className={classes.formControl}
                InputLabelProps={{ shrink: true }}
                sx={{
                  marginTop: 1,
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
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Position"
                name="position"
                variant="outlined"
                fullWidth
                value={formData.position}
                onChange={handleInputChange}
                disabled={!editing}
                className={classes.formControl}
                InputLabelProps={{ shrink: true }}
                sx={{
                  marginTop: 1,
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
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Select
                label="Role"
                name="role"
                value={formData.role}
                onChange={handleRoleChange}
                disabled={!editing}
                fullWidth
                variant="outlined"
                className={classes.formControl}
                sx={{
                  marginTop: 1,
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
                {Object.entries(role).map(([key, value]) => (
                  <MenuItem key={key} value={parseInt(key, 10)}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
          </Grid>
          <Box mt={2}>
            {editing ? (
              <Box display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSave}
                  style={{ marginRight: 8 }}
                >
                  Save
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </Button>
              </Box>
            ) : (
              <Box display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setEditing(true)}
                >
                  Edit
                </Button>
              </Box>
            )}
          </Box>
        </Card>

        {/* Statistics Section */}
        {/* Statistics Section */}
        <Card className={classes.card}>
          <Typography variant="h4" className={classes.sectionTitle}>Statistics</Typography>
          <Grid container spacing={2} className={classes.barChartContainer}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6">Request Status Distribution</Typography>
              <PieChart width={400} height={300}>
                <Pie
                  data={pieChartData}
                  cx={200}
                  cy={150}
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6">Request Count by Status</Typography>
              <BarChart
                width={400}
                height={300}
                data={pieChartData}
                margin={{
                  top: 5, right: 30, left: 20, bottom: 5,
                }}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#1976d2" />
              </BarChart>
            </Grid>
          </Grid>
        </Card>

        {/* Recent Requests Section */}
        <Card className={classes.card}>
          <Typography variant="h4" className={classes.sectionTitle}>Recent Requests</Typography>
          {requests.length > 0 ? (
            <Box>
              {requests.slice(0, 5).map(request => (
                <ListItem key={request.id} className={classes.cuteListItem}>
                  <Avatar alt={`Request ${request.requestId}`} src="/static/images/avatar/1.jpg" />
                  <ListItemText
                    primary={`Request ID: ${request.requestId}`}
                    secondary={
                      <Box className={classes.cuteListItemText}>
                        <Typography variant="body2"><strong>Start Date:</strong> {format(new Date(request.startDate), "dd-MM-yyyy")}</Typography>
                        <Typography variant="body2"><strong>End Date:</strong> {format(new Date(request.endDate), "dd-MM-yyyy")}</Typography>
                        <Typography variant="body2"><strong>Comment:</strong> {request.comment || "No comment"}</Typography>
                        <Typography variant="body2"><strong>Note:</strong> {request.note || "No notes"}</Typography>
                        <Typography variant="body2"><strong>Status:</strong> {Status[request.status]}</Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </Box>
          ) : (
            <Box className={classes.noRequestsBox}>
              <Typography>No requests found for this employee.</Typography>
            </Box>
          )}
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default DetailsEmp;
