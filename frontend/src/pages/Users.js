import React, { useEffect, useState } from 'react';
import { userApi } from '../api/users';
import { Box, Typography, Button, Chip, Alert } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';

export default function Users() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        userApi.search({ page, size: pageSize })
            .then(res => { setRows(res.data.content); setTotal(res.data.totalElements); })
            .catch(() => setError('Failed to load users'))
            .finally(() => setLoading(false));
    }, [page, pageSize]);

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'firstName', headerName: 'First Name', width: 130 },
        { field: 'lastName', headerName: 'Last Name', width: 130 },
        { field: 'email', headerName: 'Email', flex: 1 },
        { field: 'role', headerName: 'Role', width: 130 },
        {
            field: 'active', headerName: 'Active', width: 90,
            renderCell: (p) => (
                <Chip label={p.value ? 'Active' : 'Inactive'}
                      color={p.value ? 'success' : 'default'} size="small" />
            )
        },
        {
            field: 'locked', headerName: 'Locked', width: 90,
            renderCell: (p) => p.value ? <Chip label="Locked" color="warning" size="small" /> : null
        },
        {
            field: 'actions', headerName: '', width: 90,
            renderCell: (p) => (
                <Button size="small" onClick={() => navigate(`/users/${p.row.id}`)}>View</Button>
            )
        }
    ];

    return (
        <Box>
            <Typography variant="h5" mb={2}>Users</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <DataGrid
                rows={rows} columns={columns} rowCount={total} loading={loading}
                paginationMode="server"
                paginationModel={{ page, pageSize }}
                onPaginationModelChange={(m) => { setPage(m.page); setPageSize(m.pageSize); }}
                pageSizeOptions={[10, 20, 50]}
                autoHeight disableRowSelectionOnClick
            />
        </Box>
    );
}