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
  Select, FormHelperText, FormControl,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Link, useNavigate, useParams } from "react-router-dom";
import DashboardNavbar from "../../../examples/Navbars/DashboardNavbar";
import DashboardLayout from "../../../examples/LayoutContainers/DashboardLayout";
import EmployeeService from "../../../_services/EmployeeService";
import AuthService from "../../../_services/AuthService";
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
  const [error, setError] = useState();
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const navigate = useNavigate();
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
  const today = new Date().toISOString().split('T')[0];
  const validateField = (name, value) => {
    let error = "";
    if (name === "firstName" || name === "lastName" || name === "department" || name === "position") {
      if (!value) {
        error = `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
      } else if (value.length > 30) {
        error = `${name.charAt(0).toUpperCase() + name.slice(1)} must be under 30 characters`;
      }
    } else if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) {
        error = "Email is required";
      } else if (!emailRegex.test(value)) {
        error = "Invalid email format";
      }
    } else if (name === "phoneNumber") {
      const phoneNumberRegex = /^\d{8}$/;
      if (!value) {
        error = "Phone is required";
      } else if (!phoneNumberRegex.test(value)) {
        error = "Phone number must be 8 digits";
      }
    }  else if (name === "dateOfbirth") {
      if (!value) {
        error = "Date of Birth is required";
      }
    }
    return error;
  };

  const validateForm = (formValues) => {
    const errors = {};
    for (const [key, value] of Object.entries(formValues)) {
      if (key !== "role") {
        const error = validateField(key, value);
        if (error) errors[key] = error;
      }
    }
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    setIsFormValid(validateForm(formData));
  }, [formData]);

  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched((prevTouched) => ({
      ...prevTouched,
      [name]: true,
    }));
  };

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        const userid = currentUser.id;
        console.log("role connected : ",currentUser.role)
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
  const currentUser = authService.getCurrentUser();
  const userid = currentUser ? currentUser.id : null;

// Block User to see other profiles unless they are a Project Manager
  useEffect(() => {
    console.log('userid:', userid);
    console.log('id from URL:', employeeId);

    if (currentUser && userid && employeeId) { // Ensure all are defined
      if (currentUser.role !== "ProjectManager") {
        // If the user is not a Project Manager and is trying to access a different profile
        if (parseInt(userid) !== parseInt(employeeId)) {
          console.log('Unauthorized access detected.');
          navigate("/unauthorized"); // Redirect to unauthorized page
        }
      }
    }
  }, [employeeId, userid, currentUser, navigate]);


  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: validateField(name, value),
    }));
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

  const statusColors = {
    'Approved': '#4caf50', // Green
    'Rejected': '#f44336', // Red
    'Pending': '#ff9800',  // Orange
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

  if (error) return <Box color="error"  sx={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100vw' ,
    color:"red"
  }}>{error}</Box>;

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
          <Box
            className={classes.profileHeader}
            display="flex"
            flexDirection={{ xs: 'column', md: 'row' }}
            alignItems={{ xs: 'center', md: 'flex-start' }}
            justifyContent={{ xs: 'center', md: 'flex-start' }}
            p={2} // Padding around the content
          >
            <Avatar
              src={employee?.profilePicture || '/path/to/default/avatar.jpg'}
              className={classes.profileAvatar}
              sx={{
                width: { xs: 50, md: 70 },
                height: { xs: 50, md: 70 },
                mb: { xs: 2, md: 0 },
                mr: { md: 2 }
              }}
            />
            <Box
              className={classes.profileInfo}
              textAlign={{ xs: 'center', md: 'left' }}
              width={{ xs: '100%', md: 'auto' }}
            >
              <Typography variant="h4" fontSize={{ xs: '1.5rem', md: '2rem' }}>

                {`${employee?.firstName} ${employee?.lastName}`}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {employee?.email}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {employee?.phoneNumber}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Role:</strong> {role[employee?.role]}
              </Typography>
            </Box>

          </Box>

          <Divider />
          <Typography variant="h4" sx={{ marginBottom: 3, fontWeight: 'bold' }}>
            Edit Profile Information
          </Typography>
          <Grid container spacing={2}>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.firstName && touched.firstName} sx={{ mb: 2 }}>
              <TextField
                label="First Name"
                name="firstName"
                variant="outlined"
                fullWidth
                value={formData.firstName}
                onChange={handleInputChange}
                onBlur={handleBlur}
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
                {errors.firstName && touched.firstName && <FormHelperText>{errors.firstName}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.lastName && touched.lastName} sx={{ mb: 2 }}>
              <TextField
                label="Last Name"
                name="lastName"
                variant="outlined"
                fullWidth
                value={formData.lastName}
                onChange={handleInputChange}
                onBlur={handleBlur}
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
                {errors.lastName && touched.lastName && <FormHelperText>{errors.lastName}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.dateOfbirth && touched.dateOfbirth} sx={{ mb: 2 }}>
              <TextField
                label="Date of Birth"
                name="dateOfBirth"
                variant="outlined"
                fullWidth
                value={format(new Date(formData.dateOfbirth),  "yyyy-MM-dd")}
                onChange={handleInputChange}
                onBlur={handleBlur}
                disabled={!editing}
                maxDate={new Date(today)}
                className={classes.formControl}
                InputLabelProps={{ shrink: true }}
                type="date"
                inputProps={{ max: today }}
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
                {errors.dateOfbirth && touched.dateOfbirth && <FormHelperText>{errors.dateOfbirth}</FormHelperText>}
              </FormControl>
            </Grid>
            {connectedUser.role === "ProjectManager" && (
              <>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!errors.phoneNumber && touched.phoneNumber} sx={{ mb: 2 }}>
                  <TextField
                    label="Phone Number"
                    name="phoneNumber"
                    variant="outlined"
                    fullWidth
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
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
                    {errors.phoneNumber && touched.phoneNumber && <FormHelperText>{errors.phoneNumber}</FormHelperText>}
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!errors.email && touched.email} sx={{ mb: 2 }}>
                  <TextField
                    label="Email"
                    name="email"
                    variant="outlined"
                    fullWidth
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={handleBlur}

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
                  {errors.email && touched.email && <FormHelperText>{errors.email}</FormHelperText>}
                </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!errors.department && touched.department} sx={{ mb: 2 }}>
                  <TextField
                label="Department"
                name="department"
                variant="outlined"
                fullWidth
                value={formData.department}
                onChange={handleInputChange}
                onBlur={handleBlur}
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
                    {errors.department && touched.department && <FormHelperText>{errors.department}</FormHelperText>}
                  </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.position && touched.position} sx={{ mb: 2 }}>
              <TextField
                label="Position"
                name="position"
                variant="outlined"
                fullWidth
                value={formData.position}
                onChange={handleInputChange}
                onBlur={handleBlur}
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
              {errors.position && touched.position && <FormHelperText>{errors.position}</FormHelperText>}
            </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.role && touched.role} sx={{ mb: 2 }}>
              <Select
                label="Role"
                name="role"
                value={formData.role}
                onChange={handleRoleChange}
                disabled={!editing}
                onBlur={handleBlur}

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
                {errors.role && touched.role && <FormHelperText>{errors.role}</FormHelperText>}
              </FormControl>
            </Grid>
              </>
            )}
          </Grid>

          <Box mt={2}>
            {editing ? (
              <Box display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  color="white"
                  disabled={!isFormValid}

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
              <Box display="flex" justifyContent="flex-end" gap={2}>
                {connectedUser.role === "Employee" && (
                  <Button
                    component={Link}
                    to={`/change-Employeepassword/${employee.id}`}
                    variant="contained"
                    color="white"
                    sx={{
                      textTransform: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                    }}
                  >
                    Change Password
                  </Button>
                )}
                <Button
                  variant="contained"
                  color="white"
                  onClick={() => setEditing(true)}
                >
                  Edit
                </Button>
              </Box>

            )}

          </Box>
        </Card>

        {/* Statistics Section */}
        <Card className={classes.card}>
          <Typography variant="h4" sx={{ marginBottom: 3, fontWeight: 'bold' }}>
            Statistics
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ marginBottom: 2, fontWeight: 'bold' }}>
                Request Status Distribution
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <PieChart width={Math.min(400, window.innerWidth * 0.9)} height={300}>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius="80%"
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ marginBottom: 2, fontWeight: 'bold' }}>
                Request Count by Status
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <BarChart
                  width={Math.min(400, window.innerWidth * 0.9)}
                  height={300}
                  data={pieChartData}
                  margin={{
                    top: 20, right: 30, left: 20, bottom: 10,
                  }}
                >
                  <XAxis dataKey="name" />
                  <YAxis
                    tickFormatter={(value) => `${value}`} // Convert value to string to avoid commas
                  />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0088FE" barSize={40} />
                </BarChart>

              </Box>
            </Grid>
          </Grid>
        </Card>
        {/* Recent Requests Section */}
        <Card
          className={classes.card}
          sx={{
            p: { xs: 2, sm: 3 },
            boxShadow: 2,
            borderRadius: '16px',
            borderColor: '#1976d2',

          }}
        >
          <Typography variant="h4" sx={{ marginBottom: 3, fontWeight: 'bold' }}>
            Recent Requests
          </Typography>
          {requests.length > 0 ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(1, 1fr)',
                  md: 'repeat(2, 1fr)',
                  lg: 'repeat(4, 1fr)',
                },
                gap: 3,
                width: '100%',
              }}
            >
              {requests.map((request) => (
                <ListItem
                  key={request.id}
                  className={classes.cuteListItem}
                  sx={{
                    p: 3,
                    border: '2px solid #ddd', // Bold border for more contrast
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    background: 'white', // White background for the cards
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                    '&:hover': {
                      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)', // Larger shadow on hover
                      transform: 'scale(1.05)', // Subtle scale on hover
                      backgroundColor: '#e3f2fd', // Changes background color on hover
                    },
                  }}
                >
                  <Avatar
                    alt={`Request ${request.requestId}`}
                    sx={{
                      width: { xs: 70, sm: 80, md: 90 },
                      height: { xs: 70, sm: 80, md: 90 },
                      mb: 2,
                      border: '3px solid',
                      borderColor: '#1976d2',
                    }}
                  />
                  <ListItemText
                    primary={
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 'bold',
                          color: '#1976d2',
                        }}
                      >
                        Request ID: {request.requestId}
                      </Typography>
                    }
                    secondary={
                      <Box
                        className={classes.cuteListItemText}
                        sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}
                      >
                        <Typography variant="body2">
                          <strong style={{ color: '#1976d2' }}>Start Date:</strong> {format(new Date(request.startDate), 'dd-MM-yyyy')}
                        </Typography>
                        <Typography variant="body2">
                          <strong  style={{ color: '#1976d2' }}>End Date:</strong> {format(new Date(request.endDate), 'dd-MM-yyyy')}
                        </Typography>
                        <Typography variant="body2">
                          <strong  style={{ color: '#1976d2' }}>Employee comment:</strong> {request.comment || 'No comment'}
                        </Typography>
                        <Typography variant="body2">
                          <strong  style={{ color: '#1976d2' }}>Manager note:</strong> {request.note || 'No notes'}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}> {/* Red color for status */}
                          <strong style={{ color: '#1976d2' }}>Status:</strong> {Status[request.status]}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </Box>
          ) : (
            <Box
              className={classes.noRequestsBox}
              sx={{
                textAlign: 'center',
                p: 3,
                borderRadius: '12px',
                border: '1px solid #ddd',
                backgroundColor: 'rgba(255, 235, 238, 0.7)', // Soft pink transparent background
                color: '#d32f2f', // Red text color for the empty state
              }}
            >
              <Typography variant="body1">No requests found for this employee.</Typography>
            </Box>
          )}
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default DetailsEmp;
