'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Typography from '@mui/joy/Typography';
import Stack from '@mui/joy/Stack';
import Link from '@mui/joy/Link';
import Card from '@mui/joy/Card';
import Alert from '@mui/joy/Alert';
import Divider from '@mui/joy/Divider';
import Grid from '@mui/joy/Grid';
import IconButton from '@mui/joy/IconButton';
import Snackbar from '@mui/joy/Snackbar';
import NextLink from 'next/link';

// Icons
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';

export default function RegisterPage() {
    const router = useRouter();
    const { register } = useAuthStore();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await register(name, email, password);
            setSuccess(true);
            setTimeout(() => {
                router.push('/login');
            }, 2500);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex' }}>
            {/* Left Side - Marketing Content */}
            <Box
                sx={{
                    display: { xs: 'none', md: 'flex' },
                    width: '50%',
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
                    p: 8,
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Decorative circles */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: -100,
                        right: -100,
                        width: 300,
                        height: 300,
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.1)',
                        filter: 'blur(40px)',
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: -150,
                        left: -150,
                        width: 400,
                        height: 400,
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.1)',
                        filter: 'blur(60px)',
                    }}
                />

                {/* Logo */}
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Box
                        component="img"
                        src="/images/cybermax-logo.png"
                        alt="Cybermax Logo"
                        sx={{ height: 48, mb: 2 }}
                    />
                    <Typography level="h4" sx={{ color: 'white', fontWeight: 700, letterSpacing: '-0.02em' }}>
                        PT Cybermax Indonesia
                    </Typography>
                </Box>

                {/* Main Content */}
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography level="h1" sx={{ color: 'white', fontWeight: 900, mb: 2, fontSize: '3rem', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                        Join Our
                        <br />
                        Community
                    </Typography>
                    <Typography level="body-lg" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 4, maxWidth: 500, fontSize: '1.125rem', lineHeight: 1.7, fontWeight: 400 }}>
                        Create your account and start managing documents with thousands of professionals worldwide.
                    </Typography>

                    {/* Features */}
                    <Stack spacing={2.5}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                            <Box
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '12px',
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <GroupsRoundedIcon sx={{ color: 'white', fontSize: 24 }} />
                            </Box>
                            <Box>
                                <Typography level="title-md" sx={{ color: 'white', fontWeight: 700, mb: 0.5 }}>
                                    Trusted by Thousands
                                </Typography>
                                <Typography level="body-sm" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                    Join professionals from leading companies worldwide
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                            <Box
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '12px',
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <VerifiedUserRoundedIcon sx={{ color: 'white', fontSize: 24 }} />
                            </Box>
                            <Box>
                                <Typography level="title-md" sx={{ color: 'white', fontWeight: 700, mb: 0.5 }}>
                                    Enterprise Security
                                </Typography>
                                <Typography level="body-sm" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                    Your data is protected with industry-leading encryption
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                            <Box
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '12px',
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <SecurityRoundedIcon sx={{ color: 'white', fontSize: 24 }} />
                            </Box>
                            <Box>
                                <Typography level="title-md" sx={{ color: 'white', fontWeight: 700, mb: 0.5 }}>
                                    Free to Start
                                </Typography>
                                <Typography level="body-sm" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                    No credit card required, start managing documents today
                                </Typography>
                            </Box>
                        </Box>
                    </Stack>
                </Box>

                {/* Footer */}
                <Typography level="body-sm" sx={{ color: 'rgba(255, 255, 255, 0.7)', position: 'relative', zIndex: 1 }}>
                    © 2026 PT Cybermax Indonesia. All rights reserved.
                </Typography>
            </Box>

            {/* Right Side - Register Form */}
            <Box
                sx={{
                    width: { xs: '100%', md: '50%' },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 4,
                    bgcolor: 'background.body',
                }}
            >
                <Card
                    variant="outlined"
                    sx={{
                        maxWidth: 520,
                        width: '100%',
                        p: 5,
                        borderRadius: '20px',
                        boxShadow: { xs: 'none', md: '0 8px 32px rgba(0, 0, 0, 0.08)' },
                        border: { xs: 'none', md: '1px solid' },
                        borderColor: 'divider',
                    }}
                >
                    {/* Mobile Logo */}
                    <Box sx={{ mb: 4, textAlign: 'center', display: { xs: 'block', md: 'none' } }}>
                        <Box
                            component="img"
                            src="/images/cybermax-logo.png"
                            alt="Cybermax Logo"
                            sx={{ height: 48, mb: 2 }}
                        />
                    </Box>

                    {/* Header */}
                    <Box sx={{ mb: 4, textAlign: 'center' }}>
                        <Typography level="h2" component="h1" sx={{ mb: 1, fontWeight: 800, letterSpacing: '-0.02em' }}>
                            Create account
                        </Typography>
                        <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 2 }}>
                            Join thousands of professionals managing documents securely
                        </Typography>

                        {/* Feature Highlights */}
                        <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" sx={{ gap: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'primary.500' }} />
                                <Typography level="body-xs" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                    Secure Storage
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'primary.500' }} />
                                <Typography level="body-xs" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                    Easy Sharing
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'primary.500' }} />
                                <Typography level="body-xs" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                    24/7 Access
                                </Typography>
                            </Box>
                        </Stack>
                    </Box>

                    {error && (
                        <Alert color="danger" sx={{ mb: 3, borderRadius: '12px' }}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert color="success" sx={{ mb: 3, borderRadius: '12px' }}>
                            Registration successful! Redirecting to login...
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <Stack spacing={2.5}>
                            <FormControl required>
                                <FormLabel sx={{ fontWeight: 600 }}>Full Name</FormLabel>
                                <Input
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    autoComplete="name"
                                    size="lg"
                                    sx={{
                                        borderRadius: '12px',
                                        '--Input-focusedThickness': '2px',
                                    }}
                                />
                            </FormControl>

                            <FormControl required>
                                <FormLabel sx={{ fontWeight: 600 }}>Email Address</FormLabel>
                                <Input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="email"
                                    size="lg"
                                    sx={{
                                        borderRadius: '12px',
                                        '--Input-focusedThickness': '2px',
                                    }}
                                />
                            </FormControl>

                            <Grid container spacing={2}>
                                <Grid xs={12} sm={6}>
                                    <FormControl required>
                                        <FormLabel sx={{ fontWeight: 600 }}>Password</FormLabel>
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Create password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            autoComplete="new-password"
                                            size="lg"
                                            endDecorator={
                                                <IconButton
                                                    variant="plain"
                                                    color="neutral"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    sx={{ mr: -1 }}
                                                >
                                                    {showPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                                                </IconButton>
                                            }
                                            sx={{
                                                borderRadius: '12px',
                                                '--Input-focusedThickness': '2px',
                                            }}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid xs={12} sm={6}>
                                    <FormControl required>
                                        <FormLabel sx={{ fontWeight: 600 }}>Confirm Password</FormLabel>
                                        <Input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="Confirm password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            autoComplete="new-password"
                                            size="lg"
                                            endDecorator={
                                                <IconButton
                                                    variant="plain"
                                                    color="neutral"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    sx={{ mr: -1 }}
                                                >
                                                    {showConfirmPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                                                </IconButton>
                                            }
                                            sx={{
                                                borderRadius: '12px',
                                                '--Input-focusedThickness': '2px',
                                            }}
                                        />
                                    </FormControl>
                                </Grid>
                            </Grid>

                            <Typography level="body-xs" sx={{ color: 'text.tertiary', mt: -1 }}>
                                Password must be at least 6 characters
                            </Typography>

                            <Button
                                type="submit"
                                fullWidth
                                loading={loading}
                                disabled={success}
                                size="lg"
                                sx={{
                                    mt: 1,
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                                    fontWeight: 600,
                                    py: 1.5,
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #0891b2, #0e7490)',
                                    },
                                }}
                            >
                                Create account
                            </Button>
                        </Stack>
                    </form>

                    <Divider sx={{ my: 3 }}>or</Divider>

                    <Box sx={{ textAlign: 'center' }}>
                        <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                            Already have an account?{' '}
                            <Link
                                component={NextLink}
                                href="/login"
                                fontWeight="lg"
                                sx={{
                                    color: 'primary.500',
                                    '&:hover': { color: 'primary.600' },
                                }}
                            >
                                Sign in
                            </Link>
                        </Typography>
                    </Box>
                </Card>
            </Box>

            {/* Success Notification */}
            <Snackbar
                open={success}
                autoHideDuration={3000}
                onClose={() => setSuccess(false)}
                color="success"
                variant="solid"
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                startDecorator={<CheckCircleRoundedIcon />}
                sx={{
                    borderRadius: '12px',
                    fontWeight: 600,
                }}
            >
                Registration successful! Redirecting to login...
            </Snackbar>
        </Box>
    );
}
