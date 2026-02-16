'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import Box from '@mui/joy/Box';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Typography from '@mui/joy/Typography';
import CircularProgress from '@mui/joy/CircularProgress';
import Button from '@mui/joy/Button';
import Stack from '@mui/joy/Stack';
import Divider from '@mui/joy/Divider';
import Avatar from '@mui/joy/Avatar';
import Chip from '@mui/joy/Chip';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import LinearProgress from '@mui/joy/LinearProgress';
import { useColorScheme } from '@mui/joy/styles';
import NextLink from 'next/link';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

// Icons
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PendingRoundedIcon from '@mui/icons-material/PendingRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import FolderOpenRoundedIcon from '@mui/icons-material/FolderOpenRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import EastRoundedIcon from '@mui/icons-material/EastRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';

interface Stats {
    total: number;
    active: number;
    pending: number;
    pendingDelete: number;
    pendingReplace: number;
    typeStats: Record<string, number>;
    typeDates: Record<string, { latest: string; earliest: string }>;
    monthlyStats: Array<{ yearMonth: string; type: string; count: number }>;
}

/* ══════════════════════════════════════════════════════════
 * Minimal Dashboard color system
 * ══════════════════════════════════════════════════════════ */
const palette = {
    green: { main: '#00A76F', light: '#5BE49B', dark: '#007867', lighter: '#C8FAD6', darker: '#004B50' },
    blue: { main: '#0065FF', light: '#77CEFF', dark: '#003DB5', lighter: '#D6E4FF', darker: '#002766' },
    warning: { main: '#FFAB00', light: '#FFD666', dark: '#B76E00', lighter: '#FFF5CC', darker: '#7A4100' },
    error: { main: '#FF5630', light: '#FFAC82', dark: '#B71D18', lighter: '#FFE9D5', darker: '#7A0916' },
    purple: { main: '#8E33FF', light: '#C684FF', dark: '#5119B7', lighter: '#EFD6FF', darker: '#27097A' },
};

/* ══════════════════════════════════════════════════════════
 * Main Dashboard
 * ══════════════════════════════════════════════════════════ */
