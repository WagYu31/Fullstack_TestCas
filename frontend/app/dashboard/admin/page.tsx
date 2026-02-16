'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useColorScheme } from '@mui/joy/styles';
import Box from '@mui/joy/Box';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import Stack from '@mui/joy/Stack';
import Chip from '@mui/joy/Chip';
import Avatar from '@mui/joy/Avatar';
import Divider from '@mui/joy/Divider';
import CircularProgress from '@mui/joy/CircularProgress';
import Snackbar from '@mui/joy/Snackbar';

// Icons
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import ThumbUpAltRoundedIcon from '@mui/icons-material/ThumbUpAltRounded';
import ThumbDownAltRoundedIcon from '@mui/icons-material/ThumbDownAltRounded';
import InboxRoundedIcon from '@mui/icons-material/InboxRounded';

interface UnifiedRequest {
    id: string;
    requestType: string;
    reason: string;
    status: string;
    createdAt: string;
    source: 'permissions' | 'permission-requests';
    document: {
        title: string;
        documentType: string;
        mimeType?: string;
    };
    requestedBy: {
        name: string;
        email: string;
    };
}

interface Stats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
}

/* ── Minimal color palette ── */
const pal = {
    green: { main: '#00A76F', light: '#5BE49B', lighter: '#C8FAD6', darker: '#004B50' },
    blue: { main: '#0065FF', light: '#77CEFF', lighter: '#D6E4FF', darker: '#002766' },
    warning: { main: '#FFAB00', light: '#FFD666', lighter: '#FFF5CC', darker: '#7A4100' },
    error: { main: '#FF5630', light: '#FFAC82', lighter: '#FFE9D5', darker: '#7A0916' },
    purple: { main: '#8E33FF', light: '#C684FF', lighter: '#EFD6FF', darker: '#27097A' },
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
    });
};

