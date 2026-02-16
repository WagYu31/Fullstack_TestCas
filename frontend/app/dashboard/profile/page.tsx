'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import Box from '@mui/joy/Box';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Typography from '@mui/joy/Typography';
import Avatar from '@mui/joy/Avatar';
import Button from '@mui/joy/Button';
import Input from '@mui/joy/Input';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Divider from '@mui/joy/Divider';
import Chip from '@mui/joy/Chip';
import Tabs from '@mui/joy/Tabs';
import TabList from '@mui/joy/TabList';
import Tab from '@mui/joy/Tab';
import TabPanel from '@mui/joy/TabPanel';
import Switch from '@mui/joy/Switch';
import Snackbar from '@mui/joy/Snackbar';
import CircularProgress from '@mui/joy/CircularProgress';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Textarea from '@mui/joy/Textarea';
import Sheet from '@mui/joy/Sheet';

// Icons
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';
import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';

interface ProfileData {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
}

export default function ProfilePage() {
    const { user, setAuth } = useAuthStore();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', color: 'success' as 'success' | 'danger' });

    // General form
    const [formName, setFormName] = useState('');
    const [formEmail, setFormEmail] = useState('');
    const [formAbout, setFormAbout] = useState('');

    // Password form  
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Notification settings
    const [emailNotif, setEmailNotif] = useState(true);
    const [pushNotif, setPushNotif] = useState(false);
    const [activityNotif, setActivityNotif] = useState(true);
    const [notifSaving, setNotifSaving] = useState(false);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await api.get('/auth/profile');
            setProfile(res.data);
            setFormName(res.data.name || '');
            setFormEmail(res.data.email || '');

            // Load notification preferences
            try {
                const meRes = await api.get('/users/me');
                setActivityNotif(meRes.data.notifActivity ?? true);
                setEmailNotif(meRes.data.notifEmail ?? true);
                setPushNotif(meRes.data.notifPush ?? false);
            } catch (e) { }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleSaveGeneral = async () => {
        if (!formName.trim()) return;
        try {
            setSaving(true);
            const res = await api.patch('/auth/profile', { name: formName.trim() });
            setProfile(res.data);

            // Update local auth store
            const token = localStorage.getItem('token') || localStorage.getItem('access_token');
            if (token) {
                setAuth({ ...user!, name: formName.trim() } as { id: string; email: string; name: string; role: 'USER' | 'ADMIN' }, token!);
                localStorage.setItem('user', JSON.stringify({ ...user, name: formName.trim() }));
            }

            setSnackbar({ open: true, message: 'Profile updated successfully!', color: 'success' });
        } catch (error: any) {
            setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to update profile', color: 'danger' });
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress size="lg" sx={{ '--CircularProgress-size': '80px' }}>
                    <img src="/images/cybermax-logo.png" alt="Cybermax" style={{ width: 40, height: 40, objectFit: 'contain' }} />
                </CircularProgress>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
            {/* Breadcrumb / Header */}
            <Box sx={{ mb: 4 }}>
                <Typography level="body-xs" sx={{ color: 'text.tertiary', mb: 0.5, letterSpacing: 0.5 }}>
                    Dashboard / User / Account Settings
                </Typography>
                <Typography level="h3" fontWeight={700}>
                    Account
                </Typography>
            </Box>

            {/* Tabs */}
            <Tabs
                value={tabValue}
                onChange={(_, val) => setTabValue(val as number)}
                sx={{ bgcolor: 'transparent', mb: 3 }}
            >
                <TabList
                    disableUnderline
                    sx={{
                        gap: 0.5,
                        borderRadius: '10px',
                        bgcolor: 'background.level1',
                        p: 0.5,
                        '& .MuiTab-root': {
                            borderRadius: '8px',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            px: 2,
                            py: 1,
                            minHeight: 'unset',
                            '&.Mui-selected': {
                                bgcolor: 'background.surface',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                                color: 'text.primary',
                            },
                            '&:not(.Mui-selected)': {
                                color: 'text.tertiary',
                            },
                        },
                    }}
                >
                    <Tab disableIndicator>
                        <PersonRoundedIcon sx={{ fontSize: 18, mr: 1 }} />
                        General
                    </Tab>
                    <Tab disableIndicator>
                        <NotificationsRoundedIcon sx={{ fontSize: 18, mr: 1 }} />
                        Notifications
                    </Tab>
                    <Tab disableIndicator>
                        <LockResetRoundedIcon sx={{ fontSize: 18, mr: 1 }} />
                        Security
                    </Tab>
                </TabList>

                {/* ====== GENERAL TAB ====== */}
                <TabPanel value={0} sx={{ p: 0 }}>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: '280px 1fr' },
                            gap: 3,
                        }}
                    >
                        {/* Left Card - Avatar */}
                        <Card
                            variant="outlined"
                            sx={{
                                borderRadius: '16px',
                                boxShadow: '0 0 2px 0 rgba(145,158,171,0.2), 0 12px 24px -4px rgba(145,158,171,0.12)',
                                textAlign: 'center',
                                p: 4,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                            }}
                        >
                            {/* Avatar with camera overlay */}
                            <Box sx={{ position: 'relative', mb: 2 }}>
                                <Avatar
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        fontSize: '3rem',
                                        fontWeight: 700,
                                        bgcolor: 'primary.500',
                                        color: 'white',
                                        border: '3px dashed',
                                        borderColor: 'neutral.outlinedBorder',
                                    }}
                                >
                                    {profile?.name?.charAt(0).toUpperCase()}
                                </Avatar>
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        bottom: 4,
                                        right: 4,
                                        width: 32,
                                        height: 32,
                                        borderRadius: '50%',
                                        bgcolor: 'background.surface',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s',
                                        '&:hover': { transform: 'scale(1.1)' },
                                    }}
                                >
                                    <CameraAltRoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                </Box>
                            </Box>

                            <Typography level="title-md" fontWeight={700}>
                                {profile?.name}
                            </Typography>
                            <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 1.5 }}>
                                {profile?.email}
                            </Typography>
                            <Chip
                                size="sm"
                                variant="soft"
                                color={profile?.role === 'ADMIN' ? 'primary' : 'neutral'}
                                sx={{
                                    fontWeight: 700,
                                    letterSpacing: '0.5px',
                                    textTransform: 'uppercase',
                                    fontSize: '0.7rem',
                                }}
                            >
                                {profile?.role}
                            </Chip>

                            <Divider sx={{ my: 2.5, width: '100%' }} />

                            {/* Account Info */}
                            <Box sx={{ width: '100%', textAlign: 'left' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                    <Typography level="body-xs" sx={{ color: 'text.tertiary', fontWeight: 600 }}>
                                        Member since
                                    </Typography>
                                    <Typography level="body-xs" fontWeight={600}>
                                        {profile?.createdAt ? formatDate(profile.createdAt) : '-'}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography level="body-xs" sx={{ color: 'text.tertiary', fontWeight: 600 }}>
                                        Last updated
                                    </Typography>
                                    <Typography level="body-xs" fontWeight={600}>
                                        {profile?.updatedAt ? formatDate(profile.updatedAt) : '-'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Card>

                        {/* Right Card - Form */}
                        <Card
                            variant="outlined"
                            sx={{
                                borderRadius: '16px',
                                boxShadow: '0 0 2px 0 rgba(145,158,171,0.2), 0 12px 24px -4px rgba(145,158,171,0.12)',
                                p: 0,
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Box
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                                        gap: 2.5,
                                    }}
                                >
                                    <FormControl>
                                        <FormLabel sx={{ fontWeight: 600, fontSize: '0.8rem', mb: 0.5 }}>
                                            Name
                                        </FormLabel>
                                        <Input
                                            value={formName}
                                            onChange={(e) => setFormName(e.target.value)}
                                            placeholder="Your name"
                                            sx={{
                                                '--Input-focusedThickness': '1px',
                                                borderRadius: '8px',
                                            }}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel sx={{ fontWeight: 600, fontSize: '0.8rem', mb: 0.5 }}>
                                            Email address
                                        </FormLabel>
                                        <Input
                                            value={formEmail}
                                            disabled
                                            placeholder="your@email.com"
                                            sx={{
                                                '--Input-focusedThickness': '1px',
                                                borderRadius: '8px',
                                            }}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel sx={{ fontWeight: 600, fontSize: '0.8rem', mb: 0.5 }}>
                                            Role
                                        </FormLabel>
                                        <Input
                                            value={profile?.role || ''}
                                            disabled
                                            sx={{
                                                '--Input-focusedThickness': '1px',
                                                borderRadius: '8px',
                                            }}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel sx={{ fontWeight: 600, fontSize: '0.8rem', mb: 0.5 }}>
                                            Status
                                        </FormLabel>
                                        <Select
                                            defaultValue="active"
                                            disabled
                                            sx={{ borderRadius: '8px' }}
                                        >
                                            <Option value="active">Active</Option>
                                            <Option value="inactive">Inactive</Option>
                                        </Select>
                                    </FormControl>

                                    <FormControl sx={{ gridColumn: { sm: '1 / -1' } }}>
                                        <FormLabel sx={{ fontWeight: 600, fontSize: '0.8rem', mb: 0.5 }}>
                                            About
                                        </FormLabel>
                                        <Textarea
                                            value={formAbout}
                                            onChange={(e) => setFormAbout(e.target.value)}
                                            placeholder="Write something about yourself..."
                                            minRows={4}
                                            sx={{
                                                borderRadius: '8px',
                                            }}
                                        />
                                    </FormControl>
                                </Box>
                            </CardContent>

                            {/* Save Button */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    px: 3,
                                    py: 2.5,
                                    borderTop: '1px dashed',
                                    borderColor: 'divider',
                                }}
                            >
                                <Button
                                    onClick={handleSaveGeneral}
                                    loading={saving}
                                    sx={{
                                        borderRadius: '8px',
                                        fontWeight: 700,
                                        px: 3,
                                        bgcolor: '#212B36',
                                        color: 'white',
                                        '&:hover': {
                                            bgcolor: '#454F5B',
                                        },
                                    }}
                                >
                                    Save changes
                                </Button>
                            </Box>
                        </Card>
                    </Box>
                </TabPanel>

                {/* ====== NOTIFICATIONS TAB ====== */}
                <TabPanel value={1} sx={{ p: 0 }}>
                    <Card
                        variant="outlined"
                        sx={{
                            borderRadius: '16px',
                            boxShadow: '0 0 2px 0 rgba(145,158,171,0.2), 0 12px 24px -4px rgba(145,158,171,0.12)',
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Typography level="title-lg" fontWeight={700} sx={{ mb: 0.5 }}>
                                Notifications
                            </Typography>
                            <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 3 }}>
                                Manage your notification preferences
                            </Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                {/* Activity */}
                                <Sheet
                                    variant="plain"
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        py: 2,
                                        px: 0,
                                        borderBottom: '1px dashed',
                                        borderColor: 'divider',
                                    }}
                                >
                                    <Box>
                                        <Typography level="title-sm" fontWeight={600}>
                                            Activity notifications
                                        </Typography>
                                        <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                                            Get notified when someone approves or rejects your requests
                                        </Typography>
                                    </Box>
                                    <Switch
                                        checked={activityNotif}
                                        disabled={notifSaving}
                                        onChange={async (e) => {
                                            const val = e.target.checked;
                                            setNotifSaving(true);
                                            try {
                                                await api.patch('/users/notification-preferences', { notifActivity: val });
                                                setActivityNotif(val);
                                                setSnackbar({ open: true, message: val ? 'Activity notifications enabled' : 'Activity notifications disabled', color: 'success' });
                                            } catch { setSnackbar({ open: true, message: 'Failed to update', color: 'danger' }); }
                                            setNotifSaving(false);
                                        }}
                                        sx={{ ml: 2 }}
                                    />
                                </Sheet>

                                {/* Email */}
                                <Sheet
                                    variant="plain"
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        py: 2,
                                        px: 0,
                                        borderBottom: '1px dashed',
                                        borderColor: 'divider',
                                    }}
                                >
                                    <Box>
                                        <Typography level="title-sm" fontWeight={600}>
                                            Email notifications
                                        </Typography>
                                        <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                                            Receive email updates about document activities
                                        </Typography>
                                    </Box>
                                    <Switch
                                        checked={emailNotif}
                                        disabled={notifSaving}
                                        onChange={async (e) => {
                                            const val = e.target.checked;
                                            setNotifSaving(true);
                                            try {
                                                await api.patch('/users/notification-preferences', { notifEmail: val });
                                                setEmailNotif(val);
                                                setSnackbar({ open: true, message: val ? 'Email notifications enabled' : 'Email notifications disabled', color: 'success' });
                                            } catch { setSnackbar({ open: true, message: 'Failed to update', color: 'danger' }); }
                                            setNotifSaving(false);
                                        }}
                                        sx={{ ml: 2 }}
                                    />
                                </Sheet>

                                {/* Push */}
                                <Sheet
                                    variant="plain"
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        py: 2,
                                        px: 0,
                                    }}
                                >
                                    <Box>
                                        <Typography level="title-sm" fontWeight={600}>
                                            Push notifications
                                        </Typography>
                                        <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                                            Receive push notifications on your browser
                                        </Typography>
                                    </Box>
                                    <Switch
                                        checked={pushNotif}
                                        disabled={notifSaving}
                                        onChange={async (e) => {
                                            const val = e.target.checked;
                                            setNotifSaving(true);
                                            try {
                                                await api.patch('/users/notification-preferences', { notifPush: val });
                                                setPushNotif(val);
                                                setSnackbar({ open: true, message: val ? 'Push notifications enabled' : 'Push notifications disabled', color: 'success' });
                                            } catch { setSnackbar({ open: true, message: 'Failed to update', color: 'danger' }); }
                                            setNotifSaving(false);
                                        }}
                                        sx={{ ml: 2 }}
                                    />
                                </Sheet>
                            </Box>
                        </CardContent>

                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                px: 3,
                                py: 2.5,
                                borderTop: '1px dashed',
                                borderColor: 'divider',
                            }}
                        >
                            <Button
                                sx={{
                                    borderRadius: '8px',
                                    fontWeight: 700,
                                    px: 3,
                                    bgcolor: '#212B36',
                                    color: 'white',
                                    '&:hover': { bgcolor: '#454F5B' },
                                }}
                            >
                                Save changes
                            </Button>
                        </Box>
                    </Card>
                </TabPanel>

                {/* ====== SECURITY TAB ====== */}
                <TabPanel value={2} sx={{ p: 0 }}>
                    <Card
                        variant="outlined"
                        sx={{
                            borderRadius: '16px',
                            boxShadow: '0 0 2px 0 rgba(145,158,171,0.2), 0 12px 24px -4px rgba(145,158,171,0.12)',
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Typography level="title-lg" fontWeight={700} sx={{ mb: 0.5 }}>
                                Change password
                            </Typography>
                            <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 3 }}>
                                Update your password to keep your account secure
                            </Typography>

                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 2.5,
                                    maxWidth: 480,
                                }}
                            >
                                <FormControl>
                                    <FormLabel sx={{ fontWeight: 600, fontSize: '0.8rem', mb: 0.5 }}>
                                        Old password
                                    </FormLabel>
                                    <Input
                                        type="password"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        placeholder="••••••••"
                                        sx={{ borderRadius: '8px' }}
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel sx={{ fontWeight: 600, fontSize: '0.8rem', mb: 0.5 }}>
                                        New password
                                    </FormLabel>
                                    <Input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        sx={{ borderRadius: '8px' }}
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel sx={{ fontWeight: 600, fontSize: '0.8rem', mb: 0.5 }}>
                                        Confirm new password
                                    </FormLabel>
                                    <Input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        sx={{ borderRadius: '8px' }}
                                    />
                                </FormControl>
                            </Box>
                        </CardContent>

                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                px: 3,
                                py: 2.5,
                                borderTop: '1px dashed',
                                borderColor: 'divider',
                            }}
                        >
                            <Button
                                sx={{
                                    borderRadius: '8px',
                                    fontWeight: 700,
                                    px: 3,
                                    bgcolor: '#212B36',
                                    color: 'white',
                                    '&:hover': { bgcolor: '#454F5B' },
                                }}
                            >
                                Save changes
                            </Button>
                        </Box>
                    </Card>
                </TabPanel>
            </Tabs>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                color={snackbar.color}
                variant="soft"
                startDecorator={<CheckCircleRoundedIcon />}
                sx={{ borderRadius: '10px' }}
            >
                {snackbar.message}
            </Snackbar>
        </Box>
    );
}
