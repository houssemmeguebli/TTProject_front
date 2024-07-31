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
  Box,
} from "@mui/material";
import { useNavigate } from 'react-router-dom';
import RequestService from "../../../_services/RequestService";
import EmployeeService from "../../../_services/EmployeeService";
import DashboardLayout from "../../../examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "../../../examples/Navbars/DashboardNavbar";
import Swal from "sweetalert2";

const requestService = new RequestService();
const employeeService = new EmployeeService();
const bgImage = "https://raw.githubusercontent.com/creativetimofficial/public-assets/master/argon-dashboard-pro/assets/img/profile-layout-header.jpg";

const Index = ({ onSubmit }) => {
  const [request, setRequest] = useState({
    startDate: '',
    endDate: '',
    comment: '',
    userId: '',
  });

  const [users, setUsers] = useState([]);
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [touched, setTouched] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await employeeService.getAllEmployees();
        if (response.$values) {
          setUsers(response.$values);
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
    setRequest(prevRequest => ({
      ...prevRequest,
      userId: value ? value.id : '',
    }));
    setTouched(prevTouched => ({
      ...prevTouched,
      userId: true,
    }));
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setRequest(prevRequest => ({
      ...prevRequest,
      [name]: value,
    }));
    setTouched(prevTouched => ({
      ...prevTouched,
      [name]: true,
    }));
  };

  const disableWeekends = (date) => {
    const day = new Date(date).getDay();
    return day === 0 || day === 6;
  };

  const validateDates = () => {
    const { startDate, endDate } = request;
    return new Date(endDate) >= new Date(startDate);
  };

  const validateComment = (comment) => {
    return comment.length >= 10 && comment.length <= 100;
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
    if (!validateComment(formValues.comment)) {
      errors.comment = 'Comment must be between 10 and 100 characters';
    }
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm(request)) {
      return;
    }
    try {
      await requestService.createRequest(request, 0);

      Swal.fire({
        title: "Success!",
        text: "Your request has been submitted successfully.",
        icon: "success"
      });

      setRequest({
        startDate: '',
        endDate: '',
        comment: '',
        userId: '',
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
      <Container maxWidth="md" sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", marginTop: '8%', marginBottom: '8%' }}>
        <Paper elevation={3} sx={{ padding: 4, borderRadius: 3, width: "100%", maxWidth: 800 }}>
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
                  <TextField
                    name="startDate"
                    type="date"
                    value={request.startDate}
                    onChange={handleDateChange}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      inputProps: { min: new Date().toISOString().split('T')[0], disabled: disableWeekends(request.startDate) },
                    }}
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
                  {errors.startDate && touched.startDate && <FormHelperText>{errors.startDate}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!(errors.endDate && touched.endDate)} sx={{ mb: 2 }}>
                  <Typography className="label" variant="subtitle1" sx={{ mb: 1 }}>End Date</Typography>
                  <TextField
                    name="endDate"
                    type="date"
                    value={request.endDate}
                    onChange={handleDateChange}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      inputProps: { min: request.startDate, disabled: disableWeekends(request.endDate) },
                    }}
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
                    }}                               />
                  {errors.endDate && touched.endDate && <FormHelperText>{errors.endDate}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth error={!!(errors.comment && touched.comment)} sx={{ mb: 2 }}>
                  <Typography className="label" variant="subtitle1" sx={{ mb: 1 }}>Comment</Typography>
                  <TextField
                    name="comment"
                    type="text"
                    value={request.comment}
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
                    }}                               />
                  {errors.comment && touched.comment && <FormHelperText>{errors.comment}</FormHelperText>}
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
                        }}                               />
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
                  disabled={!isFormValid}
                  sx={{ minWidth: 200 }}
                >
                  Submit
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </DashboardLayout>
  );
};

Index.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export default Index;
