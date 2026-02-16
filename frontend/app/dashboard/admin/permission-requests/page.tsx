'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useColorScheme } from '@mui/joy/styles';
import Avatar from '@mui/joy/Avatar';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Chip from '@mui/joy/Chip';
import Divider from '@mui/joy/Divider';
import IconButton from '@mui/joy/IconButton';
import Stack from '@mui/joy/Stack';
import Table from '@mui/joy/Table';
import Typography from '@mui/joy/Typography';
import CircularProgress from '@mui/joy/CircularProgress';
import Snackbar from '@mui/joy/Snackbar';

// Icons
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';
import ThumbUpRoundedIcon from '@mui/icons-material/ThumbUpRounded';
import ThumbDownRoundedIcon from '@mui/icons-material/ThumbDownRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';

interface PermissionRequest {
    id: string;
    user: { name: string; email: string };
    document: { title: string; documentType: string };
    requestType?: string;
    requestReason: string;
    status: string;
    createdAt: string;
}

export default function PermissionRequestsPage() {
    const user = useAuthStore((state) => state.user);
    const [requests, setRequests] = useState<PermissionRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const { mode } = useColorScheme();
    const isDark = mode === 'dark';

    const palette = {
        green: { main: '#00A76F', light: '#5BE49B', lighter: '#C8FAD6' },
        blue: { main: '#006C9C', light: '#61F3F3', lighter: '#CAFDF5' },
        purple: { main: '#7635DC', light: '#B985F4', lighter: '#EBD6FD' },
        warning: { main: '#B76E00', light: '#FFAB00', lighter: '#FFF5CC' },
        error: { main: '#B71D18', light: '#FF5630', lighter: '#FFE9D5' },
    };

    const cardSx = {
        borderRadius: '16px',
        border: '1px solid',
        borderColor: isDark ? 'rgba(145,158,171,0.08)' : 'rgba(145,158,171,0.16)',
        bgcolor: isDark ? 'rgba(22,28,36,0.72)' : 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(20px)',
        boxShadow: isDark ? '0 8px 16px rgba(0,0,0,0.4)' : '0 8px 16px rgba(145,158,171,0.12)',
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
    };

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await api.get('/permission-requests/pending');
            setRequests(response.data);
        } catch (error) {
            console.error('Failed to fetch permission requests:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'ADMIN') {
            fetchRequests();
        }
    }, [user]);

    const handleApprove = async (id: string) => {
        try {
            setActionLoading(id);
            await api.patch(`/permission-requests/${id}/review`, {
                status: 'APPROVED',
            });
            setSuccessMessage('Permission request approved!');
            setShowSuccess(true);
            fetchRequests();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to approve request');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id: string) => {
        try {
            setActionLoading(id);
            await api.patch(`/permission-requests/${id}/review`, {
                status: 'REJECTED',
            });
            setSuccessMessage('Permission request rejected');
            setShowSuccess(true);
            fetchRequests();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to reject request');
        } finally {
            setActionLoading(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getRequestIcon = (type?: string) => {
        switch (type?.toUpperCase()) {
            case 'EDIT': return <EditRoundedIcon />;
            case 'DELETE': return <DeleteRoundedIcon />;
            case 'REPLACE': return <SwapHorizRoundedIcon />;
            default: return <DescriptionRoundedIcon />;
        }
    };

    const getRequestColor = (type?: string): 'primary' | 'danger' | 'warning' | 'neutral' => {
        switch (type?.toUpperCase()) {
            case 'EDIT': return 'primary';
            case 'DELETE': return 'danger';
            case 'REPLACE': return 'warning';
            default: return 'neutral';
        }
    };

    if (user?.role !== 'ADMIN') {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography level="h3">Access Denied</Typography>
                <Typography>You need admin privileges to access this page.</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', width: '100%', overflow: 'hidden' }}>
            <style>{`
                @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeSlideDown { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>

            {/* Header */}
            <Box sx={{ mb: 4, animation: 'fadeSlideDown 0.5s ease-out both' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1.5 }}>
                    <Box>
                        <Typography level="h2" sx={{
                            fontWeight: 800, fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                            background: isDark
                                ? 'linear-gradient(135deg, #fff 30%, #919EAB 100%)'
                                : 'linear-gradient(135deg, #212B36 30%, #454F5B 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                            Permission Requests
                        </Typography>
                        <Typography level="body-sm" sx={{ color: 'text.tertiary', fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
                            Manage permission requests
                        </Typography>
                    </Box>
                    <Button
                        variant="soft"
                        color="neutral"
                        startDecorator={<RefreshRoundedIcon />}
                        onClick={fetchRequests}
                        loading={loading}
                        sx={{ borderRadius: '12px', fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                        <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>Refresh</Box>
                    </Button>
                </Box>
            </Box>

            {/* Stat cards */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
                gap: { xs: 1.5, sm: 2 }, mb: 3,
            }}>
                {[
                    { label: 'Total Requests', value: requests.length, icon: <AssignmentRoundedIcon />, color: palette.blue },
                    { label: 'Pending', value: requests.filter(r => r.status === 'PENDING').length, icon: <PendingActionsRoundedIcon />, color: palette.warning },
                    { label: 'Approved', value: requests.filter(r => r.status === 'APPROVED').length, icon: <ThumbUpRoundedIcon />, color: palette.green },
                    { label: 'Rejected', value: requests.filter(r => r.status === 'REJECTED').length, icon: <ThumbDownRoundedIcon />, color: palette.error },
                ].map((stat, idx) => (
                    <Card key={stat.label} variant="plain" sx={{
                        ...cardSx,
                        animation: `fadeSlideUp 0.4s ease-out ${idx * 0.1}s both`,
                    }}>
                        <CardContent sx={{ p: { xs: 1.25, sm: 2, md: 2.5 } }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 0.5 }}>
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 0.5, fontWeight: 600, fontSize: { xs: '0.6rem', sm: '0.75rem' } }} noWrap>
                                        {stat.label}
                                    </Typography>
                                    <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.15rem', sm: '1.5rem', md: '1.75rem' }, color: 'text.primary', lineHeight: 1 }}>
                                        {stat.value}
                                    </Typography>
                                </Box>
                                <Avatar sx={{
                                    bgcolor: isDark ? `${stat.color.main}20` : stat.color.lighter,
                                    color: stat.color.main,
                                    width: { xs: 28, sm: 40, md: 48 }, height: { xs: 28, sm: 40, md: 48 },
                                    flexShrink: 0,
                                    '& svg': { fontSize: { xs: 16, sm: 22 } },
                                }}>
                                    {stat.icon}
                                </Avatar>
                            </Box>
                        </CardContent>
                    </Card>
                ))}
            </Box>

            {/* Main content card */}
            <Card variant="plain" sx={{
                ...cardSx,
                animation: 'fadeSlideUp 0.5s ease-out 0.3s both',
            }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    {/* Section header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 0.5, sm: 0 } }}>
                        <Typography level="title-md" sx={{ fontWeight: 700, fontSize: { xs: '0.85rem', sm: '1rem' } }}>
                            Pending Permission Requests
                        </Typography>
                        <Typography level="body-xs" sx={{ color: 'text.tertiary', flexShrink: 0 }}>
                            Review and manage document permission requests
                        </Typography>
                    </Box>

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                            <CircularProgress size="lg" sx={{ '--CircularProgress-size': '72px' }}>
                                <img src="/images/cybermax-logo.png" alt="Cybermax" style={{ width: 36, height: 36, objectFit: 'contain' }} />
                            </CircularProgress>
                        </Box>
                    ) : requests.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 8, color: 'text.tertiary' }}>
                            <DescriptionRoundedIcon sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
                            <Typography level="body-md">No pending permission requests</Typography>
                        </Box>
                    ) : (
                        <>
                            {/* Desktop Table - hidden on mobile */}
                            <Box sx={{ display: { xs: 'none', md: 'block' }, overflowX: 'auto', borderRadius: '12px' }}>
                                <Table
                                    hoverRow
                                    sx={{
                                        '--TableCell-headBackground': isDark ? 'rgba(145,158,171,0.06)' : 'rgba(145,158,171,0.04)',
                                        '& thead th': {
                                            fontWeight: 700, fontSize: '0.75rem',
                                            textTransform: 'uppercase', letterSpacing: '0.5px',
                                            color: 'text.tertiary', py: 1.5,
                                        },
                                        '& tbody tr': { transition: 'background 0.2s ease' },
                                        '& tbody td': { py: 1.5 },
                                    }}
                                >
                                    <thead>
                                        <tr>
                                            <th style={{ width: '20%' }}>User</th>
                                            <th style={{ width: '20%' }}>Document</th>
                                            <th style={{ width: '25%' }}>Reason</th>
                                            <th style={{ width: '15%' }}>Requested</th>
                                            <th style={{ width: '20%', textAlign: 'right', paddingRight: 24 }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {requests.map((request, idx) => (
                                            <tr key={request.id} style={{ animation: `fadeSlideUp 0.3s ease-out ${idx * 0.05}s both` }}>
                                                <td>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Avatar size="sm" sx={{
                                                            bgcolor: isDark ? `${palette.blue.main}30` : palette.blue.lighter,
                                                            color: palette.blue.main,
                                                            fontWeight: 700, fontSize: '0.75rem',
                                                        }}>
                                                            {request.user.name.charAt(0).toUpperCase()}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                                                                {request.user.name}
                                                            </Typography>
                                                            <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                                                                {request.user.email}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </td>
                                                <td>
                                                    <Box>
                                                        <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                                                            {request.document.title}
                                                        </Typography>
                                                        <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                                                            <Chip size="sm" variant="soft" color={getRequestColor(request.requestType)} sx={{ fontSize: '0.65rem', borderRadius: '6px' }}>
                                                                {request.requestType || request.document.documentType}
                                                            </Chip>
                                                            <Chip size="sm" variant="soft" color="warning" sx={{ fontSize: '0.65rem', borderRadius: '6px' }}>
                                                                {request.status}
                                                            </Chip>
                                                        </Stack>
                                                    </Box>
                                                </td>
                                                <td>
                                                    <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                                                        {request.requestReason}
                                                    </Typography>
                                                </td>
                                                <td>
                                                    <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                                                        {formatDate(request.createdAt)}
                                                    </Typography>
                                                </td>
                                                <td style={{ textAlign: 'right', paddingRight: 24 }}>
                                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                        <Button
                                                            size="sm" color="success" variant="soft"
                                                            startDecorator={<CheckCircleRoundedIcon sx={{ fontSize: 16 }} />}
                                                            onClick={() => handleApprove(request.id)}
                                                            loading={actionLoading === request.id}
                                                            sx={{ borderRadius: '8px', fontWeight: 700, fontSize: '0.75rem' }}
                                                        >
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="sm" color="danger" variant="soft"
                                                            startDecorator={<CancelRoundedIcon sx={{ fontSize: 16 }} />}
                                                            onClick={() => handleReject(request.id)}
                                                            loading={actionLoading === request.id}
                                                            sx={{ borderRadius: '8px', fontWeight: 700, fontSize: '0.75rem' }}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </Stack>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Box>

                            {/* Mobile Card View - hidden on desktop */}
                            <Stack spacing={2} sx={{ display: { xs: 'flex', md: 'none' } }}>
                                {requests.map((request, idx) => (
                                    <Card
                                        key={request.id}
                                        variant="plain"
                                        sx={{
                                            borderRadius: '12px',
                                            border: '1px solid',
                                            borderColor: isDark ? 'rgba(145,158,171,0.08)' : 'rgba(145,158,171,0.12)',
                                            bgcolor: isDark ? 'rgba(145,158,171,0.04)' : 'rgba(145,158,171,0.02)',
                                            animation: `fadeSlideUp 0.3s ease-out ${idx * 0.05}s both`,
                                            p: 2,
                                        }}
                                    >
                                        {/* Request type header */}
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                                                <Avatar size="sm" sx={{
                                                    bgcolor: isDark ? `${palette.blue.main}30` : palette.blue.lighter,
                                                    color: palette.blue.main,
                                                    flexShrink: 0,
                                                    width: 32, height: 32,
                                                }}>
                                                    {getRequestIcon(request.requestType)}
                                                </Avatar>
                                                <Box sx={{ minWidth: 0 }}>
                                                    <Typography level="body-sm" sx={{ fontWeight: 700, fontSize: '0.8rem' }} noWrap>
                                                        {(request.requestType || 'EDIT').toUpperCase()} Request
                                                    </Typography>
                                                    <Typography level="body-xs" sx={{ color: 'text.tertiary', fontSize: '0.65rem' }} noWrap>
                                                        Document: {request.document.title}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                                                <Chip size="sm" variant="soft" color={getRequestColor(request.requestType)} sx={{ fontSize: '0.55rem', borderRadius: '6px', height: 20 }}>
                                                    {request.requestType || 'Edit'}
                                                </Chip>
                                                <Chip size="sm" variant="soft" color="warning" sx={{ fontSize: '0.55rem', borderRadius: '6px', height: 20 }}>
                                                    {request.status}
                                                </Chip>
                                            </Stack>
                                        </Box>

                                        {/* User info */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75, pl: 0.5, flexWrap: 'wrap' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <PersonRoundedIcon sx={{ fontSize: 14, color: 'text.tertiary' }} />
                                                <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
                                                    {request.user.name}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <EmailRoundedIcon sx={{ fontSize: 14, color: 'text.tertiary' }} />
                                                <Typography level="body-xs" sx={{ color: 'text.tertiary' }} noWrap>
                                                    {request.user.email}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <CalendarTodayRoundedIcon sx={{ fontSize: 14, color: 'text.tertiary' }} />
                                                <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                                                    {formatDate(request.createdAt)}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Reason */}
                                        <Box sx={{
                                            mt: 1.5, p: 1.5, borderRadius: '10px',
                                            bgcolor: isDark ? 'rgba(145,158,171,0.06)' : 'rgba(145,158,171,0.04)',
                                            border: '1px solid',
                                            borderColor: isDark ? 'rgba(145,158,171,0.08)' : 'rgba(145,158,171,0.08)',
                                        }}>
                                            <Typography level="body-xs" sx={{ fontWeight: 700, color: 'text.tertiary', mb: 0.5 }} startDecorator={<InfoRoundedIcon sx={{ fontSize: 14 }} />}>
                                                REASON
                                            </Typography>
                                            <Typography level="body-sm" sx={{ color: 'text.primary' }}>
                                                {request.requestReason}
                                            </Typography>
                                        </Box>

                                        {/* Action buttons */}
                                        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                                            <Button
                                                size="sm" color="success" variant="soft" fullWidth
                                                startDecorator={<ThumbUpRoundedIcon sx={{ fontSize: 16 }} />}
                                                onClick={() => handleApprove(request.id)}
                                                loading={actionLoading === request.id}
                                                sx={{ borderRadius: '10px', fontWeight: 700, fontSize: '0.8rem', py: 1 }}
                                            >
                                                Approve
                                            </Button>
                                            <Button
                                                size="sm" color="danger" variant="soft" fullWidth
                                                startDecorator={<ThumbDownRoundedIcon sx={{ fontSize: 16 }} />}
                                                onClick={() => handleReject(request.id)}
                                                loading={actionLoading === request.id}
                                                sx={{ borderRadius: '10px', fontWeight: 700, fontSize: '0.8rem', py: 1 }}
                                            >
                                                Reject
                                            </Button>
                                        </Stack>
                                    </Card>
                                ))}
                            </Stack>
                        </>
                    )}
                </CardContent>
            </Card>

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
                {successMessage}
            </Snackbar>
        </Box>
    );
}
