import React, { useEffect, useState } from 'react';
import {
  Table,
  TableContainer,
  Paper,
  Typography,
  Box,
  TextField,
  Card,
  Button,
  Container,
  InputAdornment,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import EmployeeService from '../../_services/EmployeeService';
import DashboardNavbar from "../../examples/Navbars/DashboardNavbar";
import DashboardLayout from "../../examples/LayoutContainers/DashboardLayout";
import { makeStyles } from "@mui/styles";
import ArgonBox from "../../components/ArgonBox";
import ArgonTypography from "../../components/ArgonTypography";
import { Link, useNavigate } from "react-router-dom";
import { Add, Delete, Edit, Visibility, Warning } from "@mui/icons-material";
import Pagination from "@mui/material/Pagination";
import SearchIcon from "@mui/icons-material/Search";
import Footer from "../../examples/Footer";
import Swal from "sweetalert2";

const employeeService = new EmployeeService();
const bgImage = "https://raw.githubusercontent.com/creativetimofficial/public-assets/master/argon-dashboard-pro/assets/img/profile-layout-header.jpg";

const useStyles = makeStyles((theme) => ({
  dialogTitle: {
    backgroundColor: '#1976d2',
    color: 'white',
    textAlign: 'center',
    padding: theme.spacing(2),
  },
  dialogContent: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  listItem: {
    marginBottom: theme.spacing(2),
  },
  listItemTextPrimary: {
    fontWeight: 'bold'
  },
  card: {
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
    margin: theme.spacing(2),
    borderRadius: '12px',
  },
  quickLinkButton: {
    padding: '12px',
    borderRadius: '8px',
    transition: 'background-color 0.3s, color 0.3s',
    backgroundColor: '#ffffff',
    color: '#1976d2',
    '&:hover': {
      backgroundColor: '#1976d2',
      color: '#ffffff',
    },
  },
  tableContainer: {
    overflowX: 'auto',
    margin: '1%',
    '& table': {
      width: '100%',
      borderCollapse: 'collapse',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      '& th, td': {
        border: '1px solid #ddd',
        padding: theme.spacing(2),
        textAlign: 'left',
        transition: 'background-color 0.3s',
      },
      '& th': {
        backgroundColor: '#1976d2',
        color: '#fff',
        fontWeight: 'bold',
      },
      '& tbody tr:nth-child(even)': {
        backgroundColor: '#f9f9f9',
      },
      '& tbody tr:hover': {
        backgroundColor: '#f1f1f1',
      },
    },
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: theme.spacing(2),
  },
  addButton: {
    marginBottom: theme.spacing(2),
    color: '#ffffff',
    backgroundColor: '#1976d2',
    '&:hover': {
      backgroundColor: '#303f9f',
    },
  },
  importantNotes: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[100],
    borderRadius: '8px',
  },
  summarySection: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(2),
    borderRadius: '8px',
    border: `1px solid ${theme.palette.primary.main}`,
  },
  statsItem: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.white,
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
  },
  employeeMetrics: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[100],
    borderRadius: '8px',
    border: `1px solid ${theme.palette.primary.main}`,
  },
}));

