import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { companyApi } from '../api/companies';
import {
    Box, Typography, Button, Chip, Paper, Grid,
    CircularProgress, Alert
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

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

export default function CompanyDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [company, setCompany] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionMsg, setActionMsg] = useState('');

    useEffect(() => {
        if (!id) { setLoading(false); return; }
        Promise.all([
            companyApi.getById(id),
            companyApi.getUsers(id)
        ]).then(([c, u]) => {
            setCompany(c.data);
            setUsers(u.data);
        }).catch(() => setError('Failed to load company'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleCancel = async () => {
        try {
            await companyApi.cancel(id);
            setActionMsg('Company cancelled successfully');
            const res = await companyApi.getById(id);
            setCompany(res.data);
        } catch {
            setActionMsg('Action failed');
        }
    };

    if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    const userColumns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'firstName', headerName: 'First Name', width: 130 },
        { field: 'lastName', headerName: 'Last Name', width: 130 },
        { field: 'email', headerName: 'Email', flex: 1 },
        { field: 'role', headerName: 'Role', width: 130 },
        { field: 'active', headerName: 'Active', width: 90,
            renderCell: p => <Chip label={p.value ? 'Active' : 'Inactive'}
                                   color={p.value ? 'success' : 'default'} size="small" /> }
    ];

    return (
        <Box>
            <Box display="flex" alignItems="center" mb={2} gap={2}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/companies')}>
                    Back
                </Button>
                <Typography variant="h5" sx={{ flexGrow: 1 }}>
                    {company?.companyName || 'New Company'}
                </Typography>
                {company && (
                    <Chip label={company.status?.name || ''} size="small" />
                )}
                {company && company.status?.key !== 'key.companyStatus.cancelled' && (
                    <Button variant="contained" color="error" onClick={handleCancel}>
                        Cancel Company
                    </Button>
                )}
            </Box>

            {actionMsg && <Alert severity="info" sx={{ mb: 2 }} onClose={() => setActionMsg('')}>{actionMsg}</Alert>}

            {company && (
                <>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" fontWeight="bold" mb={1}>Company Info</Typography>
                                <InfoRow label="ID" value={company.id} />
                                <InfoRow label="Company Name" value={company.companyName} />
                                <InfoRow label="Tax ID" value={company.taxId} />
                                <InfoRow label="Type" value={company.type?.name} />
                                <InfoRow label="Status" value={company.status?.name} />
                                <InfoRow label="Category" value={company.category?.name} />
                                <InfoRow label="Sub Category" value={company.subCategory?.name} />
                                <InfoRow label="VAT Payer" value={company.vatPayer ? 'Yes' : 'No'} />
                                <InfoRow label="Website" value={company.webSite} />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" fontWeight="bold" mb={1}>Contact</Typography>
                                <InfoRow label="Contact Name" value={company.contactName} />
                                <InfoRow label="Contact Surname" value={company.contactSurname} />
                                <InfoRow label="Contact Position" value={company.contactPosition} />
                                <InfoRow label="Email" value={company.contactEmail} />
                                <InfoRow label="Phone" value={company.contactPhone} />
                                <InfoRow label="Mobile" value={company.contactMobile} />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" fontWeight="bold" mb={1}>Address & Banking</Typography>
                                <InfoRow label="Physical Address" value={company.phisAddress} />
                                <InfoRow label="Legal Address" value={company.legalAddress} />
                                <InfoRow label="Bank Code" value={company.bankCode1} />
                                <InfoRow label="Bank Account" value={company.bankAccount1} />
                            </Grid>
                        </Grid>
                    </Paper>

                    <Typography variant="h6" mb={1}>Users</Typography>
                    <DataGrid rows={users} columns={userColumns} autoHeight
                              pageSizeOptions={[10, 20]} disableRowSelectionOnClick />
                </>
            )}
        </Box>
    );
}