import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Alert, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, Chip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import SaveIcon from '@mui/icons-material/Save';

export default function TextTemplates() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editTemplate, setEditTemplate] = useState(null);
    const [saving, setSaving] = useState(false);
    const [actionMsg, setActionMsg] = useState('');

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const load = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8080/api/templates', { headers });
            setRows(await res.json());
        } catch {
            setError('Failed to load templates');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch(`http://localhost:8080/api/templates/${editTemplate.id}`, {
                method: 'PUT',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify(editTemplate)
            });
            setActionMsg('Template saved');
            setEditTemplate(null);
            load();
        } catch {
            setActionMsg('Save failed');
        } finally {
            setSaving(false);
        }
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'name', headerName: 'Name', flex: 1 },
        { field: 'tkey', headerName: 'Key', flex: 1 },
        { field: 'disabled', headerName: 'Status', width: 100,
            renderCell: p => p.value
                ? <Chip label="Disabled" color="error" size="small" />
                : <Chip label="Active" color="success" size="small" /> },
        { field: 'actions', headerName: '', width: 90, sortable: false,
            renderCell: p => (
                <Button size="small" onClick={() => setEditTemplate({ ...p.row })}>Edit</Button>
            )}
    ];

    return (
        <Box>
            <Typography variant="h5" mb={2}>Text Templates</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {actionMsg && <Alert severity="info" sx={{ mb: 2 }} onClose={() => setActionMsg('')}>{actionMsg}</Alert>}

            <DataGrid rows={rows} columns={columns} loading={loading}
                      autoHeight disableRowSelectionOnClick pageSizeOptions={[20, 50]} />

            <Dialog open={!!editTemplate} onClose={() => setEditTemplate(null)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Template: {editTemplate?.name}</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <TextField fullWidth label="Name" value={editTemplate?.name || ''}
                               onChange={e => setEditTemplate(t => ({ ...t, name: e.target.value }))}
                               sx={{ mb: 2 }} />
                    <TextField fullWidth label="Key" value={editTemplate?.tkey || ''}
                               disabled sx={{ mb: 2 }} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditTemplate(null)}>Cancel</Button>
                    <Button variant="contained" startIcon={<SaveIcon />}
                            onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}