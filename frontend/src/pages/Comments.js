import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Button, Chip, Alert, Tabs, Tab,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

export default function Comments() {
    const [tab, setTab] = useState(0);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [error, setError] = useState('');
    const [actionMsg, setActionMsg] = useState('');
    const [answerDialog, setAnswerDialog] = useState(false);
    const [selectedComment, setSelectedComment] = useState(null);
    const [answerText, setAnswerText] = useState('');
    const navigate = useNavigate();
    const [allRows, setAllRows] = useState([]);
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const tabKeys = ['new', 'answered', 'approved', 'cancelled'];

    const load = async (t, p, s) => {
        setLoading(true);
        try {
            const res = await fetch(
                `http://localhost:8080/api/auctions/comments/${tabKeys[t]}?page=${p}&size=${s}`,
                { headers }
            );
            const data = await res.json();
            const content = data.content || [];
            setAllRows(content);
            setRows(content.filter(r => !r.admin));
            setTotal(content.filter(r => !r.admin).length);
        } catch {
            setError('Failed to load comments');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        try {
            await fetch(`http://localhost:8080/api/auctions/comments/${id}/cancel`,
                { method: 'POST', headers });
            setActionMsg('Comment cancelled');
            load(tab, page, pageSize);
        } catch { setActionMsg('Action failed'); }
    };

    const handleAnswer = async () => {
        try {
            await fetch(`http://localhost:8080/api/auctions/comments/${selectedComment.id}/answer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...headers },
                body: JSON.stringify({ text: answerText })
            });
            setActionMsg('Comment answered');
            setAnswerDialog(false);
            setAnswerText('');
            load(tab, page, pageSize);
        } catch { setActionMsg('Answer failed'); }
    };
    const handleApprove = async (id) => {
        try {
            await fetch(`http://localhost:8080/api/auctions/comments/${id}/approve`,
                { method: 'POST', headers });
            setActionMsg('Comment approved');
            load(tab, page, pageSize);
        } catch { setActionMsg('Action failed'); }
    };

    const handleTabChange = (_, newTab) => { setTab(newTab); setPage(0); };
    useEffect(() => { load(tab, page, pageSize); }, [tab, page, pageSize]);
    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'auction', headerName: 'Auction', width: 180,
            renderCell: p => (
                <Button size="small" onClick={() => navigate(`/auctions/${p.value?.id}`)}>
                    {p.value?.name || '-'}
                </Button>
            )},
        { field: 'commCreated', headerName: 'Date', width: 160,
            renderCell: p => p.value ? new Date(p.value).toLocaleString() : '-' },
        { field: 'user', headerName: 'Company', width: 160,
            renderCell: p => p.value?.company?.companyName || p.value?.email || '-' },
        { field: 'commText', headerName: 'Question / Answer', flex: 1,
            renderCell: p => (
                <Box>
                    <Typography variant="body2">{p.row.commText}</Typography>
                    {p.row.answerToKey === null && allRows.find(r =>
                        r.answerToKey === p.row.recordKey) && (
                        <Typography variant="body2" color="primary.main" sx={{ mt: 0.5 }}>
                            ↳ {allRows.find(r => r.answerToKey === p.row.recordKey)?.commText}
                        </Typography>
                    )}
                </Box>
            )},
        { field: 'status', headerName: 'Status', width: 110,
            renderCell: p => <Chip label={p.value?.name || ''} size="small" /> },
        { field: 'actions', headerName: '', width: 220, sortable: false,
            renderCell: p => (
                // hide admin reply rows from actions
                p.row.admin ? null :
                    <Box display="flex" gap={0.5}>
                        {p.row.status?.key === 'key.coment.new' && (
                            <>
                                <Button size="small" color="success" onClick={() => handleApprove(p.row.id)}>
                                    Approve
                                </Button>
                                <Button size="small" color="primary"
                                        onClick={() => { setSelectedComment(p.row); setAnswerDialog(true); }}>
                                    Answer
                                </Button>
                            </>
                        )}
                        <Button size="small" color="error" onClick={() => handleCancel(p.row.id)}>
                            Cancel
                        </Button>
                    </Box>
            )}
    ];

    return (
        <Box>
            <Typography variant="h5" mb={2}>Auction Comments</Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {actionMsg && <Alert severity="info" sx={{ mb: 2 }} onClose={() => setActionMsg('')}>{actionMsg}</Alert>}

            <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 2 }}>
                <Tab label="New" />
                <Tab label="Answered" />
                <Tab label="Approved" />
                <Tab label="Cancelled" />
            </Tabs>

            <DataGrid rows={rows} columns={columns} rowCount={total} loading={loading}
                      paginationMode="server"
                      paginationModel={{ page, pageSize }}
                      onPaginationModelChange={m => { setPage(m.page); setPageSize(m.pageSize); }}
                      pageSizeOptions={[10, 20, 50, 100]} autoHeight disableRowSelectionOnClick />

            <Dialog open={answerDialog} onClose={() => setAnswerDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Answer Comment</DialogTitle>

                <DialogContent>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                        Original: {selectedComment?.commText}
                    </Typography>
                    <TextField fullWidth multiline rows={4} label="Your Answer"

                               value={answerText} onChange={e => setAnswerText(e.target.value)} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAnswerDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleAnswer} disabled={!answerText}>
                        Submit Answer
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}