export default function DashboardPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [dashTypeFilter, setDashTypeFilter] = useState('ALL');
    const [donutAnimKey, setDonutAnimKey] = useState(0);
    const [chartYear, setChartYear] = useState(new Date().getFullYear());
    const [rateFilter, setRateFilter] = useState<'active' | 'pending' | 'delete'>('active');
    const [docOverviewFilter, setDocOverviewFilter] = useState('ALL');
    const [overviewAnimKey, setOverviewAnimKey] = useState(0);
    const { mode } = useColorScheme();
    const isDark = mode === 'dark';

    // Animated percentage counter (RPM-style)
    const [animatedPct, setAnimatedPct] = useState(0);
    const animRef = useRef<number>(0);

    useEffect(() => {
        if (!isAuthenticated) { router.push('/login'); return; }
        fetchDashboardData();
    }, [isAuthenticated, router]);

    const fetchDashboardData = async () => {
        try {
            const statsRes = await api.get('/documents/stats');
            setStats(statsRes.data);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const total = stats?.total || 0;
    const active = stats?.active || 0;
    const pendingDel = stats?.pendingDelete || 0;
    const pendingReplace = stats?.pendingReplace || 0;
    const pending = stats?.pending || 0;
    const rateValue = rateFilter === 'active' ? active : rateFilter === 'pending' ? pending : pendingDel;
    const pct = total > 0 ? Math.round((rateValue / total) * 100) : 0;

    // Count-up animation for pct
    useEffect(() => {
        if (pct === 0) { setAnimatedPct(0); return; }
        const duration = 1500;
        const startTime = performance.now();
        const startVal = 0;
        const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setAnimatedPct(Math.round(startVal + (pct - startVal) * eased));
            if (progress < 1) animRef.current = requestAnimationFrame(animate);
        };
        animRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animRef.current);
    }, [pct, rateFilter]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress size="lg" sx={{ '--CircularProgress-size': '80px' }}>
                    <img src="/images/cybermax-logo.png" alt="Cybermax" style={{ width: 40, height: 40, objectFit: 'contain' }} />
                </CircularProgress>
            </Box>
        );
    }

    const typeStats = stats?.typeStats || {};
    const typeDates = stats?.typeDates || {};
    const monthlyStats = stats?.monthlyStats || [];

    const firstName = user?.name?.split(' ')[0] || 'User';
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const isAdmin = user?.role === 'ADMIN';

    const cardSx = {
        borderRadius: '16px',
        bgcolor: isDark ? 'rgba(145,158,171,0.08)' : '#fff',
        boxShadow: isDark ? 'none' : '0 0 2px 0 rgba(145,158,171,0.2), 0 12px 24px -4px rgba(145,158,171,0.12)',
        border: isDark ? '1px solid rgba(145,158,171,0.16)' : 'none',
        cursor: 'pointer',
        willChange: 'transform, box-shadow',
        transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.5s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:active': {
            transform: 'scale(0.97) !important',
            transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        },
    };

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>

            {/* ── Card Entrance Animations ── */}
            <style>{`
                @keyframes fadeSlideUp {
                    0% { opacity: 0; transform: translateY(40px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeSlideLeft {
                    0% { opacity: 0; transform: translateX(-40px); }
                    100% { opacity: 1; transform: translateX(0); }
                }
                @keyframes fadeSlideRight {
                    0% { opacity: 0; transform: translateX(40px); }
                    100% { opacity: 1; transform: translateX(0); }
                }
                @keyframes scaleIn {
                    0% { opacity: 0; transform: scale(0.85); }
                    100% { opacity: 1; transform: scale(1); }
                }
                @keyframes iconBounce {
                    0%, 100% { transform: translateY(0) scale(1); }
                    50% { transform: translateY(-4px) scale(1.08); }
                }
                @keyframes shimmer {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                @keyframes gentleFloat {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                @keyframes clickRipple {
                    0% { box-shadow: 0 0 0 0 rgba(0,167,111,0.4); }
                    100% { box-shadow: 0 0 0 20px rgba(0,167,111,0); }
                }
            `}</style>

            {/* ╔══════════════════════════════════════════╗
               ║         WELCOME HERO BANNER              ║
               ╚══════════════════════════════════════════╝ */}
            <Card
                variant="plain"
                sx={{
                    mb: { xs: 2.5, md: 4 },
                    borderRadius: { xs: '16px', md: '20px' },
                    overflow: 'hidden',
                    position: 'relative',
                    background: isDark
                        ? `linear-gradient(135deg, ${palette.green.darker} 0%, #0A2E28 50%, #0F3D2E 100%)`
                        : `linear-gradient(135deg, ${palette.green.lighter} 0%, #B5F5D0 40%, #E0FBE9 100%)`,
                    boxShadow: isDark
                        ? '0 12px 32px 0 rgba(0,0,0,0.32)'
                        : '0 12px 32px 0 rgba(0, 167, 111, 0.16)',
                    minHeight: { xs: 160, sm: 190, md: 220 },
                    animation: 'fadeSlideUp 0.6s ease-out both',
                }}
            >
                <CardContent
                    sx={{
                        p: { xs: 3, md: 5 },
                        position: 'relative',
                        zIndex: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                    }}
                >
                    {/* Badge */}
                    <Chip
                        size="sm"
                        variant="soft"
                        sx={{
                            mb: 2,
                            alignSelf: 'flex-start',
                            bgcolor: isDark ? 'rgba(91,228,155,0.16)' : 'rgba(0,75,80,0.08)',
                            color: isDark ? palette.green.light : palette.green.darker,
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            letterSpacing: '0.5px',
                            borderRadius: '8px',
                            px: 1.5,
                        }}
                    >
                        {isAdmin ? '🛡️ ADMIN DASHBOARD' : '📄 MY WORKSPACE'}
                    </Chip>

                    <Typography
                        level="h2"
                        sx={{
                            fontWeight: 800,
                            color: isDark ? '#fff' : palette.green.darker,
                            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
                            letterSpacing: '-0.5px',
                            mb: 0.75,
                            lineHeight: 1.3,
                        }}
                    >
                        {greeting}, {firstName}! 👋
                    </Typography>

                    <Typography
                        level="body-md"
                        sx={{
                            color: isDark ? 'rgba(255,255,255,0.56)' : 'rgba(0,75,80,0.56)',
                            maxWidth: 440,
                            mb: { xs: 2, md: 3.5 },
                            lineHeight: 1.7,
                            fontSize: { xs: '0.8rem', sm: '0.875rem' },
                        }}
                    >
                        {isAdmin
                            ? 'Manage documents & review permission requests from your admin panel.'
                            : 'View and manage your documents, track requests and stay up to date.'}
                    </Typography>

                    <Button
                        component={NextLink}
                        href={isAdmin ? '/dashboard/admin' : '/dashboard/documents'}
                        endDecorator={<EastRoundedIcon sx={{ fontSize: 18 }} />}
                        sx={{
                            alignSelf: 'flex-start',
                            bgcolor: isDark ? palette.green.light : palette.green.darker,
                            color: isDark ? palette.green.darker : '#fff',
                            fontWeight: 700,
                            borderRadius: '10px',
                            px: { xs: 2, md: 3 },
                            py: { xs: 0.8, md: 1.2 },
                            fontSize: { xs: '0.75rem', md: '0.875rem' },
                            boxShadow: `0 8px 16px 0 ${isDark ? 'rgba(91,228,155,0.24)' : 'rgba(0,75,80,0.24)'}`,
                            '&:hover': {
                                bgcolor: isDark ? '#7AEFB2' : '#00363A',
                                transform: 'translateY(-2px)',
                                boxShadow: `0 12px 24px 0 ${isDark ? 'rgba(91,228,155,0.32)' : 'rgba(0,75,80,0.32)'}`,
                            },
                            transition: 'all 0.25s ease',
                        }}
                    >
                        {isAdmin ? 'Permission Requests' : 'View My Documents'}
                    </Button>
                </CardContent>

                {/* Decorative illustration area */}
                <Box
                    sx={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: { xs: '40%', md: '35%' },
                        display: { xs: 'none', sm: 'flex' },
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1,
                    }}
                >
                    {/* Layered circles */}
                    <Box sx={{
                        position: 'absolute', width: 260, height: 260, borderRadius: '50%',
                        bgcolor: isDark ? 'rgba(91,228,155,0.04)' : 'rgba(0,75,80,0.03)',
                    }} />
                    <Box sx={{
                        position: 'absolute', width: 200, height: 200, borderRadius: '50%',
                        bgcolor: isDark ? 'rgba(91,228,155,0.06)' : 'rgba(0,75,80,0.05)',
                    }} />
                    <Box sx={{
                        position: 'absolute', width: 140, height: 140, borderRadius: '50%',
                        bgcolor: isDark ? 'rgba(91,228,155,0.10)' : 'rgba(0,75,80,0.07)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <DescriptionRoundedIcon sx={{
                            fontSize: 56,
                            color: isDark ? 'rgba(91,228,155,0.5)' : 'rgba(0,75,80,0.2)',
                        }} />
                    </Box>
                </Box>
            </Card>

            {/* ╔══════════════════════════════════════════╗
               ║         STAT CARDS WITH GRADIENTS         ║
               ╚══════════════════════════════════════════╝ */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
                gap: { xs: 1.5, sm: 2, md: 3 }, mb: { xs: 2.5, md: 4 },
            }}>
                {/* Total */}
                <Card variant="plain" sx={{
                    ...cardSx,
                    animation: 'fadeSlideUp 0.5s ease-out 0.15s both',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: isDark ? `0 12px 24px rgba(0,0,0,0.3), 0 0 0 1px ${palette.green.main}40` : `0 20px 40px ${palette.green.main}25, 0 0 0 1px ${palette.green.main}30`,
                        borderColor: `${palette.green.main}60`,
                    },
                }}>
                    <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                        <Box sx={{
                            width: { xs: 40, md: 52 }, height: { xs: 40, md: 52 }, borderRadius: { xs: '10px', md: '14px' }, mb: { xs: 1.5, md: 2.5 },
                            background: `linear-gradient(135deg, ${palette.green.light} 0%, ${palette.green.main} 100%)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: `0 8px 16px ${palette.green.main}40`,
                            animation: 'iconBounce 3s ease-in-out infinite',
                        }}>
                            <InsertDriveFileRoundedIcon sx={{ fontSize: 26, color: '#fff' }} />
                        </Box>
                        <Typography sx={{ fontWeight: 800, color: 'text.primary', fontSize: { xs: '1.5rem', md: '2rem' }, letterSpacing: '-1px', lineHeight: 1, mb: 0.5 }}>
                            {total}
                        </Typography>
                        <Typography level="body-sm" sx={{ color: 'text.tertiary', fontWeight: 600, fontSize: { xs: '0.7rem', md: '0.8rem' } }}>
                            Total Documents
                        </Typography>
                    </CardContent>
                </Card>

                {/* Active */}
                <Card variant="plain" sx={{
                    ...cardSx,
                    animation: 'fadeSlideUp 0.5s ease-out 0.25s both',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: isDark ? `0 12px 24px rgba(0,0,0,0.3), 0 0 0 1px ${palette.blue.main}40` : `0 20px 40px ${palette.blue.main}25, 0 0 0 1px ${palette.blue.main}30`,
                        borderColor: `${palette.blue.main}60`,
                    },
                }}>
                    <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                        <Box sx={{
                            width: { xs: 40, md: 52 }, height: { xs: 40, md: 52 }, borderRadius: { xs: '10px', md: '14px' }, mb: { xs: 1.5, md: 2.5 },
                            background: `linear-gradient(135deg, ${palette.blue.light} 0%, ${palette.blue.main} 100%)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: `0 8px 16px ${palette.blue.main}40`,
                            animation: 'iconBounce 3s ease-in-out 0.5s infinite',
                        }}>
                            <CheckCircleRoundedIcon sx={{ fontSize: 26, color: '#fff' }} />
                        </Box>
                        <Typography sx={{ fontWeight: 800, color: 'text.primary', fontSize: { xs: '1.5rem', md: '2rem' }, letterSpacing: '-1px', lineHeight: 1, mb: 0.5 }}>
                            {active}
                        </Typography>
                        <Typography level="body-sm" sx={{ color: 'text.tertiary', fontWeight: 600, fontSize: { xs: '0.7rem', md: '0.8rem' } }}>
                            Active Documents
                        </Typography>
                    </CardContent>
                </Card>

                <Card variant="plain" sx={{
                    ...cardSx,
                    animation: 'fadeSlideUp 0.5s ease-out 0.35s both',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: isDark ? `0 12px 24px rgba(0,0,0,0.3), 0 0 0 1px ${palette.warning.main}40` : `0 20px 40px ${palette.warning.main}25, 0 0 0 1px ${palette.warning.main}30`,
                        borderColor: `${palette.warning.main}60`,
                    },
                }}>
                    <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                        <Box sx={{
                            width: { xs: 40, md: 52 }, height: { xs: 40, md: 52 }, borderRadius: { xs: '10px', md: '14px' }, mb: { xs: 1.5, md: 2.5 },
                            background: `linear-gradient(135deg, ${palette.warning.light} 0%, ${palette.warning.main} 100%)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: `0 8px 16px ${palette.warning.main}40`,
                            animation: 'iconBounce 3s ease-in-out 1s infinite',
                        }}>
                            <PendingRoundedIcon sx={{ fontSize: 26, color: '#fff' }} />
                        </Box>
                        <Typography sx={{ fontWeight: 800, color: 'text.primary', fontSize: { xs: '1.5rem', md: '2rem' }, letterSpacing: '-1px', lineHeight: 1, mb: 0.5 }}>
                            {pending}
                        </Typography>
                        <Typography level="body-sm" sx={{ color: 'text.tertiary', fontWeight: 600, fontSize: { xs: '0.7rem', md: '0.8rem' } }}>
                            Pending Requests
                        </Typography>
                    </CardContent>
                </Card>

                <Card variant="plain" sx={{
                    ...cardSx,
                    animation: 'fadeSlideUp 0.5s ease-out 0.45s both',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: isDark ? `0 12px 24px rgba(0,0,0,0.3), 0 0 0 1px ${palette.error.main}40` : `0 20px 40px ${palette.error.main}25, 0 0 0 1px ${palette.error.main}30`,
                        borderColor: `${palette.error.main}60`,
                    },
                }}>
                    <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                        <Box sx={{
                            width: { xs: 40, md: 52 }, height: { xs: 40, md: 52 }, borderRadius: { xs: '10px', md: '14px' }, mb: { xs: 1.5, md: 2.5 },
                            background: `linear-gradient(135deg, ${palette.error.light} 0%, ${palette.error.main} 100%)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: `0 8px 16px ${palette.error.main}40`,
                            animation: 'iconBounce 3s ease-in-out 1.5s infinite',
                        }}>
                            <DeleteOutlineRoundedIcon sx={{ fontSize: 26, color: '#fff' }} />
                        </Box>
                        <Typography sx={{ fontWeight: 800, color: 'text.primary', fontSize: { xs: '1.5rem', md: '2rem' }, letterSpacing: '-1px', lineHeight: 1, mb: 0.5 }}>
                            {pendingDel}
                        </Typography>
                        <Typography level="body-sm" sx={{ color: 'text.tertiary', fontWeight: 600, fontSize: { xs: '0.7rem', md: '0.8rem' } }}>
                            Pending Delete
                        </Typography>
                    </CardContent>
                </Card>
            </Box>

            {/* ╔══════════════════════════════════════════╗
               ║         MIDDLE ANALYTICS ROW              ║
               ╚══════════════════════════════════════════╝ */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '5fr 7fr' },
                gap: { xs: 1.5, sm: 2, md: 3 }, mb: { xs: 2.5, md: 4 },
            }}>
                {/* ── Active Rate Radial ── */}
                <Card variant="plain" sx={{
                    ...cardSx,
                    animation: 'fadeSlideLeft 0.6s ease-out 0.5s both',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: isDark ? `0 12px 24px rgba(0,0,0,0.3), 0 0 0 1px ${palette.green.main}40` : `0 16px 32px ${palette.green.main}18, 0 0 0 1px ${palette.green.main}25`,
                    },
                }}>
                    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.25 }}>
                            <Box>
                                <Typography level="title-lg" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.25 }}>
                                    {rateFilter === 'active' ? 'Active' : rateFilter === 'pending' ? 'Pending' : 'Delete'} Rate
                                </Typography>
                                <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
                                    Percentage of {rateFilter} documents
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.75, mt: 1.5, mb: 2 }}>
                            {[
                                { key: 'active' as const, label: 'Active', color: palette.green.main },
                                { key: 'pending' as const, label: 'Pending', color: palette.warning.main },
                                { key: 'delete' as const, label: 'Delete', color: palette.error.main },
                            ].map(f => (
                                <Box key={f.key}
                                    onClick={() => setRateFilter(f.key)}
                                    sx={{
                                        cursor: 'pointer', px: 1.5, py: 0.5, borderRadius: '8px',
                                        fontSize: '0.72rem', fontWeight: rateFilter === f.key ? 700 : 500,
                                        color: rateFilter === f.key ? '#fff' : 'text.tertiary',
                                        bgcolor: rateFilter === f.key ? f.color : (isDark ? 'rgba(145,158,171,0.08)' : 'rgba(145,158,171,0.06)'),
                                        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                                        '&:hover': { bgcolor: rateFilter === f.key ? f.color : (isDark ? 'rgba(145,158,171,0.12)' : 'rgba(145,158,171,0.1)') },
                                    }}>
                                    {f.label}
                                </Box>
                            ))}
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                                {/* Background track (full ring) */}
                                <svg width="180" height="180" viewBox="0 0 180 180">
                                    <circle
                                        cx="90" cy="90" r="75"
                                        fill="none"
                                        stroke={isDark ? 'rgba(145,158,171,0.12)' : 'rgba(145,158,171,0.08)'}
                                        strokeWidth="14"
                                    />
                                    <circle
                                        cx="90" cy="90" r="75"
                                        fill="none"
                                        stroke={`url(#rateGradient-${rateFilter})`}
                                        strokeWidth="14"
                                        strokeLinecap="round"
                                        strokeDasharray={`${2 * Math.PI * 75}`}
                                        strokeDashoffset={`${2 * Math.PI * 75 * (1 - animatedPct / 100)}`}
                                        transform="rotate(-90 90 90)"
                                        style={{ transition: 'stroke-dashoffset 0.1s linear, stroke 0.3s ease' }}
                                    />
                                    <defs>
                                        <linearGradient id="rateGradient-active" x1="0" y1="0" x2="1" y2="1">
                                            <stop offset="0%" stopColor={palette.green.light} />
                                            <stop offset="100%" stopColor={palette.green.main} />
                                        </linearGradient>
                                        <linearGradient id="rateGradient-pending" x1="0" y1="0" x2="1" y2="1">
                                            <stop offset="0%" stopColor={palette.warning.light} />
                                            <stop offset="100%" stopColor={palette.warning.main} />
                                        </linearGradient>
                                        <linearGradient id="rateGradient-delete" x1="0" y1="0" x2="1" y2="1">
                                            <stop offset="0%" stopColor={palette.error.light} />
                                            <stop offset="100%" stopColor={palette.error.main} />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <Box sx={{
                                    position: 'absolute', inset: 0,
                                    display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Typography sx={{
                                        fontWeight: 800, color: 'text.primary',
                                        fontSize: '2.25rem', letterSpacing: '-1px', lineHeight: 1,
                                    }}>
                                        {animatedPct}%
                                    </Typography>
                                    <Typography level="body-xs" sx={{ color: 'text.tertiary', mt: 0.5, fontWeight: 600 }}>
                                        {rateFilter}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        <Divider sx={{ borderStyle: 'dashed', my: 2 }} />

                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, textAlign: 'center' }}>
                            {[
                                { val: total, label: 'Total', color: 'text.primary' },
                                { val: active, label: 'Active', color: palette.green.main },
                                { val: pendingDel, label: 'Delete', color: palette.error.main },
                            ].map((s) => (
                                <Box key={s.label}>
                                    <Typography sx={{ fontWeight: 800, color: s.color, fontSize: '1.5rem', lineHeight: 1, mb: 0.5 }}>
                                        {s.val}
                                    </Typography>
                                    <Typography level="body-xs" sx={{ color: 'text.tertiary', fontWeight: 600 }}>
                                        {s.label}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </CardContent>
                </Card>

                {/* ── Document Overview Bars ── */}
                <Card variant="plain" sx={{
                    ...cardSx,
                    animation: 'fadeSlideRight 0.6s ease-out 0.6s both',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: isDark ? `0 12px 24px rgba(0,0,0,0.3), 0 0 0 1px ${palette.purple.main}40` : `0 16px 32px ${palette.purple.main}18, 0 0 0 1px ${palette.purple.main}25`,
                    },
                }}>
                    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.25 }}>
                            <Typography level="title-lg" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                Document Overview
                            </Typography>
                            <Chip
                                size="sm" variant="soft" color="success"
                                startDecorator={<TrendingUpRoundedIcon sx={{ fontSize: 14 }} />}
                                sx={{ fontWeight: 700, fontSize: '0.7rem', borderRadius: '8px' }}
                            >
                                {total} total
                            </Chip>
                        </Box>
                        <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 1.5 }}>
                            Breakdown by document status
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.75, mb: 3, flexWrap: 'wrap' }}>
                            {[
                                { key: 'ALL', label: 'All' },
                                { key: 'ACTIVE', label: 'Active', color: palette.green.main },
                                { key: 'PENDING', label: 'Pending', color: palette.warning.main },
                                { key: 'DELETE', label: 'Delete', color: palette.error.main },
                                { key: 'REPLACE', label: 'Replace', color: palette.blue.main },
                            ].map(f => (
                                <Box key={f.key}
                                    onClick={() => { setDocOverviewFilter(f.key); setOverviewAnimKey(k => k + 1); }}
                                    sx={{
                                        cursor: 'pointer', px: 1.5, py: 0.5, borderRadius: '8px',
                                        fontSize: '0.72rem', fontWeight: docOverviewFilter === f.key ? 700 : 500,
                                        color: docOverviewFilter === f.key ? '#fff' : 'text.tertiary',
                                        bgcolor: docOverviewFilter === f.key
                                            ? (f.color || (isDark ? 'rgba(145,158,171,0.4)' : 'rgba(145,158,171,0.5)'))
                                            : (isDark ? 'rgba(145,158,171,0.08)' : 'rgba(145,158,171,0.06)'),
                                        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                                        '&:hover': {
                                            bgcolor: docOverviewFilter === f.key
                                                ? (f.color || (isDark ? 'rgba(145,158,171,0.5)' : 'rgba(145,158,171,0.6)'))
                                                : (isDark ? 'rgba(145,158,171,0.12)' : 'rgba(145,158,171,0.1)')
                                        },
                                    }}>
                                    {f.label}
                                </Box>
                            ))}
                        </Box>

                        <Stack spacing={3.5} key={overviewAnimKey}>
                            <style>{`
                                @keyframes barGrow {
                                    from { width: 0%; }
                                }
                            `}</style>
                            {[
                                { label: 'Active Documents', count: active, pal: palette.green, filterKey: 'ACTIVE' },
                                { label: 'Pending Requests', count: pending, pal: palette.warning, filterKey: 'PENDING' },
                                { label: 'Pending Delete', count: pendingDel, pal: palette.error, filterKey: 'DELETE' },
                                { label: 'Pending Replace', count: pendingReplace, pal: palette.blue, filterKey: 'REPLACE' },
                            ]
                                .filter(item => docOverviewFilter === 'ALL' || item.filterKey === docOverviewFilter)
                                .map((item, idx) => {
                                    const barPct = total > 0 ? Math.max((item.count / total) * 100, item.count > 0 ? 6 : 0) : 0;
                                    return (
                                        <Box key={item.label}
                                            sx={{ animation: `fadeSlideUp 0.4s ease-out ${idx * 0.1}s both` }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.25 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Box sx={{
                                                        width: 14, height: 14, borderRadius: '50%',
                                                        background: `linear-gradient(135deg, ${item.pal.light} 0%, ${item.pal.main} 100%)`,
                                                        boxShadow: `0 2px 6px ${item.pal.main}40`,
                                                    }} />
                                                    <Typography level="body-sm" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                                        {item.label}
                                                    </Typography>
                                                </Box>
                                                <Typography level="body-sm" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                                    {item.count}
                                                </Typography>
                                            </Box>
                                            <Box sx={{
                                                bgcolor: isDark ? 'rgba(145,158,171,0.08)' : item.pal.lighter,
                                                borderRadius: '8px', height: 8, overflow: 'hidden',
                                            }}>
                                                <Box sx={{
                                                    background: `linear-gradient(90deg, ${item.pal.light} 0%, ${item.pal.main} 100%)`,
                                                    height: '100%',
                                                    width: `${barPct}%`,
                                                    borderRadius: '8px',
                                                    animation: `barGrow 1.2s cubic-bezier(0.4,0,0.2,1) ${0.2 + idx * 0.15}s both`,
                                                }} />
                                            </Box>
                                        </Box>
                                    );
                                })}
                        </Stack>

                        <Divider sx={{ borderStyle: 'dashed', my: 3 }} />

                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar size="sm" sx={{
                                    bgcolor: isDark ? 'rgba(0,167,111,0.16)' : palette.green.lighter,
                                    color: palette.green.main,
                                }}>
                                    <DescriptionRoundedIcon sx={{ fontSize: 18 }} />
                                </Avatar>
                                <Typography level="body-sm" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                    Total Files
                                </Typography>
                            </Box>
                            <Typography level="title-md" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                {total}
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Box>

            {/* ╔══════════════════════════════════════════╗
               ║         DOCUMENT TYPE STATISTICS          ║
               ╚══════════════════════════════════════════╝ */}
            <Card variant="plain" sx={{
                ...cardSx,
                mb: { xs: 2.5, md: 4 },
                animation: 'fadeSlideUp 0.6s ease-out 0.65s both',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: isDark ? `0 12px 24px rgba(0,0,0,0.3), 0 0 0 1px ${palette.blue.main}40` : `0 16px 32px ${palette.blue.main}18, 0 0 0 1px ${palette.blue.main}25`,
                },
            }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.25, flexWrap: 'wrap', gap: 1 }}>
                        <Typography level="title-lg" sx={{ fontWeight: 700, color: 'text.primary', fontSize: { xs: '1rem', sm: '1.1rem', md: '1.125rem' } }}>
                            Jenis Dokumen
                        </Typography>
                        <Chip
                            size="sm" variant="soft" color="primary"
                            startDecorator={<DescriptionRoundedIcon sx={{ fontSize: 14 }} />}
                            sx={{ fontWeight: 700, fontSize: '0.7rem', borderRadius: '8px' }}
                        >
                            {Object.keys(typeStats).length} jenis
                        </Chip>
                    </Box>
                    <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 2, fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
                        Distribusi dokumen berdasarkan jenis
                    </Typography>

                    {/* Filter tabs */}
                    <Box sx={{ display: 'flex', gap: 0.5, mb: 3, overflowX: 'auto', pb: 0.5, WebkitOverflowScrolling: 'touch', '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none' }}>
                        {[
                            { key: 'ALL', label: 'Semua' },
                            { key: 'CONTRACT', label: 'Kontrak' },
                            { key: 'INVOICE', label: 'Invoice' },
                            { key: 'REPORT', label: 'Laporan' },
                            { key: 'PROPOSAL', label: 'Proposal' },
                        ].map((f) => (
                            <Box
                                key={f.key}
                                onClick={() => { setDashTypeFilter(f.key); setDonutAnimKey(k => k + 1); }}
                                sx={{
                                    cursor: 'pointer',
                                    px: { xs: 1.25, sm: 1.5 },
                                    py: 0.5,
                                    borderRadius: '6px',
                                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                    fontWeight: dashTypeFilter === f.key ? 700 : 500,
                                    color: dashTypeFilter === f.key ? 'text.primary' : 'text.tertiary',
                                    bgcolor: dashTypeFilter === f.key
                                        ? (isDark ? 'rgba(145,158,171,0.12)' : 'rgba(145,158,171,0.08)')
                                        : 'transparent',
                                    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0,
                                    '&:hover': {
                                        color: 'text.primary',
                                        bgcolor: isDark ? 'rgba(145,158,171,0.08)' : 'rgba(145,158,171,0.06)',
                                    },
                                }}
                            >
                                {f.label}
                            </Box>
                        ))}
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '180px 1fr', md: '220px 1fr' }, gap: { xs: 2, sm: 3 }, alignItems: 'center' }}>
                        {/* Donut chart */}
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Box sx={{ position: 'relative', width: '100%', maxWidth: { xs: 160, sm: 180, md: 220 }, aspectRatio: '1 / 1' }}>
                                <svg key={donutAnimKey} width="100%" height="100%" viewBox="0 0 180 180"
                                    style={{ animation: 'donutDraw 0.6s cubic-bezier(0.4,0,0.2,1) both' }}>
                                    <style>{`
                                        @keyframes donutDraw {
                                            0% { opacity: 0; transform: scale(0.85) rotate(-30deg); transform-origin: 90px 90px; }
                                            50% { opacity: 1; }
                                            100% { opacity: 1; transform: scale(1) rotate(0deg); transform-origin: 90px 90px; }
                                        }
                                    `}</style>
                                    {(() => {
                                        const typeEntries = Object.entries(typeStats);
                                        const typeColors: Record<string, string> = {
                                            CONTRACT: palette.blue.main,
                                            INVOICE: palette.purple.main,
                                            REPORT: palette.green.main,
                                            PROPOSAL: palette.warning.main,
                                            OTHER: '#919EAB',
                                        };
                                        const typeLabels: Record<string, string> = {
                                            CONTRACT: 'Kontrak',
                                            INVOICE: 'Invoice',
                                            REPORT: 'Laporan',
                                            PROPOSAL: 'Proposal',
                                            OTHER: 'Lainnya',
                                        };
                                        const radius = 72;
                                        const circumference = 2 * Math.PI * radius;
                                        let offset = 0;
                                        return typeEntries.map(([type, count]) => {
                                            const pctType = total > 0 ? count / total : 0;
                                            const dashLen = circumference * pctType;
                                            const isActive = dashTypeFilter === 'ALL' || dashTypeFilter === type;
                                            const midAngle = ((offset + dashLen / 2) / circumference) * 360 - 90;
                                            const midRad = (midAngle * Math.PI) / 180;
                                            const tooltipX = 90 + Math.cos(midRad) * (radius + 24);
                                            const tooltipY = 90 + Math.sin(midRad) * (radius + 24);
                                            const el = (
                                                <g key={type}>
                                                    <circle
                                                        cx="90" cy="90" r={radius}
                                                        fill="none"
                                                        stroke={typeColors[type] || '#919EAB'}
                                                        strokeWidth={dashTypeFilter === type ? 20 : (isActive ? 16 : 10)}
                                                        strokeDasharray={`${dashLen} ${circumference - dashLen}`}
                                                        strokeDashoffset={-offset}
                                                        transform="rotate(-90 90 90)"
                                                        strokeLinecap="round"
                                                        opacity={isActive ? 1 : 0.15}
                                                        style={{
                                                            cursor: 'pointer',
                                                            transition: 'stroke-width 0.5s cubic-bezier(0.34,1.56,0.64,1), opacity 0.5s cubic-bezier(0.4,0,0.2,1)',
                                                        }}
                                                        onClick={() => { setDashTypeFilter(dashTypeFilter === type ? 'ALL' : type); setDonutAnimKey(k => k + 1); }}
                                                    />
                                                    {dashTypeFilter === type && (
                                                        <g style={{ pointerEvents: 'none' }}>
                                                            <rect
                                                                x={tooltipX - 40} y={tooltipY - 14}
                                                                width="80" height="28" rx="8"
                                                                fill={isDark ? '#1e1e2e' : '#212B36'}
                                                                opacity="0.95"
                                                            />
                                                            <circle cx={tooltipX - 26} cy={tooltipY} r="4" fill={typeColors[type]} />
                                                            <text
                                                                x={tooltipX + 4} y={tooltipY + 1}
                                                                textAnchor="middle"
                                                                dominantBaseline="middle"
                                                                fill="#fff"
                                                                fontSize="11"
                                                                fontWeight="700"
                                                                fontFamily="Inter, sans-serif"
                                                            >
                                                                {typeLabels[type] || type} {count}
                                                            </text>
                                                        </g>
                                                    )}
                                                </g>
                                            );
                                            offset += dashLen;
                                            return el;
                                        });
                                    })()}
                                    {Object.keys(typeStats).length === 0 && (
                                        <circle cx="90" cy="90" r={72} fill="none"
                                            stroke={isDark ? 'rgba(145,158,171,0.12)' : 'rgba(145,158,171,0.08)'}
                                            strokeWidth="16" />
                                    )}
                                </svg>
                                <Box sx={{
                                    position: 'absolute', inset: 0,
                                    display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', justifyContent: 'center',
                                    pointerEvents: 'none',
                                }}>
                                    {dashTypeFilter !== 'ALL' && (
                                        <Typography sx={{
                                            fontWeight: 700, fontSize: '0.7rem', lineHeight: 1.2, mb: 0.25,
                                            color: (() => {
                                                const c: Record<string, string> = { CONTRACT: palette.blue.main, INVOICE: palette.purple.main, REPORT: palette.green.main, PROPOSAL: palette.warning.main, OTHER: '#919EAB' };
                                                return c[dashTypeFilter] || 'text.primary';
                                            })(),
                                            transition: 'all 0.5s cubic-bezier(0.4,0,0.2,1)',
                                        }}>
                                            {(() => {
                                                const labels: Record<string, string> = { CONTRACT: 'Kontrak', INVOICE: 'Invoice', REPORT: 'Laporan', PROPOSAL: 'Proposal', OTHER: 'Lainnya' };
                                                return labels[dashTypeFilter] || dashTypeFilter;
                                            })()}
                                        </Typography>
                                    )}
                                    <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }, color: 'text.primary', lineHeight: 1, transition: 'all 0.5s cubic-bezier(0.4,0,0.2,1)' }}>
                                        {dashTypeFilter === 'ALL' ? total : (typeStats[dashTypeFilter] || 0)}
                                    </Typography>
                                    <Typography level="body-xs" sx={{ color: 'text.tertiary', fontWeight: 600 }}>
                                        {dashTypeFilter === 'ALL' ? 'total' : ''}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        {/* Type bars */}
                        <Stack spacing={2} key={donutAnimKey}>
                            {(() => {
                                const typeColors: Record<string, { main: string; light: string; lighter: string }> = {
                                    CONTRACT: { main: palette.blue.main, light: palette.blue.light, lighter: palette.blue.lighter },
                                    INVOICE: { main: palette.purple.main, light: palette.purple.light, lighter: palette.purple.lighter },
                                    REPORT: { main: palette.green.main, light: palette.green.light, lighter: palette.green.lighter },
                                    PROPOSAL: { main: palette.warning.main, light: palette.warning.light, lighter: palette.warning.lighter },
                                    OTHER: { main: '#919EAB', light: '#B4BCC8', lighter: '#DFE3E8' },
                                };
                                const typeLabels: Record<string, string> = {
                                    CONTRACT: 'Kontrak',
                                    INVOICE: 'Invoice',
                                    REPORT: 'Laporan',
                                    PROPOSAL: 'Proposal',
                                    OTHER: 'Lainnya',
                                };
                                const allTypes = ['CONTRACT', 'INVOICE', 'REPORT', 'PROPOSAL', 'OTHER'];
                                const entries = allTypes.map(type => ({
                                    type,
                                    count: typeStats[type] || 0,
                                    colors: typeColors[type] || typeColors.OTHER,
                                    label: typeLabels[type] || type,
                                }));
                                return entries.map((item, idx) => {
                                    const barPct = total > 0 ? Math.max((item.count / total) * 100, item.count > 0 ? 8 : 0) : 0;
                                    const isActive = dashTypeFilter === 'ALL' || dashTypeFilter === item.type;
                                    const delay = idx * 0.08;
                                    return (
                                        <Box key={item.type} sx={{
                                            opacity: isActive ? 1 : 0.2,
                                            transition: `opacity 0.7s cubic-bezier(0.4,0,0.2,1) ${delay}s, transform 0.7s cubic-bezier(0.4,0,0.2,1) ${delay}s`,
                                            cursor: 'pointer',
                                            transform: isActive && dashTypeFilter !== 'ALL' ? 'translateX(6px) scale(1.02)' : 'translateX(0) scale(1)',
                                            animation: `fadeSlideUp 0.4s ease-out ${idx * 0.1}s both`,
                                            '&:hover': { opacity: 1, transform: 'translateX(6px) scale(1.02)' },
                                        }}
                                            onClick={() => { setDashTypeFilter(dashTypeFilter === item.type ? 'ALL' : item.type); setDonutAnimKey(k => k + 1); }}
                                        >
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Box sx={{
                                                        width: 10, height: 10, borderRadius: '50%',
                                                        bgcolor: item.colors.main,
                                                        boxShadow: isActive ? `0 2px 8px ${item.colors.main}50` : 'none',
                                                        transform: isActive ? 'scale(1.3)' : 'scale(1)',
                                                        transition: `all 0.6s cubic-bezier(0.34,1.56,0.64,1) ${delay}s`,
                                                    }} />
                                                    <Typography level="body-sm" sx={{
                                                        fontWeight: isActive ? 700 : 600,
                                                        color: isActive && dashTypeFilter !== 'ALL' ? item.colors.main : 'text.primary',
                                                        fontSize: '0.8rem',
                                                        transition: `color 0.5s cubic-bezier(0.4,0,0.2,1) ${delay}s`,
                                                    }}>
                                                        {item.label}
                                                    </Typography>
                                                </Box>
                                                <Typography level="body-sm" sx={{
                                                    fontWeight: 700,
                                                    color: isActive && dashTypeFilter !== 'ALL' ? item.colors.main : 'text.primary',
                                                    fontSize: isActive && dashTypeFilter !== 'ALL' ? '0.95rem' : '0.875rem',
                                                    transition: `all 0.5s cubic-bezier(0.4,0,0.2,1) ${delay}s`,
                                                }}>
                                                    {item.count}
                                                </Typography>
                                            </Box>
                                            <Box sx={{
                                                bgcolor: isDark ? 'rgba(145,158,171,0.08)' : item.colors.lighter,
                                                borderRadius: '8px', height: isActive && dashTypeFilter !== 'ALL' ? 10 : isActive ? 7 : 5,
                                                overflow: 'hidden',
                                                transition: `all 0.6s cubic-bezier(0.4,0,0.2,1) ${delay}s`,
                                            }}>
                                                <Box sx={{
                                                    background: `linear-gradient(90deg, ${item.colors.light} 0%, ${item.colors.main} 100%)`,
                                                    height: '100%',
                                                    width: `${barPct}%`,
                                                    borderRadius: '8px',
                                                    animation: `barGrow 1s cubic-bezier(0.4,0,0.2,1) ${0.15 + idx * 0.12}s both`,
                                                }} />
                                            </Box>

                                        </Box>
                                    );
                                });
                            })()}
                        </Stack>
                    </Box>
                </CardContent>
            </Card>

            {/* ╔══════════════════════════════════════════╗
               ║     MONTHLY DOCUMENT CHART                ║
               ╚══════════════════════════════════════════╝ */}
            <Card variant="plain" sx={{ ...cardSx, p: 0, animation: 'fadeSlideUp 0.5s ease-out 0.65s both' }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box>
                            <Typography level="title-lg" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1.1rem' }}>
                                Aktivitas Dokumen
                            </Typography>
                            <Typography level="body-sm" sx={{ color: 'text.tertiary', fontSize: '0.8rem' }}>
                                Request dokumen per bulan berdasarkan jenis
                            </Typography>
                        </Box>
                        <Select
                            value={chartYear}
                            onChange={(_, v) => v && setChartYear(v)}
                            size="sm"
                            variant="outlined"
                            sx={{
                                minWidth: 100,
                                borderRadius: '10px',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                bgcolor: isDark ? 'rgba(145,158,171,0.08)' : 'rgba(145,158,171,0.04)',
                                borderColor: isDark ? 'rgba(145,158,171,0.2)' : 'rgba(145,158,171,0.15)',
                            }}
                        >
                            {[2025, 2026, 2027, 2028, 2029, 2030].map(y => (
                                <Option key={y} value={y}>{y}</Option>
                            ))}
                        </Select>
                    </Box>

                    {/* Legend */}
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                        {[
                            { key: 'CONTRACT', label: 'Kontrak', color: palette.blue.main },
                            { key: 'INVOICE', label: 'Invoice', color: palette.purple.main },
                            { key: 'REPORT', label: 'Laporan', color: palette.green.main },
                            { key: 'PROPOSAL', label: 'Proposal', color: palette.warning.main },
                            { key: 'OTHER', label: 'Lainnya', color: '#919EAB' },
                        ].map(l => (
                            <Box key={l.key} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: l.color }} />
                                <Typography level="body-xs" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>{l.label}</Typography>
                            </Box>
                        ))}
                    </Box>

                    {/* Recharts stacked bar chart */}
                    {(() => {
                        const typeChartColors: Record<string, string> = {
                            CONTRACT: palette.blue.main,
                            INVOICE: palette.purple.main,
                            REPORT: palette.green.main,
                            PROPOSAL: palette.warning.main,
                            OTHER: '#919EAB',
                        };
                        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
                        const chartData = monthNames.map((name, i) => {
                            const key = `${chartYear}-${String(i + 1).padStart(2, '0')}`;
                            const row: Record<string, any> = { month: name };
                            let found = false;
                            for (const entry of monthlyStats) {
                                if (entry.yearMonth === key) {
                                    row[entry.type] = (row[entry.type] || 0) + entry.count;
                                    found = true;
                                }
                            }
                            if (!found) {
                                row.CONTRACT = 0; row.INVOICE = 0; row.REPORT = 0; row.PROPOSAL = 0; row.OTHER = 0;
                            }
                            return row;
                        });

                        const CustomTooltip = ({ active, payload, label }: any) => {
                            if (!active || !payload?.length) return null;
                            const typeLabelsMap: Record<string, string> = {
                                CONTRACT: 'Kontrak', INVOICE: 'Invoice', REPORT: 'Laporan', PROPOSAL: 'Proposal', OTHER: 'Lainnya',
                            };
                            return (
                                <Box sx={{
                                    bgcolor: isDark ? '#1e293b' : '#fff',
                                    borderRadius: '12px',
                                    p: 1.5,
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                                    border: `1px solid ${isDark ? 'rgba(145,158,171,0.15)' : 'rgba(145,158,171,0.1)'}`,
                                    minWidth: 140,
                                }}>
                                    <Typography level="body-xs" sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}>{label} {chartYear}</Typography>
                                    {payload.filter((p: any) => p.value > 0).reverse().map((p: any) => (
                                        <Box key={p.dataKey} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, py: 0.25 }}>
                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: p.fill, flexShrink: 0 }} />
                                            <Typography level="body-xs" sx={{ color: 'text.secondary', flex: 1 }}>{typeLabelsMap[p.dataKey] || p.dataKey}</Typography>
                                            <Typography level="body-xs" sx={{ fontWeight: 700, color: 'text.primary' }}>{p.value}</Typography>
                                        </Box>
                                    ))}
                                </Box>
                            );
                        };

                        return (
                            <Box sx={{ width: '100%', height: { xs: 250, md: 320 }, mt: 1 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 20, right: 10, left: -10, bottom: 5 }} barSize={24} barGap={2}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false}
                                            stroke={isDark ? 'rgba(145,158,171,0.08)' : 'rgba(145,158,171,0.12)'} />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false}
                                            tick={{ fill: isDark ? '#546e7a' : '#919EAB', fontSize: 12, fontWeight: 500 }} />
                                        <YAxis axisLine={false} tickLine={false}
                                            tick={{ fill: isDark ? '#546e7a' : '#919EAB', fontSize: 12, fontWeight: 500 }}
                                            allowDecimals={false} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? 'rgba(145,158,171,0.04)' : 'rgba(145,158,171,0.06)', radius: 6 }} />
                                        <Bar dataKey="OTHER" stackId="a" fill={typeChartColors.OTHER} radius={[0, 0, 0, 0]} />
                                        <Bar dataKey="PROPOSAL" stackId="a" fill={typeChartColors.PROPOSAL} radius={[0, 0, 0, 0]} />
                                        <Bar dataKey="REPORT" stackId="a" fill={typeChartColors.REPORT} radius={[0, 0, 0, 0]} />
                                        <Bar dataKey="INVOICE" stackId="a" fill={typeChartColors.INVOICE} radius={[0, 0, 0, 0]} />
                                        <Bar dataKey="CONTRACT" stackId="a" fill={typeChartColors.CONTRACT} radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        );
                    })()}
                </CardContent>
            </Card>

            {/* ╔══════════════════════════════════════════╗
               ║         QUICK ACTIONS                     ║
               ╚══════════════════════════════════════════╝ */}
            <Typography level="title-lg" sx={{ fontWeight: 700, color: 'text.primary', mb: { xs: 1.5, md: 2.5 }, animation: 'fadeSlideUp 0.5s ease-out 0.7s both', fontSize: { xs: '1rem', md: '1.125rem' } }}>
                Quick Actions
            </Typography>
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: {
                    xs: '1fr',
                    sm: '1fr 1fr',
                    md: isAdmin ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
                },
                gap: { xs: 1.5, md: 3 },
            }}>
                {/* My Documents */}
                <Card
                    component={NextLink} href="/dashboard/documents"
                    variant="plain"
                    sx={{
                        ...cardSx, textDecoration: 'none',
                        animation: 'fadeSlideUp 0.5s ease-out 0.75s both',
                        '&:hover': {
                            transform: 'translateY(-6px)',
                            boxShadow: isDark ? `0 12px 24px rgba(0,0,0,0.3), 0 0 0 1px ${palette.green.main}40` : `0 20px 40px ${palette.green.main}20, 0 0 0 1px ${palette.green.main}30`,
                            borderColor: `${palette.green.main}60`,
                            '& .qa-arrow': { transform: 'translateX(6px)', color: palette.green.main },
                        },
                    }}
                >
                    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{
                                width: { xs: 40, md: 48 }, height: { xs: 40, md: 48 }, borderRadius: { xs: '10px', md: '14px' },
                                background: `linear-gradient(135deg, ${palette.green.light} 0%, ${palette.green.main} 100%)`,
                                boxShadow: `0 8px 16px ${palette.green.main}40`,
                                animation: 'gentleFloat 4s ease-in-out infinite',
                            }}>
                                <FolderOpenRoundedIcon sx={{ fontSize: 24, color: '#fff' }} />
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                                <Typography level="title-md" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.25 }}>
                                    My Documents
                                </Typography>
                                <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                                    Manage all your files
                                </Typography>
                            </Box>
                            <ArrowForwardRoundedIcon
                                className="qa-arrow"
                                sx={{ color: 'text.tertiary', fontSize: 20, transition: 'all 0.3s ease' }}
                            />
                        </Box>
                    </CardContent>
                </Card>

                {/* Profile */}
                <Card
                    component={NextLink} href="/dashboard/profile"
                    variant="plain"
                    sx={{
                        ...cardSx, textDecoration: 'none',
                        animation: 'fadeSlideUp 0.5s ease-out 0.85s both',
                        '&:hover': {
                            transform: 'translateY(-6px)',
                            boxShadow: isDark ? `0 12px 24px rgba(0,0,0,0.3), 0 0 0 1px ${palette.blue.main}40` : `0 20px 40px ${palette.blue.main}20, 0 0 0 1px ${palette.blue.main}30`,
                            borderColor: `${palette.blue.main}60`,
                            '& .qa-arrow': { transform: 'translateX(6px)', color: palette.blue.main },
                        },
                    }}
                >
                    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{
                                width: { xs: 40, md: 48 }, height: { xs: 40, md: 48 }, borderRadius: { xs: '10px', md: '14px' },
                                background: `linear-gradient(135deg, ${palette.blue.light} 0%, ${palette.blue.main} 100%)`,
                                boxShadow: `0 8px 16px ${palette.blue.main}40`,
                                animation: 'gentleFloat 4s ease-in-out 0.5s infinite',
                            }}>
                                <PersonRoundedIcon sx={{ fontSize: 24, color: '#fff' }} />
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                                <Typography level="title-md" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.25 }}>
                                    My Profile
                                </Typography>
                                <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                                    Account settings & info
                                </Typography>
                            </Box>
                            <ArrowForwardRoundedIcon
                                className="qa-arrow"
                                sx={{ color: 'text.tertiary', fontSize: 20, transition: 'all 0.3s ease' }}
                            />
                        </Box>
                    </CardContent>
                </Card>

                {/* Admin Panel */}
                {isAdmin && (
                    <Card
                        component={NextLink} href="/dashboard/admin"
                        variant="plain"
                        sx={{
                            ...cardSx, textDecoration: 'none',
                            animation: 'fadeSlideUp 0.5s ease-out 0.95s both',
                            '&:hover': {
                                transform: 'translateY(-6px)',
                                boxShadow: isDark ? `0 12px 24px rgba(0,0,0,0.3), 0 0 0 1px ${palette.error.main}40` : `0 20px 40px ${palette.error.main}20, 0 0 0 1px ${palette.error.main}30`,
                                borderColor: `${palette.error.main}60`,
                                '& .qa-arrow': { transform: 'translateX(6px)', color: palette.error.main },
                            },
                        }}
                    >
                        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{
                                    width: { xs: 40, md: 48 }, height: { xs: 40, md: 48 }, borderRadius: { xs: '10px', md: '14px' },
                                    background: `linear-gradient(135deg, ${palette.error.light} 0%, ${palette.error.main} 100%)`,
                                    boxShadow: `0 8px 16px ${palette.error.main}40`,
                                    animation: 'gentleFloat 4s ease-in-out 1s infinite',
                                }}>
                                    <SecurityRoundedIcon sx={{ fontSize: 24, color: '#fff' }} />
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Typography level="title-md" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.25 }}>
                                        Permission Requests
                                    </Typography>
                                    <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                                        Requests & management
                                    </Typography>
                                </Box>
                                <ArrowForwardRoundedIcon
                                    className="qa-arrow"
                                    sx={{ color: 'text.tertiary', fontSize: 20, transition: 'all 0.3s ease' }}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                )}
            </Box>
        </Box>
    );
}
