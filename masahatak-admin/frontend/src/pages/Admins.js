import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  Tooltip
} from '@mui/material';
import { Delete, Add, Person, Star } from '@mui/icons-material';
import api from '../utils/api';
import MainLayout from '../components/Layout/MainLayout';
import authService from '../services/authService';

const Admins = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [currentAdminId, setCurrentAdminId] = useState('');
  const [newAdmin, setNewAdmin] = useState({
    email: '',
    fullName: '',
    password: '',
    role: 'admin'
  });

  useEffect(() => {
    // Check if user is super_admin
    const adminData = authService.getAdminData();
    if (!adminData || adminData.role !== 'super_admin') {
      navigate('/');
      return;
    }
    setCurrentAdminId(adminData.id);
    fetchAdmins();
  }, [navigate]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await api.get('/superadmin/admins');
      setAdmins(response.data.admins || []);
    } catch (err) {
      setError('Failed to load admins');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    try {
      await api.post('/superadmin/admins', newAdmin);
      setSuccess('Admin created successfully');
      setCreateDialogOpen(false);
      setNewAdmin({ email: '', fullName: '', password: '', role: 'admin' });
      fetchAdmins();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create admin');
      console.error(err);
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (!window.confirm(t('admins.confirmDelete') || 'Are you sure you want to remove this admin?')) {
      return;
    }

    try {
      await api.delete(`/superadmin/admins/${adminId}`);
      setSuccess(t('admins.adminDeleted') || 'Admin removed successfully');
      fetchAdmins();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove admin');
      console.error(err);
    }
  };

  const handleMakeSuperAdmin = async (adminId) => {
    if (!window.confirm(t('admins.confirmMakeSuper') || 'Are you sure you want to make this admin a super admin?')) {
      return;
    }

    try {
      await api.put(`/superadmin/admins/${adminId}/role`, { role: 'super_admin' });
      setSuccess(t('admins.roleUpdated') || 'Admin role updated successfully');
      fetchAdmins();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update admin role');
      console.error(err);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && admins.length === 0) {
    return (
      <MainLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {t('admins.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('admins.subtitle')}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialogOpen(true)}
        >
          {t('admins.addAdmin')}
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Card elevation={2}>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('settings.fullName')}</TableCell>
                  <TableCell>{t('settings.email')}</TableCell>
                  <TableCell>{t('admins.role')}</TableCell>
                  <TableCell>{t('common.status')}</TableCell>
                  <TableCell>{t('users.joinedDate')}</TableCell>
                  <TableCell>{t('common.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {admins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No admins found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  admins.map((admin) => (
                    <TableRow key={admin.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Person fontSize="small" color="action" />
                          <Typography variant="body2" fontWeight="medium">
                            {admin.fullName || 'N/A'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {admin.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={admin.role === 'super_admin' ? t('admins.superAdmin') : t('admins.admin')}
                          size="small"
                          color={admin.role === 'super_admin' ? 'primary' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={t(`common.${admin.status || 'active'}`)}
                          size="small"
                          color={admin.status === 'active' ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(admin.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {admin.role !== 'super_admin' && admin.id !== currentAdminId && (
                          <Tooltip title={t('admins.makeSuper')}>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleMakeSuperAdmin(admin.id)}
                            >
                              <Star fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {admin.id !== currentAdminId && (
                          <Tooltip title={t('admins.removeAdmin')}>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteAdmin(admin.id)}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Create Admin Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('admins.addAdmin')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('settings.fullName')}
                value={newAdmin.fullName}
                onChange={(e) => setNewAdmin({ ...newAdmin, fullName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('settings.email')}
                type="email"
                value={newAdmin.email}
                onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('settings.newPassword')}
                type="password"
                value={newAdmin.password}
                onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                required
                helperText={t('admins.minPasswordHelper') || "Minimum 6 characters"}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('admins.role')}
                value={t('admins.admin')}
                disabled
                helperText={t('admins.newAdminHelper') || "New admins are created with standard admin privileges"}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button
            onClick={handleCreateAdmin}
            variant="contained"
            disabled={!newAdmin.email || !newAdmin.fullName || !newAdmin.password}
          >
            {t('common.create')}
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};

export default Admins;
