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
import IconButton from '@mui/joy/IconButton';
import Snackbar from '@mui/joy/Snackbar';
import NextLink from 'next/link';

// Icons
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import CloudRoundedIcon from '@mui/icons-material/CloudRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            setShowSuccess(true);
            setTimeout(() => {
                router.push('/dashboard');
            }, 1000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid email or password');
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
                        Secure Document
                        <br />
                        Management
                    </Typography>
                    <Typography level="body-lg" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 4, maxWidth: 500, fontSize: '1.125rem', lineHeight: 1.7, fontWeight: 400 }}>
                        Manage, share, and collaborate on documents with enterprise-grade security and seamless workflow integration.
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
                                <SecurityRoundedIcon sx={{ color: 'white', fontSize: 24 }} />
                            </Box>
                            <Box>
                                <Typography level="title-md" sx={{ color: 'white', fontWeight: 700, mb: 0.5, letterSpacing: '-0.01em' }}>
                                    Bank-Level Security
                                </Typography>
                                <Typography level="body-sm" sx={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.6, fontWeight: 400 }}>
                                    256-bit encryption and advanced security protocols protect your data
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
                                <CloudRoundedIcon sx={{ color: 'white', fontSize: 24 }} />
                            </Box>
                            <Box>
                                <Typography level="title-md" sx={{ color: 'white', fontWeight: 700, mb: 0.5, letterSpacing: '-0.01em' }}>
                                    Cloud Storage
                                </Typography>
                                <Typography level="body-sm" sx={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.6, fontWeight: 400 }}>
                                    Access your documents anywhere, anytime from any device
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
                                <SpeedRoundedIcon sx={{ color: 'white', fontSize: 24 }} />
                            </Box>
                            <Box>
                                <Typography level="title-md" sx={{ color: 'white', fontWeight: 700, mb: 0.5, letterSpacing: '-0.01em' }}>
                                    Lightning Fast
                                </Typography>
                                <Typography level="body-sm" sx={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.6, fontWeight: 400 }}>
                                    Optimized performance for quick uploads and downloads
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

            {/* Right Side - Login Form */}
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
                        maxWidth: 480,
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
                            Welcome back
                        </Typography>
                        <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 2 }}>
                            Sign in to continue to your account
                        </Typography>

                        {/* Security Badge */}
                        <Box
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.5,
                                px: 2,
                                py: 0.5,
                                borderRadius: '20px',
                                bgcolor: 'success.softBg',
                                border: '1px solid',
                                borderColor: 'success.outlinedBorder',
                            }}
                        >
                            <Box
                                sx={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: '50%',
                                    bgcolor: 'success.solidBg',
                                }}
                            />
                            <Typography level="body-xs" sx={{ color: 'success.solidBg', fontWeight: 600 }}>
                                Secure Connection
                            </Typography>
                        </Box>
                    </Box>

                    {error && (
                        <Alert color="danger" sx={{ mb: 3, borderRadius: '12px' }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <Stack spacing={2.5}>
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

                            <FormControl required>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <FormLabel sx={{ fontWeight: 600 }}>Password</FormLabel>
                                    <Link
                                        component={NextLink}
                                        href="/forgot-password"
                                        level="body-sm"
                                        sx={{ fontWeight: 500 }}
                                    >
                                        Forgot password?
                                    </Link>
                                </Box>
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
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

                            <Button
                                type="submit"
                                fullWidth
                                loading={loading}
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
                                Sign in
                            </Button>
                        </Stack>
                    </form>

                    <Divider sx={{ my: 3 }}>or</Divider>

                    <Box sx={{ textAlign: 'center' }}>
                        <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                            Don't have an account?{' '}
                            <Link
                                component={NextLink}
                                href="/register"
                                fontWeight="lg"
                                sx={{
                                    color: 'primary.500',
                                    '&:hover': { color: 'primary.600' },
                                }}
                            >
                                Sign up
                            </Link>
                        </Typography>
                    </Box>
                </Card>
            </Box>

            {/* Success Notification */}
            <Snackbar
                open={showSuccess}
                autoHideDuration={3000}
                onClose={() => setShowSuccess(false)}
                color="success"
                variant="solid"
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                startDecorator={<CheckCircleRoundedIcon />}
                sx={{
                    borderRadius: '12px',
                    fontWeight: 600,
                }}
            >
                Login successful! Redirecting to dashboard...
            </Snackbar>
        </Box>
    );
}