const EmployeeTable = () => {
  const classes = useStyles();
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await employeeService.getAllEmployees();
        if (Array.isArray(data.$values)) {
          setEmployees(data.$values);
          setFilteredEmployees(data.$values);
        } else {
          throw new Error('Unexpected data format');
        }
      } catch (error) {
        setError('Failed to fetch employees');
        console.error('Error fetching employees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    const filtered = employees.filter(employee =>
      employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEmployees(filtered);
  }, [searchTerm, employees]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage - 1); // Adjust for zero-based page index
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);

  };

  const handleViewDetails = (employee) => {
    navigate(`/employee/${employee.id}`);
  };
  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  // Additional Statistics
  const totalTenure = employees.reduce((acc, employee) => acc + employee.tenure, 0);
  const averageTenure = employees.length ? (totalTenure / employees.length).toFixed(1) : 0;
  const departmentDistribution = employees.reduce((acc, employee) => {
    acc[employee.department] = (acc[employee.department] || 0) + 1;
    return acc;
  }, {});
  const handleDelete = async (employeeId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await employeeService.deleteEmployee(employeeId);
        setEmployees(employees.filter(employee => employee.id !== employeeId));
        Swal.fire({
          title: "Deleted!",
          text: "Employee has been deleted.",
          icon: "success",
        });
      } catch (error) {
        console.error('Error deleting Employee:', error);
        Swal.fire({
          title: "Error!",
          text: "There was a problem deleting  Employee.",
          icon: "error",
        });
      }
    }
  };
  const UserStatus = {
    INACTIVE: 0,
    ACTIVE: 1,
    SUSPENDED: 2,
  };

  const handleToggleStatus = async (employee) => {
    const newStatus = employee.userStatus === UserStatus.SUSPENDED ? UserStatus.ACTIVE : UserStatus.SUSPENDED;
    const result = await Swal.fire({
      title: "Confirm Status Change",
      text: `Are you sure you want to mark this employee as ${newStatus === UserStatus.ACTIVE ? 'Active' : 'Suspended'}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, change status!",
    });

    if (result.isConfirmed) {
      try {
        await employeeService.updateEmployee(employee.id, { ...employee, userStatus: newStatus });
        setEmployees(employees.map(emp => emp.id === employee.id ? { ...emp, userStatus: newStatus } : emp));
        Swal.fire({
          title: "Status Changed!",
          text: `Employee status has been updated to ${newStatus === UserStatus.ACTIVE ? 'Active' : 'Inactive'}.`,
          icon: "success",
        });
      } catch (error) {
        console.error('Error updating employee status:', error);
        Swal.fire({
          title: "Error!",
          text: "There was a problem updating employee status.",
          icon: "error",
        });
      }
    }
  };

  const getRoleName = (role) => {
    switch (role) {
      case 0:
        return 'Project Manager';
      case 1:
        return 'Employee';
      default:
        return 'Unknown Role';
    }
  };

  const getStatusName = (status) => {
    switch (status) {
      case UserStatus.INACTIVE:
        return 'INACTIVE';
      case UserStatus.ACTIVE:
        return 'ACTIVE';
      case UserStatus.SUSPENDED:
        return 'SUSPENDED';
      default:
        return 'Unknown Status';
    }
  };
  const getStatusColor = (status) => {
    switch (status) {
      case UserStatus.ACTIVE:
        return 'green';
      case UserStatus.SUSPENDED:
        return 'red';
      case UserStatus.INACTIVE:
        return 'gray';
      default:
        return 'black';
    }
  };



  return (
    <DashboardLayout
      sx={{
        backgroundImage: ({ functions: { rgba, linearGradient }, palette: { gradients } }) =>
          `${linearGradient(rgba(gradients.info.main, 0.6), rgba(gradients.info.state, 0.6))}, url(${bgImage})`,
        backgroundPositionY: "50%",
      }}
    >
      <DashboardNavbar />
      <ArgonBox py={3} className={classes.card}>
        <Card>
          <ArgonBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
            <ArgonTypography variant="h6" fontWeight="medium">List of Employees</ArgonTypography>
            <Link to="/authentication/sign-up" style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                color="primary"
                className={classes.addButton}
                startIcon={<Add />}
              >
                New Employee
              </Button>
            </Link>
          </ArgonBox>
          <ArgonBox className={classes.tableContainer}>
            <ArgonBox className="search-input-container" mb={2}>
              <TextField
                variant="outlined"
                placeholder="Search by Name"
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon style={{ color: '#1976d2' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </ArgonBox>
            <TableContainer component={Paper}>
              <Table>
                <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th style={{textAlign:'center'}}>Role</th>
                  <th style={{textAlign:'center'}}>Department</th>
                  <th style={{textAlign:'center'}}>Status</th>
                  <th style={{textAlign:'center'}}>Actions</th>
                </tr>
                </thead>
                <tbody>
                {filteredEmployees.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(employee => (
                  <tr key={employee.id} >
                    <td>{employee.firstName} {employee.lastName}</td>
                    <td>{employee.email}</td>
                    <td style={{textAlign:'center'}}>{getRoleName(employee.role)}</td>
                    <td style={{textAlign:'center'}}>{employee.department}</td>
                    <td style={{textAlign:'center', color: getStatusColor(employee.userStatus) }}>{getStatusName(employee.userStatus)}</td>
                    <td style={{textAlign:'center'}}>
                      <IconButton onClick={() => handleViewDetails(employee)}>
                        <Visibility />
                      </IconButton>
                      {employee.userStatus !== UserStatus.INACTIVE && (
                        <IconButton onClick={() => handleToggleStatus(employee)} color="warning">
                          {employee.userStatus === UserStatus.ACTIVE ? <Warning /> : <Add />}
                        </IconButton>
                      )}

                    </td>
                  </tr>
                ))}
                </tbody>
              </Table>
            </TableContainer>
            <Pagination
              className={classes.pagination}
              count={Math.ceil(filteredEmployees.length / rowsPerPage)}
              page={page + 1}
              onChange={handleChangePage}
            />
          </ArgonBox>
        </Card>
      </ArgonBox>

      <Dialog open={openDialog} onClose={handleDialogClose} fullWidth maxWidth="md" >
        <DialogTitle className={classes.dialogTitle} style={{ color: "white"  }}>Employee Details</DialogTitle>
        <DialogContent className={classes.dialogContent}>
          {selectedEmployee && (
            <Box>
              <Typography variant="h6" style={{ textAlign: "center" }}>{selectedEmployee.firstName} {selectedEmployee.lastName} </Typography>
              <List>
                <ListItem className={classes.listItem} style={{ textAlign: "center" }}>
                  <ListItemText primary="Email" secondary={selectedEmployee.email} />
                </ListItem>
                <ListItem className={classes.listItem} style={{ textAlign: "center" }}>
                  <ListItemText primary="Position" secondary={selectedEmployee.role} />
                </ListItem>
                <ListItem className={classes.listItem} style={{ textAlign: "center" }}>
                  <ListItemText primary="Department" secondary={selectedEmployee.department} />
                </ListItem>
                <ListItem className={classes.listItem} style={{ textAlign: "center" }}>
                  <ListItemText primary="phneNumber" secondary={`${selectedEmployee.phneNumber} years`} />
                </ListItem>
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">Close</Button>
        </DialogActions>
      </Dialog>

      <Card className={classes.employeeMetrics} elevation={5}>
        <Box p={4} display="flex" flexDirection="column" gap={3} borderRadius={2} bgcolor="#f9f9f9">
          {/* Title */}
          <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
            Employee Statistics
          </Typography>

          {/* Total Employees */}
          <Box display="flex" flexDirection="column" alignItems="center" bgcolor="#fff" p={3} borderRadius={2} boxShadow={2}>
            <Typography variant="h6" color="textSecondary">
              Total Employees
            </Typography>
            <Typography variant="h2" fontWeight="bold" color="primary">
              {employees.length}
            </Typography>
          </Box>

          {/* Department Distribution */}
          <Typography variant="h6" fontWeight="medium" color="textPrimary" gutterBottom>
            Department Distribution
          </Typography>
          <List>
            {Object.entries(departmentDistribution).map(([department, count]) => (
              <ListItem key={department} sx={{ borderBottom: '1px solid #ddd', borderRadius: 1, bgcolor: '#fafafa', '&:last-child': { borderBottom: 'none' } }}>
                <ListItemText
                  primary={department}
                  secondary={`${count} employee(s)`}
                  primaryTypographyProps={{ variant: 'body1', fontWeight: 'medium' }}
                  secondaryTypographyProps={{ variant: 'body2', color: 'textSecondary' }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Card>

      <Footer />
    </DashboardLayout>
  );
};

export default EmployeeTable;
