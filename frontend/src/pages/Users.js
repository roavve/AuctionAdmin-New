import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../api/users';
import {
    Box, Typography, Button, Chip, Alert, Paper,
    TextField, MenuItem, Select, FormControl, InputLabel,
    Grid, IconButton, Collapse
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';

const EMPTY_FILTERS = {
    email: '',
    companyId: '',
    internal: '',
    active: '',
    locked: '',
};

export default function Users() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
    const [showFilters, setShowFilters] = useState(false);
    const navigate = useNavigate();

    const loadUsers = async (currentPage, currentSize, currentFilters) => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                size: currentSize,
                ...(currentFilters.email && { email: currentFilters.email }),
                ...(currentFilters.internal !== '' && { internal: currentFilters.internal }),
                ...(currentFilters.active !== '' && { active: currentFilters.active }),
                ...(currentFilters.locked !== '' && { locked: currentFilters.locked }),
            };
            const res = await userApi.search(params);
            setRows(res.data.content);
            setTotal(res.data.totalElements);
        } catch {
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers(page, pageSize, appliedFilters);
    }, [page, pageSize, appliedFilters]);

    const handleSearch = () => { setPage(0); setAppliedFilters({ ...filters }); };
    const handleClear = () => { setFilters(EMPTY_FILTERS); setAppliedFilters(EMPTY_FILTERS); setPage(0); };

    const activeFilterCount = Object.values(appliedFilters).filter(v => v !== '').length;

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'firstName', headerName: 'First Name', width: 130 },
        { field: 'lastName', headerName: 'Last Name', width: 130 },
        { field: 'email', headerName: 'Email', flex: 1 },
        { field: 'role', headerName: 'Role', width: 150 },
        { field: 'internal', headerName: 'Type', width: 100,
            renderCell: p => <Chip label={p.value ? 'Internal' : 'External'} size="small"
                                   color={p.value ? 'primary' : 'default'} /> },
        { field: 'active', headerName: 'Active', width: 90,
            renderCell: p => (
                <Chip label={p.value ? 'Active' : 'Inactive'}
                      color={p.value ? 'success' : 'default'} size="small" />
            )},
        { field: 'locked', headerName: 'Locked', width: 90,
            renderCell: p => p.value ? <Chip label="Locked" color="warning" size="small" /> : null },
        { field: 'actions', headerName: '', width: 90,
            renderCell: p => (
                <Button size="small" onClick={() => navigate(`/users/${p.row.id}`)}>View</Button>
            )}
    ];

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">Users</Typography>
                <Box display="flex" gap={1}>
                    <Button variant="outlined" startIcon={<FilterListIcon />}
                            onClick={() => setShowFilters(!showFilters)}
                            color={activeFilterCount > 0 ? 'primary' : 'inherit'}>
                        Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
                    </Button>
                    <Button variant="contained" startIcon={<AddIcon />}
                            onClick={() => navigate('/users/new')}>
                        New User
                    </Button>
                </Box>
            </Box>

            <Collapse in={showFilters}>
                <Paper sx={{ p: 2, mb: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, md: 3 }}>
                            <TextField fullWidth size="small" label="Email"
                                       value={filters.email}
                                       onChange={e => setFilters(f => ({ ...f, email: e.target.value }))}
                                       onKeyDown={e => e.key === 'Enter' && handleSearch()} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 2 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Type</InputLabel>
                                <Select value={filters.internal} label="Type"
                                        onChange={e => setFilters(f => ({ ...f, internal: e.target.value }))}>
                                    <MenuItem value="">All</MenuItem>
                                    <MenuItem value="true">Internal</MenuItem>
                                    <MenuItem value="false">External</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, md: 2 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Active</InputLabel>
                                <Select value={filters.active} label="Active"
                                        onChange={e => setFilters(f => ({ ...f, active: e.target.value }))}>
                                    <MenuItem value="">All</MenuItem>
                                    <MenuItem value="true">Active</MenuItem>
                                    <MenuItem value="false">Inactive</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, md: 2 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Locked</InputLabel>
                                <Select value={filters.locked} label="Locked"
                                        onChange={e => setFilters(f => ({ ...f, locked: e.target.value }))}>
                                    <MenuItem value="">All</MenuItem>
                                    <MenuItem value="true">Locked</MenuItem>
                                    <MenuItem value="false">Not Locked</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <Box display="flex" gap={1}>
                                <Button variant="contained" startIcon={<SearchIcon />}
                                        onClick={handleSearch} fullWidth>
                                    Search
                                </Button>
                                <IconButton onClick={handleClear} title="Clear">
                                    <ClearIcon />
                                </IconButton>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            </Collapse>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <DataGrid
                rows={rows}
                columns={columns}
                rowCount={total}
                loading={loading}
                paginationMode="server"
                paginationModel={{ page, pageSize }}
                onPaginationModelChange={m => { setPage(m.page); setPageSize(m.pageSize); }}
                pageSizeOptions={[10, 20, 50]}
                autoHeight
                disableRowSelectionOnClick
            />
        </Box>
    );
}