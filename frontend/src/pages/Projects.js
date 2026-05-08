import React, { useEffect, useState } from 'react';
import { projectApi } from '../api/projects';
import { Box, Typography, Button, Chip, Alert } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';

export default function Projects() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = () => {
        setLoading(true);
        projectApi.getAll()
            .then(res => setRows(res.data))
            .catch(() => setError('Failed to load projects'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'name', headerName: 'Project Name', flex: 1 },
        {
            field: 'status', headerName: 'Status', width: 130,
            renderCell: (p) => <Chip label={p.value?.name || ''} size="small" />
        },
        { field: 'projectSum', headerName: 'Sum', width: 130 },
        {
            field: 'disabled', headerName: 'Disabled', width: 100,
            renderCell: (p) => p.value ? <Chip label="Disabled" color="error" size="small" /> : null
        }
    ];

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">Projects</Typography>
            </Box>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <DataGrid rows={rows} columns={columns} loading={loading}
                      autoHeight disableRowSelectionOnClick pageSizeOptions={[20, 50]} />
        </Box>
    );
}