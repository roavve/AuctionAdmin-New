import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Box, Button, TextField, Typography, Paper, Alert, CircularProgress
} from '@mui/material';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(email, password);
            navigate('/auctions');
        } catch (err) {
            setError('Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f5f5f5">
            <Paper elevation={3} sx={{ p: 4, width: 400 }}>
                <Typography variant="h5" mb={3} textAlign="center" fontWeight="bold">
                    Auction Admin
                </Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth label="Email" type="email" value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        margin="normal" required autoFocus
                    />
                    <TextField
                        fullWidth label="Password" type="password" value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        margin="normal" required
                    />
                    <Button
                        fullWidth type="submit" variant="contained" sx={{ mt: 3 }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Login'}
                    </Button>
                </form>
            </Paper>
        </Box>
    );
}