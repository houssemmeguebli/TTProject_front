import React, { useEffect, useState } from "react";
import {
  TextField,
  Grid,
  Card,
  Box,
  FormControl,
  FormHelperText,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Button,
  FormLabel, CircularProgress,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import Swal from "sweetalert2";
import AuthService from "../../../_services/AuthService";
import EmailService from "../../../_services/EmailService";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";

const bgImage = "https://raw.githubusercontent.com/creativetimofficial/public-assets/master/argon-dashboard-pro/assets/img/profile-layout-header.jpg";
const authService = new AuthService();

function Cover() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    role: "", // Role should be a number
    projectName: "",
    position: "",
    Gender: "", // Gender should be a number
    dateOfbirth: "" // Fixed spelling
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const roles = [
    { value: 0, label: "Project Manager" },
    { value: 1, label: "Employee" },
  ];

  useEffect(() => {
    setIsFormValid(validateForm(formData));
  }, [formData]);

  const validateField = (name, value) => {
    let error = "";
    if (name === "firstName" || name === "lastName" || name === "department") {
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
    } else if (name === "phone") {
      const phoneRegex = /^\d{8}$/;
      if (!value) {
        error = "Phone is required";
      } else if (!phoneRegex.test(value)) {
        error = "Phone number must be 8 digits";
      }
    } else if (name === "Gender") {
      if (value !== "0" && value !== "1") {
        error = "Invalid Gender value";
      }
    } else if (name === "dateOfbirth") {
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
    if (formValues.role === 0 && !formValues.projectName) {
      errors.projectName = "Project Name is required for Project Manager";
    }
    if (formValues.role === 1 && !formValues.position) {
      errors.position = "Position is required for Employee";
    }
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (event) => {
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

  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched((prevTouched) => ({
      ...prevTouched,
      [name]: true,
    }));
  };

  const handleRoleChange = (event, value) => {
    const newRole = value ? value.value : "";
    setFormData((prevData) => ({
      ...prevData,
      role: newRole,
      projectName: newRole === 0 ? prevData.projectName : "",
      position: newRole === 1 ? prevData.position : ""
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      role: newRole ? "" : "Role is required",
      projectName: newRole === 0 ? "" : prevErrors.projectName,
      position: newRole === 1 ? "" : prevErrors.position,
    }));
    setTouched((prevTouched) => ({
      ...prevTouched,
      role: true,
    }));
  };

  const generatePassword = (firstName) => {
    const currentYear = new Date().getFullYear();
    const capitalizedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
    return `TT${currentYear}@${capitalizedFirstName}`;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm(formData)) return;

    const password = generatePassword(formData.firstName);

    // Explicitly convert Gender and role to number
    const user = {
      ...formData,
      password,
      Gender: Number(formData.Gender),
      role: Number(formData.role),
    };

    setLoading(true);

    try {
      await authService.register(user);
      await EmailService.sendEmail(user.email, user.firstName, user.password);
      Swal.fire("Success!", "User registered successfully and email sent!", "success");
      navigate('/EmployeeProfiles');
    } catch (error) {
      console.error("Error creating user:", error);

      let errorMessage = "Error registering user or sending email.";
      if (error.response && error.response.data && Array.isArray(error.response.data.$values)) {
        // Extract and format the error messages
        const errorDetails = error.response.data.$values.map(e => e.description).join('<br />');
        errorMessage = errorDetails;
      }

      Swal.fire("Error!", errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

    return (
      <DashboardLayout
        sx={{
          backgroundImage: ({ functions: { rgba, linearGradient }, palette: { gradients } }) =>
            `${linearGradient(
              rgba(gradients.info.main, 0.6),
              rgba(gradients.info.state, 0.6)
            )}, url(${bgImage})`,
          backgroundPositionY: "50%",
        }}
      >
        <DashboardNavbar />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh" marginTop="7%">
          <Card sx={{ width: '80%', maxWidth: 800, p: 3 }}>
            <Typography variant="h4" fontWeight="medium" textAlign="center" mb={2}>
              Add New Employee
            </Typography>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors.firstName && touched.firstName} sx={{ mb: 2 }}>
                    <TextField
                      name="firstName"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      fullWidth
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
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors.lastName && touched.lastName} sx={{ mb: 2 }}>
                    <TextField
                      name="lastName"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      fullWidth
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
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors.email && touched.email} sx={{ mb: 2 }}>
                    <TextField
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      fullWidth
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
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors.phone && touched.phone} sx={{ mb: 2 }}>
                    <TextField
                      name="phone"
                      placeholder="Phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      fullWidth
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
                    {errors.phone && touched.phone && <FormHelperText>{errors.phone}</FormHelperText>}
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors.role && touched.role} sx={{ mb: 2 }}>
                    <Autocomplete
                      options={roles}
                      getOptionLabel={(option) => option.label}
                      renderInput={(params) => (
                        <TextField {...params} label="Role" variant="outlined" />
                      )}
                      onChange={handleRoleChange}
                      onBlur={handleBlur}
                      value={roles.find((role) => role.value === formData.role) || null}
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
                    {errors.role && touched.role && <FormHelperText>{errors.role}</FormHelperText>}
                  </FormControl>
                </Grid>
                {formData.role === 0 && (
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth error={!!errors.projectName && touched.projectName} sx={{ mb: 2 }}>
                      <TextField
                        name="projectName"
                        placeholder="Project Name"
                        value={formData.projectName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        fullWidth
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
                      {errors.projectName && touched.projectName &&
                        <FormHelperText>{errors.projectName}</FormHelperText>}
                    </FormControl>
                  </Grid>
                )}
                {formData.role === 1 && (
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth error={!!errors.position && touched.position} sx={{ mb: 2 }}>
                      <TextField
                        name="position"
                        placeholder="Position"
                        value={formData.position}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        fullWidth
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
                )}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors.department && touched.department} sx={{ mb: 2 }}>
                    <TextField
                      name="department"
                      placeholder="Department"
                      value={formData.department}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      fullWidth
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
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors.Gender && touched.Gender} sx={{ mb: 2 }}>
                    <FormLabel component="legend">Gender</FormLabel>
                    <RadioGroup
                      name="Gender"
                      value={formData.Gender}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      sx={{
                        display: 'flex',
                        flexDirection: 'row', // Align items in a row
                        gap: 2, // Add space between the radio buttons
                      }}
                    >
                      <FormControlLabel value="0" control={<Radio />} label="Male" />
                      <FormControlLabel value="1" control={<Radio />} label="Female" />
                    </RadioGroup>
                    {errors.Gender && touched.Gender && <FormHelperText>{errors.Gender}</FormHelperText>}
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth error={!!errors.dateOfbirth && touched.dateOfbirth} sx={{ mb: 2 }}>
                    <TextField
                      type="date"
                      name="dateOfbirth"
                      placeholder="Date of Birth"
                      value={formData.dateOfbirth}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      fullWidth
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
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ max: today }} // Restrict selectable date to today and before
                    />
                    {errors.dateOfbirth && touched.dateOfbirth && <FormHelperText>{errors.dateOfbirth}</FormHelperText>}
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={!isFormValid}
                    fullWidth


                  >
                    {loading ? <CircularProgress size={24} /> : 'Submit'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Card>
        </Box>
      </DashboardLayout>
    );
  }
export default Cover;
