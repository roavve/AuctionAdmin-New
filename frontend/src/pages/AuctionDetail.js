import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auctionApi } from '../api/auctions';
import {
  Box, Typography, Button, Chip, Tabs, Tab, CircularProgress,
  Alert, Grid, Paper, Dialog, DialogTitle, DialogContent,
  DialogActions, List, ListItem, ListItemText, ListItemButton, Checkbox
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const STATUS_COLORS = {
  'key.auctionStatus.draft': 'default',
  'key.auctionStatus.active': 'success',
  'key.auctionStatus.planned': 'info',
  'key.auctionStatus.completed': 'primary',
  'key.auctionStatus.cancelled': 'error',
};

function InfoRow({ label, value }) {
  return (
      <Box display="flex" py={0.5}>
        <Typography variant="body2" color="text.secondary" sx={{ width: 200, flexShrink: 0 }}>
          {label}
        </Typography>
        <Typography variant="body2">{value ?? '-'}</Typography>
      </Box>
  );
}

export default function AuctionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [comments, setComments] = useState([]);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [inviteDialog, setInviteDialog] = useState(false);
  const [allCompanies, setAllCompanies] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [inviteLoading, setInviteLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await auctionApi.getById(id);
      setAuction(res.data);
    } catch {
      setError('Failed to load auction');
    } finally {
      setLoading(false);
    }
  };

  const loadTab = async (t) => {
    try {
      if (t === 1) setBids((await auctionApi.getBids(id)).data);
      if (t === 2) setInvitations((await auctionApi.getInvitations(id)).data);
      if (t === 3) setParticipants((await auctionApi.getParticipants(id)).data);
      if (t === 4) setComments((await auctionApi.getComments(id)).data);
    } catch {}
  };

  const loadCompanies = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/companies', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setAllCompanies(data);
    } catch {}
  };

  useEffect(() => {
    if (!isNew && id) load();
  }, []);

  useEffect(() => {
    if (!isNew && id) loadTab(tab);
  }, [tab]);

  const handleAction = async (action) => {
    try {
      if (action === 'activate') await auctionApi.activate(id);
      if (action === 'cancel') await auctionApi.cancel(id);
      if (action === 'close') await auctionApi.close(id);
      setActionMsg('Action completed successfully');
      load();
    } catch (e) {
      setActionMsg('Action failed: ' + (e.response?.data?.error || e.message));
    }
  };

  const handleInvite = async () => {
    if (selectedCompanies.length === 0) return;
    setInviteLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/auctions/${id}/invite-companies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ companyIds: selectedCompanies })
      });
      const data = await res.json();
      setActionMsg(`${data.count} companies invited successfully`);
      setInviteDialog(false);
      setSelectedCompanies([]);
      loadTab(2);
    } catch {
      setActionMsg('Failed to invite companies');
    } finally {
      setInviteLoading(false);
    }
  };

  // NEW AUCTION FORM
  if (isNew) {
    return (
        <Box>
          <Box display="flex" alignItems="center" mb={2} gap={2}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/auctions')}>
              Back
            </Button>
            <Typography variant="h5">New Auction</Typography>
          </Box>
          <Paper sx={{ p: 3 }}>
            <Typography variant="body1" color="text.secondary">
              New auction form coming soon.
            </Typography>
          </Paper>
        </Box>
    );
  }

  if (loading) return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
  );

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!auction) return null;

  const statusKey = auction.status?.key;

  const bidColumns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'bidValue', headerName: 'Bid Value', width: 120 },
    { field: 'bidDate', headerName: 'Date', width: 180,
      renderCell: p => p.value ? new Date(p.value).toLocaleString() : '-' },
    { field: 'user', headerName: 'User', flex: 1,
      renderCell: p => p.value ? `${p.value.firstName || ''} ${p.value.lastName || ''}`.trim() || p.value.email : '-' },
    { field: 'status', headerName: 'Status', width: 120,
      renderCell: p => <Chip label={p.value?.name || ''} size="small" /> },
    { field: 'actions', headerName: '', width: 100,
      renderCell: p => p.row.status?.key === 'key.bid.active' ? (
          <Button size="small" color="error"
                  onClick={() => auctionApi.cancelBid(p.row.id).then(() => loadTab(1))}>
            Cancel
          </Button>
      ) : null }
  ];

  const invColumns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'company', headerName: 'Company', flex: 1,
      renderCell: p => p.value?.companyName || '-' },
    { field: 'status', headerName: 'Status', width: 130,
      renderCell: p => <Chip label={p.value?.name || ''} size="small" /> },
    { field: 'dateInvited', headerName: 'Invited', width: 120,
      renderCell: p => p.value ? new Date(p.value).toLocaleDateString() : '-' },
    { field: 'actions', headerName: '', width: 160,
      renderCell: p => (
          <Box>
            <Button size="small" color="warning"
                    onClick={() => auctionApi.cancelInvitation(p.row.id).then(() => loadTab(2))}>
              Cancel
            </Button>
            <Button size="small"
                    onClick={() => auctionApi.closeInvitation(p.row.id).then(() => loadTab(2))}>
              Close
            </Button>
          </Box>
      )}
  ];

  const partColumns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'company', headerName: 'Company', flex: 1,
      renderCell: p => p.value?.companyName || '-' },
    { field: 'status', headerName: 'Status', width: 130,
      renderCell: p => <Chip label={p.value?.name || ''} size="small" /> },
    { field: 'winner', headerName: 'Winner', width: 90,
      renderCell: p => p.value ? <Chip label="Winner" color="success" size="small" /> : null },
    { field: 'actions', headerName: '', width: 130,
      renderCell: p => !p.row.winner ? (
          <Button size="small" color="success"
                  onClick={() => auctionApi.setWinner(p.row.id).then(() => loadTab(3))}>
            Set Winner
          </Button>
      ) : null }
  ];

  const commentColumns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'commText', headerName: 'Comment', flex: 1 },
    { field: 'commCreated', headerName: 'Date', width: 160,
      renderCell: p => p.value ? new Date(p.value).toLocaleString() : '-' },
    { field: 'status', headerName: 'Status', width: 120,
      renderCell: p => <Chip label={p.value?.name || ''} size="small" /> },
    { field: 'actions', headerName: '', width: 160,
      renderCell: p => (
          <Box>
            {p.row.status?.key === 'key.coment.new' &&
                <Button size="small" color="success"
                        onClick={() => auctionApi.approveComment(p.row.id).then(() => loadTab(4))}>
                  Approve
                </Button>}
            <Button size="small" color="error"
                    onClick={() => auctionApi.cancelComment(p.row.id).then(() => loadTab(4))}>
              Cancel
            </Button>
          </Box>
      )}
  ];

  return (
      <Box>
        <Box display="flex" alignItems="center" mb={2} gap={2} flexWrap="wrap">
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/auctions')}>
            Back
          </Button>
          <Typography variant="h5" sx={{ flexGrow: 1 }}>{auction.name}</Typography>
          <Chip label={auction.status?.name || ''} color={STATUS_COLORS[statusKey] || 'default'} />
          {statusKey === 'key.auctionStatus.draft' &&
              <Button variant="contained" color="success"
                      onClick={() => handleAction('activate')}>Activate</Button>}
          {statusKey === 'key.auctionStatus.active' &&
              <Button variant="contained" color="warning"
                      onClick={() => handleAction('close')}>Close</Button>}
          {statusKey === 'key.auctionStatus.active' &&
              <Button variant="contained" color="error"
                      onClick={() => handleAction('cancel')}>Cancel</Button>}
        </Box>

        {actionMsg && (
            <Alert severity="info" sx={{ mb: 2 }} onClose={() => setActionMsg('')}>{actionMsg}</Alert>
        )}

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="Details" />
          <Tab label="Bids" />
          <Tab label="Invitations" />
          <Tab label="Participants" />
          <Tab label="Comments" />
        </Tabs>

        {tab === 0 && (
            <Paper sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle1" fontWeight="bold" mb={1}>General</Typography>
                  <InfoRow label="ID" value={auction.id} />
                  <InfoRow label="Record Key" value={auction.recordKey} />
                  <InfoRow label="Type" value={auction.auctionType?.name} />
                  <InfoRow label="Project" value={auction.project?.name} />
                  <InfoRow label="Description" value={auction.desc} />
                  <InfoRow label="Invite Text" value={auction.inviteText} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle1" fontWeight="bold" mb={1}>Bidding</Typography>
                  <InfoRow label="Start Bid Value" value={auction.startBidValue} />
                  <InfoRow label="Max Bid Value" value={auction.maxBidValue} />
                  <InfoRow label="Last Bid Value" value={auction.lastBidValue} />
                  <InfoRow label="Bid Step" value={auction.bidStep} />
                  <InfoRow label="Quantity" value={auction.quantity} />
                  <InfoRow label="Currency" value={auction.currency?.name} />
                  <InfoRow label="Unit of Measure" value={auction.uom?.name} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle1" fontWeight="bold" mb={1}>Schedule</Typography>
                  <InfoRow label="Discuss Start" value={auction.discussStartDate ? new Date(auction.discussStartDate).toLocaleDateString() : null} />
                  <InfoRow label="Discuss End" value={auction.discussEndDate ? new Date(auction.discussEndDate).toLocaleDateString() : null} />
                  <InfoRow label="Auction Start" value={auction.auctionStartDate ? new Date(auction.auctionStartDate).toLocaleDateString() : null} />
                  <InfoRow label="Auction End" value={auction.auctionEndDate ? new Date(auction.auctionEndDate).toLocaleDateString() : null} />
                  <InfoRow label="Start Time" value={auction.startTime} />
                  <InfoRow label="End Time" value={auction.endTime} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle1" fontWeight="bold" mb={1}>Bid Period</Typography>
                  <InfoRow label="Bid Start Date" value={auction.bidStartDate ? new Date(auction.bidStartDate).toLocaleDateString() : null} />
                  <InfoRow label="Bid End Date" value={auction.bidEndDate ? new Date(auction.bidEndDate).toLocaleDateString() : null} />
                  <InfoRow label="Bid Start Time" value={auction.bidStartTime} />
                  <InfoRow label="Bid End Time" value={auction.bidEndTime} />
                  <InfoRow label="Additional Minutes" value={auction.additionalMinute} />
                  <InfoRow label="Show Last Bid" value={auction.showLastBid ? 'Yes' : 'No'} />
                </Grid>
              </Grid>
            </Paper>
        )}

        {tab === 1 && (
            <DataGrid rows={bids} columns={bidColumns} autoHeight
                      pageSizeOptions={[10, 20, 50]} disableRowSelectionOnClick />
        )}

        {tab === 2 && (
            <Box>
              <Box mb={2} display="flex" gap={2} alignItems="center">
                <Typography variant="subtitle1">Invitations</Typography>
                <Button variant="contained" size="small"
                        onClick={() => { loadCompanies(); setInviteDialog(true); }}>
                  Invite Companies
                </Button>
              </Box>
              <DataGrid rows={invitations} columns={invColumns} autoHeight
                        pageSizeOptions={[10, 20, 50]} disableRowSelectionOnClick />
            </Box>
        )}

        {tab === 3 && (
            <DataGrid rows={participants} columns={partColumns} autoHeight
                      pageSizeOptions={[10, 20, 50]} disableRowSelectionOnClick />
        )}

        {tab === 4 && (
            <DataGrid rows={comments} columns={commentColumns} autoHeight
                      pageSizeOptions={[10, 20, 50]} disableRowSelectionOnClick />
        )}

        <Dialog open={inviteDialog} onClose={() => setInviteDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            Invite Companies to Auction
            <Typography variant="body2" color="text.secondary">
              {selectedCompanies.length} selected
            </Typography>
          </DialogTitle>
          <DialogContent dividers>
            <List dense sx={{ maxHeight: 400, overflow: 'auto' }}>
              {allCompanies.map(company => (
                  <ListItem key={company.id} disablePadding>
                    <ListItemButton onClick={() => {
                      setSelectedCompanies(prev =>
                          prev.includes(company.id)
                              ? prev.filter(cid => cid !== company.id)
                              : [...prev, company.id]
                      );
                    }}>
                      <Checkbox checked={selectedCompanies.includes(company.id)} size="small" />
                      <ListItemText
                          primary={company.companyName}
                          secondary={`${company.taxId || ''} | ${company.contactEmail || ''}`}
                      />
                    </ListItemButton>
                  </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setInviteDialog(false); setSelectedCompanies([]); }}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleInvite}
                    disabled={selectedCompanies.length === 0 || inviteLoading}>
              {inviteLoading ? 'Inviting...' : `Invite ${selectedCompanies.length} Companies`}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
  );
}