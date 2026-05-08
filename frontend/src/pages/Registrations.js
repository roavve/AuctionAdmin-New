import React, { useEffect, useState } from 'react';
import client from '../api/client';
import { Box, Typography, Tabs, Tab, Button, Chip, Alert } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

export default function Registrations() {
    const [tab, setTab] = useState(0);
    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [actionMsg, setActionMsg] = useState('');

    const TABS = ['new', 'processed', 'cancelled'];

    const load = async () => {
        setLoading(true);
        try {
            const res = await client.get(`/api/registrations/${TABS[tab]}`, {
                params: { page, size: pageSize }
            });
            setRows(res.data.content || res.data);
            setTotal(res.data.totalElements || res.data.length);
        } catch {
            setRows([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [tab, page, pageSize]);

    const handleApprove = async (id) => {
        try {
            await client.post(`/api/registrations/${id}/createCompany`);
            setActionMsg('Company created from request');
            load();
        } catch {
            setActionMsg('Action failed');
        }
    };

    const handleReject = async (id) => {
        try {
            await client.post(`/api/registrations/${id}/reject`);
            setActionMsg('Request rejected');
            load();
        } catch {
            setActionMsg('Action failed');
        }
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'companyName', headerName: 'Company', flex: 1 },
        { field: 'taxId', headerName: 'Tax ID', width: 130 },
        { field: 'contactEmail', headerName: 'Email', width: 200 },
        { field: 'contactPhone', headerName: 'Phone', width: 130 },
        { field: 'requestDate', headerName: 'Date', width: 120,
            renderCell: p => p.value ? new Date(p.value).toLocaleDateString() : '-' },
        { field: 'status', headerName: 'Status', width: 120,
            renderCell: p => <Chip label={p.value?.name || ''} size="small" /> },
        { field: 'actions', headerName: '', width: 200, sortable: false,
            renderCell: p => tab === 0 ? (
                <Box>
                    <Button size="small" color="success" onClick={() => handleApprove(p.row.id)}>Approve</Button>
                    <Button size="small" color="error" onClick={() => handleReject(p.row.id)}>Reject</Button>
                </Box>
            ) : null }
    ];

    return (
        <Box>
            <Typography variant="h5" mb={2}>Registration Requests</Typography>
            {actionMsg && <Alert severity="info" sx={{ mb: 2 }} onClose={() => setActionMsg('')}>{actionMsg}</Alert>}
            <Tabs value={tab} onChange={(_, v) => { setTab(v); setPage(0); }} sx={{ mb: 2 }}>
                <Tab label="New" />
                <Tab label="Processed" />
                <Tab label="Cancelled" />
            </Tabs>
            <DataGrid
                rows={rows} columns={columns} rowCount={total} loading={loading}
                paginationMode="server"
                paginationModel={{ page, pageSize }}
                onPaginationModelChange={m => { setPage(m.page); setPageSize(m.pageSize); }}
                pageSizeOptions={[10, 20, 50]}
                autoHeight disableRowSelectionOnClick
            />
        </Box>
    );
}