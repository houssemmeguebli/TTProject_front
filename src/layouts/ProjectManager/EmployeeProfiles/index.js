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
  InputAdornment,
  IconButton,
   CardContent,
  CircularProgress,
} from "@mui/material";
import EmployeeService from '../../../_services/EmployeeService';
import DashboardNavbar from "../../../examples/Navbars/DashboardNavbar";
import DashboardLayout from "../../../examples/LayoutContainers/DashboardLayout";
import { makeStyles } from "@mui/styles";
import ArgonBox from "../../../components/ArgonBox";
import { Link, useNavigate } from "react-router-dom";
import { Add, PictureAsPdf, Visibility, Warning } from "@mui/icons-material";
import Pagination from "@mui/material/Pagination";
import SearchIcon from "@mui/icons-material/Search";
import Footer from "../../../examples/Footer";
import Swal from "sweetalert2";
import MenuItem from "@mui/material/MenuItem";
import EmployeeStatistics from "./EmployeesStatistics";
import { format, parseISO } from "date-fns";
import jsPDF from "jspdf";
import 'jspdf-autotable';
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
  statusCell: {
    width: "140px",
    fontWeight: 600,
    padding: "12px 20px",
    textAlign: "center",
    borderRadius: "5px",
    justifyContent: "center",
    color: "#fff",
    transition: "background-color 0.3s, transform 0.2s",
    display: "inline-block",
    fontSize: "16px",
    textTransform: "uppercase",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      fontSize: "12px",
      padding: "10px 15px",
    },
  },
  statusActive: {
    backgroundColor: '#4caf50', // Green for active
    '&:hover': {
      backgroundColor: '#388e3c', // Darker green on hover
    },
  },
  statusInactive: {
    backgroundColor: '#9e9e9e', // Gray for inactive
    '&:hover': {
      backgroundColor: '#757575', // Darker gray on hover
    },
  },
  statusSuspended: {
    backgroundColor: '#f44336', // Red for suspended
    '&:hover': {
      backgroundColor: '#d32f2f', // Darker red on hover
    },
  },

}));

