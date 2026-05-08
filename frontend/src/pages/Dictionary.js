import React, { useEffect, useState } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

export default function Dictionary() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('http://localhost:8080/api/dictionary/items', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
            .then(r => r.json())
            .then(setRows)
            .catch(() => setError('Failed to load'))
            .finally(() => setLoading(false));
    }, []);

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'key', headerName: 'Key', width: 250 },
        { field: 'name', headerName: 'Name (EN)', width: 200 },
        { field: 'nameGE', headerName: 'Name (GE)', width: 200 },
        { field: 'sortOrder', headerName: 'Order', width: 80 },
        { field: 'disabled', headerName: 'Disabled', width: 90,
            renderCell: p => p.value ? 'Yes' : 'No' }
    ];

    return (
        <Box>
            <Typography variant="h5" mb={2}>Dictionary Items</Typography>
            {error && <Alert severity="error">{error}</Alert>}
            <DataGrid rows={rows} columns={columns} loading={loading}
                      autoHeight disableRowSelectionOnClick pageSizeOptions={[20, 50, 100]} />
        </Box>
    );
}