import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Paper, Grid, Chip, CircularProgress,
    List, ListItem, ListItemText, ListItemButton, Divider
} from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';

function StatCard({ title, value, color, icon, onClick }) {
    return (
        <Paper sx={{
            p: 3, cursor: onClick ? 'pointer' : 'default',
            borderLeft: `4px solid ${color}`,
            '&:hover': onClick ? { boxShadow: 4 } : {},
            transition: 'box-shadow 0.2s'
        }} onClick={onClick}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="body2" color="text.secondary">{title}</Typography>
                    <Typography variant="h3" fontWeight="bold" color={color}>
                        {value ?? <CircularProgress size={32} />}
                    </Typography>
                </Box>
                <Box sx={{ color, opacity: 0.3, fontSize: 60 }}>
                    {icon}
                </Box>
            </Box>
        </Paper>
    );
}

export default function Dashboard() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const [stats, setStats] = useState({
        activeAuctions: null,
        draftAuctions: null,
        pendingRegistrations: null,
        totalCompanies: null,
        totalUsers: null,
        totalProjects: null,
    });
    const [recentAuctions, setRecentAuctions] = useState([]);
    const [recentRegistrations, setRecentRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);

    const STATUS_COLORS = {
        'key.auctionStatus.draft': '#9e9e9e',
        'key.auctionStatus.active': '#4caf50',
        'key.auctionStatus.planned': '#2196f3',
        'key.auctionStatus.completed': '#9c27b0',
        'key.auctionStatus.cancelled': '#f44336',
    };

    useEffect(() => {
        const load = async () => {
            try {
                const [auctionsRes, companiesRes, usersRes, projectsRes, registrationsRes] = await Promise.all([
                    fetch('http://localhost:8080/api/auctions?size=100', { headers }).then(r => r.json()),
                    fetch('http://localhost:8080/api/companies', { headers }).then(r => r.json()),
                    fetch('http://localhost:8080/api/users?size=100', { headers }).then(r => r.json()),
                    fetch('http://localhost:8080/api/projects', { headers }).then(r => r.json()),
                    fetch('http://localhost:8080/api/registrations/new?size=100', { headers }).then(r => r.json()),
                ]);

                const auctions = auctionsRes.content || [];
                const activeAuctions = auctions.filter(a => a.status?.key === 'key.auctionStatus.active');
                const draftAuctions = auctions.filter(a => a.status?.key === 'key.auctionStatus.draft');

                setStats({
                    activeAuctions: activeAuctions.length,
                    draftAuctions: draftAuctions.length,
                    pendingRegistrations: registrationsRes.totalElements || 0,
                    totalCompanies: Array.isArray(companiesRes) ? companiesRes.length : 0,
                    totalUsers: usersRes.totalElements || 0,
                    totalProjects: Array.isArray(projectsRes) ? projectsRes.length : 0,
                });

                setRecentAuctions(auctions.slice(0, 8));
                setRecentRegistrations((registrationsRes.content || []).slice(0, 5));
            } catch (e) {
                console.error('Dashboard load error', e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <Box>
            <Typography variant="h5" mb={3} fontWeight="bold">Dashboard</Typography>

            <Grid container spacing={3} mb={4}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <StatCard title="Active Auctions" value={stats.activeAuctions}
                              color="#4caf50" icon={<GavelIcon fontSize="inherit" />}
                              onClick={() => navigate('/auctions')} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <StatCard title="Draft Auctions" value={stats.draftAuctions}
                              color="#9e9e9e" icon={<GavelIcon fontSize="inherit" />}
                              onClick={() => navigate('/auctions')} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <StatCard title="Pending Registrations" value={stats.pendingRegistrations}
                              color="#ff9800" icon={<AssignmentIcon fontSize="inherit" />}
                              onClick={() => navigate('/registrations')} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <StatCard title="Total Companies" value={stats.totalCompanies}
                              color="#2196f3" icon={<BusinessIcon fontSize="inherit" />}
                              onClick={() => navigate('/companies')} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <StatCard title="Total Users" value={stats.totalUsers}
                              color="#9c27b0" icon={<PeopleIcon fontSize="inherit" />}
                              onClick={() => navigate('/users')} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <StatCard title="Total Projects" value={stats.totalProjects}
                              color="#00bcd4" icon={<GavelIcon fontSize="inherit" />}
                              onClick={() => navigate('/projects')} />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 7 }}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                            Recent Auctions
                        </Typography>
                        <List dense disablePadding>
                            {loading ? <CircularProgress size={24} /> : recentAuctions.length === 0 ? (
                                <Typography variant="body2" color="text.secondary" p={1}>No auctions found</Typography>
                            ) : recentAuctions.map((a, i) => (
                                <React.Fragment key={a.id}>
                                    <ListItem disablePadding>
                                        <ListItemButton onClick={() => navigate(`/auctions/${a.id}`)}>
                                            <ListItemText
                                                primary={a.name}
                                                secondary={`ID: ${a.id} | Start Bid: ${a.startBidValue || '-'} | Last Bid: ${a.lastBidValue || '-'}`}
                                            />
                                            <Chip
                                                label={a.status?.name || ''}
                                                size="small"
                                                sx={{
                                                    ml: 1,
                                                    bgcolor: STATUS_COLORS[a.status?.key] || '#9e9e9e',
                                                    color: 'white'
                                                }}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                    {i < recentAuctions.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 5 }}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                            Pending Registrations
                        </Typography>
                        <List dense disablePadding>
                            {loading ? <CircularProgress size={24} /> : recentRegistrations.length === 0 ? (
                                <Typography variant="body2" color="text.secondary" p={1}>
                                    No pending registrations
                                </Typography>
                            ) : recentRegistrations.map((r, i) => (
                                <React.Fragment key={r.id}>
                                    <ListItem disablePadding>
                                        <ListItemButton onClick={() => navigate('/registrations')}>
                                            <ListItemText
                                                primary={r.companyName || r.name || `Request #${r.id}`}
                                                secondary={`${r.contactEmail || ''} | ${r.taxId || ''}`}
                                            />
                                            <Chip label="New" color="warning" size="small" />
                                        </ListItemButton>
                                    </ListItem>
                                    {i < recentRegistrations.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}