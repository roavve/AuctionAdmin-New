import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Button, Alert, Tabs, Tab,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

export default function Registrations() {
    const [tab, setTab] = useState(0);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [error, setError] = useState('');
    const [actionMsg, setActionMsg] = useState('');
    const [detailDialog, setDetailDialog] = useState(false);
    const [selectedReg, setSelectedReg] = useState(null);
    const [regFiles, setRegFiles] = useState([]);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [fileDescription, setFileDescription] = useState('');
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    const tabKeys = ['new', 'processed', 'cancelled'];

    const load = async (t, p, s) => {
        setLoading(true);
        try {
            const res = await fetch(
                `http://localhost:8080/api/registrations/${tabKeys[t]}?page=${p}&size=${s}`,
                { headers }
            );
            const data = await res.json();
            setRows(data.content || []);
            setTotal(data.totalElements || 0);
        } catch {
            setError('Failed to load registrations');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(tab, page, pageSize); }, [tab, page, pageSize]);

    const handleTabChange = (_, newTab) => {
        setTab(newTab);
        setPage(0);
    };

    const handleApprove = async (id) => {
        try {
            const res = await fetch(`http://localhost:8080/api/registrations/${id}/createCompany`,
                { method: 'POST', headers });
            const data = await res.json();
            if (data.success) {
                setActionMsg(`Company created successfully (ID: ${data.companyId})`);
                load(tab, page, pageSize);
            } else {
                setActionMsg('Failed: ' + data.error);
            }
        } catch {
            setActionMsg('Action failed');
        }
    };

    const handleReject = async (id) => {
        try {
            await fetch(`http://localhost:8080/api/registrations/${id}/reject`,
                { method: 'POST', headers });
            setActionMsg('Registration rejected');
            load(tab, page, pageSize);
        } catch {
            setActionMsg('Action failed');
        }
    };

    const loadFiles = async (requestId) => {
        try {
            const res = await fetch(`http://localhost:8080/api/registrations/${requestId}/files`, { headers });
            setRegFiles(await res.json());
        } catch {
            setRegFiles([]);

        }
    };

    const handleViewDetail = (reg) => {
        setSelectedReg(reg);
        loadFiles(reg.id);
        setDetailDialog(true);
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
        if (!file || !selectedReg) return;
        setUploadingFile(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            if (fileDescription) formData.append('description', fileDescription);
            await fetch(`http://localhost:8080/api/registrations/${selectedReg.id}/files`, {
                method: 'POST', headers, body: formData
            });
            setActionMsg(`File uploaded`);
            loadFiles(selectedReg.id);
        } catch {
            setActionMsg('Upload failed');
        } finally {
            setUploadingFile(false);
            e.target.value = '';
        }
    };

    const fileColumns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'fileName', headerName: 'File Name', flex: 1 },
        { field: 'fileDescription', headerName: 'Description', width: 200 },
        { field: 'fileSize', headerName: 'Size', width: 100 },
        { field: 'fileDate', headerName: 'Date', width: 160,
            renderCell: p => p.value ? new Date(p.value).toLocaleString() : '-' },
        { field: 'actions', headerName: '', width: 160, sortable: false,
            renderCell: p => (
                <Box display="flex" gap={0.5}>
                    <Button size="small"
                            onClick={() => downloadFile(
                                `http://localhost:8080/api/registrations/files/${p.row.id}/download`,
                                p.row.fileName)}>
                        Download
                    </Button>
                    <Button size="small" color="error"
                            onClick={() => fetch(`http://localhost:8080/api/registrations/files/${p.row.id}`,
                                { method: 'DELETE', headers }).then(() => loadFiles(selectedReg.id))}>
                        Delete
                    </Button>
                </Box>
            )}
    ];

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'companyName', headerName: 'Company Name', flex: 1 },
        { field: 'taxId', headerName: 'Tax ID', width: 130 },
        { field: 'contactEmail', headerName: 'Email', width: 200 },
        { field: 'contactPhone', headerName: 'Phone', width: 130 },
        { field: 'contactName', headerName: 'Contact', width: 130,
            renderCell: p => `${p.row.contactName || ''} ${p.row.contactSurname || ''}`.trim() || '-' },
        { field: 'requestDate', headerName: 'Date', width: 130,
            renderCell: p => p.value ? new Date(p.value).toLocaleDateString() : '-' },
        { field: 'actions', headerName: '', width: 260, sortable: false,
            renderCell: p => (
                <Box display="flex" gap={0.5}>
                    <Button size="small" onClick={() => handleViewDetail(p.row)}>View</Button>
                    {tab === 0 && (
                        <>
                            <Button size="small" color="success"
                                    onClick={() => handleApprove(p.row.id)}>Approve</Button>
                            <Button size="small" color="error"
                                    onClick={() => handleReject(p.row.id)}>Reject</Button>
                        </>
                    )}
                </Box>
            )}
    ];

    return (
        <Box>
            <Typography variant="h5" mb={2}>Registrations</Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {actionMsg && <Alert severity="info" sx={{ mb: 2 }} onClose={() => setActionMsg('')}>{actionMsg}</Alert>}

            <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 2 }}>
                <Tab label="New" />
                <Tab label="Processed" />
                <Tab label="Cancelled" />
            </Tabs>

            <DataGrid rows={rows} columns={columns} rowCount={total} loading={loading}
                      paginationMode="server"
                      paginationModel={{ page, pageSize }}
                      onPaginationModelChange={m => { setPage(m.page); setPageSize(m.pageSize); }}
                      pageSizeOptions={[10, 20, 50, 100]} autoHeight disableRowSelectionOnClick />

            <Dialog open={detailDialog} onClose={() => setDetailDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    Registration: {selectedReg?.companyName}
                    <Typography variant="body2" color="text.secondary">
                        {selectedReg?.contactEmail} | {selectedReg?.taxId}
                    </Typography>
                </DialogTitle>
                <DialogContent dividers>
                    {selectedReg && (
                        <Box mb={3}>
                            <Typography variant="subtitle2" fontWeight="bold" mb={1}>Details</Typography>
                            <Typography variant="body2">Contact: {selectedReg.contactName} {selectedReg.contactSurname}</Typography>
                            <Typography variant="body2">Phone: {selectedReg.contactPhone}</Typography>
                            <Typography variant="body2">Mobile: {selectedReg.contactMobile}</Typography>
                            <Typography variant="body2">Address: {selectedReg.phisAddress}</Typography>
                            <Typography variant="body2">Tax ID: {selectedReg.taxId}</Typography>
                            <Typography variant="body2">VAT Payer: {selectedReg.vatPayer ? 'Yes' : 'No'}</Typography>
                            <Box sx={{
                                mt: 1, p: 1,
                                bgcolor: selectedReg.policyAccepted ? 'success.light' : 'error.light',
                                borderRadius: 1, display: 'inline-block'
                            }}>
                                <Typography variant="body2" color="white" fontWeight="bold">
                                    {selectedReg.policyAccepted ? '✓ Policy Accepted' : '✗ Policy Not Accepted'}
                                </Typography>
                            </Box>
                            {selectedReg.policyFileName && (
                                <Box mt={1}>
                                    <Typography variant="body2">
                                        Policy Document: <strong>{selectedReg.policyFileName}</strong>
                                    </Typography>
                                    <Button size="small" variant="outlined" sx={{ mt: 0.5 }}
                                            onClick={() => downloadFile(
                                                `http://localhost:8080/api/registrations/${selectedReg.id}/policy`,
                                                selectedReg.policyFileName)}>
                                        Download Policy Doc
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    )}

                    <Typography variant="subtitle2" fontWeight="bold" mb={1}>Files</Typography>
                    <Box mb={2} display="flex" gap={2} sx={{ alignItems: 'center' }}>
                        <TextField size="small" label="Description (optional)"
                                   value={fileDescription}
                                   onChange={e => setFileDescription(e.target.value)}
                                   sx={{ width: 250 }} />
                        <Button variant="contained" component="label" disabled={uploadingFile}>
                            {uploadingFile ? 'Uploading...' : 'Upload File'}
                            <input type="file" hidden onChange={handleFileUpload} />
                        </Button>
                    </Box>
                    {regFiles.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">No files attached</Typography>
                    ) : (
                        <DataGrid rows={regFiles} columns={fileColumns} autoHeight
                                  pageSizeOptions={[10, 20, 50, 100]} disableRowSelectionOnClick />
                    )}
                </DialogContent>
                <DialogActions>
                    {tab === 0 && selectedReg && (
                        <>
                            {!selectedReg.policyAccepted && (
                                <Button variant="outlined" color="warning"
                                        onClick={async () => {
                                            await fetch(`http://localhost:8080/api/registrations/${selectedReg.id}/acceptPolicy`,
                                                { method: 'POST', headers });
                                            setSelectedReg(r => ({ ...r, policyAccepted: true }));
                                            setActionMsg('Policy marked as accepted');
                                        }}>
                                    Mark Policy Accepted
                                </Button>
                            )}
                            <Button color="success" variant="contained"
                                    disabled={!selectedReg.policyAccepted}
                                    onClick={() => { handleApprove(selectedReg.id); setDetailDialog(false); }}>
                                Approve
                            </Button>
                            <Button color="error" variant="contained"
                                    onClick={() => { handleReject(selectedReg.id); setDetailDialog(false); }}>
                                Reject
                            </Button>
                        </>
                    )}
                    <Button onClick={() => setDetailDialog(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}