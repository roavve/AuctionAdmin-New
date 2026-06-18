import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { companyApi } from '../api/companies';
import {
    Box, Typography, Button, Chip, Paper, Grid,
    CircularProgress, Alert, TextField, MenuItem,
    Select, FormControl, InputLabel, Tabs, Tab, Divider
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HistoryIcon from '@mui/icons-material/History';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
const EMPTY_FORM = {
    companyName: '', taxId: '', businessDesc: '',
    phisAddress: '', legalAddress: '', webSite: '',
    bankCode1: '', bankAccount1: '', note: '',
    vatPayer: false,
    contactEmail: '', contactPhone: '', contactMobile: '',
    contactName: '', contactSurname: '', contactPosition: '',
    type: null, category: null,
};

function SectionTitle({ icon, title }) {
    return (
        <Box display="flex" alignItems="center" gap={1} mb={2}>
            {icon}
            <Typography variant="subtitle1" fontWeight="700" color="primary.main">
                {title}
            </Typography>
            <Divider sx={{ flex: 1, ml: 1 }} />
        </Box>
    );
}

function InfoRow({ label, value }) {
    return (
        <Box display="flex" alignItems="flex-start" py={0.6}>
            <Typography variant="body2" sx={{
                width: 160, flexShrink: 0, color: 'text.secondary',
                fontWeight: 500, fontSize: '0.78rem', pt: 0.1
            }}>
                {label}
            </Typography>
            <Typography variant="body2" sx={{
                fontWeight: 400, wordBreak: 'break-word',
                color: value && value !== '-' ? 'text.primary' : 'text.disabled'
            }}>
                {value ?? '-'}
            </Typography>
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

function BidHistoryTab({ companyId, headers }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`http://localhost:8080/api/companies/${companyId}/bid-history`, { headers })
            .then(r => r.json())
            .then(data => { setHistory(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, [companyId]);

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'auctionName', headerName: 'Auction', flex: 1,
            valueGetter: (value, row) => row.auction?.name || '-',
            renderCell: p => (
                <Button size="small" onClick={() => navigate(`/auctions/${p.row.auction?.id}`)}>
                    {p.row.auction?.name || '-'}
                </Button>
            )},
        { field: 'auctionProject', headerName: 'Project', width: 150,
            valueGetter: (value, row) => row.auction?.project?.name || '-' },
        { field: 'winner', headerName: 'Result', width: 100,
            renderCell: p => p.value
                ? <Chip label="WON" color="success" size="small" />
                : <Chip label="LOST" color="error" size="small" /> },
        { field: 'startBid', headerName: 'Start Bid', width: 110,
            valueGetter: (value, row) => row.auction?.startBidValue || '-' },
        { field: 'lastBid', headerName: 'Last Bid', width: 110,
            valueGetter: (value, row) => row.auction?.lastBidValue || '-' },
        { field: 'auctionStatus', headerName: 'Auction Status', width: 130,
            valueGetter: (value, row) => row.auction?.status?.name || '-',
            renderCell: p => <Chip label={p.row.auction?.status?.name || ''} size="small" /> },
    ];

    return (
        <Box>
            <Typography variant="subtitle1" mb={2} fontWeight="bold">
                Bid History ({history.length} auctions participated)
            </Typography>
            <DataGrid rows={history} columns={columns} autoHeight
                      loading={loading} pageSizeOptions={[10, 20, 50]}
                      disableRowSelectionOnClick />
        </Box>
    );
}

function ProjectStatsTab({ companyId, headers }) {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`http://localhost:8080/api/companies/${companyId}/project-stats`, { headers })
            .then(r => r.json())
            .then(data => { setStats(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, [companyId]);

    const columns = [
        { field: 'projectId', headerName: 'ID', width: 70 },

        { field: 'projectName', headerName: 'Project', flex: 1 },
        { field: 'auctionCount', headerName: 'Total Auctions', width: 130 },
        { field: 'wonCount', headerName: 'Won', width: 90,
            renderCell: p => <Chip label={p.value} color="success" size="small" /> },
        { field: 'lostCount', headerName: 'Lost', width: 90,
            renderCell: p => <Chip label={p.value} color="error" size="small" /> },
        { field: 'winRate', headerName: 'Win Rate', width: 110,
            valueGetter: (value, row) => row.auctionCount > 0
                ? ((row.wonCount / row.auctionCount) * 100).toFixed(1) + '%'
                : '0%' },
    ];

    return (
        <Box>
            <Typography variant="subtitle1" mb={2} fontWeight="bold">
                Project Statistics ({stats.length} projects participated)
            </Typography>
            <DataGrid
                rows={stats}
                getRowId={row => row.projectId}
                columns={columns}
                autoHeight
                loading={loading}
                pageSizeOptions={[10, 20]}
                disableRowSelectionOnClick
            />
        </Box>
    );
}

function AuctionInvitationsTab({ companyId, headers }) {
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`http://localhost:8080/api/companies/${companyId}/invitations`, { headers })
            .then(r => r.json())
            .then(data => { setInvitations(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, [companyId]);

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'auction', headerName: 'Auction', flex: 1,
            renderCell: p => (
                <Button size="small" onClick={() => navigate(`/auctions/${p.value?.id}`)}>
                    {p.value?.name || '-'}
                </Button>
            )},
        { field: 'status', headerName: 'Status', width: 130,
            renderCell: p => <Chip label={p.value?.name || ''} size="small" /> },
        { field: 'dateInvited', headerName: 'Date Invited', width: 160,
            renderCell: p => p.value ? new Date(p.value).toLocaleDateString() : '-' },
        { field: 'dateAccepted', headerName: 'Date Accepted', width: 160,
            renderCell: p => p.value ? new Date(p.value).toLocaleDateString() : '-' },
    ];

    return (
        <Box>
            <Typography variant="subtitle1" mb={2} fontWeight="bold">
                Auction Invitations ({invitations.length})
            </Typography>
            <DataGrid rows={invitations} columns={columns} autoHeight
                      loading={loading} pageSizeOptions={[10, 20]}
                      disableRowSelectionOnClick />
        </Box>
    );
}
function CompanyCategoriesTab({ companyId, headers }) {
    const [categories, setCategories] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addDialog, setAddDialog] = useState(false);
    const [form, setForm] = useState({ categoryId: '', subCategoryId: '' });
    const [subCategories, setSubCategories] = useState([]);

    const load = async () => {
        setLoading(true);
        try {
            const [catRes, allCatRes] = await Promise.all([
                fetch(`http://localhost:8080/api/companies/${companyId}/categories`, { headers })
                    .then(r => r.json()),
                fetch('http://localhost:8080/api/categories', { headers })
                    .then(r => r.json()),
            ]);
            setCategories(catRes);
            setAllCategories(allCatRes.filter(c => !c.parent));
        } catch {}
        setLoading(false);
    };

    useEffect(() => { load(); }, [companyId]);

    const handleCategoryChange = async (categoryId) => {
        setForm(f => ({ ...f, categoryId, subCategoryId: '' }));
        try {
            const res = await fetch('http://localhost:8080/api/categories', { headers });
            const all = await res.json();
            setSubCategories(all.filter(c => c.parent?.id === parseInt(categoryId)));
        } catch {}
    };

    const handleAdd = async () => {
        try {
            await fetch(`http://localhost:8080/api/companies/${companyId}/categories`, {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    categoryId: parseInt(form.categoryId),
                    subCategoryId: parseInt(form.subCategoryId)
                })
            });
            setAddDialog(false);
            setForm({ categoryId: '', subCategoryId: '' });
            load();
        } catch {}
    };

    const handleDelete = async (id) => {
        await fetch(`http://localhost:8080/api/companies/categories/${id}`, {
            method: 'DELETE', headers
        });
        load();
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'category', headerName: 'Category', flex: 1,
            renderCell: p => p.value?.name || '-' },
        { field: 'subCategory', headerName: 'Sub Category', flex: 1,
            renderCell: p => p.value?.name || '-' },
        { field: 'actions', headerName: '', width: 100, sortable: false,
            renderCell: p => (
                <Button size="small" color="error"
                        onClick={() => handleDelete(p.row.id)}>Remove</Button>
            )}
    ];

    return (
        <Box>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Typography variant="subtitle1" fontWeight="bold">
                    Company Categories ({categories.length})
                </Typography>
                <Button variant="contained" size="small"
                        onClick={() => setAddDialog(true)}>
                    Add Category
                </Button>
            </Box>

            <DataGrid rows={categories} columns={columns} autoHeight
                      loading={loading} pageSizeOptions={[10, 20]}
                      disableRowSelectionOnClick />

            <Dialog open={addDialog} onClose={() => setAddDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add Category</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
                        <InputLabel>Category</InputLabel>
                        <Select value={form.categoryId} label="Category"
                                onChange={e => handleCategoryChange(e.target.value)}>
                            {allCategories.map(c => (
                                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth disabled={!form.categoryId}>
                        <InputLabel>Sub Category</InputLabel>
                        <Select value={form.subCategoryId} label="Sub Category"

                                onChange={e => setForm(f => ({ ...f, subCategoryId: e.target.value }))}>
                            {subCategories.map(c => (
                                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleAdd}
                            disabled={!form.categoryId || !form.subCategoryId}>
                        Add
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
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
                window.location.href = `/companies/${res.data.id}`;
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

    const fmt = (date) => date ? new Date(date).toLocaleDateString() : '-';

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
            {/* Header Banner */}
            <Box display="flex" alignItems="center" gap={2} mb={2} flexWrap="wrap">
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/companies')} variant="outlined">
                    Back
                </Button>
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" fontWeight="700">{company?.companyName}</Typography>
                    <Box display="flex" gap={1} mt={0.5} flexWrap="wrap">
                        <Chip label={company?.status?.name || 'Unknown'} size="small" color="primary" />
                        {company?.taxId && <Chip label={`Tax ID: ${company.taxId}`} size="small" variant="outlined" />}
                        {company?.category && <Chip label={company.category.name} size="small" variant="outlined" />}
                    </Box>
                </Box>
                <Box display="flex" gap={1}>
                    <Button variant="outlined" onClick={() => setEditing(true)}>Edit</Button>
                    {company?.status?.key === 'key.companyStatus.created' && (
                        <Button variant="contained" color="success" onClick={handleInvite}>Invite</Button>
                    )}
                    {company?.status?.key !== 'key.companyStatus.cancelled' && (
                        <Button variant="contained" color="error" onClick={handleCancel}>Cancel</Button>
                    )}
                </Box>
            </Box>

            {actionMsg && <Alert severity="info" sx={{ mb: 2 }} onClose={() => setActionMsg('')}>{actionMsg}</Alert>}

            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}
                  variant="scrollable" scrollButtons="auto">
                <Tab label="Details" />
                <Tab label="Users" />
                <Tab label="Files" />
                <Tab label="Bid History" />
                <Tab label="Project Stats" />
                <Tab label="Auction Invitations" />
                <Tab label="Categories" />
            </Tabs>

            {tab === 0 && company && (
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper sx={{ p: 2.5, height: '100%' }}>
                            <SectionTitle icon={<BusinessIcon color="primary" fontSize="small" />} title="Company Info" />
                            <InfoRow label="ID" value={company.id} />
                            <InfoRow label="Company Name" value={company.companyName} />
                            <InfoRow label="Tax ID" value={company.taxId} />
                            <InfoRow label="Type" value={company.type?.name} />
                            <InfoRow label="Status" value={company.status?.name} />
                            <InfoRow label="Category" value={company.category?.name} />
                            <InfoRow label="Sub Category" value={company.subCategory?.name} />
                            <InfoRow label="VAT Payer" value={company.vatPayer ? 'Yes' : 'No'} />
                            <InfoRow label="Website" value={company.webSite} />
                            <InfoRow label="Business Desc" value={company.businessDesc} />
                            <InfoRow label="Note" value={company.note} />
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper sx={{ p: 2.5, mb: 2 }}>
                            <SectionTitle icon={<PersonIcon color="primary" fontSize="small" />} title="Contact" />
                            <InfoRow label="Name" value={`${company.contactName || ''} ${company.contactSurname || ''}`.trim() || '-'} />
                            <InfoRow label="Position" value={company.contactPosition} />
                            <InfoRow label="Email" value={company.contactEmail} />
                            <InfoRow label="Phone" value={company.contactPhone} />
                            <InfoRow label="Mobile" value={company.contactMobile} />
                        </Paper>
                        <Paper sx={{ p: 2.5 }}>
                            <SectionTitle icon={<LocationOnIcon color="primary" fontSize="small" />} title="Address & Banking" />
                            <InfoRow label="Physical Address" value={company.phisAddress} />
                            <InfoRow label="Legal Address" value={company.legalAddress} />
                            <InfoRow label="Bank Code" value={company.bankCode1} />
                            <InfoRow label="Bank Account" value={company.bankAccount1} />
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper sx={{ p: 2.5, height: '100%' }}>
                            <SectionTitle icon={<HistoryIcon color="primary" fontSize="small" />} title="Dates & History" />
                            <InfoRow label="Created By" value={company.flowCreatedBy} />
                            <InfoRow label="Admin User" value={company.adminUser} />
                            <InfoRow label="Create Date" value={fmt(company.flowDateCreated)} />
                            <InfoRow label="Invite Date" value={fmt(company.flowDateInvited)} />
                            <InfoRow label="Invited By" value={company.flowInvitedBy} />
                            <InfoRow label="Register Date" value={fmt(company.flowDateRegistered)} />
                            <InfoRow label="Activation Date" value={fmt(company.flowDateActivated)} />
                            <InfoRow label="Cancel Date" value={fmt(company.flowDateCancelled)} />
                            <InfoRow label="Cancelled By" value={company.flowCancelledBy} />
                            <InfoRow label="Request ID" value={company.fromReqId} />
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {tab === 1 && (
                <DataGrid rows={users} columns={userColumns} autoHeight
                          pageSizeOptions={[10, 20]} disableRowSelectionOnClick />
            )}

            {tab === 2 && (
                <Box>
                    <Box mb={2} display="flex" gap={2} alignItems="center">
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

            {tab === 3 && <BidHistoryTab companyId={id} headers={headers} />}
            {tab === 4 && <ProjectStatsTab companyId={id} headers={headers} />}
            {tab === 5 && <AuctionInvitationsTab companyId={id} headers={headers} />}
            {tab === 6 && <CompanyCategoriesTab companyId={id} headers={headers} />}
        </Box>
    );
}