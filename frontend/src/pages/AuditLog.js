import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Paper, TextField, Button,
    Grid, IconButton, Collapse, Alert
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

const EMPTY_FILTERS = { userId: '', action: '', objectName: '' };

export default function AuditLog() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
    const [showFilters, setShowFilters] = useState(false);
    const [error, setError] = useState('');

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const load = async (p, s, f) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: p, size: s });
            if (f.userId) params.append('userId', f.userId);
            if (f.action) params.append('action', f.action);
            if (f.objectName) params.append('objectName', f.objectName);
            const res = await fetch(`http://localhost:8080/api/audit?${params}`, { headers });
            const data = await res.json();
            setRows(data.content || []);
            setTotal(data.totalElements || 0);
        } catch {
            setError('Failed to load audit log');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(page, pageSize, appliedFilters); }, [page, pageSize, appliedFilters]);

    const handleSearch = () => { setPage(0); setAppliedFilters({ ...filters }); };
    const handleClear = () => { setFilters(EMPTY_FILTERS); setAppliedFilters(EMPTY_FILTERS); setPage(0); };

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'auditDate', headerName: 'Date', width: 180,
            renderCell: p => p.value ? new Date(p.value).toLocaleString() : '-' },
        { field: 'userId', headerName: 'User', width: 180 },
        { field: 'action', headerName: 'Action', width: 150 },
        { field: 'objectName', headerName: 'Object', width: 150 },
        { field: 'objectId', headerName: 'Object ID', width: 100 },
        { field: 'detail', headerName: 'Detail', flex: 1 },
    ];

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">Audit Log</Typography>
                <Button variant="outlined" startIcon={<FilterListIcon />}
                        onClick={() => setShowFilters(!showFilters)}>
                    Filters
                </Button>
            </Box>

            <Collapse in={showFilters}>
                <Paper sx={{ p: 2, mb: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, md: 3 }}>
                            <TextField fullWidth size="small" label="User"
                                       value={filters.userId}
                                       onChange={e => setFilters(f => ({ ...f, userId: e.target.value }))}
                                       onKeyDown={e => e.key === 'Enter' && handleSearch()} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <TextField fullWidth size="small" label="Action"
                                       value={filters.action}
                                       onChange={e => setFilters(f => ({ ...f, action: e.target.value }))}
                                       onKeyDown={e => e.key === 'Enter' && handleSearch()} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <TextField fullWidth size="small" label="Object Name"
                                       value={filters.objectName}
                                       onChange={e => setFilters(f => ({ ...f, objectName: e.target.value }))}
                                       onKeyDown={e => e.key === 'Enter' && handleSearch()} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <Box display="flex" gap={1}>
                                <Button variant="contained" startIcon={<SearchIcon />}
                                        onClick={handleSearch} fullWidth>Search</Button>
                                <IconButton onClick={handleClear}><ClearIcon /></IconButton>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            </Collapse>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <DataGrid rows={rows} columns={columns} rowCount={total} loading={loading}
                      paginationMode="server"
                      paginationModel={{ page, pageSize }}
                      onPaginationModelChange={m => { setPage(m.page); setPageSize(m.pageSize); }}
                      pageSizeOptions={[20, 50, 100]} autoHeight disableRowSelectionOnClick />
        </Box>
    );
}