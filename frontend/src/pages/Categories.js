import React, { useEffect, useState } from 'react';
import { categoryApi } from '../api/categories';
import { Box, Typography, Chip, Alert } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

export default function Categories() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('http://localhost:8080/api/categories', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
            .then(r => r.json())
            .then(setRows)
            .catch(() => setError('Failed to load'))
            .finally(() => setLoading(false));
    }, []);

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'name', headerName: 'Name', flex: 1 },
        { field: 'parent', headerName: 'Parent', width: 160,
            renderCell: p => p.value?.name || '-' },
        { field: 'disabled', headerName: 'Disabled', width: 100,
            renderCell: p => p.value ? <Chip label="Disabled" color="error" size="small" /> : null }
    ];

    return (
        <Box>
            <Typography variant="h5" mb={2}>Categories</Typography>
            {error && <Alert severity="error">{error}</Alert>}
            <DataGrid rows={rows} columns={columns} loading={loading}
                      autoHeight disableRowSelectionOnClick pageSizeOptions={[20, 50]} />
        </Box>
    );
}