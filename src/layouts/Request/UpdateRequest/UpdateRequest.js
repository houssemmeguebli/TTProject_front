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
  InputLabel,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import RequestService from '../../../_services/RequestService';
import DashboardLayout from '../../../examples/LayoutContainers/DashboardLayout';
import DashboardNavbar from '../../../examples/Navbars/DashboardNavbar';
import Swal from "sweetalert2";

const requestService = new RequestService();
const bgImage =
  'https://raw.githubusercontent.com/creativetimofficial/public-assets/master/argon-dashboard-pro/assets/img/profile-layout-header.jpg';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh', // Utilisation de 100vh pour le centrage vertical
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

const UpdateRequest = () => {
  const classes = useStyles();
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState({
    status: '',
    startDate: '',
    endDate: '',
  });

  const statuses = [
    { value: 0, label: 'Pending' },
    { value: 1, label: 'Approved' },
    { value: 2, label: 'Updated' },
    { value: 3, label: 'Rejected' },
  ];

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const response = await requestService.getRequestById(requestId);
        setRequest({
          ...response,
          startDate: response.startDate.split('T')[0],
          endDate: response.endDate.split('T')[0],
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await Swal.fire({
      title: "Do you want to save the changes?",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Save",
      denyButtonText: `Don't save`,
    });

    if (result.isConfirmed) {
      console.log('Request data before update:', request);
      try {
        await requestService.updateRequest(requestId, request);
        Swal.fire("Saved!", "", "success");
        navigate('/requests'); // Redirection après la mise à jour
      } catch (error) {
        console.error(`Error updating request with ID ${requestId}:`, error);
        if (error.response && error.response.data) {
          console.error('Server response:', error.response.data);
        }
        Swal.fire("Error!", "There was a problem updating your request.", "error");
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
            rgba(gradients.info.state, 0.6)
          )}, url(${bgImage})`,
        backgroundPositionY: '50%',
      }}
    >
      <DashboardNavbar />

      <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh',marginTop:'8%' }}>
        <Paper className={classes.paper} elevation={3}>
          <Typography variant="h4" gutterBottom className={classes.title}>
            Update Request
          </Typography>
          <form className={classes.form} onSubmit={handleSubmit}>
            <div>
              <Typography className={classes.label}>Start Date</Typography>
              <TextField
                name="startDate"
                type="date"
                value={request.startDate}
                onChange={handleChange}
                fullWidth
                className={classes.textField}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </div>
            <div>
              <Typography className={classes.label}>End Date</Typography>
              <TextField
                name="endDate"
                type="date"
                value={request.endDate}
                onChange={handleChange}
                fullWidth
                className={classes.textField}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </div>
            <div>
              <Typography className={classes.label}>Status</Typography>
              <FormControl fullWidth>
                <Select
                  name="status"
                  value={request.status}
                  onChange={handleChange}
                  className={classes.textField}
                >
                  {statuses.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <Button type="submit" variant="contained" className={classes.button}>
              Update
            </Button>
          </form>
          <div className={classes.notes}>
            <Typography variant="h6">Important Notes:</Typography>
            <Typography variant="body2">
              - If approved, the employee will be notified automatically.
              <br />
              - Ensure all dates are correctly set before submitting.
            </Typography>
          </div>
        </Paper>
      </Container>
    </DashboardLayout>
  );
};

export default UpdateRequest;
