import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Grid,
  Container,
  Typography,
  Paper,
  TextField,
  Autocomplete,
  FormControl,
  FormHelperText,
  Box, CircularProgress, Card,
} from "@mui/material";
import { useNavigate } from 'react-router-dom';
import RequestService from "../../../../_services/RequestService";
import EmployeeService from "../../../../_services/EmployeeService";
import DashboardLayout from "../../../../examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "../../../../examples/Navbars/DashboardNavbar";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import EmailService from "../../../../_services/EmailService";
import AuthService from "../../../../_services/AuthService";

const requestService = new RequestService();
const employeeService = new EmployeeService();
const authService=new AuthService();
const bgImage = "https://raw.githubusercontent.com/creativetimofficial/public-assets/master/argon-dashboard-pro/assets/img/profile-layout-header.jpg";
const currentUser =authService.getCurrentUser();
const Index = ({ onSubmit }) => {
  const [request, setRequest] = useState({
    startDate: new Date(),
    endDate: new Date(),
    comment:'',
    note:'',
    employeeId: '',
    projectManagerId:currentUser?.id || '',

  });

  const [users, setUsers] = useState([]);
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [touched, setTouched] = useState({});
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await employeeService.getAllEmployees();
        console.log("employees", response);
        //fetch only active users
        if (response.$values) {
          const activeUsers = response.$values.filter(user => user.userStatus === 1);
          setUsers(activeUsers);
        } else {
          console.error('Unexpected response structure:', response);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const validate = validateForm(request);
    setIsFormValid(validate);
  }, [request]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setRequest(prevRequest => ({
      ...prevRequest,
      [name]: type === 'checkbox' ? e.target.checked : value,
    }));
    setTouched(prevTouched => ({
      ...prevTouched,
      [name]: true,
    }));
  };

  const handleUserChange = (event, value) => {
    const selectedUserId = value ? value.id : '';

    setRequest(prevRequest => ({
      ...prevRequest,
      employeeId: selectedUserId,
    }));
    setTouched(prevTouched => ({
      ...prevTouched,
      employeeId: true,
    }));

    console.log('Selected user ID:', selectedUserId);
  };


  const handleDateChange = (name, date) => {
    setRequest(prevRequest => ({
      ...prevRequest,
      [name]: date,
    }));
    setTouched(prevTouched => ({
      ...prevTouched,
      [name]: true,
    }));
  };

  const today = new Date().toISOString().split('T')[0];

  const disWeekends = (current) => {
    return current.getDay() !== 0 && current.getDay() !== 6;
  };

  const validateDates = () => {
    const { startDate, endDate } = request;
    return new Date(endDate) >= new Date(startDate);
  };

  const validateNote = (note) => {
    return note.length >= 10 && note.length <= 100;
  };

  const validateForm = (formValues) => {
    const errors = {};
    if (!formValues.startDate) {
      errors.startDate = 'Start date is required';
    }
    if (!formValues.endDate) {
      errors.endDate = 'End date is required';
    } else if (!validateDates()) {
      errors.endDate = 'End date must be after start date';
    }
    if (!validateNote(formValues.note)) {
      errors.note = 'note must be between 10 and 100 characters';
    }
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm(request)) {
      return;
    }
    setLoading(true);
    try {
      await requestService.createRequest(request, 0);

      const selectedUser = users.find(user => user.id === request.employeeId);
      const userEmail = selectedUser ? selectedUser.email : '';
      const userName= selectedUser? selectedUser.firstName:'';
      console.log("email", userEmail);

      await EmailService.sendRequestEmail(userEmail, {
        userName: userName,
        startDate: request.startDate,
        endDate: request.endDate,
        note: request.note,
      });

      Swal.fire({
        title: "Success!",
        text: "Your request has been submitted and an email has been sent to the selected employee.",
        icon: "success"
      });
      setRequest({
        startDate: new Date(),
        endDate: new Date(),
        comment:'',
        note: '',
        employeeId: '',
        projectManagerId: currentUser?.id || '',
      });

      onSubmit();
      navigate('/Requests');
    } catch (error) {
      console.error('Error creating request:', error.response ? error.response.data : error.message);
      Swal.fire({
        title: "Error!",
        text: "There was a problem submitting your request.",
        icon: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout
      sx={{
        backgroundImage: ({ functions: { rgba, linearGradient }, palette: { gradients } }) =>
          `${linearGradient(
            rgba(gradients.info.main, 0.6),
            rgba(gradients.info.state, 0.6),
          )}, url(${bgImage})`,
        backgroundPositionY: "50%",
      }}
    >
      <DashboardNavbar />
      <Container sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", marginTop: '8%', marginBottom: '8%' }}>
        <Card elevation={1} sx={{ padding: 4, borderRadius: 3, width: "100%", maxWidth: 800, maxHeight: "100%" }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: "bold", color: "text.primary", marginBottom: 3 }}>
            Create Request
          </Typography>
          <Typography variant="subtitle1" gutterBottom align="center" sx={{ marginBottom: 3 }}>
            Please fill out the form below to submit your request. Make sure to provide all required information and check the dates carefully.
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!(errors.startDate && touched.startDate)} sx={{ mb: 2 }}>
                  <Typography className="label" variant="subtitle1" sx={{ mb: 1 }}>Start Date</Typography>
                  <DatePicker
                    selected={request.startDate}
                    onChange={(date) => handleDateChange('startDate', date)}
                    dateFormat="dd-MM-yyyy"
                    minDate={new Date(today)}
                    filterDate={disWeekends}
                    customInput={
                      <TextField
                        name="startDate"
                        type="text"
                        value={request.startDate ? request.startDate.toISOString().split('T')[0] : ''}
                        fullWidth
                        required
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          readOnly: true // prevents manual input
                        }}
                      />
                    }
                  />
                  {errors.startDate && touched.startDate && <FormHelperText>{errors.startDate}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!(errors.endDate && touched.endDate)} sx={{ mb: 2 }}>
                  <Typography className="label" variant="subtitle1" sx={{ mb: 1 }}>End Date</Typography>
                  <DatePicker
                    selected={request.endDate}
                    onChange={(date) => handleDateChange('endDate', date)}
                    dateFormat="dd-MM-yyyy"
                    minDate={request.startDate || new Date(today)}
                    filterDate={disWeekends}
                    customInput={
                      <TextField
                        name="endDate"
                        type="text"
                        value={request.endDate ? request.endDate.toISOString().split('T')[0] : ''}
                        fullWidth
                        required
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          readOnly: true // prevents manual input
                        }}
                      />
                    }
                  />
                  {errors.endDate && touched.endDate && <FormHelperText>{errors.endDate}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth error={!!(errors.note && touched.note)} sx={{ mb: 2 }}>
                  <Typography className="label" variant="subtitle1" sx={{ mb: 1 }}>Manager note</Typography>
                  <TextField
                    name="note"
                    type="text"
                    value={request.note}
                    onChange={handleChange}
                    fullWidth
                    required
                    multiline
                    rows={4}
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
                  {errors.note && touched.note && <FormHelperText>{errors.note}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth error={!!(errors.userId && touched.userId)} sx={{ mb: 2 }}>
                  <Typography className="label" variant="subtitle1" sx={{ mb: 1 }}>Employee</Typography>
                  <Autocomplete
                    options={users}
                    getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                    onChange={handleUserChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        name="userId"
                        label="Select Employee"
                        required
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
                    )}
                  />
                  {errors.userId && touched.userId && <FormHelperText>{errors.userId}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ minWidth: 150 }}
                  disabled={loading ||!isFormValid}
                >
                  {loading ? <CircularProgress size={24} /> : 'Submit'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Card>
      </Container>
    </DashboardLayout>
  );
};

Index.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export default Index;
