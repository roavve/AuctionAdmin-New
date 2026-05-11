import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectApi } from '../api/projects';
import {
    Box, Typography, Button, Chip, Alert, Paper,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Grid
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';

function ProjectForm({ initial, onSave, onCancel, saving, saveError }) {
    const [form, setForm] = useState(initial || { name: '', projectSum: '' });
    const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

    return (
        <Box>
            {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}
            <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                    <TextField fullWidth label="Project Name" value={form.name || ''}
                               onChange={e => set('name', e.target.value)} required />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <TextField fullWidth label="Project Sum" type="number"
                               value={form.projectSum || ''}
                               onChange={e => set('projectSum', e.target.value)} />
                </Grid>
            </Grid>
            <Box display="flex" gap={2} mt={2}>
                <Button variant="contained" startIcon={<SaveIcon />}
                        onClick={() => onSave(form)} disabled={saving}>
                    {saving ? 'Saving...' : 'Save'}
                </Button>
                <Button onClick={onCancel}>Cancel</Button>
            </Box>
        </Box>
    );
}

export default function Projects() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [dialog, setDialog] = useState(false);
    const [editProject, setEditProject] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [actionMsg, setActionMsg] = useState('');
    const [projectAuctions, setProjectAuctions] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [auctionsDialog, setAuctionsDialog] = useState(false);
    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const load = () => {
        setLoading(true);
        projectApi.getAll()
            .then(res => setRows(res.data))
            .catch(() => setError('Failed to load projects'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handleSave = async (form) => {
        setSaving(true);
        setSaveError('');
        try {
            if (editProject?.id) {
                await projectApi.update(editProject.id, form);
                setActionMsg('Project updated');
            } else {
                await projectApi.create(form);
                setActionMsg('Project created');
            }
            setDialog(false);
            setEditProject(null);
            load();
        } catch (e) {
            setSaveError(e.response?.data?.error || e.message || 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this project?')) return;
        try {
            await projectApi.delete(id);
            setActionMsg('Project deleted');
            load();
        } catch {
            setActionMsg('Delete failed');
        }
    };

    const viewAuctions = async (project) => {
        setSelectedProject(project);
        try {
            const res = await fetch(`http://localhost:8080/api/auctions/search?projectId=${project.id}&size=100`, { headers });
            const data = await res.json();
            setProjectAuctions(data.content || []);
        } catch {
            setProjectAuctions([]);
        }
        setAuctionsDialog(true);
    };

    const STATUS_COLORS = {
        'key.auctionStatus.draft': 'default',
        'key.auctionStatus.active': 'success',
        'key.auctionStatus.planned': 'info',
        'key.auctionStatus.completed': 'primary',
        'key.auctionStatus.cancelled': 'error',
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'name', headerName: 'Project Name', flex: 1 },
        { field: 'status', headerName: 'Status', width: 130,
            renderCell: p => <Chip label={p.value?.name || ''} size="small" /> },
        { field: 'projectSum', headerName: 'Sum', width: 130,
            renderCell: p => p.value ? p.value.toLocaleString() : '-' },
        { field: 'disabled', headerName: 'Disabled', width: 100,
            renderCell: p => p.value ? <Chip label="Disabled" color="error" size="small" /> : null },
        { field: 'actions', headerName: '', width: 240, sortable: false,
            renderCell: p => (
                <Box display="flex" gap={0.5}>
                    <Button size="small" onClick={() => viewAuctions(p.row)}>Auctions</Button>
                    <Button size="small" onClick={() => { setEditProject(p.row); setDialog(true); }}>Edit</Button>
                    <Button size="small" color="error" onClick={() => handleDelete(p.row.id)}>Delete</Button>
                </Box>
            )}
    ];

    const auctionColumns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'name', headerName: 'Name', flex: 1 },
        { field: 'status', headerName: 'Status', width: 130,
            renderCell: p => <Chip label={p.value?.name || ''} size="small"
                                   color={STATUS_COLORS[p.value?.key] || 'default'} /> },
        { field: 'startBidValue', headerName: 'Start Bid', width: 110 },
        { field: 'lastBidValue', headerName: 'Last Bid', width: 110 },
        { field: 'actions', headerName: '', width: 90,
            renderCell: p => (
                <Button size="small" onClick={() => { setAuctionsDialog(false); navigate(`/auctions/${p.row.id}`); }}>
                    View
                </Button>
            )}
    ];

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">Projects</Typography>
                <Button variant="contained" startIcon={<AddIcon />}
                        onClick={() => { setEditProject(null); setDialog(true); }}>
                    New Project
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {actionMsg && <Alert severity="info" sx={{ mb: 2 }} onClose={() => setActionMsg('')}>{actionMsg}</Alert>}

            <DataGrid rows={rows} columns={columns} loading={loading}
                      autoHeight disableRowSelectionOnClick pageSizeOptions={[20, 50]} />

            <Dialog open={dialog} onClose={() => { setDialog(false); setEditProject(null); }}
                    maxWidth="sm" fullWidth>
                <DialogTitle>{editProject?.id ? 'Edit Project' : 'New Project'}</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <ProjectForm
                        initial={editProject}
                        onSave={handleSave}
                        onCancel={() => { setDialog(false); setEditProject(null); }}
                        saving={saving}
                        saveError={saveError}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={auctionsDialog} onClose={() => setAuctionsDialog(false)}
                    maxWidth="lg" fullWidth>
                <DialogTitle>
                    Auctions in: {selectedProject?.name}
                    <Typography variant="body2" color="text.secondary">
                        {projectAuctions.length} auctions found
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <DataGrid rows={projectAuctions} columns={auctionColumns}
                              autoHeight disableRowSelectionOnClick pageSizeOptions={[10, 20, 50]} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAuctionsDialog(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}