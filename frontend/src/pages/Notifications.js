import React, { useEffect, useState } from 'react';
import { Box, Typography, Chip, Alert } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

export default function Notifications() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [error, setError] = useState('');

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const load = async (p, s) => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8080/api/notifications?page=${p}&size=${s}`, { headers });
            const data = await res.json();
            setRows(data.content || []);
            setTotal(data.totalElements || 0);
        } catch {
            setError('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(page, pageSize); }, [page, pageSize]);

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'createDate', headerName: 'Date', width: 180,
            renderCell: p => p.value ? new Date(p.value).toLocaleString() : '-' },
        { field: 'sendSubject', headerName: 'Subject', flex: 1 },
        { field: 'sendText', headerName: 'Text', flex: 2,
            renderCell: p => (
                <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.value}
                </Box>
            )},
        { field: 'isEmail', headerName: 'Email', width: 90,
            renderCell: p => p.value ? <Chip label="Email" color="primary" size="small" /> : null },
        { field: 'isSms', headerName: 'SMS', width: 90,
            renderCell: p => p.value ? <Chip label="SMS" color="secondary" size="small" /> : null },
        { field: 'emailStatus', headerName: 'Email Status', width: 120 },
        { field: 'smsStatus', headerName: 'SMS Status', width: 120 },
    ];

    return (

        <Box>
            <Typography variant="h5" mb={2}>Notifications</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <DataGrid rows={rows} columns={columns} rowCount={total} loading={loading}
                      paginationMode="server"
                      paginationModel={{ page, pageSize }}
                      onPaginationModelChange={m => { setPage(m.page); setPageSize(m.pageSize); }}
                      pageSizeOptions={[20, 50, 100]} autoHeight disableRowSelectionOnClick />
        </Box>
    );
}