import React from 'react';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';

const MainLayout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F5F7FA' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          ml: '260px',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;
