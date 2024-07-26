import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Grid,
  Container,
  Typography,
  Paper,
  IconButton,
  TextField,
  Autocomplete,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { DateRange, Note } from "@mui/icons-material";
import { useNavigate } from 'react-router-dom';
import RequestService from "../../../_services/RequestService";
import UserService from "../../../_services/ProjectManagerService";
import DashboardLayout from "../../../examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "../../../examples/Navbars/DashboardNavbar";
import Swal from "sweetalert2";
import EmployeeService from "../../../_services/EmployeeService";
import AuthService from "../../../_services/AuthService";

const requestService = new RequestService();
const employeeService = new EmployeeService();
const authService = new AuthService();
const bgImage = "https://raw.githubusercontent.com/creativetimofficial/public-assets/master/argon-dashboard-pro/assets/img/profile-layout-header.jpg";
const currentUser = authService.getCurrentUser();

const AddRequestEmp = ({ onSubmit }) => {
  const [request, setRequest] = useState({
    startDate: '',
    endDate: '',
    comment: '',
    userId: currentUser.id,
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRequest(prevRequest => ({
      ...prevRequest,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };


  const userRole=1;
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting request:', request);
      await requestService.createRequest(request,userRole);

      // Show success message
      Swal.fire({
        title: "Great!",
        text: "Your request has been submitted!",
        icon: "success"
      });

      // Reset the form
      setRequest({
        startDate: '',
        endDate: '',
        comment: '',
        userId: currentUser.id,

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
      <Container maxWidth="md" sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "70vh", marginTop: '15%', marginBottom: '15%' }}>
        <Paper elevation={3} sx={{ padding: 4, borderRadius: 3, width: "100%", maxWidth: 600 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: "bold", color: "text.primary" }}>
            Create Request
          </Typography>
          <form onSubmit={handleSubmit} >
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <div>
                  <Typography className="label">Start Date</Typography>
                  <TextField
                    name="startDate"
                    type="date"
                    value={request.startDate}
                    onChange={handleChange}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    className="textField"
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

                </div>
              </Grid>
              <Grid item xs={12} sm={6}>
                <div>
                  <Typography className="label">End Date</Typography>
                  <TextField
                    name="endDate"
                    type="date"
                    value={request.endDate}
                    onChange={handleChange}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    className="textField"
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

                </div>
              </Grid>
              <Grid item xs={12}>
                <div>
                  <Typography className="label">Comment</Typography>
                  <TextField
                    name="comment"
                    value={request.comment}
                    onChange={handleChange}
                    fullWidth
                    required
                    multiline
                    rows={2}

                    className="textField"
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

                </div>
              </Grid>
              <Grid item xs={12} sx={{ display: "flex", justifyContent: "center" }}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  sx={{
                    borderRadius: 2,
                    padding: "10px 20px",
                    fontWeight: "bold",
                    textTransform: "none",
                    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
                    "&:hover": {
                      backgroundColor: "#0056b3",
                      boxShadow: "0px 6px 24px rgba(0, 0, 0, 0.15)",
                      color: "white",
                    },
                    width: "50%",
                  }}
                >
                  Submit
                </Button>
              </Grid>
            </Grid>
          </form>
          <div style={{
            marginTop: "24px",
            backgroundColor: "#f5f5f5",
            padding: "16px",
            borderRadius: "8px",
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
          }}>
            <Typography variant="h6">Important Notes:</Typography>
            <Typography variant="body2">
              - If approved, the employee will be notified automatically.
              <br />
              - Ensure all dates are correctly set before submitting.
            </Typography>
          </div>
          <div style={{
            marginTop: "24px",
            backgroundColor: "#e7f3ff",
            padding: "16px",
            borderRadius: "8px",
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
          }}>
            <Typography variant="h6">Submission Guidelines:</Typography>
            <Typography variant="body2">
              - Double-check the selected employees name.
              <br />
              - Add any relevant comments to provide context.
            </Typography>
          </div>
          <div style={{
            marginTop: "24px",
            backgroundColor: "#fff3cd",
            padding: "16px",
            borderRadius: "8px",
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
          }}>
            <Typography variant="h6">Feedback Section:</Typography>
            <Typography variant="body2">
              - If you encounter issues, please reach out to HR.
              <br />
              - Your feedback is valuable for improving the process.
            </Typography>
          </div>
        </Paper>
      </Container>

    </DashboardLayout>
  );
};

AddRequestEmp.propTypes = {
  onSubmit: PropTypes.func.isRequired
};

export default AddRequestEmp;
