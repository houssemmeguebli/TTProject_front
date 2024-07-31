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
  CircularProgress,
  Box
} from "@mui/material";
import { useNavigate } from 'react-router-dom';
import RequestService from "../../../_services/RequestService";
import AuthService from "../../../_services/AuthService";
import DashboardLayout from "../../../examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "../../../examples/Navbars/DashboardNavbar";
import Swal from "sweetalert2";

const requestService = new RequestService();
const authService = new AuthService();
const bgImage = "https://raw.githubusercontent.com/creativetimofficial/public-assets/master/argon-dashboard-pro/assets/img/profile-layout-header.jpg";
const currentUser = authService.getCurrentUser();

const AddRequestEmp = ({ onSubmit }) => {
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState({
    startDate: '',
    endDate: '',
    comment: '',
    userId: currentUser?.id || '' // Ensure userId is handled properly
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prevValues => ({
      ...prevValues,
      [name]: value
    }));
    validateForm();
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prevTouched => ({
      ...prevTouched,
      [name]: true
    }));
    validateForm();
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formValues.startDate) newErrors.startDate = 'Start date is required';
    if (!formValues.endDate) newErrors.endDate = 'End date is required';
    if (formValues.startDate && formValues.endDate && formValues.startDate > formValues.endDate) {
      newErrors.endDate = 'End date cannot be before start date';
    }
    if (!validateComment(formValues.comment)) newErrors.comment = 'Comment must be between 10 and 100 characters';
    setErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0);
  };

  const validateComment = (comment) => {
    return comment.length >= 10 && comment.length <= 100;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    validateForm();
    if (!isFormValid) return;

    setLoading(true);

    try {
      await requestService.createRequest(formValues, 1);
      Swal.fire({
        title: "Great!",
        text: "Your request has been submitted!",
        icon: "success"
      });
      setFormValues({
        startDate: '',
        endDate: '',
        comment: '',
        userId: currentUser?.id || '' // Reset userId
      });
      onSubmit();
      navigate('/RequestEmployee');
    } catch (error) {
      console.error('Error creating request:', error.response ? error.response.data : error.message);
      Swal.fire({
        title: "Error!",
        text: "There was a problem creating your request.",
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
      <Container maxWidth="md" sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", marginTop: '10%', marginBottom: '10%' }}>
        <Paper elevation={3} sx={{ padding: 4, borderRadius: 3, width: "100%", maxWidth: 600 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: "bold", color: "primary.main", marginBottom: 2 }}>
            Create Request
          </Typography>
          <Typography variant="body1" gutterBottom align="center" sx={{ color: "text.secondary", marginBottom: 4 }}>
            Please fill out the form below to submit your request. Make sure to double-check the information before submitting.
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!(errors.startDate && touched.startDate)} sx={{ marginBottom: 2 }}>
                  <Typography className="label">Start Date</Typography>
                  <TextField
                    id="startDate"
                    name="startDate"
                    type="date"
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    value={formValues.startDate}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    InputProps={{
                      inputProps: { min: new Date().toISOString().split('T')[0] },
                    }}
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
                  {errors.startDate && touched.startDate && <FormHelperText>{errors.startDate}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!(errors.endDate && touched.endDate)} sx={{ marginBottom: 2 }}>
                  <Typography className="label">End Date</Typography>
                  <TextField
                    id="endDate"
                    name="endDate"
                    type="date"
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    value={formValues.endDate}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    InputProps={{
                      inputProps: { min: formValues.startDate || new Date().toISOString().split('T')[0] },
                    }}
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
                  {errors.endDate && touched.endDate && <FormHelperText>{errors.endDate}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth error={!!(errors.comment && touched.comment)} sx={{ marginBottom: 2 }}>
                  <Typography className="label">Comment</Typography>

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
                  disabled={!isFormValid || loading}
                  sx={{ minWidth: 200 }}
                  startIcon={loading && <CircularProgress size={24} />}
                >
                  {loading ? 'Submitting...' : 'Submit'}
                </Button>
              </Grid>
            </Grid>
          </form>
          <Box sx={{ padding: 2, borderRadius: 1, marginBottom: 4, marginTop: '4%' }}>
            <Typography variant="h6" component="h2" gutterBottom align="center" sx={{ fontWeight: "bold" }}>
              Tips & Advice
            </Typography>
            <Typography variant="body2" gutterBottom align="center" sx={{ color: "text.secondary" }}>
              - Ensure the start and end dates are accurate.
              <br />
              - Provide a detailed comment explaining the reason for your request.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </DashboardLayout>
  );
};

AddRequestEmp.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export default AddRequestEmp;
