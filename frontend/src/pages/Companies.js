import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { companyApi } from '../api/companies';
import {
    Box, Button, Typography, Chip, Alert, Paper,
    TextField, MenuItem, Select, FormControl, InputLabel,
    Grid, IconButton, Collapse, Tabs, Tab
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';

const EMPTY_FILTERS = {
    name: '',
    taxId: '',
    categoryId: '',
};

export default function Companies() {
    const [tab, setTab] = useState(0);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [total, setTotal] = useState(0);
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
    const [showFilters, setShowFilters] = useState(false);
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const statusKeys = {
        0: ['key.companyStatus.created', 'key.companyStatus.invited',
            'key.companyStatus.received', 'key.companyStatus.registered'],
        1: ['key.companyStatus.active'],
        2: ['key.companyStatus.cancelled', 'key.companyStatus.rejected']
    };

    const loadCategories = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/categories', { headers });
            setCategories(await res.json());
        } catch {}
    };

    const loadCompanies = async (currentPage, currentSize, currentFilters, currentTab) => {
        setLoading(true);
        try {
            const res = await companyApi.getAll();
            let data = res.data;

            // filter by tab status
            const allowedKeys = statusKeys[currentTab];
            data = data.filter(c => allowedKeys.includes(c.status?.key));

            // apply search filters
            if (currentFilters.name)
                data = data.filter(c => c.companyName?.toLowerCase()
                    .includes(currentFilters.name.toLowerCase()));
            if (currentFilters.taxId)
                data = data.filter(c => c.taxId?.toLowerCase()
                    .includes(currentFilters.taxId.toLowerCase()));
            if (currentFilters.categoryId)
                data = data.filter(c => c.category?.id === Number(currentFilters.categoryId));

            setTotal(data.length);
            const start = currentPage * currentSize;
            setRows(data.slice(start, start + currentSize));
        } catch {
            setError('Failed to load companies');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadCategories(); }, []);

    useEffect(() => {
        loadCompanies(page, pageSize, appliedFilters, tab);
    }, [page, pageSize, appliedFilters, tab]);

    const handleTabChange = (_, newTab) => {
        setTab(newTab);
        setPage(0);
    };

    const handleSearch = () => { setPage(0); setAppliedFilters({ ...filters }); };
    const handleClear = () => {
        setFilters(EMPTY_FILTERS);
        setAppliedFilters(EMPTY_FILTERS);
        setPage(0);
    };

    const activeFilterCount = Object.values(appliedFilters).filter(v => v !== '').length;

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'companyName', headerName: 'Company Name', flex: 1 },
        { field: 'taxId', headerName: 'Tax ID', width: 130 },
        { field: 'type', headerName: 'Type', width: 130,
            renderCell: p => p.value?.name || '-' },
        { field: 'status', headerName: 'Status', width: 130,
            renderCell: p => <Chip label={p.value?.name || ''} size="small" /> },
        { field: 'category', headerName: 'Category', width: 150,
            renderCell: p => p.value?.name || '-' },
        { field: 'contactEmail', headerName: 'Email', width: 200 },
        { field: 'contactPhone', headerName: 'Phone', width: 130 },
        { field: 'flowDateCreated', headerName: 'Date Created', width: 130,
            renderCell: p => p.value ? new Date(p.value).toLocaleDateString() : '-' },
        { field: 'actions', headerName: '', width: 90, sortable: false,
            renderCell: p => (
                <Button size="small" onClick={() => navigate(`/companies/${p.row.id}`)}>View</Button>
            )}
    ];

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">Companies</Typography>
                <Box display="flex" gap={1}>
                    <Button variant="outlined" startIcon={<FilterListIcon />}
                            onClick={() => setShowFilters(!showFilters)}
                            color={activeFilterCount > 0 ? 'primary' : 'inherit'}>
                        Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
                    </Button>
                    <Button variant="contained" startIcon={<AddIcon />}
                            onClick={() => navigate('/companies/new')}>
                        New Company
                    </Button>
                </Box>
            </Box>

            <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 2 }}>
                <Tab label="New Companies" />
                <Tab label="Active Companies" />
                <Tab label="Cancelled Companies" />
            </Tabs>

            <Collapse in={showFilters}>
                <Paper sx={{ p: 2, mb: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, md: 3 }}>
                            <TextField fullWidth size="small" label="Company Name"
                                       value={filters.name}
                                       onChange={e => setFilters(f => ({ ...f, name: e.target.value }))}
                                       onKeyDown={e => e.key === 'Enter' && handleSearch()} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 2 }}>
                            <TextField fullWidth size="small" label="Tax ID"
                                       value={filters.taxId}
                                       onChange={e => setFilters(f => ({ ...f, taxId: e.target.value }))}
                                       onKeyDown={e => e.key === 'Enter' && handleSearch()} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Category</InputLabel>
                                <Select value={filters.categoryId} label="Category"
                                        onChange={e => setFilters(f => ({ ...f, categoryId: e.target.value }))}>
                                    <MenuItem value="">All Categories</MenuItem>
                                    {categories.map(c => (
                                        <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
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