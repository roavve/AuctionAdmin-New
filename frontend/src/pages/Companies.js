import React, { useEffect, useState } from 'react';
import { companyApi } from '../api/companies';
import { Box, Typography, Button, Chip, Alert } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';

export default function Companies() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        companyApi.getAll()
            .then(res => setRows(res.data))
            .catch(() => setError('Failed to load companies'))
            .finally(() => setLoading(false));
    }, []);

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'companyName', headerName: 'Company Name', flex: 1 },
        { field: 'taxId', headerName: 'Tax ID', width: 130 },
        {
            field: 'status', headerName: 'Status', width: 130,
            renderCell: (p) => <Chip label={p.value?.name || ''} size="small" />
        },
        { field: 'contactEmail', headerName: 'Email', width: 200 },
        { field: 'contactPhone', headerName: 'Phone', width: 130 },
        {
            field: 'actions', headerName: '', width: 90,
            renderCell: (p) => (
                <Button size="small" onClick={() => navigate(`/companies/${p.row.id}`)}>View</Button>
            )
        }
    ];

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">Companies</Typography>
                <Button variant="contained" startIcon={<AddIcon />}
                        onClick={() => navigate('/companies/new')}>
                    New Company
                </Button>
            </Box>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <DataGrid rows={rows} columns={columns} loading={loading}
                      autoHeight disableRowSelectionOnClick pageSizeOptions={[20, 50, 100]} />
        </Box>
    );
}