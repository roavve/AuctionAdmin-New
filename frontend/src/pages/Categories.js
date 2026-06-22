import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Chip, Alert, Button,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, FormControl, InputLabel, Select, MenuItem,
    FormControlLabel, Switch
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';

export default function Categories() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionMsg, setActionMsg] = useState('');
    const [dialog, setDialog] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [form, setForm] = useState({ name: '', parentId: '', disabled: false });
    const [saving, setSaving] = useState(false);
    const [parents, setParents] = useState([]);

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    const load = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8080/api/categories', { headers });
            setRows(await res.json());
        } catch {
            setError('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const loadParents = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/categories/parents', { headers });
            setParents(await res.json());
        } catch {}
    };

    useEffect(() => { load(); loadParents(); }, []);

    const handleOpen = (item = null) => {
        setEditItem(item);
        setForm(item ? {
            name: item.name || '',
            parentId: item.parent?.id || '',
            disabled: item.disabled || false
        } : { name: '', parentId: '', disabled: false });
        setDialog(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const body = {
                name: form.name,
                disabled: form.disabled,
                parent: form.parentId ? { id: form.parentId } : null
            };
            const url = editItem
                ? `http://localhost:8080/api/categories/${editItem.id}`
                : 'http://localhost:8080/api/categories';
            const method = editItem ? 'PUT' : 'POST';
            await fetch(url, { method, headers, body: JSON.stringify(body) });
            setActionMsg(editItem ? 'Category updated' : 'Category created');
            setDialog(false);
            load();
            loadParents();
        } catch {
            setActionMsg('Save failed');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this category?')) return;
        try {
            await fetch(`http://localhost:8080/api/categories/${id}`, { method: 'DELETE', headers });
            setActionMsg('Category deleted');
            load();
            loadParents();
        } catch {
            setActionMsg('Delete failed');
        }
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'name', headerName: 'Name', flex: 1 },
        { field: 'parent', headerName: 'Parent', width: 200,
            renderCell: p => p.value?.name || '-' },
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5">Categories</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
                    New Category
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {actionMsg && <Alert severity="info" sx={{ mb: 2 }} onClose={() => setActionMsg('')}>{actionMsg}</Alert>}

            <DataGrid rows={rows} columns={columns} loading={loading}
                      autoHeight disableRowSelectionOnClick pageSizeOptions={[20, 50, 100]} />

            <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editItem ? 'Edit Category' : 'New Category'}</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <TextField fullWidth label="Name" value={form.name}
                               onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                               sx={{ mb: 2 }} required />
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Parent Category (leave empty for top-level)</InputLabel>
                        <Select value={form.parentId} label="Parent Category (leave empty for top-level)"
                                onChange={e => setForm(f => ({ ...f, parentId: e.target.value }))}>
                            <MenuItem value="">None (Top Level)</MenuItem>
                            {parents.map(p => (
                                <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControlLabel
                        control={<Switch checked={form.disabled}
                                         onChange={e => setForm(f => ({ ...f, disabled: e.target.checked }))} />}
                        label="Disabled" />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave}
                            disabled={saving || !form.name}>
                        {saving ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}