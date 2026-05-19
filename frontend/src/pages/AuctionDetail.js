import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auctionApi } from '../api/auctions';
import {
  Box, Typography, Button, Chip, Tabs, Tab, CircularProgress,
  Alert, Grid, Paper, TextField, MenuItem, Select, FormControl,
  InputLabel, Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemText, ListItemButton, Checkbox
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';

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

const EMPTY_FORM = {
  name: '', desc: '', inviteText: '',
  startBidValue: '', maxBidValue: '', bidStep: '', quantity: '',
  discussStartDate: '', discussEndDate: '',
  auctionStartDate: '', auctionEndDate: '',
  startTime: '', endTime: '',
  bidStartDate: '', bidEndDate: '',
  bidStartTime: '', bidEndTime: '',
  additionalMinute: '',
  showLastBid: false,
  auctionType: { key: 'key.auctionType.buy' },
  valueType: { key: 'key.valueType.amount' },
  uom: { key: 'key.uom.piece' },
  currency: { key: 'key.currency.lari' },
  project: null,
};

function AuctionForm({ initial, projects, dictionaryItems, onSave, onCancel, saving, saveError }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));
  const setObj = (field, key) => setForm(f => ({ ...f, [field]: { key } }));

  const itemsForKey = (prefix) => dictionaryItems.filter(d => d.key.startsWith(prefix));

  return (
      <Paper sx={{ p: 3 }}>
        {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle1" fontWeight="bold">Basic Info</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Name" value={form.name}
                       onChange={e => set('name', e.target.value)} required />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Project</InputLabel>
              <Select value={form.project?.id || ''} label="Project"
                      onChange={e => set('project', e.target.value ? { id: e.target.value } : null)}>
                <MenuItem value="">No Project</MenuItem>
                {projects.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Auction Type</InputLabel>
              <Select value={form.auctionType?.key || ''} label="Auction Type"
                      onChange={e => setObj('auctionType', e.target.value)}>
                {itemsForKey('key.auctionType').map(d =>
                    <MenuItem key={d.key} value={d.key}>{d.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Currency</InputLabel>
              <Select value={form.currency?.key || ''} label="Currency"
                      onChange={e => setObj('currency', e.target.value)}>
                {itemsForKey('key.currency').map(d =>
                    <MenuItem key={d.key} value={d.key}>{d.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField fullWidth label="Description" value={form.desc || ''}
                       onChange={e => set('desc', e.target.value)} multiline rows={2} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField fullWidth label="Invite Text" value={form.inviteText || ''}
                       onChange={e => set('inviteText', e.target.value)} multiline rows={2} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle1" fontWeight="bold" mt={1}>Bidding</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField fullWidth label="Start Bid Value" type="number"
                       value={form.startBidValue || ''}
                       onChange={e => set('startBidValue', e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField fullWidth label="Max Bid Value" type="number"
                       value={form.maxBidValue || ''}
                       onChange={e => set('maxBidValue', e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField fullWidth label="Bid Step" type="number"
                       value={form.bidStep || ''}
                       onChange={e => set('bidStep', e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField fullWidth label="Quantity" type="number"
                       value={form.quantity || ''}
                       onChange={e => set('quantity', e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Value Type</InputLabel>
              <Select value={form.valueType?.key || ''} label="Value Type"
                      onChange={e => setObj('valueType', e.target.value)}>
                {itemsForKey('key.valueType').map(d =>
                    <MenuItem key={d.key} value={d.key}>{d.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Unit of Measure</InputLabel>
              <Select value={form.uom?.key || ''} label="Unit of Measure"
                      onChange={e => setObj('uom', e.target.value)}>
                {itemsForKey('key.uom').map(d =>
                    <MenuItem key={d.key} value={d.key}>{d.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle1" fontWeight="bold" mt={1}>Schedule</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Discuss Start Date" type="date"
                       value={form.discussStartDate?.substring(0, 10) || ''}
                       onChange={e => set('discussStartDate', e.target.value)}
                       InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Discuss End Date" type="date"
                       value={form.discussEndDate?.substring(0, 10) || ''}
                       onChange={e => set('discussEndDate', e.target.value)}
                       InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField fullWidth label="Auction Start Date" type="date"
                       value={form.auctionStartDate?.substring(0, 10) || ''}
                       onChange={e => set('auctionStartDate', e.target.value)}
                       InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField fullWidth label="Auction End Date" type="date"
                       value={form.auctionEndDate?.substring(0, 10) || ''}
                       onChange={e => set('auctionEndDate', e.target.value)}
                       InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <TextField fullWidth label="Start Time (HH:mm)"
                       value={form.startTime || ''}
                       onChange={e => set('startTime', e.target.value)}
                       placeholder="14:00" />
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <TextField fullWidth label="End Time (HH:mm)"
                       value={form.endTime || ''}
                       onChange={e => set('endTime', e.target.value)}
                       placeholder="16:00" />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle1" fontWeight="bold" mt={1}>Bid Period</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField fullWidth label="Bid Start Date" type="date"
                       value={form.bidStartDate?.substring(0, 10) || ''}
                       onChange={e => set('bidStartDate', e.target.value)}
                       InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField fullWidth label="Bid End Date" type="date"
                       value={form.bidEndDate?.substring(0, 10) || ''}
                       onChange={e => set('bidEndDate', e.target.value)}
                       InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <TextField fullWidth label="Bid Start Time"
                       value={form.bidStartTime || ''}
                       onChange={e => set('bidStartTime', e.target.value)}
                       placeholder="14:00" />
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <TextField fullWidth label="Bid End Time"
                       value={form.bidEndTime || ''}
                       onChange={e => set('bidEndTime', e.target.value)}
                       placeholder="16:00" />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField fullWidth label="Additional Minutes" type="number"
                       value={form.additionalMinute || ''}
                       onChange={e => set('additionalMinute', e.target.value)} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box display="flex" gap={2} mt={2}>
              <Button variant="contained" startIcon={<SaveIcon />}
                      onClick={() => onSave(form)} disabled={saving}>
                {saving ? 'Saving...' : 'Save Auction'}
              </Button>
              <Button onClick={onCancel}>Cancel</Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
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
  const [editing, setEditing] = useState(isNew);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [revisions, setRevisions] = useState([]);
  const [revisionFiles, setRevisionFiles] = useState([]);
  const [internalFiles, setInternalFiles] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [fileDescription, setFileDescription] = useState('');
  const [allCompanies, setAllCompanies] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [inviteDialog, setInviteDialog] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [dictionaryItems, setDictionaryItems] = useState([]);
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const load = async () => {
    setLoading(true);
    try {
      const [auctionRes, projectsRes, dictRes] = await Promise.all([
        auctionApi.getById(id),
        fetch('http://localhost:8080/api/projects', { headers }).then(r => r.json()),
        fetch('http://localhost:8080/api/dictionary/items', { headers }).then(r => r.json()),
      ]);
      setAuction(auctionRes.data);
      setProjects(projectsRes);
      setDictionaryItems(dictRes);
    } catch {
      setError('Failed to load auction');
    } finally {
      setLoading(false);
    }
  };

  const loadNew = async () => {
    try {
      const [projectsRes, dictRes] = await Promise.all([
        fetch('http://localhost:8080/api/projects', { headers }).then(r => r.json()),
        fetch('http://localhost:8080/api/dictionary/items', { headers }).then(r => r.json()),
      ]);
      setProjects(projectsRes);
      setDictionaryItems(dictRes);
    } catch {}
  };

  const loadTab = async (t) => {
    try {
      if (t === 1) setBids((await auctionApi.getBids(id)).data);
      if (t === 2) setInvitations((await auctionApi.getInvitations(id)).data);
      if (t === 3) setParticipants((await auctionApi.getParticipants(id)).data);
      if (t === 4) setComments((await auctionApi.getComments(id)).data);

      if (t === 5) {
        const res = await fetch(`http://localhost:8080/api/auctions/${id}/files`, { headers });
        setRevisionFiles(await res.json());
      }
      if (t === 6) {
        const res = await fetch(`http://localhost:8080/api/auctions/${id}/internal-files`, { headers });
        setInternalFiles(await res.json());
      }
      if (t === 7) {
        const res = await fetch(`http://localhost:8080/api/auctions/${id}/revisions`, { headers });
        setRevisions(await res.json());
      }
    } catch {}
  };

  const loadCompanies = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/companies', { headers });
      setAllCompanies(await res.json());
    } catch {}
  };

  useEffect(() => {
    if (isNew) loadNew();
    else if (id) load();
  }, []);

  useEffect(() => {
    if (!isNew && id) loadTab(tab);
  }, [tab]);

  const handleSave = async (form) => {
    setSaving(true);
    setSaveError('');
    try {
      const payload = {
        ...form,
        auctionType: form.auctionType?.key ? { key: form.auctionType.key } : null,
        valueType: form.valueType?.key ? { key: form.valueType.key } : null,
        uom: form.uom?.key ? { key: form.uom.key } : null,
        currency: form.currency?.key ? { key: form.currency.key } : null,
        project: form.project?.id ? { id: form.project.id } : null,
      };

      if (isNew) {
        const res = await auctionApi.create(payload);
        navigate(`/auctions/${res.data.id}`);
      } else {
        await auctionApi.update(id, payload);
        setEditing(false);
        load();
        setActionMsg('Auction saved successfully');
      }
    } catch (e) {
      setSaveError(e.response?.data?.error || e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

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
        headers: { 'Content-Type': 'application/json', ...headers },
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
  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (fileDescription) formData.append('description', fileDescription);
      const url = type === 'internal'
          ? `http://localhost:8080/api/auctions/${id}/internal-files`
          : `http://localhost:8080/api/auctions/${id}/files`;
      await fetch(url, {
        method: 'POST',
        headers,
        body: formData
      });
      setActionMsg(`File "${file.name}" uploaded successfully`);
      if (type === 'internal') loadTab(6);
      else loadTab(5);
    } catch {
      setActionMsg('Upload failed');
    } finally {
      setUploadingFile(false);
      e.target.value = '';
    }
  };
  if (isNew) {
    return (
        <Box>
          <Box display="flex" alignItems="center" mb={2} gap={2}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/auctions')}>Back</Button>
            <Typography variant="h5">New Auction</Typography>
          </Box>
          {dictionaryItems.length > 0 ? (
              <AuctionForm
                  projects={projects}
                  dictionaryItems={dictionaryItems}
                  onSave={handleSave}
                  onCancel={() => navigate('/auctions')}
                  saving={saving}
                  saveError={saveError}
              />
          ) : (
              <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>
          )}
        </Box>
    );
  }
  const downloadFile = async (url, fileName) => {
    try {
      const res = await fetch(url, { headers });
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName || 'download';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      setActionMsg('Download failed');
    }
  };
  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
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
                    onClick={() => auctionApi.cancelInvitation(p.row.id).then(() => loadTab(2))}>Cancel</Button>
            <Button size="small"
                    onClick={() => auctionApi.closeInvitation(p.row.id).then(() => loadTab(2))}>Close</Button>
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
                  onClick={() => auctionApi.setWinner(p.row.id).then(() => loadTab(3))}>Set Winner</Button>
      ) : null }
  ];

  const commentColumns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'commText', headerName: 'Comment', flex: 1 },
    { field: 'commCreated', headerName: 'Date', width: 160,
      renderCell: p => p.value ? new Date(p.value).toLocaleString() : '-' },
    { field: 'status', headerName: 'Status', width: 120,
      renderCell: p => <Chip label={p.value?.name || ''} size="small" /> },
    { field: 'actions', headerName: '', width: 240,
      renderCell: p => (
          <Box display="flex" gap={0.5}>
            {p.row.status?.key === 'key.coment.new' &&
                <Button size="small" color="success"
                        onClick={() => auctionApi.approveComment(p.row.id).then(() => loadTab(4))}>
                  Approve
                </Button>}
            {p.row.status?.key === 'key.coment.new' &&
                <Button size="small" color="primary"
                        onClick={() => {
                          const text = window.prompt('Enter reply:');
                          if (text) {
                            fetch(`http://localhost:8080/api/auctions/comments/${p.row.id}/answer`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json', ...headers },
                              body: JSON.stringify({ text })
                            }).then(() => loadTab(4));
                          }
                        }}>
                  Answer
                </Button>}
            <Button size="small" color="error"
                    onClick={() => auctionApi.cancelComment(p.row.id).then(() => loadTab(4))}>
              Cancel
            </Button>
          </Box>
      )}
  ];

  if (editing) {
    return (
        <Box>
          <Box display="flex" alignItems="center" mb={2} gap={2}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => setEditing(false)}>Back</Button>
            <Typography variant="h5">Edit: {auction.name}</Typography>
          </Box>
          <AuctionForm
              initial={auction}
              projects={projects}
              dictionaryItems={dictionaryItems}
              onSave={handleSave}
              onCancel={() => setEditing(false)}
              saving={saving}
              saveError={saveError}
          />
        </Box>
    );
  }

  return (
      <Box>
        <Box display="flex" alignItems="center" mb={2} gap={2} flexWrap="wrap">
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/auctions')}>Back</Button>
          <Typography variant="h5" sx={{ flexGrow: 1 }}>{auction.name}</Typography>
          <Chip label={auction.status?.name || ''} color={STATUS_COLORS[statusKey] || 'default'} />
          <Button variant="outlined" onClick={() => setEditing(true)}>Edit</Button>
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
          <Tab label="Files" />
          <Tab label="Internal Files" />
          <Tab label="Revisions" />
        </Tabs>

        {tab === 0 && (
            <Paper sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle1" fontWeight="bold" mb={1}>General</Typography>
                  <InfoRow label="ID" value={auction.id} />
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
            <Box>
              {bids.length >= 2 && (() => {
                const activeBids = bids.filter(b => b.status?.key === 'key.bid.active')
                    .sort((a, b) => a.bidValue - b.bidValue);
                if (activeBids.length >= 2) {
                  const first = activeBids[0].bidValue;
                  const second = activeBids[1].bidValue;
                  const gap = ((second - first) / second * 100).toFixed(1);
                  return (
                      <Box mb={2} display="flex" gap={3} alignItems="center">
                        <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                          <Typography variant="body2" color="white">🥇 Best Bid</Typography>
                          <Typography variant="h6" color="white" fontWeight="bold">
                            {first.toLocaleString()} {auction.currency?.name}
                          </Typography>
                          <Typography variant="body2" color="white">
                            {activeBids[0].user?.company?.companyName || activeBids[0].user?.email}
                          </Typography>
                        </Box>
                        <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                          <Typography variant="body2" color="white">🥈 2nd Place</Typography>
                          <Typography variant="h6" color="white" fontWeight="bold">
                            {second.toLocaleString()} {auction.currency?.name}
                          </Typography>
                          <Typography variant="body2" color="white">
                            {activeBids[1].user?.company?.companyName || activeBids[1].user?.email}
                          </Typography>
                        </Box>
                        <Box sx={{ p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                          <Typography variant="body2">Gap</Typography>
                          <Typography variant="h4" fontWeight="bold" color="warning.dark">
                            {gap}%
                          </Typography>
                          <Typography variant="body2">1st is ahead by</Typography>
                        </Box>
                      </Box>
                  );
                }
                return null;
              })()}
              <DataGrid rows={bids} columns={bidColumns} autoHeight
                        pageSizeOptions={[10, 20, 50]} disableRowSelectionOnClick />
            </Box>
        )}

        {tab === 2 && (
            <Box>
              <Box mb={2} display="flex" gap={2} alignItems="center">
                <Typography variant="subtitle1">Invitations</Typography>
                <Button variant="contained" size="small"
                        onClick={() => { loadCompanies(); setInviteDialog(true); }}>
                  Invite Companies
                </Button>
                <Button variant="outlined" size="small" color="success"
                        onClick={() => downloadFile(
                            `http://localhost:8080/api/export/auction/${id}/invitations`,
                            `invitations_${id}.xlsx`)}>
                  Export Excel
                </Button>
              </Box>
              <DataGrid rows={invitations} columns={invColumns} autoHeight
                        pageSizeOptions={[10, 20, 50]} disableRowSelectionOnClick />
            </Box>
        )}

        {tab === 3 && (
            <Box>
              <Box mb={2} display="flex" gap={2} alignItems="center">
                <Typography variant="subtitle1">Participants</Typography>
                <Button variant="outlined" size="small" color="success"
                        onClick={() => downloadFile(
                            `http://localhost:8080/api/export/auction/${id}/participants`,
                            `participants_${id}.xlsx`)}>
                  Export Excel
                </Button>
              </Box>
              <DataGrid rows={participants} columns={partColumns} autoHeight
                        pageSizeOptions={[10, 20, 50]} disableRowSelectionOnClick />
            </Box>
        )}

        {tab === 4 && (
            <DataGrid rows={comments} columns={commentColumns} autoHeight
                      pageSizeOptions={[10, 20, 50]} disableRowSelectionOnClick />
        )}
        {tab === 5 && (
            <Box>
              <Box mb={2} display="flex" gap={2} alignItems="center" flexWrap="wrap">
                <Typography variant="subtitle1">Revision Files</Typography>
                <TextField size="small" label="Description (optional)"
                           value={fileDescription}
                           onChange={e => setFileDescription(e.target.value)}
                           sx={{ width: 250 }} />
                <Button variant="contained" component="label" disabled={uploadingFile}>
                  {uploadingFile ? 'Uploading...' : 'Upload File'}
                  <input type="file" hidden onChange={e => handleFileUpload(e, 'revision')} />
                </Button>
              </Box>
              <DataGrid
                  rows={revisionFiles}
                  columns={[
                    { field: 'id', headerName: 'ID', width: 70 },
                    { field: 'fileName', headerName: 'File Name', flex: 1 },
                    { field: 'fileDescription', headerName: 'Description', width: 200 },
                    { field: 'fileSize', headerName: 'Size (bytes)', width: 120 },
                    { field: 'fileDate', headerName: 'Date', width: 160,
                      renderCell: p => p.value ? new Date(p.value).toLocaleString() : '-' },
                    { field: 'fileUser', headerName: 'Uploaded By', width: 150 },
                    { field: 'actions', headerName: '', width: 160, sortable: false,
                      renderCell: p => (
                          <Box display="flex" gap={0.5}>
                            <Button size="small"
                                    onClick={() => downloadFile(`http://localhost:8080/api/auctions/files/${p.row.id}/download`, p.row.fileName)}>
                              Download
                            </Button>
                            <Button size="small" color="error"
                                    onClick={() => fetch(`http://localhost:8080/api/auctions/files/${p.row.id}`, {
                                      method: 'DELETE', headers
                                    }).then(() => loadTab(5))}>
                              Delete
                            </Button>
                          </Box>
                      )}
                  ]}
                  autoHeight pageSizeOptions={[10, 20]} disableRowSelectionOnClick
              />
            </Box>
        )}

        {tab === 6 && (
            <Box>
              <Box mb={2} display="flex" gap={2} alignItems="center" flexWrap="wrap">
                <Typography variant="subtitle1">Internal Files</Typography>
                <TextField size="small" label="Description (optional)"
                           value={fileDescription}
                           onChange={e => setFileDescription(e.target.value)}
                           sx={{ width: 250 }} />
                <Button variant="contained" component="label" disabled={uploadingFile}>
                  {uploadingFile ? 'Uploading...' : 'Upload File'}
                  <input type="file" hidden onChange={e => handleFileUpload(e, 'internal')} />
                </Button>
              </Box>
              <DataGrid
                  rows={internalFiles}
                  columns={[
                    { field: 'id', headerName: 'ID', width: 70 },
                    { field: 'fileName', headerName: 'File Name', flex: 1 },
                    { field: 'fileDescription', headerName: 'Description', width: 200 },
                    { field: 'fileSize', headerName: 'Size (bytes)', width: 120 },
                    { field: 'fileDate', headerName: 'Date', width: 160,
                      renderCell: p => p.value ? new Date(p.value).toLocaleString() : '-' },
                    { field: 'fileUser', headerName: 'Uploaded By', width: 150 },
                    { field: 'actions', headerName: '', width: 160, sortable: false,
                      renderCell: p => (
                          <Box display="flex" gap={0.5}>
                            <Button size="small"
                                    onClick={() => downloadFile(`http://localhost:8080/api/auctions/internal-files/${p.row.id}/download`, p.row.fileName)}>
                              Download
                            </Button>
                            <Button size="small" color="error"
                                    onClick={() => fetch(`http://localhost:8080/api/auctions/internal-files/${p.row.id}`, {
                                      method: 'DELETE', headers
                                    }).then(() => loadTab(6))}>
                              Delete
                            </Button>
                          </Box>
                      )}
                  ]}
                  autoHeight pageSizeOptions={[10, 20]} disableRowSelectionOnClick
              />
            </Box>
        )}
        <Dialog open={inviteDialog} onClose={() => setInviteDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            Invite Companies to Auction
            <Typography variant="body2" color="text.secondary">{selectedCompanies.length} selected</Typography>
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
            <Button onClick={() => { setInviteDialog(false); setSelectedCompanies([]); }}>Cancel</Button>
            <Button variant="contained" onClick={handleInvite}
                    disabled={selectedCompanies.length === 0 || inviteLoading}>
              {inviteLoading ? 'Inviting...' : `Invite ${selectedCompanies.length} Companies`}
            </Button>
          </DialogActions>
        </Dialog>
              {tab === 7 && (
                  <Box>
                    <Typography variant="subtitle1" mb={2}>Revisions</Typography>
                    <DataGrid
                        rows={revisions}
                        columns={[
                          { field: 'id', headerName: 'ID', width: 70 },
                          { field: 'revisionNum', headerName: 'Revision #', width: 110 },
                          { field: 'revisionDate', headerName: 'Date', width: 180,
                            renderCell: p => p.value ? new Date(p.value).toLocaleString() : '-' },
                          { field: 'current', headerName: 'Current', width: 100,
                            renderCell: p => p.value ? <Chip label="Current" color="success" size="small" /> : null },
                          { field: 'createUserId', headerName: 'Created By', width: 150 },
                        ]}
                        autoHeight pageSizeOptions={[10, 20]} disableRowSelectionOnClick
                    />
                  </Box>
              )}

              <Dialog open={inviteDialog} onClose={() => setInviteDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                  Invite Companies to Auction
                  <Typography variant="body2" color="text.secondary">{selectedCompanies.length} selected</Typography>
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
                  <Button onClick={() => { setInviteDialog(false); setSelectedCompanies([]); }}>Cancel</Button>
                  <Button variant="contained" onClick={handleInvite}
                          disabled={selectedCompanies.length === 0 || inviteLoading}>
                    {inviteLoading ? 'Inviting...' : `Invite ${selectedCompanies.length} Companies`}
                  </Button>
                </DialogActions>
              </Dialog>
            </Box>
        );
        }