import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userApi } from '../api/users';
import {
    Box, Typography, Button, Chip, Paper, Grid,
    CircularProgress, Alert, TextField, Dialog,
    DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function InfoRow({ label, value }) {
    return (
        <Box display="flex" py={0.5}>
            <Typography variant="body2" color="text.secondary" sx={{ width: 200, flexShrink: 0 }}>
                {label}
            </Typography>
            <Typography variant="body2">{value ?? '-'}</Typography>
        </Box>
    );
}

export default function UserDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionMsg, setActionMsg] = useState('');
    const [pwDialog, setPwDialog] = useState(false);
    const [newPassword, setNewPassword] = useState('');

    const load = async () => {
        try {
            const res = await userApi.getById(id);
            setUser(res.data);
        } catch {
            setError('Failed to load user');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [id]);

    const handleAction = async (action) => {
        try {
            if (action === 'lock') await userApi.lock(id);
            if (action === 'unlock') await userApi.unlock(id);
            if (action === 'cancel') await userApi.cancel(id);
            setActionMsg('Action completed');
            load();
        } catch {
            setActionMsg('Action failed');
        }
    };

    const handlePasswordChange = async () => {
        try {
            await userApi.changePassword(id, newPassword);
            setActionMsg('Password changed successfully');
            setPwDialog(false);
            setNewPassword('');
        } catch {
            setActionMsg('Password change failed');
        }
    };

    if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!user) return null;

    return (
        <Box>
            <Box display="flex" alignItems="center" mb={2} gap={2}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/users')}>Back</Button>
                <Typography variant="h5" sx={{ flexGrow: 1 }}>
                    {user.firstName} {user.lastName}
                </Typography>
                <Chip label={user.active ? 'Active' : 'Inactive'}
                      color={user.active ? 'success' : 'default'} />
                {user.locked && <Chip label="Locked" color="warning" />}
                <Button variant="outlined" onClick={() => setPwDialog(true)}>Change Password</Button>
                {!user.locked
                    ? <Button variant="contained" color="warning" onClick={() => handleAction('lock')}>Lock</Button>
                    : <Button variant="contained" color="success" onClick={() => handleAction('unlock')}>Unlock</Button>
                }
                {!user.cancelled &&
                    <Button variant="contained" color="error" onClick={() => handleAction('cancel')}>Cancel</Button>}
            </Box>

            {actionMsg && <Alert severity="info" sx={{ mb: 2 }} onClose={() => setActionMsg('')}>{actionMsg}</Alert>}

            <Paper sx={{ p: 3 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" fontWeight="bold" mb={1}>User Info</Typography>
                        <InfoRow label="ID" value={user.id} />
                        <InfoRow label="First Name" value={user.firstName} />
                        <InfoRow label="Last Name" value={user.lastName} />
                        <InfoRow label="Email" value={user.email} />
                        <InfoRow label="Role" value={user.role} />
                        <InfoRow label="Internal" value={user.internal ? 'Yes' : 'No'} />
                        <InfoRow label="External" value={user.external ? 'Yes' : 'No'} />
                        <InfoRow label="Status" value={user.status} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" fontWeight="bold" mb={1}>Contact & Dates</Typography>
                        <InfoRow label="Contact Email" value={user.contactEmail} />
                        <InfoRow label="Contact Phone" value={user.contactPhone} />
                        <InfoRow label="Contact Mobile" value={user.contactMobile} />
                        <InfoRow label="Contact Position" value={user.contactPosition} />
                        <InfoRow label="Register Date" value={user.registerDate ? new Date(user.registerDate).toLocaleDateString() : null} />
                        <InfoRow label="Activate Date" value={user.activateDate ? new Date(user.activateDate).toLocaleDateString() : null} />
                        <InfoRow label="Last Login" value={user.loginDate ? new Date(user.loginDate).toLocaleString() : null} />
                        <InfoRow label="Company ID" value={user.company?.id} />
                    </Grid>
                </Grid>
            </Paper>

            <Dialog open={pwDialog} onClose={() => setPwDialog(false)}>
                <DialogTitle>Change Password</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth label="New Password" type="password"
                        value={newPassword} onChange={e => setNewPassword(e.target.value)}
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPwDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handlePasswordChange}>Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}