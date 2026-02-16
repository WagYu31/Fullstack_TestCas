'use client';

import { useState, useEffect, useCallback } from 'react';
import Box from '@mui/joy/Box';
import IconButton from '@mui/joy/IconButton';
import Typography from '@mui/joy/Typography';
import Badge from '@mui/joy/Badge';
import Sheet from '@mui/joy/Sheet';
import Divider from '@mui/joy/Divider';
import Button from '@mui/joy/Button';
import CircularProgress from '@mui/joy/CircularProgress';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import api from '@/lib/api';
import { getSocket } from '@/lib/socket';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
}

export default function NotificationDropdown() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchUnreadCount = useCallback(async () => {
        try {
            const res = await api.get('/notifications/unread-count');
            setUnreadCount(res.data.count);
        } catch (e) {
            console.error('Failed to fetch unread count:', e);
        }
    }, []);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/notifications?limit=10');
            setNotifications(res.data.data || []);
        } catch (e) {
            console.error('Failed to fetch notifications:', e);
        }
        setLoading(false);
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (e) {
            console.error('Failed to mark as read:', e);
        }
    };

    // Fetch unread count on mount
    useEffect(() => {
        fetchUnreadCount();
    }, [fetchUnreadCount]);

    // Listen for real-time notifications via WebSocket
    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        const handler = (data: any) => {
            // Add new notification to the list
            const newNotif: Notification = {
                id: Date.now().toString(),
                title: data.title || 'Notifikasi',
                message: data.message || '',
                type: data.type || 'DOCUMENT_UPDATE',
                isRead: false,
                createdAt: new Date().toISOString(),
            };
            setNotifications((prev) => [newNotif, ...prev].slice(0, 10));
            setUnreadCount((prev) => prev + 1);
        };

        socket.on('new-notification', handler);
        return () => { socket.off('new-notification', handler); };
    }, []);

    // Fetch notifications when dropdown opens
    useEffect(() => {
        if (open) {
            fetchNotifications();
        }
    }, [open, fetchNotifications]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'DOCUMENT_UPDATE': return <UploadFileRoundedIcon sx={{ fontSize: 18, color: 'primary.500' }} />;
            case 'DOCUMENT_DELETED': return <DeleteRoundedIcon sx={{ fontSize: 18, color: 'danger.500' }} />;
            default: return <DescriptionRoundedIcon sx={{ fontSize: 18, color: 'neutral.500' }} />;
        }
    };

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Baru saja';
        if (mins < 60) return `${mins} menit lalu`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs} jam lalu`;
        const days = Math.floor(hrs / 24);
        return `${days} hari lalu`;
    };

    return (
        <Box sx={{ position: 'relative' }}>
            {/* Bell Icon with Badge */}
            <IconButton
                variant="plain"
                color="neutral"
                onClick={() => setOpen(!open)}
                sx={{ position: 'relative' }}
            >
                <Badge
                    badgeContent={unreadCount}
                    color="danger"
                    size="sm"
                    invisible={unreadCount === 0}
                    sx={{
                        '& .MuiBadge-badge': {
                            fontSize: '0.65rem',
                            minWidth: 18,
                            height: 18,
                        },
                    }}
                >
                    <NotificationsRoundedIcon />
                </Badge>
            </IconButton>

            {/* Dropdown Panel */}
            {open && (
                <>
                    {/* Backdrop */}
                    <Box
                        onClick={() => setOpen(false)}
                        sx={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 1300,
                        }}
                    />

                    {/* Notification Panel */}
                    <Sheet
                        variant="outlined"
                        sx={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            mt: 1,
                            width: 380,
                            maxHeight: 480,
                            borderRadius: 'lg',
                            boxShadow: '0 0 2px 0 rgba(145,158,171,0.2), 0 20px 40px -4px rgba(145,158,171,0.24)',
                            zIndex: 1301,
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        {/* Header */}
                        <Box sx={{
                            p: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}>
                            <Box>
                                <Typography level="title-md" fontWeight={700}>
                                    Notifikasi
                                </Typography>
                                {unreadCount > 0 && (
                                    <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                                        {unreadCount} belum dibaca
                                    </Typography>
                                )}
                            </Box>
                        </Box>

                        <Divider />

                        {/* Notification List */}
                        <Box sx={{
                            flex: 1,
                            overflow: 'auto',
                            '&::-webkit-scrollbar': { width: 6 },
                            '&::-webkit-scrollbar-thumb': {
                                borderRadius: 3,
                                bgcolor: 'neutral.300',
                            },
                        }}>
                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                    <CircularProgress size="sm" />
                                </Box>
                            ) : notifications.length === 0 ? (
                                <Box sx={{ textAlign: 'center', p: 4 }}>
                                    <NotificationsRoundedIcon sx={{ fontSize: 48, color: 'neutral.300', mb: 1 }} />
                                    <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
                                        Belum ada notifikasi
                                    </Typography>
                                </Box>
                            ) : (
                                notifications.map((notif) => (
                                    <Box
                                        key={notif.id}
                                        onClick={() => !notif.isRead && markAsRead(notif.id)}
                                        sx={{
                                            p: 2,
                                            display: 'flex',
                                            gap: 1.5,
                                            cursor: notif.isRead ? 'default' : 'pointer',
                                            bgcolor: notif.isRead ? 'transparent' : 'primary.softBg',
                                            borderBottom: '1px solid',
                                            borderColor: 'divider',
                                            transition: 'background 0.2s',
                                            '&:hover': {
                                                bgcolor: notif.isRead ? 'background.level1' : 'primary.softHoverBg',
                                            },
                                        }}
                                    >
                                        <Box sx={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            bgcolor: 'background.level1',
                                            flexShrink: 0,
                                        }}>
                                            {getIcon(notif.type)}
                                        </Box>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography
                                                level="title-sm"
                                                fontWeight={notif.isRead ? 400 : 700}
                                                sx={{ fontSize: '0.8rem' }}
                                            >
                                                {notif.title}
                                            </Typography>
                                            <Typography
                                                level="body-xs"
                                                sx={{
                                                    color: 'text.secondary',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                {notif.message}
                                            </Typography>
                                            <Typography level="body-xs" sx={{ color: 'text.tertiary', mt: 0.5, fontSize: '0.65rem' }}>
                                                {timeAgo(notif.createdAt)}
                                            </Typography>
                                        </Box>
                                        {!notif.isRead && (
                                            <Box sx={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: '50%',
                                                bgcolor: 'primary.500',
                                                flexShrink: 0,
                                                mt: 0.5,
                                            }} />
                                        )}
                                    </Box>
                                ))
                            )}
                        </Box>
                    </Sheet>
                </>
            )}
        </Box>
    );
}
