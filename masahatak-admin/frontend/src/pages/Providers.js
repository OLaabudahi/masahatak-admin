import React, { useState, useEffect } from 'react';
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
  TablePagination,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  CircularProgress,
  Alert,
  Tooltip,
  Grid
} from '@mui/material';
import {
  Visibility,
  Block,
  CheckCircle,
  Delete,
  FilterList,
  Business
} from '@mui/icons-material';
import api from '../utils/api';
import MainLayout from '../components/Layout/MainLayout';

const Providers = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalProviders, setTotalProviders] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [actionDialog, setActionDialog] = useState({ open: false, type: '', reason: '' });
  const [providerDetails, setProviderDetails] = useState(null);

  useEffect(() => {
    fetchProviders();
  }, [page, rowsPerPage, statusFilter]);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/providers', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          status: statusFilter
        }
      });
      setProviders(response.data.providers);
      setTotalProviders(response.data.pagination.total);
    } catch (err) {
      setError('Failed to load providers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProviderDetails = async (providerId) => {
    try {
      const response = await api.get(`/providers/${providerId}`);
      setProviderDetails(response.data);
      setDetailsDialog(true);
    } catch (err) {
      setError('Failed to load provider details');
      console.error(err);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenActionDialog = (provider, type) => {
    setSelectedProvider(provider);
    setActionDialog({ open: true, type, reason: '' });
  };

  const handleCloseActionDialog = () => {
    setActionDialog({ open: false, type: '', reason: '' });
    setSelectedProvider(null);
  };

  const handleAction = async () => {
    try {
      if (actionDialog.type === 'delete') {
        await api.delete(`/providers/${selectedProvider.id}`);
      } else {
        await api.put(`/providers/${selectedProvider.id}/status`, {
          status: actionDialog.type,
          reason: actionDialog.reason
        });
      }
      handleCloseActionDialog();
      fetchProviders();
    } catch (err) {
      setError(`Failed to ${actionDialog.type} provider`);
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'suspended':
        return 'error';
      case 'pending':
        return 'warning';
      case 'deleted':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <MainLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Providers Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage workspace providers and their listings
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card elevation={2}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={statusFilter}
                label="Status Filter"
                onChange={(e) => setStatusFilter(e.target.value)}
                startAdornment={<FilterList sx={{ mr: 1, ml: 1 }} />}
              >
                <MenuItem value="all">All Providers</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
                <MenuItem value="deleted">Deleted</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Business Name</TableCell>
                  <TableCell>Owner Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Workspaces</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : providers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No providers found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  providers.map((provider) => (
                    <TableRow key={provider.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Business color="primary" />
                          {provider.businessName || 'N/A'}
                        </Box>
                      </TableCell>
                      <TableCell>{provider.ownerName || 'N/A'}</TableCell>
                      <TableCell>{provider.email}</TableCell>
                      <TableCell>{provider.phoneNumber || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip
                          label={provider.workspaceCount || 0}
                          color="primary"
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={provider.status || 'active'}
                          color={getStatusColor(provider.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => fetchProviderDetails(provider.id)}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {provider.status !== 'suspended' && (
                          <Tooltip title="Suspend Provider">
                            <IconButton
                              size="small"
                              color="warning"
                              onClick={() => handleOpenActionDialog(provider, 'suspended')}
                            >
                              <Block fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {provider.status === 'suspended' && (
                          <Tooltip title="Activate Provider">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleOpenActionDialog(provider, 'active')}
                            >
                              <CheckCircle fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Delete Provider">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleOpenActionDialog(provider, 'delete')}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={totalProviders}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </CardContent>
      </Card>

      {/* Provider Details Dialog */}
      <Dialog open={detailsDialog} onClose={() => setDetailsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Business color="primary" />
            Provider Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {providerDetails && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Business Name</Typography>
                <Typography variant="body1" gutterBottom>{providerDetails.provider.businessName}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Owner Name</Typography>
                <Typography variant="body1" gutterBottom>{providerDetails.provider.ownerName}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                <Typography variant="body1" gutterBottom>{providerDetails.provider.email}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                <Typography variant="body1" gutterBottom>{providerDetails.provider.phoneNumber}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Statistics</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h4" color="primary">{providerDetails.stats.totalWorkspaces}</Typography>
                        <Typography variant="body2" color="text.secondary">Workspaces</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h4" color="primary">{providerDetails.stats.totalBookings}</Typography>
                        <Typography variant="body2" color="text.secondary">Total Bookings</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h4" color="primary">${providerDetails.stats.totalRevenue}</Typography>
                        <Typography variant="body2" color="text.secondary">Total Revenue</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={actionDialog.open} onClose={handleCloseActionDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionDialog.type === 'delete'
            ? 'Delete Provider'
            : actionDialog.type === 'suspended'
            ? 'Suspend Provider'
            : 'Activate Provider'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {actionDialog.type === 'delete'
              ? `Are you sure you want to delete ${selectedProvider?.businessName}? This will also affect all their workspaces.`
              : actionDialog.type === 'suspended'
              ? `Are you sure you want to suspend ${selectedProvider?.businessName}?`
              : `Are you sure you want to activate ${selectedProvider?.businessName}?`}
          </Typography>
          {actionDialog.type !== 'active' && (
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Reason (optional)"
              value={actionDialog.reason}
              onChange={(e) => setActionDialog({ ...actionDialog, reason: e.target.value })}
              margin="normal"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseActionDialog}>Cancel</Button>
          <Button
            onClick={handleAction}
            variant="contained"
            color={actionDialog.type === 'delete' || actionDialog.type === 'suspended' ? 'error' : 'primary'}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};

export default Providers;
