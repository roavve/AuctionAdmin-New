import React, { useEffect, useState } from 'react';
import { auctionApi } from '../api/auctions';
import {
    Box, Typography, Tabs, Tab, Chip, Button, CircularProgress
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';

const TABS = [
    { label: 'Active', fn: auctionApi.monitorActive },
    { label: 'Planned', fn: auctionApi.monitorPlanned },
    { label: 'Closed', fn: auctionApi.monitorClosed },
    { label: 'Cancelled', fn: auctionApi.monitorCancelled },
];

export default function Monitor() {
    const [tab, setTab] = useState(0);
    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const navigate = useNavigate();

    const load = async () => {
        setLoading(true);
        try {
            const res = await TABS[tab].fn({ page, size: pageSize });
            setRows(res.data.content);
            setTotal(res.data.totalElements);
        } catch (e) {
            setRows([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [tab, page, pageSize]);

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'name', headerName: 'Name', flex: 1 },
        { field: 'startBidValue', headerName: 'Start Bid', width: 110 },
        { field: 'lastBidValue', headerName: 'Last Bid', width: 110 },
        {
            field: 'project', headerName: 'Project', width: 160,
            renderCell: (p) => p.value?.name || '-'
        },
        {
            field: 'auctionStartDate', headerName: 'Start Date', width: 120,
            renderCell: (p) => p.value ? new Date(p.value).toLocaleDateString() : '-'
        },
        {
            field: 'actions', headerName: '', width: 90,
            renderCell: (p) => (
                <Button size="small" onClick={() => navigate(`/auctions/${p.row.id}`)}>View</Button>
            )
        }
    ];

    return (
        <Box>
            <Typography variant="h5" mb={2}>Auction Monitor</Typography>
            <Tabs value={tab} onChange={(_, v) => { setTab(v); setPage(0); }} sx={{ mb: 2 }}>
                {TABS.map((t, i) => <Tab key={i} label={t.label} />)}
            </Tabs>
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