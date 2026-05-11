import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userApi } from '../api/users';
import {
    Box, Typography, Button, Chip, Paper, Grid,
    CircularProgress, Alert, TextField, Dialog,
    DialogTitle, DialogContent, DialogActions,
    FormControl, InputLabel, Select, MenuItem,
    FormControlLabel, Switch
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';

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

const EMPTY_FORM = {
    firstName: '', lastName: '', email: '', password: '',
    role: 'ROLE_USER', internal: false, external: true,
    contactEmail: '', contactPhone: '', contactMobile: '',
    contactPosition: '',
};

const ROLES = [
    { value: 'ROLE_ADMIN', label: 'Admin' },
    { value: 'ROLE_USER', label: 'User' },
    { value: 'ROLE_VIEWER', label: 'Viewer (Monitoring)' },
];

function UserForm({ initial, onSave, onCancel, saving, saveError }) {
    const [form, setForm] = useState(initial || EMPTY_FORM);
    const set = (field, value) => setForm(f => ({ ...f, [field]: value }));
    const isNew = !initial;

    return (
        <Paper sx={{ p: 3 }}>
            {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}
            <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle1" fontWeight="bold">User Info</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth label="First Name" value={form.firstName || ''}
                               onChange={e => set('firstName', e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth label="Last Name" value={form.lastName || ''}
                               onChange={e => set('lastName', e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth label="Email" value={form.email || ''}
                               onChange={e => set('email', e.target.value)} required />
                </Grid>
                {isNew && (
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField fullWidth label="Password" type="password"
                                   value={form.password || ''}
                                   onChange={e => set('password', e.target.value)} required />
                    </Grid>
                )}
                <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth>
                        <InputLabel>Role</InputLabel>
                        <Select value={form.role || 'ROLE_USER'} label="Role"
                                onChange={e => set('role', e.target.value)}>
                            {ROLES.map(r => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                    <FormControlLabel
                        control={<Switch checked={form.internal || false}
                                         onChange={e => set('internal', e.target.checked)} />}
                        label="Internal User"
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                    <FormControlLabel
                        control={<Switch checked={form.external || false}
                                         onChange={e => set('external', e.target.checked)} />}
                        label="External User"
                    />
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle1" fontWeight="bold" mt={1}>Contact</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth label="Contact Email" value={form.contactEmail || ''}
                               onChange={e => set('contactEmail', e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth label="Contact Phone" value={form.contactPhone || ''}
                               onChange={e => set('contactPhone', e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth label="Contact Mobile" value={form.contactMobile || ''}
                               onChange={e => set('contactMobile', e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth label="Contact Position" value={form.contactPosition || ''}
                               onChange={e => set('contactPosition', e.target.value)} />
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <Box display="flex" gap={2} mt={2}>
                        <Button variant="contained" startIcon={<SaveIcon />}
                                onClick={() => onSave(form)} disabled={saving}>
                            {saving ? 'Saving...' : 'Save User'}
                        </Button>
                        <Button onClick={onCancel}>Cancel</Button>
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
}

export default function UserDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = !id || id === 'new';

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(!isNew);
    const [error, setError] = useState('');
    const [actionMsg, setActionMsg] = useState('');
    const [editing, setEditing] = useState(isNew);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
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

    useEffect(() => { if (!isNew) load(); }, []);

    const handleSave = async (form) => {
        setSaving(true);
        setSaveError('');
        try {
            if (isNew) {
                const res = await userApi.create(form);
                navigate(`/users/${res.data.id}`);
            } else {
                await userApi.update(id, form);
                setEditing(false);
                load();
                setActionMsg('User saved successfully');
            }
        } catch (e) {
            setSaveError(e.response?.data?.error || e.message || 'Save failed');
        } finally {
            setSaving(false);
        }
    };

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

    if (isNew) {
        return (
            <Box>
                <Box display="flex" alignItems="center" mb={2} gap={2}>
                    <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/users')}>Back</Button>
                    <Typography variant="h5">New User</Typography>
                </Box>
                <UserForm
                    onSave={handleSave}
                    onCancel={() => navigate('/users')}
                    saving={saving}
                    saveError={saveError}
                />
            </Box>
        );
    }

    if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!user) return null;

    if (editing) {
        return (
            <Box>
                <Box display="flex" alignItems="center" mb={2} gap={2}>
                    <Button startIcon={<ArrowBackIcon />} onClick={() => setEditing(false)}>Back</Button>
                    <Typography variant="h5">Edit: {user.firstName} {user.lastName}</Typography>
                </Box>
                <UserForm
                    initial={user}
                    onSave={handleSave}
                    onCancel={() => setEditing(false)}
                    saving={saving}
                    saveError={saveError}
                />
            </Box>
        );
    }

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
                <Button variant="outlined" onClick={() => setEditing(true)}>Edit</Button>
                <Button variant="outlined" onClick={() => setPwDialog(true)}>Change Password</Button>
                {!user.locked
                    ? <Button variant="contained" color="warning"
                              onClick={() => handleAction('lock')}>Lock</Button>
                    : <Button variant="contained" color="success"
                              onClick={() => handleAction('unlock')}>Unlock</Button>}
                {!user.cancelled &&
                    <Button variant="contained" color="error"
                            onClick={() => handleAction('cancel')}>Cancel</Button>}
            </Box>

            {actionMsg && <Alert severity="info" sx={{ mb: 2 }} onClose={() => setActionMsg('')}>{actionMsg}</Alert>}

            <Paper sx={{ p: 3 }}>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
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
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="subtitle1" fontWeight="bold" mb={1}>Contact & Dates</Typography>
                        <InfoRow label="Contact Email" value={user.contactEmail} />
                        <InfoRow label="Contact Phone" value={user.contactPhone} />
                        <InfoRow label="Contact Mobile" value={user.contactMobile} />
                        <InfoRow label="Contact Position" value={user.contactPosition} />
                        <InfoRow label="Register Date" value={user.registerDate ? new Date(user.registerDate).toLocaleDateString() : null} />
                        <InfoRow label="Last Login" value={user.loginDate ? new Date(user.loginDate).toLocaleString() : null} />
                        <InfoRow label="Company ID" value={user.company?.id} />
                    </Grid>
                </Grid>
            </Paper>

            <Dialog open={pwDialog} onClose={() => setPwDialog(false)}>
                <DialogTitle>Change Password</DialogTitle>
                <DialogContent>
                    <TextField fullWidth label="New Password" type="password"
                               value={newPassword} onChange={e => setNewPassword(e.target.value)}
                               sx={{ mt: 1 }} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPwDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handlePasswordChange}>Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}