import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auctionApi } from '../api/auctions';
import {
    Box, Button, Typography, Chip, Alert, Paper,
    TextField, MenuItem, Select, FormControl, InputLabel,
    Grid, IconButton, Collapse
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';

const STATUS_COLORS = {
    'key.auctionStatus.draft': 'default',
    'key.auctionStatus.active': 'success',
    'key.auctionStatus.planned': 'info',
    'key.auctionStatus.completed': 'primary',
    'key.auctionStatus.cancelled': 'error',
};

const EMPTY_FILTERS = {
    statusId: '',
    projectId: '',
    rangeStartAmount: '',
    rangeEndAmount: '',
};

export default function Auctions() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [total, setTotal] = useState(0);
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
    const [showFilters, setShowFilters] = useState(false);
    const [statuses, setStatuses] = useState([]);
    const [projects, setProjects] = useState([]);
    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const loadDropdowns = async () => {
        try {
            const [dictRes, projRes] = await Promise.all([
                fetch('http://localhost:8080/api/dictionary/items', { headers }).then(r => r.json()),
                fetch('http://localhost:8080/api/projects', { headers }).then(r => r.json()),
            ]);
            setStatuses(dictRes.filter(d => d.key?.startsWith('key.auctionStatus')));
            setProjects(projRes);
        } catch {}
    };

    const loadAuctions = async (currentPage, currentSize, currentFilters) => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                size: currentSize,
                ...(currentFilters.statusId && { statusId: currentFilters.statusId }),
                ...(currentFilters.projectId && { projectId: currentFilters.projectId }),
                ...(currentFilters.rangeStartAmount && { rangeStartAmount: currentFilters.rangeStartAmount }),
                ...(currentFilters.rangeEndAmount && { rangeEndAmount: currentFilters.rangeEndAmount }),
            };
            const res = await auctionApi.search(params);
            setRows(res.data.content);
            setTotal(res.data.totalElements);
        } catch (err) {
            setError('Failed to load auctions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDropdowns();
    }, []);

    useEffect(() => {
        loadAuctions(page, pageSize, appliedFilters);
    }, [page, pageSize, appliedFilters]);

    const handleSearch = () => {
        setPage(0);
        setAppliedFilters({ ...filters });
    };

    const handleClear = () => {
        setFilters(EMPTY_FILTERS);
        setAppliedFilters(EMPTY_FILTERS);
        setPage(0);
    };

    const activeFilterCount = Object.values(appliedFilters).filter(v => v !== '').length;

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'name', headerName: 'Name', flex: 1 },
        {
            field: 'status', headerName: 'Status', width: 140,
            renderCell: (params) => (
                <Chip
                    label={params.value?.name || ''}
                    color={STATUS_COLORS[params.value?.key] || 'default'}
                    size="small"
                />
            )
        },
        {
            field: 'project', headerName: 'Project', width: 160,
            renderCell: (params) => params.value?.name || '-'
        },
        { field: 'startBidValue', headerName: 'Start Bid', width: 110 },
        { field: 'lastBidValue', headerName: 'Last Bid', width: 110 },
        {
            field: 'auctionStartDate', headerName: 'Start Date', width: 120,
            renderCell: (params) => params.value ? new Date(params.value).toLocaleDateString() : '-'
        },
        {
            field: 'actions', headerName: '', width: 100, sortable: false,
            renderCell: (params) => (
                <Button size="small" onClick={() => navigate(`/auctions/${params.row.id}`)}>
                    View
                </Button>
            )
        }
    ];

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">Auctions</Typography>
                <Box display="flex" gap={1}>
                    <Button
                        variant="outlined"
                        startIcon={<FilterListIcon />}
                        onClick={() => setShowFilters(!showFilters)}
                        color={activeFilterCount > 0 ? 'primary' : 'inherit'}
                    >
                        Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
                    </Button>
                    <Button variant="contained" startIcon={<AddIcon />}
                            onClick={() => navigate('/auctions/new')}>
                        New Auction
                    </Button>
                </Box>
            </Box>

            <Collapse in={showFilters}>
                <Paper sx={{ p: 2, mb: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, md: 3 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Status</InputLabel>
                                <Select value={filters.statusId} label="Status"
                                        onChange={e => setFilters(f => ({ ...f, statusId: e.target.value }))}>
                                    <MenuItem value="">All Statuses</MenuItem>
                                    {statuses.map(s => (
                                        <MenuItem key={s.id} value={s.id}>
                                            <Chip label={s.name} color={STATUS_COLORS[s.key] || 'default'} size="small" sx={{ mr: 1 }} />
                                            {s.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Project</InputLabel>
                                <Select value={filters.projectId} label="Project"
                                        onChange={e => setFilters(f => ({ ...f, projectId: e.target.value }))}>
                                    <MenuItem value="">All Projects</MenuItem>
                                    {projects.map(p => (
                                        <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, md: 2 }}>
                            <TextField fullWidth size="small" label="Min Bid Value" type="number"
                                       value={filters.rangeStartAmount}
                                       onChange={e => setFilters(f => ({ ...f, rangeStartAmount: e.target.value }))} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 2 }}>
                            <TextField fullWidth size="small" label="Max Bid Value" type="number"
                                       value={filters.rangeEndAmount}
                                       onChange={e => setFilters(f => ({ ...f, rangeEndAmount: e.target.value }))} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 2 }}>
                            <Box display="flex" gap={1}>
                                <Button variant="contained" startIcon={<SearchIcon />}
                                        onClick={handleSearch} fullWidth>
                                    Search
                                </Button>
                                <IconButton onClick={handleClear} title="Clear filters">
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
                onPaginationModelChange={(model) => {
                    setPage(model.page);
                    setPageSize(model.pageSize);
                }}
                pageSizeOptions={[10, 20, 50]}
                autoHeight
                disableRowSelectionOnClick
            />
        </Box>
    );
}