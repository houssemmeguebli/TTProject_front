import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Grid,
  Container,
  Typography,
  Paper,
  TextField,
  FormControl,
  FormHelperText,
  CircularProgress, Card,
} from "@mui/material";
import { format } from 'date-fns';

import { useNavigate } from 'react-router-dom';
import RequestService from "../../_services/RequestService";
import AuthService from "../../_services/AuthService";
import DashboardLayout from "../../examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "../../examples/Navbars/DashboardNavbar";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import ProjectManagerService from "../../_services/ProjectManagerService";
import EmailService from "../../_services/EmailService";

const requestService = new RequestService();
const authService = new AuthService();
const bgImage = "https://raw.githubusercontent.com/creativetimofficial/public-assets/master/argon-dashboard-pro/assets/img/profile-layout-header.jpg";
const currentUser = authService.getCurrentUser();
const projectManagerService = new ProjectManagerService();
const AddRequestEmp = ({ onSubmit }) => {
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState({
    startDate: new Date(),
    endDate: new Date(),
    comment: '',
    employeeId: currentUser?.id || ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prevFormValues => ({
      ...prevFormValues,
      [name]: value
    }));
    validateForm({ ...formValues, [name]: value });
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prevFormValues => ({
      ...prevFormValues,
      [name]: true
    }));
    validateForm(formValues);
  };

  const handleDateChange = (name, date) => {
    setFormValues(prevValues => ({
      ...prevValues,
      [name]: date,
    }));
    setTouched(prevTouched => ({
      ...prevTouched,
      [name]: true,
    }));
    validateForm({ ...formValues, [name]: date });
  };

  const today = new Date().toISOString().split('T')[0];

  const disWeekends = (date) => date.getDay() !== 0 && date.getDay() !== 6;

  const validateDates = () => new Date(formValues.endDate) >= new Date(formValues.startDate);

  const validateComment = (comment) => comment.length >= 10 && comment.length <= 100;

  const validateForm = (values) => {
    const errors = {};
    if (!values.startDate) {
      errors.startDate = 'Start date is required';
    }
    if (!values.endDate) {
      errors.endDate = 'End date is required';
    } else if (new Date(values.endDate) < new Date(values.startDate)) {
      errors.endDate = 'End date must be after start date';
    }
    if (!validateComment(values.comment)) {
      errors.comment = 'Comment must be between 10 and 100 characters';
    }
    setErrors(errors);
    setIsFormValid(Object.keys(errors).length === 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    validateForm(formValues);
    if (!isFormValid) return;

    setLoading(true);

    try {
      await requestService.createRequest(formValues, 1);

      // Fetch the project managers
      const response = await projectManagerService.getAllUsers();
      console.log('Project Managers Response:', response);

      const projectManagers = response.$values || [];
      if (!Array.isArray(projectManagers)) {
        throw new Error("Project Managers data is not an array");
      }
      // Validate email addresses
      const validEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const managersEmails = projectManagers
        .map(pm => pm.email)
        .filter(email => validEmailRegex.test(email)); // Keep only valid emails
      console.log('Project Managers emails:', managersEmails);

      if (managersEmails.length === 0) {
        throw new Error("No valid email addresses found.");
      }

      const emailDetails = {
        emails: managersEmails,
        startDate: formValues.startDate.toISOString().split('T')[0],
        endDate: formValues.endDate.toISOString().split('T')[0],
        comment: formValues.comment,
        userName: currentUser?.name || 'Unknown User',
        userEmail: currentUser?.email || 'unknown@example.com'
      };

      await EmailService.sendRequestEmailForManager(emailDetails);

      Swal.fire({
        title: "Great!",
        text: "Your request has been submitted!",
        icon: "success"
      });

      setFormValues({
        startDate: new Date(),
        endDate: new Date(),
        comment: '',
        employeeId: currentUser?.id || ''
      });
      onSubmit();
      navigate('/RequestEmployee');
    } catch (error) {
      console.error('Error creating request:', error.response ? error.response.data : error.message);
      Swal.fire({
        title: "Error!",
        text: "There was a problem creating your request or in sending emails.",
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
      <Container maxWidth="md" sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", marginTop: '5%', marginBottom: '10%' }}>
        <Card elevation={3} sx={{ padding: 4, borderRadius: 3, width: "100%", maxWidth: 600 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: "bold", color: "primary.main", marginBottom: 2 }}>
            Create Request
          </Typography>
          <Typography variant="body1" gutterBottom align="center" sx={{ color: "text.secondary", marginBottom: 4 }}>
            Please fill out the form below to submit your request. Make sure to double-check the information before submitting.
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!(errors.startDate && touched.startDate)} sx={{ mb: 2 }}>
                  <Typography className="label" variant="subtitle1" sx={{ mb: 1 }}>Start Date</Typography>
                  <DatePicker
                    selected={formValues.startDate}
                    onChange={(date) => handleDateChange('startDate', date)}
                    dateFormat="dd-MM-yyyy"
                    minDate={new Date(today)}
                    filterDate={disWeekends}
                    customInput={
                      <TextField
                        name="startDate"
                        type="text"
                        fullWidth
                        required
                        InputLabelProps={{ shrink: true }}
                        value={formValues.startDate ? format(formValues.startDate, 'dd-MM-yyyy') : ''}
                        placeholder={!formValues.startDate ? 'Select date' : ''}
                        InputProps={{
                          readOnly: true
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
                    selected={formValues.endDate}
                    onChange={(date) => handleDateChange('endDate', date)}
                    dateFormat="dd-MM-yyyy"
                    minDate={formValues.startDate || new Date(today)}
                    filterDate={disWeekends}
                    customInput={
                      <TextField
                        name="endDate"
                        type="text"
                        value={formValues.endDate ? format(formValues.endDate, 'dd-MM-yyyy') : ''}
                        fullWidth
                        required
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          readOnly: true,
                          placeholder: "Select a date" // Adding the placeholder

                        }}
                      />
                    }
                  />
                  {errors.endDate && touched.endDate && <FormHelperText>{errors.endDate}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth error={!!(errors.comment && touched.comment)} sx={{ marginBottom: 2 }}>
                  <Typography className="label">Employee comment</Typography>
                  <TextField
                    id="comment"
                    name="comment"
                    value={formValues.comment}
                    fullWidth
                    required
                    multiline
                    rows={3}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    sx={{
                      marginTop: 1,
                      width: "100%",
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
                  {errors.comment && touched.comment && <FormHelperText>{errors.comment}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid item xs={12} sx={{ display: "flex", justifyContent: "center" }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={!isFormValid}
                  sx={{ minWidth: 200 }}
                  startIcon={loading && <CircularProgress size={24} />}
                >
                  {loading ? 'Submitting...' : 'Submit'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Card>
      </Container>
    </DashboardLayout>
  );
};

AddRequestEmp.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export default AddRequestEmp;
