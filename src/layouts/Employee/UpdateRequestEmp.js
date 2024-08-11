import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Container,
  Paper,
  Typography,
  CircularProgress,
  FormControl,
  FormHelperText, Card,
} from "@mui/material";
import { makeStyles } from '@mui/styles';
import RequestService from '../../_services/RequestService';
import DashboardLayout from '../../examples/LayoutContainers/DashboardLayout';
import DashboardNavbar from '../../examples/Navbars/DashboardNavbar';
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';

const requestService = new RequestService();
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
  notes: {
    marginTop: theme.spacing(3),
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(2),
    borderRadius: '8px',
    boxShadow: theme.shadows[1],
  },
}));

const UpdateRequestEmp = () => {
  const classes = useStyles();
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  const [request, setRequest] = useState({
    comment: '',
    startDate: new Date(),
    endDate: new Date(),
  });
  const [originalRequest, setOriginalRequest] = useState({});

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const response = await requestService.getRequestById(requestId);
        setRequest({
          ...response,
          startDate: new Date(response.startDate),
          endDate: new Date(response.endDate),
          comment: response.comment || '',
        });
        setOriginalRequest({
          ...response,
          startDate: new Date(response.startDate),
          endDate: new Date(response.endDate),
        });
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

    // Mark the field as touched
    setTouched((prevTouched) => ({
      ...prevTouched,
      [name]: true,
    }));

    // Validate the field
    validateField(name, value);
  };

  const handleDateChange = (name, date) => {
    setRequest((prevRequest) => ({
      ...prevRequest,
      [name]: date,
    }));

    // Mark the field as touched
    setTouched((prevTouched) => ({
      ...prevTouched,
      [name]: true,
    }));

    // Validate the field
    validateField(name, date);
  };

  const validateDates = () => {
    const { startDate, endDate } = request;
    return new Date(endDate) >= new Date(startDate);
  };

  const validateComment = (comment) => comment.length >= 10 && comment.length <= 100;

  const validateField = (name, value) => {
    const currentErrors = { ...errors };

    switch (name) {
      case 'startDate':
        if (!value) {
          currentErrors.startDate = 'Start date is required';
        } else {
          delete currentErrors.startDate;
        }
        break;
      case 'endDate':
        if (!value) {
          currentErrors.endDate = 'End date is required';
        } else if (!validateDates()) {
          currentErrors.endDate = 'End date must be after start date';
        } else {
          delete currentErrors.endDate;
        }
        break;
      case 'comment':
        if (!validateComment(value)) {
          currentErrors.comment = 'Comment must be between 10 and 100 characters';
        } else {
          delete currentErrors.comment;
        }
        break;
      default:
        break;
    }

    setErrors(currentErrors);
    setIsFormValid(Object.keys(currentErrors).length === 0);
  };

  const validateForm = () => {
    const currentErrors = {};
    if (!request.startDate) {
      currentErrors.startDate = 'Start date is required';
    }
    if (!request.endDate) {
      currentErrors.endDate = 'End date is required';
    } else if (!validateDates()) {
      currentErrors.endDate = 'End date must be after start date';
    }
    if (!validateComment(request.comment)) {
      currentErrors.comment = 'Comment must be between 10 and 100 characters';
    }
    setErrors(currentErrors);
    setIsFormValid(Object.keys(currentErrors).length === 0);
    return Object.keys(currentErrors).length === 0;
  };

  const disWeekends = (current) => {
    return current.getDay() !== 0 && current.getDay() !== 6;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prevTouched) => ({
      ...prevTouched,
      [name]: true,
    }));
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({
      startDate: true,
      endDate: true,
      comment: true,
    });

    if (!validateForm()) {
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
        Swal.fire("Saved!", "", "success");
        navigate('/RequestEmployee');
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
        backgroundPositionY: '50%',
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
                minDate={new Date()}
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
                    onBlur={handleBlur}
                    onChange={() => {}}
                  />
                }
              />
              {errors.startDate && touched.startDate && <FormHelperText>{errors.startDate}</FormHelperText>}
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
                    onBlur={handleBlur}
                    onChange={() => {}}
                  />
                }
              />
              {errors.endDate && touched.endDate && <FormHelperText>{errors.endDate}</FormHelperText>}
            </FormControl>
            <FormControl fullWidth error={!!(errors.comment && touched.comment)}>
              <Typography className={classes.label}>Comment</Typography>
              <TextField
                name="comment"
                multiline
                rows={4}
                value={request.comment}
                onChange={handleChange}
                onBlur={handleBlur}
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
              <FormHelperText>{errors.comment}</FormHelperText>
            </FormControl>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              className={classes.button}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Save"}
            </Button>
          </form>
        </Card>
      </Container>
    </DashboardLayout>
  );
};

export default UpdateRequestEmp;
