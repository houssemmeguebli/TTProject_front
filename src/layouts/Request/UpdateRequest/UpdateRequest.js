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
  FormControl, OutlinedInput, InputAdornment, InputLabel,
} from "@mui/material";
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
    width :"100%",
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
    note: '', // Add note field to request state
  });

  const [originalRequest, setOriginalRequest] = useState({});
  const [isNoteRequired, setIsNoteRequired] = useState(false);

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
          startDate: response.startDate.split('T')[0],
          endDate: response.endDate.split('T')[0],
          note: response.note || '', // Initialize note from the response
        });
        setOriginalRequest({
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

    // Check if startDate or endDate has been changed to set note required
    if (name === "startDate" || name === "endDate") {
      setIsNoteRequired(true);
      const oldStartDate = originalRequest.startDate;
      const oldEndDate = originalRequest.endDate;
      setRequest((prev) => ({
        ...prev,
        note: `Old Start Date: ${oldStartDate}, Old End Date: ${oldEndDate}. ${prev.note}`,
      }));
    }
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
        navigate('/requests');
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

  useEffect(() => {
    const isStartDateChanged = request.startDate !== originalRequest.startDate;
    const isEndDateChanged = request.endDate !== originalRequest.endDate;
    setIsNoteRequired(isStartDateChanged || isEndDateChanged);
  }, [request.startDate, request.endDate, originalRequest]);

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

      <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh', marginTop: '8%' }}>
        <Paper className={classes.paper} elevation={3}>
          <Typography variant="h4" gutterBottom className={classes.title}>
            Update Request
          </Typography>
          <form className={classes.form} onSubmit={handleSubmit} >
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
                sx={{
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
                sx={{
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
            <div>
              <Typography className={classes.label}>Status</Typography>
              <FormControl    sx={{
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
              }}>
                <Select

                  name="status"
                  value={request.status}
                  onChange={handleChange}
                  className={classes.textField}
                  sx={{
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
                >
                  {statuses.map((status) => (
                    <MenuItem key={status.value} value={status.value}
                    >
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <div >
              <Typography className={classes.label}>Note</Typography>
              <TextField
                name="note"
                type="text"
                value={request.note}
                onChange={handleChange}
                required={isNoteRequired}
                placeholder={isNoteRequired ? "If you change, explain here" : ""}
                className={classes.textField}
                multiline
                rows={4} // Adjust height as needed
                fullWidth
                variant="outlined" // Ensure outlined style
                sx={{
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
