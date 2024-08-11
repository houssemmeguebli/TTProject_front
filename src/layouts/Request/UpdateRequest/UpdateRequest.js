import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Container,
  Paper,
  Typography,
  MenuItem,
  Select,
  FormControl,
  CircularProgress,
  FormHelperText,
  Card,
} from "@mui/material";
import { makeStyles } from '@mui/styles';
import RequestService from '../../../_services/RequestService';
import DashboardLayout from '../../../examples/LayoutContainers/DashboardLayout';
import DashboardNavbar from '../../../examples/Navbars/DashboardNavbar';
import Swal from "sweetalert2";
import EmployeeService from "../../../_services/EmployeeService";
import EmailService from "../../../_services/EmailService";
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';

const requestService = new RequestService();
const employeeService = new EmployeeService();
const bgImage =
  'https://raw.githubusercontent.com/creativetimofficial/public-assets/master/argon-dashboard-pro/assets/img/profile-layout-header.jpg';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
  paper: {
    padding: theme.spacing(4),
    maxWidth: 600,
    width: '100%',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    borderRadius: '12px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
  },
  label: {
    fontWeight: 'bold',
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(1),
  },
  textField: {
    width: "100%",
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: theme.palette.primary.main,
      },
      '&:hover fieldset': {
        borderColor: theme.palette.primary.dark,
      },
      '&.Mui-focused fieldset': {
        borderColor: theme.palette.primary.dark,
      },
    },
  },
  button: {
    alignSelf: 'flex-end',
    padding: theme.spacing(1.5),
    borderRadius: '8px',
    backgroundColor: theme.palette.primary.main,
    color: '#fff',
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: theme.spacing(2),
    color: theme.palette.text.primary,
  },
}));

const UpdateRequest = () => {
  const classes = useStyles();
  const { requestId } = useParams();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [isNoteRequired, setIsNoteRequired] = useState(false);

  const [request, setRequest] = useState({
    status: '',
    startDate: new Date(),
    endDate: new Date(),
    note: '',
  });
  const today = new Date().toISOString().split('T')[0];

  const [originalRequest, setOriginalRequest] = useState({});
  const [employee, setEmployee] = useState(null);

  const statuses = [
    { value: 1, label: 'Approved' },
    { value: 3, label: 'Rejected' },
  ];

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const response = await requestService.getRequestById(requestId);
        setRequest({
          ...response,
          startDate: new Date(response.startDate),
          endDate: new Date(response.endDate),
          note: response.note || '',
        });
        setOriginalRequest({
          ...response,
          startDate: new Date(response.startDate),
          endDate: new Date(response.endDate),
        });
        const employeeData = await employeeService.getEmployeeById(response.userId);
        setEmployee(employeeData);
      } catch (error) {
        console.error('Error fetching request:', error);
      }
    };

    if (requestId) {
      fetchRequest();
    }
  }, [requestId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRequest((prevRequest) => ({
      ...prevRequest,
      [name]: value,
    }));
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
    if (name === "startDate" || name === "endDate") {
      setIsNoteRequired(true);
      const oldStartDate = originalRequest.startDate.toISOString().split('T')[0];
      const oldEndDate = originalRequest.endDate.toISOString().split('T')[0];
      setRequest((prev) => ({
        ...prev,
        note: `Old Start Date: ${oldStartDate}, Old End Date: ${oldEndDate}. ${prev.note}`,
      }));
    }
  };

  const disWeekends = (current) => {
    return current.getDay() !== 0 && current.getDay() !== 6;
  };

  const validateDates = () => {
    const { startDate, endDate } = request;
    return new Date(endDate) >= new Date(startDate);
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
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm(request)) {
      return;
    }

    const result = await Swal.fire({
      title: "Do you want to save the changes?",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Save",
      denyButtonText: `Don't save`,
    });

    if (result.isConfirmed) {
      setLoading(true);

      try {
        await requestService.updateRequest(requestId, request);

        if (employee) {
          await EmailService.sendRequestUpdateEmail(employee.email, {
            startDate: request.startDate.toISOString().split('T')[0],
            endDate: request.endDate.toISOString().split('T')[0],
            note: request.note,
            status: request.status,
            userName: employee.firstName,
          });
        }

        Swal.fire("Saved!", "", "success");
        navigate('/requests');
      } catch (error) {
        console.error(`Error updating request with ID ${requestId}:`, error);
        Swal.fire("Error!", "There was a problem updating your request.", "error");
      } finally {
        setLoading(false);
      }
    } else if (result.isDenied) {
      Swal.fire("Changes are not saved", "", "info");
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
      <Container className={classes.container}>
        <Card className={classes.paper}>
          <Typography variant="h4" className={classes.title}>
            Update Request
          </Typography>
          <form onSubmit={handleSubmit} className={classes.form}>
            <FormControl fullWidth error={!!(errors.startDate && touched.startDate)}>
              <Typography className={classes.label}>Start Date</Typography>
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
                    variant="outlined"
                    className={classes.textField}
                    onChange={() => {}}
                  />
                }
              />
              <FormHelperText>{errors.startDate}</FormHelperText>
            </FormControl>
            <FormControl fullWidth error={!!(errors.endDate && touched.endDate)}>
              <Typography className={classes.label}>End Date</Typography>
              <DatePicker
                selected={request.endDate}
                onChange={(date) => handleDateChange('endDate', date)}
                dateFormat="dd-MM-yyyy"
                minDate={request.startDate}
                filterDate={disWeekends}
                customInput={
                  <TextField
                    name="endDate"
                    type="text"
                    value={request.endDate ? request.endDate.toISOString().split('T')[0] : ''}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    className={classes.textField}
                    onChange={() => {}}
                  />
                }
              />
              <FormHelperText>{errors.endDate}</FormHelperText>
            </FormControl>
            <FormControl fullWidth>
              <Typography className={classes.label}>Status</Typography>
              <Select
                name="status"
                value={request.status}
                onChange={handleChange}
                variant="outlined"
                className={classes.textField}
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
                {statuses.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <Typography className={classes.label}>Note</Typography>
              <TextField
                name="note"
                multiline
                rows={4}
                value={request.note}
                onChange={handleChange}
                variant="outlined"
                className={classes.textField}
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
            </FormControl>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              className={classes.button}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Save"}
            </Button>
          </form>
        </Card>
      </Container>
    </DashboardLayout>
  );
};

export default UpdateRequest;
