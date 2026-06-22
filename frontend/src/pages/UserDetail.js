import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userApi } from '../api/users';
import {
    Box, Typography, Button, Chip, Paper, Grid,
    CircularProgress, Alert, TextField, Dialog,
    DialogTitle, DialogContent, DialogActions,
    FormControl, InputLabel, Select, MenuItem,
    FormControlLabel, Switch, Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import HistoryIcon from '@mui/icons-material/History';

function SectionTitle({ icon, title }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            {icon}
            <Typography variant="subtitle1" fontWeight="700" color="primary.main">{title}</Typography>
            <Divider sx={{ flex: 1, ml: 1 }} />
        </Box>
    );
}

function InfoRow({ label, value }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', py: 0.6 }}>
            <Typography variant="body2" sx={{
                width: 160, flexShrink: 0, color: 'text.secondary',
                fontWeight: 500, fontSize: '0.78rem', pt: 0.1
            }}>
                {label}
            </Typography>
            <Typography variant="body2" sx={{
                wordBreak: 'break-word',
                color: value && value !== '-' ? 'text.primary' : 'text.disabled'
            }}>
                {value ?? '-'}
            </Typography>
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
    const [validationError, setValidationError] = useState('');
    const set = (field, value) => setForm(f => ({ ...f, [field]: value }));
    const isNew = !initial;

    const validate = () => {
        const missing = [];
        if (!form.firstName?.trim()) missing.push('First Name');
        if (!form.lastName?.trim()) missing.push('Last Name');
        if (!form.email?.trim()) missing.push('Email');
        if (isNew && !form.password?.trim()) missing.push('Password');
        if (!form.contactPosition?.trim()) missing.push('Contact Position');
        if (!form.contactEmail?.trim()) missing.push('Contact Email');
        if (!form.contactPhone?.trim()) missing.push('Contact Phone');
        if (!form.contactMobile?.trim()) missing.push('Contact Mobile');

        if (missing.length > 0) {
            return 'Please fill in required fields: ' + missing.join(', ');
        }
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(form.email)) {
            return 'Email is not a valid email address';
        }
        if (!emailRe.test(form.contactEmail)) {
            return 'Contact Email is not a valid email address';
        }
        if (isNew && form.password.length < 6) {
            return 'Password must be at least 6 characters';
        }
        return '';
    };

    const handleSaveClick = () => {
        const err = validate();
        if (err) {
            setValidationError(err);
            return;
        }
        setValidationError('');
        onSave(form);
    };

    return (
        <Paper sx={{ p: 3 }}>
            {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}
            {validationError && <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setValidationError('')}>{validationError}</Alert>}
            <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle1" fontWeight="bold">User Info</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth label="First Name *" value={form.firstName || ''}
                               onChange={e => set('firstName', e.target.value)} required />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth label="Last Name *" value={form.lastName || ''}
                               onChange={e => set('lastName', e.target.value)} required />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth label="Email *" value={form.email || ''}
                               onChange={e => set('email', e.target.value)} required />
                </Grid>
                {isNew && (
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField fullWidth label="Password *" type="password"
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
                        label="Internal User" />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                    <FormControlLabel
                        control={<Switch checked={form.external || false}
                                         onChange={e => set('external', e.target.checked)} />}
                        label="External User" />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle1" fontWeight="bold" mt={1}>Contact</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth label="Contact Email *" value={form.contactEmail || ''}
                               onChange={e => set('contactEmail', e.target.value)} required />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth label="Contact Phone *" value={form.contactPhone || ''}
                               onChange={e => set('contactPhone', e.target.value)} required />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth label="Contact Mobile *" value={form.contactMobile || ''}
                               onChange={e => set('contactMobile', e.target.value)} required />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth label="Contact Position *" value={form.contactPosition || ''}
                               onChange={e => set('contactPosition', e.target.value)} required />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <Button variant="contained" startIcon={<SaveIcon />}
                                onClick={handleSaveClick} disabled={saving}>
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
                window.location.href = `/users/${res.data.id}`;
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

    const fmt = (date) => date ? new Date(date).toLocaleDateString() : '-';
    const fmtTime = (date) => date ? new Date(date).toLocaleString() : '-';

    if (isNew) {
        return (
            <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                    <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/users')}>Back</Button>
                    <Typography variant="h5">New User</Typography>
                </Box>
                <UserForm onSave={handleSave} onCancel={() => navigate('/users')}
                          saving={saving} saveError={saveError} />
            </Box>
        );
    }

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!user) return null;

    if (editing) {
        return (
            <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                    <Button startIcon={<ArrowBackIcon />} onClick={() => setEditing(false)}>Back</Button>
                    <Typography variant="h5">Edit: {user.firstName} {user.lastName}</Typography>
                </Box>
                <UserForm initial={user} onSave={handleSave} onCancel={() => setEditing(false)}
                          saving={saving} saveError={saveError} />
            </Box>
        );
    }

    const roleLabel = { ROLE_ADMIN: 'Admin', ROLE_USER: 'User', ROLE_VIEWER: 'Viewer' }[user.role] || user.role;

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/users')} variant="outlined">
                    Back
                </Button>
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" fontWeight="700">
                        {user.firstName} {user.lastName}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                        <Chip label={user.active ? 'Active' : 'Inactive'}
                              color={user.active ? 'success' : 'default'} size="small" />
                        {user.locked && <Chip label="Locked" color="warning" size="small" />}
                        {user.cancelled && <Chip label="Cancelled" color="error" size="small" />}
                        <Chip label={roleLabel} size="small" variant="outlined" />
                        {user.internal && <Chip label="Internal" size="small" variant="outlined" />}
                        {user.external && <Chip label="External" size="small" variant="outlined" />}
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button variant="outlined" onClick={() => setEditing(true)}>Edit</Button>
                    <Button variant="outlined" onClick={() => setPwDialog(true)}>Change Password</Button>
                    {!user.locked
                        ? <Button variant="contained" color="warning" onClick={() => handleAction('lock')}>Lock</Button>
                        : <Button variant="contained" color="success" onClick={() => handleAction('unlock')}>Unlock</Button>}
                    {!user.cancelled &&
                        <Button variant="contained" color="error" onClick={() => handleAction('cancel')}>Cancel</Button>}
                </Box>
            </Box>

            {actionMsg && <Alert severity="info" sx={{ mb: 2 }} onClose={() => setActionMsg('')}>{actionMsg}</Alert>}

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 2.5 }}>
                        <SectionTitle icon={<PersonIcon color="primary" fontSize="small" />} title="User Info" />
                        <InfoRow label="ID" value={user.id} />
                        <InfoRow label="First Name" value={user.firstName} />
                        <InfoRow label="Last Name" value={user.lastName} />
                        <InfoRow label="Email" value={user.email} />
                        <InfoRow label="Role" value={roleLabel} />
                        <InfoRow label="Internal" value={user.internal ? 'Yes' : 'No'} />
                        <InfoRow label="External" value={user.external ? 'Yes' : 'No'} />
                        <InfoRow label="Status" value={user.status} />
                        {user.company && (
                            <InfoRow label="Company" value={user.company.companyName || `ID: ${user.company.id}`} />
                        )}
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 2.5 }}>
                        <SectionTitle icon={<ContactMailIcon color="primary" fontSize="small" />} title="Contact" />
                        <InfoRow label="Contact Email" value={user.contactEmail} />
                        <InfoRow label="Contact Phone" value={user.contactPhone} />
                        <InfoRow label="Contact Mobile" value={user.contactMobile} />
                        <InfoRow label="Contact Position" value={user.contactPosition} />
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 2.5 }}>
                        <SectionTitle icon={<HistoryIcon color="primary" fontSize="small" />} title="Dates" />
                        <InfoRow label="Register Date" value={fmt(user.registerDate)} />
                        <InfoRow label="Activate Date" value={fmt(user.activateDate)} />
                        <InfoRow label="Last Login" value={fmtTime(user.loginDate)} />
                        <InfoRow label="Lock Date" value={fmt(user.lockDate)} />
                        <InfoRow label="Cancel Date" value={fmt(user.cancelledDate)} />
                    </Paper>
                </Grid>
            </Grid>

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