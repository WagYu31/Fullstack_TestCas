'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import NextLink from 'next/link';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import IconButton from '@mui/joy/IconButton';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('Password minimal 6 karakter.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Password dan konfirmasi tidak cocok.');
            return;
        }

        if (!token) {
            setError('Token reset tidak valid. Silakan request ulang dari halaman Forgot Password.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/reset-password', { token, newPassword: password });
            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal reset password. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.body', p: 4 }}>
                <Card variant="outlined" sx={{ maxWidth: 480, width: '100%', p: 5, borderRadius: '20px', textAlign: 'center' }}>
                    <Typography level="h3" sx={{ mb: 2, fontWeight: 800 }}>Token Tidak Valid</Typography>
                    <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 3 }}>
                        Link reset password tidak valid atau sudah kedaluwarsa. Silakan request ulang.
                    </Typography>
                    <Button component={NextLink} href="/forgot-password" fullWidth size="lg"
                        sx={{ borderRadius: '12px', background: 'linear-gradient(135deg, #06b6d4, #0891b2)', fontWeight: 600, py: 1.5 }}>
                        Request Reset Password
                    </Button>
                </Card>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex' }}>
            {/* Left Side */}
            <Box sx={{
                display: { xs: 'none', md: 'flex' }, width: '50%',
                background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
                p: 8, flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                position: 'relative', overflow: 'hidden',
            }}>
                <Box sx={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(40px)' }} />
                <Box sx={{ position: 'absolute', bottom: -150, left: -150, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(60px)' }} />
                <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                    <LockResetRoundedIcon sx={{ fontSize: 80, color: 'white', mb: 3 }} />
                    <Typography level="h1" sx={{ color: 'white', fontWeight: 900, mb: 2, fontSize: '2.5rem', letterSpacing: '-0.03em' }}>
                        Buat Password Baru
                    </Typography>
                    <Typography level="body-lg" sx={{ color: 'rgba(255,255,255,0.85)', maxWidth: 400 }}>
                        Masukkan password baru untuk mengamankan akun Anda.
                    </Typography>
                </Box>
            </Box>

            {/* Right Side - Form */}
            <Box sx={{ width: { xs: '100%', md: '50%' }, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4, bgcolor: 'background.body' }}>
                <Card variant="outlined" sx={{
                    maxWidth: 480, width: '100%', p: 5, borderRadius: '20px',
                    boxShadow: { xs: 'none', md: '0 8px 32px rgba(0, 0, 0, 0.08)' },
                    border: { xs: 'none', md: '1px solid' }, borderColor: 'divider',
                }}>
                    {success ? (
                        <Stack spacing={3} alignItems="center" sx={{ textAlign: 'center', py: 2 }}>
                            <Box sx={{
                                width: 64, height: 64, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                            }}>
                                <CheckCircleRoundedIcon sx={{ fontSize: 32 }} />
                            </Box>
                            <Box>
                                <Typography level="h3" sx={{ mb: 1, fontWeight: 800 }}>Password Berhasil Direset!</Typography>
                                <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                                    Password Anda telah berhasil diperbarui. Silakan login dengan password baru.
                                </Typography>
                            </Box>
                            <Button component={NextLink} href="/login" fullWidth size="lg"
                                sx={{
                                    borderRadius: '12px', background: 'linear-gradient(135deg, #06b6d4, #0891b2)', fontWeight: 600, py: 1.5,
                                    '&:hover': { background: 'linear-gradient(135deg, #0891b2, #0e7490)' }
                                }}>
                                Login Sekarang
                            </Button>
                        </Stack>
                    ) : (
                        <>
                            <Box sx={{ mb: 4, textAlign: 'center' }}>
                                <Typography level="h2" component="h1" sx={{ mb: 1, fontWeight: 800, letterSpacing: '-0.02em' }}>
                                    Reset Password
                                </Typography>
                                <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
                                    Masukkan password baru untuk akun Anda.
                                </Typography>
                            </Box>

                            {error && (
                                <Alert color="danger" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>
                            )}

                            <form onSubmit={handleSubmit}>
                                <Stack spacing={2.5}>
                                    <FormControl required>
                                        <FormLabel sx={{ fontWeight: 600 }}>Password Baru</FormLabel>
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Minimal 6 karakter"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            size="lg"
                                            endDecorator={
                                                <IconButton variant="plain" onClick={() => setShowPassword(!showPassword)}>
                                                    {showPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                                                </IconButton>
                                            }
                                            sx={{ borderRadius: '12px', '--Input-focusedThickness': '2px' }}
                                        />
                                    </FormControl>

                                    <FormControl required>
                                        <FormLabel sx={{ fontWeight: 600 }}>Konfirmasi Password</FormLabel>
                                        <Input
                                            type="password"
                                            placeholder="Ulangi password baru"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            size="lg"
                                            sx={{ borderRadius: '12px', '--Input-focusedThickness': '2px' }}
                                        />
                                    </FormControl>

                                    <Button type="submit" fullWidth loading={loading} size="lg"
                                        sx={{
                                            mt: 1, borderRadius: '12px', background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                                            fontWeight: 600, py: 1.5, '&:hover': { background: 'linear-gradient(135deg, #0891b2, #0e7490)' }
                                        }}>
                                        Reset Password
                                    </Button>
                                </Stack>
                            </form>

                            <Box sx={{ textAlign: 'center', mt: 3 }}>
                                <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                                    Ingat password Anda?{' '}
                                    <Link component={NextLink} href="/login" fontWeight="lg"
                                        sx={{ color: 'primary.500', '&:hover': { color: 'primary.600' } }}>
                                        Login
                                    </Link>
                                </Typography>
                            </Box>
                        </>
                    )}
                </Card>
            </Box>
        </Box>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography>Loading...</Typography>
            </Box>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}
