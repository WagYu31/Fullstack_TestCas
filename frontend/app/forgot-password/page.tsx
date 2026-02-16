'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
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
import NextLink from 'next/link';

// Icons
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/auth/forgot-password', { email });
            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal mengirim email reset. Silakan coba lagi.');
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
                        We're Here
                        <br />
                        to Help
                    </Typography>
                    <Typography level="body-lg" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 4, maxWidth: 500, fontSize: '1.125rem', lineHeight: 1.7, fontWeight: 400 }}>
                        Forgot your password? No worries! We'll help you reset it quickly and securely.
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
                                <LockResetRoundedIcon sx={{ color: 'white', fontSize: 24 }} />
                            </Box>
                            <Box>
                                <Typography level="title-md" sx={{ color: 'white', fontWeight: 700, mb: 0.5 }}>
                                    Quick Reset
                                </Typography>
                                <Typography level="body-sm" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                    Reset your password in just a few simple steps
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
                                <EmailRoundedIcon sx={{ color: 'white', fontSize: 24 }} />
                            </Box>
                            <Box>
                                <Typography level="title-md" sx={{ color: 'white', fontWeight: 700, mb: 0.5 }}>
                                    Email Verification
                                </Typography>
                                <Typography level="body-sm" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                    We'll send a secure reset link to your email address
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
                                <SupportAgentRoundedIcon sx={{ color: 'white', fontSize: 24 }} />
                            </Box>
                            <Box>
                                <Typography level="title-md" sx={{ color: 'white', fontWeight: 700, mb: 0.5 }}>
                                    24/7 Support
                                </Typography>
                                <Typography level="body-sm" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                    Need help? Our support team is always available
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

            {/* Right Side - Forgot Password Form */}
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
                        {!success && (
                            <>
                                <Typography level="h2" component="h1" sx={{ mb: 1, fontWeight: 800, letterSpacing: '-0.02em' }}>
                                    Forgot Password?
                                </Typography>
                                <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 2 }}>
                                    No worries! Enter your email and we'll send you reset instructions.
                                </Typography>

                                {/* Security Note */}
                                <Box
                                    sx={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 0.5,
                                        px: 2,
                                        py: 0.5,
                                        borderRadius: '20px',
                                        bgcolor: 'primary.softBg',
                                        border: '1px solid',
                                        borderColor: 'primary.outlinedBorder',
                                    }}
                                >
                                    <Typography level="body-xs" sx={{ color: 'primary.solidBg', fontWeight: 600 }}>
                                        🔒 Secure password reset process
                                    </Typography>
                                </Box>
                            </>
                        )}
                    </Box>

                    {success ? (
                        /* Success State */
                        <Stack spacing={3} alignItems="center" sx={{ textAlign: 'center', py: 2 }}>
                            <Box
                                sx={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #10b981, #059669)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                }}
                            >
                                <CheckCircleRoundedIcon sx={{ fontSize: 32 }} />
                            </Box>

                            <Box>
                                <Typography level="h3" sx={{ mb: 1, fontWeight: 800, letterSpacing: '-0.02em' }}>
                                    Check Your Email
                                </Typography>
                                <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                                    We've sent password reset instructions to
                                </Typography>
                                <Typography level="body-sm" sx={{ fontWeight: 600, mt: 0.5 }}>
                                    {email}
                                </Typography>
                            </Box>

                            <Alert color="primary" sx={{ borderRadius: '12px', width: '100%' }}>
                                <Typography level="body-sm">
                                    <strong>Didn't receive the email?</strong>
                                    <br />
                                    Check your spam folder or try again in a few minutes.
                                </Typography>
                            </Alert>

                            <Button
                                component={NextLink}
                                href="/login"
                                fullWidth
                                size="lg"
                                sx={{
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                                    fontWeight: 600,
                                    py: 1.5,
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #0891b2, #0e7490)',
                                    },
                                }}
                            >
                                Return to Login
                            </Button>
                        </Stack>
                    ) : (
                        /* Form State */
                        <>
                            {/* Back Button */}
                            <Link
                                component={NextLink}
                                href="/login"
                                level="body-sm"
                                startDecorator={<ArrowBackRoundedIcon />}
                                sx={{
                                    mb: 3,
                                    display: 'inline-flex',
                                    fontWeight: 500,
                                }}
                            >
                                Back to login
                            </Link>

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
                                        Send Reset Link
                                    </Button>
                                </Stack>
                            </form>

                            <Divider sx={{ my: 3 }}>or</Divider>

                            <Stack spacing={2}>
                                <Button
                                    component={NextLink}
                                    href="/login"
                                    variant="outlined"
                                    fullWidth
                                    size="lg"
                                    sx={{
                                        borderRadius: '12px',
                                        fontWeight: 600,
                                    }}
                                >
                                    Try logging in again
                                </Button>

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
                            </Stack>
                        </>
                    )}
                </Card>
            </Box>
        </Box>
    );
}
