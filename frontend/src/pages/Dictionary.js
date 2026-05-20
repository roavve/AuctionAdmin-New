import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Alert, Button, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, FormControlLabel, Switch, Grid
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';

export default function Dictionary() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionMsg, setActionMsg] = useState('');
    const [dialog, setDialog] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [form, setForm] = useState({ key: '', name: '', nameGE: '', sortOrder: '', disabled: false });
    const [saving, setSaving] = useState(false);

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    const load = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8080/api/dictionary/items', { headers });
            setRows(await res.json());
        } catch {
            setError('Failed to load dictionary items');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleOpen = (item = null) => {
        setEditItem(item);
        setForm(item ? {
            key: item.key || '',
            name: item.name || '',
            nameGE: item.nameGE || '',
            sortOrder: item.sortOrder || '',
            disabled: item.disabled || false
        } : { key: '', name: '', nameGE: '', sortOrder: '', disabled: false });
        setDialog(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const body = {
                key: form.key,
                name: form.name,
                nameGE: form.nameGE,
                sortOrder: form.sortOrder ? parseInt(form.sortOrder) : null,
                disabled: form.disabled
            };
            const url = editItem
                ? `http://localhost:8080/api/dictionary/items/${editItem.id}`
                : 'http://localhost:8080/api/dictionary/items';
            const method = editItem ? 'PUT' : 'POST';
            await fetch(url, { method, headers, body: JSON.stringify(body) });
            setActionMsg(editItem ? 'Item updated' : 'Item created');
            setDialog(false);
            load();
        } catch {
            setActionMsg('Save failed');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this dictionary item? This may break system functionality!')) return;
        try {
            await fetch(`http://localhost:8080/api/dictionary/items/${id}`, { method: 'DELETE', headers });
            setActionMsg('Item deleted');
            load();
        } catch {
            setActionMsg('Delete failed');
        }
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'key', headerName: 'Key', width: 250 },
        { field: 'name', headerName: 'Name (EN)', width: 200 },
        { field: 'nameGE', headerName: 'Name (GE)', width: 200 },
        { field: 'sortOrder', headerName: 'Order', width: 80 },
        { field: 'disabled', headerName: 'Status', width: 100,
            renderCell: p => p.value
                ? <Chip label="Disabled" color="error" size="small" />
                : <Chip label="Active" color="success" size="small" /> },
        { field: 'actions', headerName: '', width: 160, sortable: false,
            renderCell: p => (
                <Box display="flex" gap={0.5}>
                    <Button size="small" onClick={() => handleOpen(p.row)}>Edit</Button>
                    <Button size="small" color="error" onClick={() => handleDelete(p.row.id)}>Delete</Button>
                </Box>
            )}
    ];

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">Dictionary Items</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
                    New Item
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {actionMsg && <Alert severity="info" sx={{ mb: 2 }} onClose={() => setActionMsg('')}>{actionMsg}</Alert>}

            <DataGrid rows={rows} columns={columns} loading={loading}
                      autoHeight disableRowSelectionOnClick pageSizeOptions={[20, 50, 100]} />

            <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editItem ? 'Edit Dictionary Item' : 'New Dictionary Item'}</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        Be careful editing dictionary keys — they are used throughout the system.
                    </Alert>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                            <TextField fullWidth label="Key (e.g. key.auctionStatus.draft)"
                                       value={form.key}
                                       onChange={e => setForm(f => ({ ...f, key: e.target.value }))}
                                       disabled={!!editItem}
                                       helperText={editItem ? "Key cannot be changed after creation" : ""}
                                       required />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField fullWidth label="Name (English)" value={form.name}
                                       onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField fullWidth label="Name (Georgian)" value={form.nameGE}
                                       onChange={e => setForm(f => ({ ...f, nameGE: e.target.value }))} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField fullWidth label="Sort Order" type="number"
                                       value={form.sortOrder}
                                       onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <FormControlLabel
                                control={<Switch checked={form.disabled}
                                                 onChange={e => setForm(f => ({ ...f, disabled: e.target.checked }))} />}
                                label="Disabled" />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave}
                            disabled={saving || !form.key}>
                        {saving ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}