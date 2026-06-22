import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Button, Alert, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Paper, Divider
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

export default function TextTemplates() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionMsg, setActionMsg] = useState('');
    const [editDialog, setEditDialog] = useState(false);
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState({ subject: '', emailBody: '', smsBody: '' });
    const [saving, setSaving] = useState(false);

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

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

    const handleEdit = (row) => {
        setSelected(row);
        setForm({
            subject: row.subject || '',
            emailBody: row.emailBody || '',
            smsBody: row.smsBody || '',
        });
        setEditDialog(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch(`http://localhost:8080/api/templates/${selected.id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ ...selected, ...form })
            });
            setActionMsg('Template saved successfully');
            setEditDialog(false);
            load();
        } catch {
            setActionMsg('Save failed');
        } finally {
            setSaving(false);
        }
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'name', headerName: 'Template Name', width: 220 },
        { field: 'tkey', headerName: 'Key', width: 220 },
        { field: 'subject', headerName: 'Subject', flex: 1 },
        { field: 'disabled', headerName: 'Status', width: 100,
            renderCell: p => <Chip label={p.value ? 'Disabled' : 'Active'}
                                   color={p.value ? 'error' : 'success'} size="small" /> },
        { field: 'actions', headerName: '', width: 90, sortable: false,
            renderCell: p => (
                <Button size="small" onClick={() => handleEdit(p.row)}>Edit</Button>
            )}
    ];

    return (
        <Box>
            <Typography variant="h5" mb={2}>Text Templates</Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {actionMsg && <Alert severity="info" sx={{ mb: 2 }} onClose={() => setActionMsg('')}>{actionMsg}</Alert>}

            <DataGrid rows={rows} columns={columns} loading={loading}
                      pageSizeOptions={[10, 20, 100]} disableRowSelectionOnClick />

            <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    Edit Template: {selected?.name}
                    <Typography variant="body2" color="text.secondary">{selected?.tkey}</Typography>
                </DialogTitle>
                <DialogContent dividers>
                    <Box mb={2}>
                        <Typography variant="subtitle2" color="text.secondary" mb={1}>
                            Available variables: {'{auctionName}'} {'{email}'} {'{password}'} {'{bidValue}'} {'{companyName}'}
                        </Typography>
                    </Box>

                    <TextField fullWidth label="Email Subject" value={form.subject}
                               onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                               sx={{ mb: 2 }} />

                    <Divider sx={{ mb: 2 }}>
                        <Chip label="Email Body" size="small" />
                    </Divider>

                    <TextField fullWidth multiline rows={6} label="Email Body (HTML)"
                               value={form.emailBody}
                               onChange={e => setForm(f => ({ ...f, emailBody: e.target.value }))}
                               sx={{ mb: 2, fontFamily: 'monospace' }}
                               helperText="Supports HTML tags like <b>, <p>, <br>" />

                    <Divider sx={{ mb: 2 }}>
                        <Chip label="SMS Body" size="small" color="primary" />
                    </Divider>

                    <TextField fullWidth multiline rows={3} label="SMS Text"
                               value={form.smsBody}
                               onChange={e => setForm(f => ({ ...f, smsBody: e.target.value }))}
                               helperText={`${form.smsBody.length} characters (keep under 160 for single SMS)`} />

                    {form.emailBody && (
                        <Box mt={2}>
                            <Divider sx={{ mb: 2 }}>
                                <Chip label="Email Preview" size="small" color="success" />
                            </Divider>
                            <Paper variant="outlined" sx={{ p: 2 }}>
                                <Typography variant="caption" color="text.secondary">Subject: {form.subject}</Typography>
                                <Box mt={1} dangerouslySetInnerHTML={{ __html: form.emailBody }} />
                            </Paper>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Template'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}