export default function AdminPage() {
    const [requests, setRequests] = useState<UnifiedRequest[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [snack, setSnack] = useState<{ open: boolean; msg: string; color: 'success' | 'danger' }>({
        open: false, msg: '', color: 'success',
    });
    const { mode } = useColorScheme();
    const isDark = mode === 'dark';

    const cardSx = {
        borderRadius: '16px',
        bgcolor: isDark ? 'rgba(145,158,171,0.08)' : '#fff',
        boxShadow: isDark ? 'none' : '0 0 2px 0 rgba(145,158,171,0.2), 0 12px 24px -4px rgba(145,158,171,0.12)',
        border: isDark ? '1px solid rgba(145,158,171,0.16)' : 'none',
        willChange: 'transform, box-shadow',
        transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.5s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:active': {
            transform: 'scale(0.97) !important',
            transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        },
    };

    const fetchData = async () => {
        try {
            setError(null);
            const [permissionsRes, statsRes, editRequestsRes] = await Promise.all([
                api.get('/permissions'),
                api.get('/permissions/stats'),
                api.get('/permission-requests/pending'),
            ]);

            const deleteReplaceRequests: UnifiedRequest[] = (permissionsRes.data || []).map((r: any) => ({
                id: r.id,
                requestType: r.requestType || 'DELETE',
                reason: r.reason || '',
                status: r.status || 'PENDING',
                createdAt: r.createdAt,
                source: 'permissions' as const,
                document: {
                    title: r.document?.title || 'Unknown',
                    documentType: r.document?.documentType || '',
                    mimeType: r.document?.mimeType,
                },
                requestedBy: {
                    name: r.requestedBy?.name || 'Unknown',
                    email: r.requestedBy?.email || '',
                },
            }));

            const editRequests: UnifiedRequest[] = (editRequestsRes.data || []).map((r: any) => ({
                id: r.id,
                requestType: 'EDIT',
                reason: r.requestReason || '',
                status: r.status || 'PENDING',
                createdAt: r.createdAt,
                source: 'permission-requests' as const,
                document: {
                    title: r.document?.title || 'Unknown',
                    documentType: r.document?.documentType || '',
                    mimeType: r.document?.mimeType,
                },
                requestedBy: {
                    name: r.user?.name || 'Unknown',
                    email: r.user?.email || '',
                },
            }));

            const allRequests = [...deleteReplaceRequests, ...editRequests]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            setRequests(allRequests);

            const editCount = editRequests.length;
            setStats({
                total: (statsRes.data?.total || 0) + editCount,
                pending: (statsRes.data?.pending || 0) + editCount,
                approved: statsRes.data?.approved || 0,
                rejected: statsRes.data?.rejected || 0,
            });
        } catch (error: any) {
            console.error('Failed to fetch admin data:', error);
            setError(error.response?.data?.message || 'Failed to load admin data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleApprove = async (request: UnifiedRequest) => {
        if (!confirm('Are you sure you want to approve this request?')) return;
        try {
            if (request.source === 'permissions') {
                await api.post(`/permissions/${request.id}/approve`);
            } else {
                await api.patch(`/permission-requests/${request.id}/review`, { status: 'APPROVED' });
            }
            setSnack({ open: true, msg: 'Request approved successfully!', color: 'success' });
            fetchData();
        } catch (error: any) {
            setSnack({ open: true, msg: error.response?.data?.message || 'Failed to approve', color: 'danger' });
        }
    };

    const handleReject = async (request: UnifiedRequest) => {
        if (!confirm('Are you sure you want to reject this request?')) return;
        try {
            if (request.source === 'permissions') {
                await api.post(`/permissions/${request.id}/reject`);
            } else {
                await api.patch(`/permission-requests/${request.id}/review`, { status: 'REJECTED' });
            }
            setSnack({ open: true, msg: 'Request rejected.', color: 'danger' });
            fetchData();
        } catch (error: any) {
            setSnack({ open: true, msg: error.response?.data?.message || 'Failed to reject', color: 'danger' });
        }
    };

    const getTypeConfig = (type: string) => {
        switch (type) {
            case 'DELETE':
                return { icon: <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />, color: pal.error, label: 'Delete' };
            case 'REPLACE':
                return { icon: <SwapHorizRoundedIcon sx={{ fontSize: 18 }} />, color: pal.blue, label: 'Replace' };
            case 'EDIT':
                return { icon: <EditRoundedIcon sx={{ fontSize: 18 }} />, color: pal.purple, label: 'Edit' };
            default:
                return { icon: <DescriptionRoundedIcon sx={{ fontSize: 18 }} />, color: pal.blue, label: type };
        }
    };

    /* ── Loading ── */
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <CircularProgress size="lg" sx={{ '--CircularProgress-size': '80px' }}>
                    <img src="/images/cybermax-logo.png" alt="Cybermax" style={{ width: 40, height: 40, objectFit: 'contain' }} />
                </CircularProgress>
            </Box>
        );
    }

    /* ── Error ── */
    if (error) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 2 }}>
                <Avatar sx={{
                    width: 64, height: 64,
                    bgcolor: isDark ? 'rgba(255,86,48,0.16)' : pal.error.lighter,
                    color: pal.error.main,
                }}>
                    <ErrorOutlineRoundedIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Typography level="title-lg" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    Failed to Load Data
                </Typography>
                <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 1 }}>{error}</Typography>
                <Button
                    startDecorator={<RefreshRoundedIcon />}
                    onClick={() => { setLoading(true); fetchData(); }}
                    sx={{
                        bgcolor: pal.green.darker, color: '#fff', borderRadius: '10px', fontWeight: 700,
                        '&:hover': { bgcolor: '#00363A' },
                    }}
                >
                    Try Again
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>

            {/* ── Card Animations ── */}
            <style>{`
                @keyframes fadeSlideUp {
                    0% { opacity: 0; transform: translateY(30px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes iconBounce {
                    0%, 100% { transform: translateY(0) scale(1); }
                    50% { transform: translateY(-4px) scale(1.08); }
                }
                @keyframes cardFloat {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-6px); }
                }
            `}</style>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{
                        width: 48, height: 48, borderRadius: '14px',
                        background: `linear-gradient(135deg, ${pal.purple.light} 0%, ${pal.purple.main} 100%)`,
                        boxShadow: `0 8px 16px ${pal.purple.main}40`,
                    }}>
                        <SecurityRoundedIcon sx={{ fontSize: 24, color: '#fff' }} />
                    </Avatar>
                    <Box>
                        <Typography level="h2" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.5px' }}>
                            Permission Requests
                        </Typography>
                        <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
                            Manage permission requests
                        </Typography>
                    </Box>
                </Box>
                <Button
                    variant="soft"
                    color="neutral"
                    startDecorator={<RefreshRoundedIcon sx={{ fontSize: 18 }} />}
                    onClick={() => { setLoading(true); fetchData(); }}
                    sx={{ borderRadius: '10px', fontWeight: 600 }}
                >
                    Refresh
                </Button>
            </Box>

            {/* ═══════════ STAT CARDS ═══════════ */}
            {stats && (
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
                    gap: 3, mb: 4,
                }}>
                    {[
                        { label: 'Total Requests', value: stats.total, gradient: `linear-gradient(135deg, ${pal.blue.light}, ${pal.blue.main})`, shadow: pal.blue.main, icon: <DescriptionRoundedIcon sx={{ fontSize: 26, color: '#fff' }} /> },
                        { label: 'Pending', value: stats.pending, gradient: `linear-gradient(135deg, ${pal.warning.light}, ${pal.warning.main})`, shadow: pal.warning.main, icon: <AccessTimeRoundedIcon sx={{ fontSize: 26, color: '#fff' }} /> },
                        { label: 'Approved', value: stats.approved, gradient: `linear-gradient(135deg, ${pal.green.light}, ${pal.green.main})`, shadow: pal.green.main, icon: <CheckCircleRoundedIcon sx={{ fontSize: 26, color: '#fff' }} /> },
                        { label: 'Rejected', value: stats.rejected, gradient: `linear-gradient(135deg, ${pal.error.light}, ${pal.error.main})`, shadow: pal.error.main, icon: <CancelRoundedIcon sx={{ fontSize: 26, color: '#fff' }} /> },
                    ].map((s, idx) => (
                        <Card key={s.label} variant="plain" sx={{
                            ...cardSx,
                            cursor: 'pointer',
                            animation: `fadeSlideUp 0.5s ease-out ${0.15 + idx * 0.1}s both, cardFloat 3s ease-in-out ${1 + idx * 0.5}s infinite`,
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: isDark
                                    ? `0 12px 24px rgba(0,0,0,0.3), 0 0 0 1px ${s.shadow}40`
                                    : `0 20px 40px ${s.shadow}25, 0 0 0 1px ${s.shadow}30`,
                                borderColor: `${s.shadow}60`,
                                animationPlayState: 'paused',
                            },
                        }}>
                            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography level="body-sm" sx={{ color: 'text.tertiary', fontWeight: 600, mb: 1 }}>
                                        {s.label}
                                    </Typography>
                                    <Typography sx={{ fontWeight: 800, color: 'text.primary', fontSize: '2rem', letterSpacing: '-1px', lineHeight: 1 }}>
                                        {s.value}
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    width: 52, height: 52, borderRadius: '14px',
                                    background: s.gradient,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: `0 8px 16px ${s.shadow}40`,
                                    animation: `iconBounce 3s ease-in-out ${idx * 0.5}s infinite`,
                                }}>
                                    {s.icon}
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            )}

            {/* ═══════════ PENDING REQUESTS ═══════════ */}
            <Card variant="plain" sx={{ ...cardSx, overflow: 'hidden' }}>
                {/* Section Header */}
                <Box sx={{
                    p: 3, pb: 2,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                    <Box>
                        <Typography level="title-lg" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.25 }}>
                            Pending Permission Requests
                        </Typography>
                        <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
                            Review and manage document permission requests
                        </Typography>
                    </Box>
                    <Chip
                        size="sm" variant="soft" color="warning"
                        startDecorator={<AccessTimeRoundedIcon sx={{ fontSize: 14 }} />}
                        sx={{ fontWeight: 700, fontSize: '0.7rem', borderRadius: '8px' }}
                    >
                        {requests.filter(r => r.status === 'PENDING').length} pending
                    </Chip>
                </Box>

                <Divider />

                {/* Request List */}
                {requests.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8, px: 3 }}>
                        <Avatar sx={{
                            width: 64, height: 64, mx: 'auto', mb: 2,
                            bgcolor: isDark ? 'rgba(145,158,171,0.12)' : 'rgba(145,158,171,0.06)',
                        }}>
                            <InboxRoundedIcon sx={{ fontSize: 32, color: 'text.tertiary' }} />
                        </Avatar>
                        <Typography level="title-md" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                            No pending requests
                        </Typography>
                        <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
                            All permission requests have been processed
                        </Typography>
                    </Box>
                ) : (
                    <Stack spacing={0}>
                        {requests.map((request) => {
                            const typeConfig = getTypeConfig(request.requestType);
                            const isPending = request.status === 'PENDING';

                            return (
                                <Box
                                    key={`${request.source}-${request.id}`}
                                    sx={{
                                        p: 3,
                                        transition: 'background 0.2s ease',
                                        '&:hover': {
                                            bgcolor: isDark ? 'rgba(145,158,171,0.04)' : 'rgba(145,158,171,0.02)',
                                        },
                                    }}
                                >
                                    {/* Top row: Type icon + Title + Tags */}
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                        {/* Type Avatar */}
                                        <Avatar sx={{
                                            width: 44, height: 44, borderRadius: '12px',
                                            bgcolor: isDark
                                                ? `${typeConfig.color.main}20`
                                                : typeConfig.color.lighter,
                                            color: typeConfig.color.main,
                                            flexShrink: 0,
                                        }}>
                                            {typeConfig.icon}
                                        </Avatar>

                                        {/* Content */}
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            {/* Title row */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 0.5 }}>
                                                <Typography level="title-md" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                                    {request.requestType} Request
                                                </Typography>
                                                <Stack direction="row" spacing={0.75}>
                                                    <Chip size="sm" variant="soft" sx={{
                                                        bgcolor: isDark ? `${typeConfig.color.main}20` : typeConfig.color.lighter,
                                                        color: typeConfig.color.main,
                                                        fontWeight: 700, fontSize: '0.65rem', borderRadius: '6px',
                                                    }}>
                                                        {typeConfig.label}
                                                    </Chip>
                                                    <Chip size="sm" variant="soft" sx={{
                                                        bgcolor: isDark ? 'rgba(255,171,0,0.16)' : pal.warning.lighter,
                                                        color: isDark ? pal.warning.main : pal.warning.darker,
                                                        fontWeight: 700, fontSize: '0.65rem', borderRadius: '6px',
                                                    }}>
                                                        {request.status}
                                                    </Chip>
                                                </Stack>
                                            </Box>

                                            {/* Document name */}
                                            <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 1.5 }}>
                                                Document: <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>{request.document.title}</Box>
                                            </Typography>

                                            {/* Meta row */}
                                            <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', mb: 2 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <PersonRoundedIcon sx={{ fontSize: 14, color: 'text.tertiary' }} />
                                                    <Typography level="body-xs" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                                        {request.requestedBy.name}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <EmailRoundedIcon sx={{ fontSize: 14, color: 'text.tertiary' }} />
                                                    <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                                                        {request.requestedBy.email}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <CalendarTodayRoundedIcon sx={{ fontSize: 14, color: 'text.tertiary' }} />
                                                    <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                                                        {formatDate(request.createdAt)}
                                                    </Typography>
                                                </Box>
                                            </Stack>

                                            {/* Reason box */}
                                            <Box sx={{
                                                p: 2, borderRadius: '10px', mb: 2,
                                                bgcolor: isDark ? 'rgba(145,158,171,0.06)' : 'rgba(145,158,171,0.04)',
                                                border: '1px dashed',
                                                borderColor: isDark ? 'rgba(145,158,171,0.16)' : 'rgba(145,158,171,0.2)',
                                            }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}>
                                                    <InfoRoundedIcon sx={{ fontSize: 14, color: 'text.tertiary' }} />
                                                    <Typography level="body-xs" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                        Reason
                                                    </Typography>
                                                </Box>
                                                <Typography level="body-sm" sx={{ color: 'text.primary', fontWeight: 500 }}>
                                                    {request.reason || 'No reason provided'}
                                                </Typography>
                                            </Box>

                                            {/* Action Buttons */}
                                            {isPending && (
                                                <Stack direction="row" spacing={1.5}>
                                                    <Button
                                                        size="sm"
                                                        startDecorator={<ThumbUpAltRoundedIcon sx={{ fontSize: 16 }} />}
                                                        onClick={() => handleApprove(request)}
                                                        sx={{
                                                            bgcolor: pal.green.main, color: '#fff',
                                                            fontWeight: 700, borderRadius: '10px', px: 2.5,
                                                            boxShadow: `0 6px 12px ${pal.green.main}40`,
                                                            '&:hover': {
                                                                bgcolor: pal.green.darker,
                                                                transform: 'translateY(-2px)',
                                                                boxShadow: `0 8px 16px ${pal.green.main}50`,
                                                            },
                                                            transition: 'all 0.2s ease',
                                                        }}
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="soft"
                                                        startDecorator={<ThumbDownAltRoundedIcon sx={{ fontSize: 16 }} />}
                                                        onClick={() => handleReject(request)}
                                                        sx={{
                                                            bgcolor: isDark ? 'rgba(255,86,48,0.16)' : pal.error.lighter,
                                                            color: pal.error.main,
                                                            fontWeight: 700, borderRadius: '10px', px: 2.5,
                                                            '&:hover': {
                                                                bgcolor: isDark ? 'rgba(255,86,48,0.24)' : 'rgba(255,86,48,0.16)',
                                                                transform: 'translateY(-2px)',
                                                            },
                                                            transition: 'all 0.2s ease',
                                                        }}
                                                    >
                                                        Reject
                                                    </Button>
                                                </Stack>
                                            )}
                                        </Box>
                                    </Box>
                                </Box>
                            );
                        })}
                    </Stack>
                )}
            </Card>

            {/* ═══════════ SNACKBAR ═══════════ */}
            <Snackbar
                open={snack.open}
                autoHideDuration={3000}
                onClose={() => setSnack({ ...snack, open: false })}
                variant="soft"
                color={snack.color}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                startDecorator={snack.color === 'success' ? <CheckCircleRoundedIcon /> : <CancelRoundedIcon />}
                sx={{
                    borderRadius: '12px', fontWeight: 600,
                    boxShadow: isDark ? '0 8px 16px rgba(0,0,0,0.24)' : '0 8px 16px rgba(145,158,171,0.16)',
                }}
            >
                {snack.msg}
            </Snackbar>
        </Box>
    );
}