const EmployeeTable = () => {
  const classes = useStyles();
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 700);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  const handleStatusChange = (event) => {
    setFilterStatus(event.target.value);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 700);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);


  useEffect(() => {
    const filtered = employees.filter(employee => {
      const matchesStatus = filterStatus === 'all' || employee.userStatus === parseInt(filterStatus, 10);
      const matchesSearchTerm =
        employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.department.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesStatus && matchesSearchTerm;
    });
    setFilteredEmployees(filtered);
  }, [searchTerm, filterStatus, employees]);

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

  if (loading) return <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh', // Full viewport height
      width: '100vw'  // Full viewport width
    }}
  >
    <CircularProgress />
  </Box>;

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Employees Report", 14, 25);
    doc.setFontSize(11);
    doc.text(`Generated on: ${format(new Date(), "dd-MM-yyyy")}`, 14, 35);

    // Add a horizontal line below the header
    doc.setLineWidth(0.5);
    doc.line(14, 40, 196, 40);

    const tableColumn = [
       "Full Name", "Email","Phone" ,"Role","Position",
      "Department","Date Of Birth" ,"Status"
    ];
    const tableRows = [];

    // Data collection for the table
    filteredEmployees.forEach(employee => {
      const dateOfbirth = parseISO(employee.dateOfbirth);

      const requestData = [
        `${employee.firstName} ${employee.lastName}`,
        employee.email,
        employee.phoneNumber,
        getRoleName(employee.role),
        employee.position,
        employee.department,
        format(dateOfbirth, "dd-MM-yyyy"),
        getStatusName(employee.userStatus)
      ];

      tableRows.push(requestData);
    });

    // Table with custom styles
    doc.autoTable({
      startY: 50, // Starting point
      head: [tableColumn],
      body: tableRows,
      theme: 'grid', // Styling theme for the table
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [0, 57, 107], textColor: [255, 255, 255] }, // Custom header color
      alternateRowStyles: { fillColor: [240, 240, 240] }, // Alternating row colors
      margin: { top: 10 },
    });

    // Display total number of employees below the table
    const finalY = doc.previousAutoTable.finalY + 10; // Get the position after the table
    doc.setFontSize(12);
    doc.text(`Total Employees: ${filteredEmployees.length}`, 14, finalY);

    // Add a footer with page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10, { align: 'right' });
    }

    // Convert the document to a Blob and open in a new tab
    const pdfBlob = doc.output('blob');
    const blobURL = URL.createObjectURL(pdfBlob);
    window.open(blobURL);
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
          <ArgonBox
            display="flex"
            flexDirection={{ xs: 'column', sm: 'row' }} // Stack vertically on small screens, row on larger screens
            justifyContent="space-between"
            alignItems="center"
            p={3}
          >
            {/* Title on the left */}
            <Typography variant="h4" sx={{ mb: { xs: 2, sm: 0 } }}>
              Employees List
            </Typography>

            {/* Buttons on the right */}
            <Box
              display="flex"
              flexDirection={{ xs: 'column', sm: 'row' }} // Stack vertically on small screens, row on larger screens
              gap={2}
              justifyContent="flex-end"
              alignItems="center"
              sx={{
                width: { xs: '100%', sm: 'auto' },
                textAlign: { xs: 'center', sm: 'right' } // Center text on small screens
              }}
            >

              <Button
                variant="contained"
                color="primary"
                startIcon={<PictureAsPdf />}
                className={classes.addButton}

                onClick={generatePDF}
                sx={{
                  width: { xs: '100%', sm: 'auto' }, // Full width on small screens, auto on larger
                }}
              >
                Export PDF
              </Button>
              <Link to="/authentication/sign-up" style={{ textDecoration: 'none' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Add />}
                  className={classes.addButton}

                  sx={{
                    width: { xs: '100%', sm: 'auto' }, // Full width on small screens, auto on larger
                  }}
                >
                  New Employee
                </Button>
              </Link>
            </Box>
          </ArgonBox>          <ArgonBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
            <TextField
              select
              label="Filter Status"
              value={filterStatus}
              onChange={handleStatusChange}
              variant="outlined"
              sx={{
                width: { xs: "100%", sm: "70%", md: "20%" },
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
              <MenuItem value="all">All</MenuItem>
              <MenuItem value={UserStatus.ACTIVE}>Active</MenuItem>
              <MenuItem value={UserStatus.INACTIVE}>Inactive</MenuItem>
              <MenuItem value={UserStatus.SUSPENDED}>Suspended</MenuItem>
            </TextField>
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
          <ArgonBox className={classes.tableContainer}>
            {filteredEmployees.length === 0 ?(
              <div style={{
                textAlign: "center",
                marginTop: "50px",
                marginBottom: "20px",
                padding: "30px",
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                maxWidth: "700px",
                marginLeft: "auto",
                marginRight: "auto",
              }}>
                <Typography variant="h5" style={{ fontWeight: 600, color: "#333" }}>
                  No employees
                </Typography>
                <Typography variant="body1" style={{ marginTop: "15px", color: "#666" }}>
                  At this moment, there are no employees awaiting your review.
                </Typography>
                <Typography variant="body2" style={{ marginTop: "10px", color: "#999" }}>
                  You can always add new employee or update existing ones through the provided forms.
                </Typography>
                <Link to="/authentication/sign-up" style={{ textDecoration: "none" }}>
                  <Button variant="contained" color="white" style={{ marginTop: "20px", borderRadius: "8px" }}>
                    Add New Employee
                  </Button>
                </Link>

              </div>

            ):(
              <>
            {isMobile ? (
              filteredEmployees.map(employee => (
                <Card key={employee.id} variant="outlined"
                      sx={{ margin: 2, borderRadius: 2, boxShadow: 2, borderColor: "#e0e0e0" }}>
                  <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Typography variant="h5" component="div" sx={{ fontWeight: "600", color: "#333" }}>
                      {employee.firstName} {employee.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.primary" sx={{ marginBottom: 0.5 }}>
                      <strong>Email:</strong> {employee.email}
                    </Typography>
                    <Typography variant="body2" color="text.primary" sx={{ marginBottom: 0.5 }}>
                      <strong>Role:</strong> {getRoleName(employee.role)}
                    </Typography>
                    <Typography variant="body2" color="text.primary" sx={{ marginBottom: 0.5 }}>
                      <strong>Department:</strong> {employee.department}
                    </Typography>
                    <Typography variant="body2" sx={{ color: getStatusColor(employee.userStatus), fontWeight: "500" }}>
                        <strong>Status:</strong> {getStatusName(employee.userStatus)}
                      </Typography>
                      <div style={{ marginTop: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton onClick={() => handleViewDetails(employee)} sx={{ color: '#1976d2' }}>
                          <Visibility />
                        </IconButton>
                        {employee.userStatus !== UserStatus.INACTIVE && (
                          <IconButton onClick={() => handleToggleStatus(employee)} color="warning">
                            {employee.userStatus === UserStatus.ACTIVE ? <Warning /> : <Add />}
                          </IconButton>
                        )}
                      </div>
                    </CardContent>
                  </Card>
            ))
            ) : (
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
                  <tr key={employee.id}>
                    <td>{employee.firstName} {employee.lastName}</td>
                    <td>{employee.email}</td>
                    <td style={{ textAlign: "center" }}>{getRoleName(employee.role)}</td>
                    <td style={{ textAlign: "center" }}>{employee.department}</td>
                    <td style={{ textAlign: "center" }}>
                      <span
                        className={`${classes.statusCell} ${employee.userStatus === UserStatus.ACTIVE ? classes.statusActive : employee.userStatus === UserStatus.SUSPENDED ? classes.statusSuspended : classes.statusInactive}`}
                      >
                        {getStatusName(employee.userStatus)}
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
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
            )}
            <Pagination
              className={classes.pagination}
              count={Math.ceil(filteredEmployees.length / rowsPerPage)}
              page={page + 1}
              onChange={handleChangePage}
            />
              </>
            )}
             </ArgonBox>

           </Card>
          </ArgonBox>


      <Card className={classes.employeeMetrics} elevation={5}>
        <Box p={4}>
          <EmployeeStatistics employees={employees} />
        </Box>

      </Card>

      <Footer />
    </DashboardLayout>
  );
};

export default EmployeeTable;
