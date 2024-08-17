// src/components/EmployeeStatistics.js
import React, { useEffect, useState } from "react";
import PropTypes from 'prop-types';
import { Box, Typography, Card, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, BarElement, CategoryScale, LinearScale } from 'chart.js';
import EmployeeService from "../../../_services/EmployeeService";

ChartJS.register(Title, Tooltip, Legend, ArcElement, BarElement, CategoryScale, LinearScale);

const employeeService = new EmployeeService();

const EmployeeStatistics = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await employeeService.getAllEmployees();
        if (Array.isArray(data.$values)) {
          setEmployees(data.$values);
        } else {
          throw new Error('Unexpected data format');
        }
      } catch (error) {
        setError(error.message || 'Failed to fetch employees');
        console.error('Error fetching employees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }
  const genderDistribution = employees.reduce((acc, employee) => {
    if (employee.gender === 0 || employee.gender === 1) {
      const gender = employee.gender === 0 ? 'Male' : 'Female';
      acc[gender] = (acc[gender] || 0) + 1;
    }
    return acc;
  }, {});

  if (error) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
        <Typography variant="h6" color="error">{error}</Typography>
      </Box>
    );
  }

  // Compute statistics
  const totalEmployees = employees.length;
  const activeCount = employees.filter(e => e.userStatus === 1).length;
  const inactiveCount = employees.filter(e => e.userStatus === 0).length;
  const suspendedCount = employees.filter(e => e.userStatus === 2).length;

  const departmentDistribution = employees.reduce((acc, employee) => {
    acc[employee.department] = (acc[employee.department] || 0) + 1;
    return acc;
  }, {});

  // Pie chart data
  const statusData = {
    labels: ['Active', 'Inactive', 'Suspended'],
    datasets: [
      {
        data: [activeCount, inactiveCount, suspendedCount],
        backgroundColor: ['#4caf50', '#9e9e9e', '#f44336'],
        borderColor: ['#ffffff', '#ffffff', '#ffffff'],
        borderWidth: 1,
      },
    ],
  };

  // Bar chart data
  const departmentData = {
    labels: Object.keys(departmentDistribution),
    datasets: [
      {
        label: 'Number of Employees',
        data: Object.values(departmentDistribution),
        backgroundColor: '#2196f3',
        borderColor: '#1976d2',
        borderWidth: 1,
      },
    ],
  };

  const genderData = {
    labels: ['Male', 'Female'],
    datasets: [
      {
        label: 'Number of Employees',
        data: [genderDistribution['Male'] || 0, genderDistribution['Female'] || 0],
        backgroundColor: ['#1976d2', '#f44336'],
        borderColor: ['#ffffff', '#ffffff'],
        borderWidth: 1,
      },
    ],
  };
  return (
    <>
      <Typography variant="h4">
        Employees statistics
      </Typography>
    <Card elevation={5} sx={{ padding: 3, borderRadius: 2, bgcolor: '#f9f9f9' ,marginTop :"2%"}}>
      {/* Statistics Table */}
      <Box display="flex" flexDirection="column" alignItems="center" bgcolor="#fff" p={3} borderRadius={2} boxShadow={2} sx={{marginBottom:"2%"}}>
        <Typography variant="h6" color="textSecondary" gutterBottom>Statistics Summary</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Total Employees</TableCell>
                <TableCell align="right">{totalEmployees}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Active Employees</TableCell>
                <TableCell align="right">{activeCount}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Inactive Employees</TableCell>
                <TableCell align="right">{inactiveCount}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Suspended Employees</TableCell>
                <TableCell align="right">{suspendedCount}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Departments</TableCell>
                <TableCell align="right">{Object.keys(departmentDistribution).length}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Box display="flex" flexDirection="column" gap={3}>


        {/* Charts Section */}
        <Box
          display="flex"
          flexDirection={{ xs: 'column', sm: 'row' }}
          gap={3}
          sx={{ height: 'auto' }}
        >
          {/* Employee Status Distribution */}
          <Box display="flex" flexDirection="column" alignItems="center" bgcolor="#fff" p={3} borderRadius={2} boxShadow={2} sx={{ height: { xs: 350, sm: 350 }, width: { xs: '100%', sm: '50%' } }}>
            <Typography variant="h6" color="textSecondary">Employee Status Distribution</Typography>
            <Pie data={statusData} options={{ maintainAspectRatio: false }} />
          </Box>

          {/* Gender Distribution */}
          <Box display="flex" flexDirection="column" alignItems="center" bgcolor="#fff" p={3} borderRadius={2} boxShadow={2} sx={{ height: { xs: 350, sm: 350 }, width: { xs: '100%', sm: '50%' } }}>
            <Typography variant="h6" color="textSecondary">Gender Distribution</Typography>
            <Pie data={genderData} options={{ maintainAspectRatio: false }} />
          </Box>
        </Box>
        {/* Department Distribution */}
        <Box display="flex" flexDirection="column" alignItems="center" bgcolor="#fff" p={3} borderRadius={2} boxShadow={2} sx={{ height: { xs: 350, sm: 350 }, width: '100%' }}>
          <Typography variant="h6" color="textSecondary">Department Distribution</Typography>
          <Bar data={departmentData} options={{ maintainAspectRatio: false, responsive: true }} barSize={10}/>
        </Box>

      </Box>
    </Card>
    </>
  );
};

EmployeeStatistics.propTypes = {
  employees: PropTypes.arrayOf(
    PropTypes.shape({
      department: PropTypes.string.isRequired,
      hireDate: PropTypes.string.isRequired,
      role: PropTypes.string.isRequired,
      userStatus: PropTypes.number.isRequired,
      birthDate: PropTypes.string.isRequired,
      gender: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default EmployeeStatistics;
