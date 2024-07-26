import React from 'react';
import { Card, CardContent, Typography, Button, Container, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { makeStyles } from '@mui/styles';

// Custom styles
const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin:"5%"
  },
  card: {
    padding: theme.spacing(4),
    textAlign: 'center',
    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
  },
  title: {
    fontWeight: 'bold',
  },
  button: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(1.5, 4),
    fontSize: '1rem',
  },
}));

const Unauthorized = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Container component="main" className={classes.root}>
      <Card className={classes.card}>
        <CardContent>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Typography variant="h2" component="h1" gutterBottom className={classes.title}>
              Unauthorized
            </Typography>
            <Typography variant="body1" align="center" gutterBottom>
              You do not have permission to view this page.
            </Typography>
            <Button variant="contained" color="primary" onClick={handleGoBack} className={classes.button}>
              Go Back
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Unauthorized;
