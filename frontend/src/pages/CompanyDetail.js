import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { companyApi } from '../api/companies';
import {
    Box, Typography, Button, Chip, Paper, Grid,
    CircularProgress, Alert, TextField, MenuItem,
    Select, FormControl, InputLabel, Tabs, Tab
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';

const EMPTY_FORM = {
    companyName: '', taxId: '', businessDesc: '',
    phisAddress: '', legalAddress: '', webSite: '',
    bankCode1: '', bankAccount1: '', note: '',
    vatPayer: false,
    contactEmail: '', contactPhone: '', contactMobile: '',
    contactName: '', contactSurname: '', contactPosition: '',
    type: null, category: null,
};

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

function CompanyForm({ initial, categories, companyTypes, onSave, onCancel, saving, saveError }) {
    const [form, setForm] = useState(initial || EMPTY_FORM);
    const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

    return (
        <Paper sx={{ p: 3 }}>
            {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}
            <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle1" fontWeight="bold">Company Info</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth label="Company Name" value={form.companyName || ''}
                               onChange={e => set('companyName', e.target.value)} required />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth label="Tax ID" value={form.taxId || ''}
                               onChange={e => set('taxId', e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth>
                        <InputLabel>Type</InputLabel>
                        <Select value={form.type?.id || ''} label="Type"
                                onChange={e => set('type', e.target.value ? { id: e.target.value } : null)}>
                            <MenuItem value="">None</MenuItem>
                            {companyTypes.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth>
                        <InputLabel>Category</InputLabel>
                        <Select value={form.category?.id || ''} label="Category"
                                onChange={e => set('category', e.target.value ? { id: e.target.value } : null)}>
                            <MenuItem value="">None</MenuItem>
                            {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <TextField fullWidth label="Business Description" value={form.businessDesc || ''}
                               onChange={e => set('businessDesc', e.target.value)} multiline rows={2} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle1" fontWeight="bold" mt={1}>Contact</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth label="Contact Name" value={form.contactName || ''}
                               onChange={e => set('contactName', e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth label="Contact Surname" value={form.contactSurname || ''}
                               onChange={e => set('contactSurname', e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth label="Contact Position" value={form.contactPosition || ''}
                               onChange={e => set('contactPosition', e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth label="Email" value={form.contactEmail || ''}
                               onChange={e => set('contactEmail', e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth label="Phone" value={form.contactPhone || ''}
                               onChange={e => set('contactPhone', e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth label="Mobile" value={form.contactMobile || ''}
                               onChange={e => set('contactMobile', e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle1" fontWeight="bold" mt={1}>Address & Banking</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth label="Physical Address" value={form.phisAddress || ''}
                               onChange={e => set('phisAddress', e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth label="Legal Address" value={form.legalAddress || ''}
                               onChange={e => set('legalAddress', e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth label="Bank Code" value={form.bankCode1 || ''}
                               onChange={e => set('bankCode1', e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth label="Bank Account" value={form.bankAccount1 || ''}
                               onChange={e => set('bankAccount1', e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth label="Website" value={form.webSite || ''}
                               onChange={e => set('webSite', e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <TextField fullWidth label="Note" value={form.note || ''}
                               onChange={e => set('note', e.target.value)} multiline rows={2} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <Box display="flex" gap={2} mt={2}>
                        <Button variant="contained" startIcon={<SaveIcon />}
                                onClick={() => onSave(form)} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Company'}
                        </Button>
                        <Button onClick={onCancel}>Cancel</Button>
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
}

export default function CompanyDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = !id || id === 'new';

    const [company, setCompany] = useState(null);
    const [users, setUsers] = useState([]);
    const [files, setFiles] = useState([]);
    const [tab, setTab] = useState(0);
    const [loading, setLoading] = useState(!isNew);
    const [error, setError] = useState('');
    const [actionMsg, setActionMsg] = useState('');
    const [editing, setEditing] = useState(isNew);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [categories, setCategories] = useState([]);
    const [companyTypes, setCompanyTypes] = useState([]);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [fileDescription, setFileDescription] = useState('');

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const loadDropdowns = async () => {
        try {
            const [catRes, dictRes] = await Promise.all([
                fetch('http://localhost:8080/api/categories', { headers }).then(r => r.json()),
                fetch('http://localhost:8080/api/dictionary/items', { headers }).then(r => r.json()),
            ]);
            setCategories(catRes);
            setCompanyTypes(dictRes.filter(d => d.key?.startsWith('key.companyType')));
        } catch {}
    };

    const load = async () => {
        setLoading(true);
        try {
            const [compRes, usersRes] = await Promise.all([
                companyApi.getById(id),
                companyApi.getUsers(id),
            ]);
            setCompany(compRes.data);
            setUsers(usersRes.data);
            await loadDropdowns();
        } catch {
            setError('Failed to load company');
        } finally {
            setLoading(false);
        }
    };

    const loadFiles = async () => {
        try {
            const res = await fetch(`http://localhost:8080/api/companies/${id}/files`, { headers });
            setFiles(await res.json());
        } catch {}
    };

    useEffect(() => {
        if (isNew) loadDropdowns();
        else load();
    }, []);

    useEffect(() => {
        if (!isNew && tab === 2) loadFiles();
    }, [tab]);

    const handleSave = async (form) => {
        setSaving(true);
        setSaveError('');
        try {
            if (isNew) {
                const res = await companyApi.create(form);
                navigate(`/companies/${res.data.id}`);
            } else {
                await companyApi.update(id, form);
                setEditing(false);
                load();
                setActionMsg('Company saved successfully');
            }
        } catch (e) {
            setSaveError(e.response?.data?.error || e.message || 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = async () => {
        try {
            await companyApi.cancel(id);
            setActionMsg('Company cancelled');
            load();
        } catch {
            setActionMsg('Action failed');
        }
    };
    const handleInvite = async () => {
        try {
            await fetch(`http://localhost:8080/api/companies/${id}/invite`, {
                method: 'POST', headers
            });
            setActionMsg('Company invited successfully - user account created and credentials sent');
            load();
        } catch {
            setActionMsg('Invite failed');
        }
    };
    const downloadFile = async (url, fileName) => {
        try {
            const res = await fetch(url, { headers });
            const blob = await res.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = fileName || 'download';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(blobUrl);
        } catch {
            setActionMsg('Download failed');
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingFile(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            if (fileDescription) formData.append('description', fileDescription);
            await fetch(`http://localhost:8080/api/companies/${id}/files`, {
                method: 'POST', headers, body: formData
            });
            setActionMsg(`File "${file.name}" uploaded successfully`);
            loadFiles();
        } catch {
            setActionMsg('Upload failed');
        } finally {
            setUploadingFile(false);
            e.target.value = '';
        }
    };

    const userColumns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'firstName', headerName: 'First Name', width: 130 },
        { field: 'lastName', headerName: 'Last Name', width: 130 },
        { field: 'email', headerName: 'Email', flex: 1 },
        { field: 'role', headerName: 'Role', width: 130 },
        { field: 'active', headerName: 'Active', width: 90,
            renderCell: p => <Chip label={p.value ? 'Active' : 'Inactive'}
                                   color={p.value ? 'success' : 'default'} size="small" /> },
        { field: 'actions', headerName: '', width: 90,
            renderCell: p => (
                <Button size="small" onClick={() => navigate(`/users/${p.row.id}`)}>View</Button>
            )}
    ];

    const fileColumns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'fileName', headerName: 'File Name', flex: 1 },
        { field: 'fileDescription', headerName: 'Description', width: 200 },
        { field: 'fileSize', headerName: 'Size (bytes)', width: 120 },
        { field: 'fileDate', headerName: 'Date', width: 160,
            renderCell: p => p.value ? new Date(p.value).toLocaleString() : '-' },
        { field: 'fileUser', headerName: 'Uploaded By', width: 150 },
        { field: 'actions', headerName: '', width: 160, sortable: false,
            renderCell: p => (
                <Box display="flex" gap={0.5}>
                    <Button size="small"
                            onClick={() => downloadFile(`http://localhost:8080/api/companies/files/${p.row.id}/download`, p.row.fileName)}>
                        Download
                    </Button>
                    <Button size="small" color="error"
                            onClick={() => fetch(`http://localhost:8080/api/companies/files/${p.row.id}`, {
                                method: 'DELETE', headers
                            }).then(() => loadFiles())}>
                        Delete
                    </Button>
                </Box>
            )}
    ];

    if (isNew) {
        return (
            <Box>
                <Box display="flex" alignItems="center" mb={2} gap={2}>
                    <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/companies')}>Back</Button>
                    <Typography variant="h5">New Company</Typography>
                </Box>
                {categories.length > 0 || companyTypes.length > 0 ? (
                    <CompanyForm categories={categories} companyTypes={companyTypes}
                                 onSave={handleSave} onCancel={() => navigate('/companies')}
                                 saving={saving} saveError={saveError} />
                ) : (
                    <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>
                )}
            </Box>
        );
    }

    if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    if (editing) {
        return (
            <Box>
                <Box display="flex" alignItems="center" mb={2} gap={2}>
                    <Button startIcon={<ArrowBackIcon />} onClick={() => setEditing(false)}>Back</Button>
                    <Typography variant="h5">Edit: {company?.companyName}</Typography>
                </Box>
                <CompanyForm initial={company} categories={categories} companyTypes={companyTypes}
                             onSave={handleSave} onCancel={() => setEditing(false)}
                             saving={saving} saveError={saveError} />
            </Box>
        );
    }

    return (
        <Box>
            <Box display="flex" alignItems="center" mb={2} gap={2}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/companies')}>Back</Button>
                <Typography variant="h5" sx={{ flexGrow: 1 }}>{company?.companyName}</Typography>
                {company && <Chip label={company.status?.name || ''} size="small" />}
                <Button variant="outlined" onClick={() => setEditing(true)}>Edit</Button>
                {company && company.status?.key === 'key.companyStatus.created' && (
                    <Button variant="contained" color="primary" onClick={handleInvite}>
                        Invite Company
                    </Button>
                )}
                {company && company.status?.key !== 'key.companyStatus.cancelled' && (
                    <Button variant="contained" color="error" onClick={handleCancel}>Cancel Company</Button>
                )}
            </Box>

            {actionMsg && <Alert severity="info" sx={{ mb: 2 }} onClose={() => setActionMsg('')}>{actionMsg}</Alert>}

            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
                <Tab label="Details" />
                <Tab label="Users" />
                <Tab label="Files" />
            </Tabs>

            {tab === 0 && company && (
                <Paper sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle1" fontWeight="bold" mb={1}>Company Info</Typography>
                            <InfoRow label="ID" value={company.id} />
                            <InfoRow label="Company Name" value={company.companyName} />
                            <InfoRow label="Tax ID" value={company.taxId} />
                            <InfoRow label="Type" value={company.type?.name} />
                            <InfoRow label="Status" value={company.status?.name} />
                            <InfoRow label="Category" value={company.category?.name} />
                            <InfoRow label="VAT Payer" value={company.vatPayer ? 'Yes' : 'No'} />
                            <InfoRow label="Website" value={company.webSite} />
                            <InfoRow label="Business Desc" value={company.businessDesc} />
                            <InfoRow label="Note" value={company.note} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle1" fontWeight="bold" mb={1}>Contact</Typography>
                            <InfoRow label="Contact Name" value={company.contactName} />
                            <InfoRow label="Contact Surname" value={company.contactSurname} />
                            <InfoRow label="Contact Position" value={company.contactPosition} />
                            <InfoRow label="Email" value={company.contactEmail} />
                            <InfoRow label="Phone" value={company.contactPhone} />
                            <InfoRow label="Mobile" value={company.contactMobile} />
                            <Typography variant="subtitle1" fontWeight="bold" mb={1} mt={2}>Address & Banking</Typography>
                            <InfoRow label="Physical Address" value={company.phisAddress} />
                            <InfoRow label="Legal Address" value={company.legalAddress} />
                            <InfoRow label="Bank Code" value={company.bankCode1} />
                            <InfoRow label="Bank Account" value={company.bankAccount1} />
                        </Grid>
                    </Grid>
                </Paper>
            )}

            {tab === 1 && (
                <DataGrid rows={users} columns={userColumns} autoHeight
                          pageSizeOptions={[10, 20]} disableRowSelectionOnClick />
            )}

            {tab === 2 && (
                <Box>
                    <Box mb={2} display="flex" gap={2} alignItems="center" flexWrap="wrap">
                        <Typography variant="subtitle1">Company Files</Typography>
                        <TextField size="small" label="Description (optional)"
                                   value={fileDescription}
                                   onChange={e => setFileDescription(e.target.value)}
                                   sx={{ width: 250 }} />
                        <Button variant="contained" component="label" disabled={uploadingFile}>
                            {uploadingFile ? 'Uploading...' : 'Upload File'}
                            <input type="file" hidden onChange={handleFileUpload} />
                        </Button>
                    </Box>
                    <DataGrid rows={files} columns={fileColumns} autoHeight
                              pageSizeOptions={[10, 20]} disableRowSelectionOnClick />
                </Box>
            )}
        </Box>
    );
}