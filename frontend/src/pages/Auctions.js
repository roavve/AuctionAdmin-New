import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auctionApi } from '../api/auctions';
import {
    Box, Button, Typography, Chip, CircularProgress, Alert,
    TextField, MenuItem, Select, FormControl, InputLabel, Grid
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';

const STATUS_COLORS = {
    'key.auctionStatus.draft': 'default',
    'key.auctionStatus.active': 'success',
    'key.auctionStatus.planned': 'info',
    'key.auctionStatus.completed': 'primary',
    'key.auctionStatus.cancelled': 'error',
};

export default function Auctions() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [total, setTotal] = useState(0);
    const navigate = useNavigate();

    const loadAuctions = async () => {
        setLoading(true);
        try {
            const res = await auctionApi.search({ page, size: pageSize });
            setRows(res.data.content);
            setTotal(res.data.totalElements);
        } catch (err) {
            setError('Failed to load auctions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadAuctions(); }, [page, pageSize]);

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
            field: 'actions', headerName: 'Actions', width: 100, sortable: false,
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
                <Button variant="contained" startIcon={<AddIcon />}
                        onClick={() => navigate('/auctions/new')}>
                    New Auction
                </Button>
            </Box>

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