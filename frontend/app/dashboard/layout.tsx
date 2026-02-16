'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemButton from '@mui/joy/ListItemButton';
import ListItemContent from '@mui/joy/ListItemContent';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import IconButton from '@mui/joy/IconButton';
import Avatar from '@mui/joy/Avatar';
import Dropdown from '@mui/joy/Dropdown';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import MenuItem from '@mui/joy/MenuItem';
import Divider from '@mui/joy/Divider';
import CircularProgress from '@mui/joy/CircularProgress';
import Tooltip from '@mui/joy/Tooltip';
import Snackbar from '@mui/joy/Snackbar';
import { useColorScheme } from '@mui/joy/styles';
import NextLink from 'next/link';
import { getSocket, disconnectSocket } from '@/lib/socket';
import NotificationDropdown from '@/components/NotificationDropdown';

import Chip from '@mui/joy/Chip';

// Icons
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isAuthenticated, logout, setAuth } = useAuthStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);
    const { mode, setMode } = useColorScheme();
    const [wsNotif, setWsNotif] = useState<{ open: boolean; title: string; message: string }>({ open: false, title: '', message: '' });

    // WebSocket real-time notification listener
    useEffect(() => {
        if (!isHydrated || !isAuthenticated) return;

        const socket = getSocket();
        if (!socket) return;

        const handler = (data: any) => {
            setWsNotif({ open: true, title: data.title || 'Notifikasi', message: data.message || '' });
        };

        socket.on('new-notification', handler);

        return () => {
            socket.off('new-notification', handler);
        };
    }, [isHydrated, isAuthenticated]);

    // Restore auth from localStorage on mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (token && userStr) {
            try {
                const userData = JSON.parse(userStr);
                setAuth(userData, token);
            } catch (error) {
                console.error('Failed to restore auth:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setIsHydrated(true);
    }, [setAuth]);

    // Check auth after hydration
    useEffect(() => {
        if (isHydrated && !isAuthenticated) {
            router.push('/login');
        }
    }, [isHydrated, isAuthenticated, router]);

    const handleLogout = () => {
        disconnectSocket();
        logout();
        router.push('/login');
    };

    const toggleTheme = () => {
        setMode(mode === 'light' ? 'dark' : 'light');
    };

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    // Show loading while hydrating
    if (!isHydrated) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                }}
            >
                <CircularProgress size="lg" sx={{ '--CircularProgress-size': '80px' }}>
                    <img
                        src="/images/cybermax-logo.png"
                        alt="Cybermax"
                        style={{ width: 40, height: 40, objectFit: 'contain' }}
                    />
                </CircularProgress>
            </Box>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    const navItems = [
        { label: 'Dashboard', href: '/dashboard', icon: <HomeRoundedIcon /> },
        { label: 'Documents', href: '/dashboard/documents', icon: <DescriptionRoundedIcon /> },
        ...(user?.role === 'ADMIN' ? [
            { label: 'Permission Requests', href: '/dashboard/admin', icon: <AdminPanelSettingsRoundedIcon /> },
            { label: 'User Management', href: '/dashboard/admin/users', icon: <PeopleRoundedIcon /> },
        ] : []),
    ];

    const sidebarWidth = isSidebarCollapsed ? 80 : 280;

    return (
        <>
            <Box sx={{ display: 'flex', minHeight: '100vh' }}>
                {/* Backdrop Overlay */}
                {!isSidebarCollapsed && (
                    <Box
                        onClick={toggleSidebar}
                        sx={{
                            display: { xs: 'none', md: 'block' },
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            bgcolor: 'rgba(0, 0, 0, 0.5)',
                            zIndex: 1199,
                            transition: 'opacity 0.3s ease',
                        }}
                    />
                )}

                {/* Sidebar Drawer - Desktop */}
                <Sheet
                    sx={{
                        width: 280,
                        p: 0,
                        flexShrink: 0,
                        display: { xs: 'none', md: 'flex' },
                        flexDirection: 'column',
                        gap: 0,
                        borderRight: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.surface',
                        position: 'fixed',
                        top: 0,
                        left: isSidebarCollapsed ? -280 : 0,
                        bottom: 0,
                        zIndex: 1200,
                        transition: 'left 0.3s ease',
                        boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 8px 16px -4px rgba(145, 158, 171, 0.12)',
                    }}
                >
                    {/* Logo Section */}
                    <Box
                        sx={{
                            p: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                        }}
                    >
                        {/* Logo */}
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                        }}>
                            <Box
                                component="img"
                                src="/images/cybermax-logo.png"
                                alt="Cybermax Logo"
                                sx={{
                                    width: 40,
                                    height: 40,
                                    objectFit: 'contain',
                                }}
                            />
                            {!isSidebarCollapsed && (
                                <Box>
                                    <Typography
                                        level="title-lg"
                                        fontWeight="bold"
                                        sx={{ lineHeight: 1.2 }}
                                    >
                                        Cybermax
                                    </Typography>
                                    <Typography
                                        level="body-xs"
                                        sx={{ color: 'text.tertiary' }}
                                    >
                                        Document Management
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        {/* Close Button */}
                        <IconButton
                            onClick={toggleSidebar}
                            variant="plain"
                            size="sm"
                            sx={{
                                color: 'text.secondary',
                                '&:hover': { bgcolor: 'background.level1' }
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    {/* Navigation */}
                    <Box sx={{ flex: 1, p: 2 }}>
                        <List
                            sx={{
                                '--ListItem-radius': '8px',
                                '--List-gap': '4px',
                            }}
                        >
                            {navItems.map((item) => (
                                <ListItem key={item.href}>
                                    {isSidebarCollapsed ? (
                                        <Tooltip title={item.label} placement="right">
                                            <ListItemButton
                                                component={NextLink}
                                                href={item.href}
                                                selected={pathname === item.href}
                                                sx={{
                                                    py: 1.5,
                                                    px: 2,
                                                    justifyContent: 'center',
                                                    position: 'relative',
                                                    '&:hover': {
                                                        bgcolor: 'rgba(145, 158, 171, 0.08)',
                                                    },
                                                    '&.Joy-selected': {
                                                        bgcolor: 'rgba(6, 182, 212, 0.08)',
                                                        color: 'primary.500',
                                                        '&::after': {
                                                            content: '""',
                                                            position: 'absolute',
                                                            right: 0,
                                                            top: '50%',
                                                            transform: 'translateY(-50%)',
                                                            width: '3px',
                                                            height: '20px',
                                                            bgcolor: 'primary.500',
                                                            borderRadius: '4px 0 0 4px',
                                                        },
                                                    },
                                                }}
                                            >
                                                <ListItemDecorator sx={{ color: 'inherit' }}>
                                                    {item.icon}
                                                </ListItemDecorator>
                                            </ListItemButton>
                                        </Tooltip>
                                    ) : (
                                        <ListItemButton
                                            component={NextLink}
                                            href={item.href}
                                            selected={pathname === item.href}
                                            sx={{
                                                py: 1.5,
                                                px: 2,
                                                position: 'relative',
                                                '&:hover': {
                                                    bgcolor: 'rgba(145, 158, 171, 0.08)',
                                                },
                                                '&.Joy-selected': {
                                                    bgcolor: 'rgba(6, 182, 212, 0.08)',
                                                    color: 'primary.500',
                                                    fontWeight: 600,
                                                    '&::after': {
                                                        content: '""',
                                                        position: 'absolute',
                                                        right: 0,
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        width: '3px',
                                                        height: '20px',
                                                        bgcolor: 'primary.500',
                                                        borderRadius: '4px 0 0 4px',
                                                    },
                                                },
                                            }}
                                        >
                                            <ListItemDecorator sx={{ color: 'inherit' }}>
                                                {item.icon}
                                            </ListItemDecorator>
                                            <ListItemContent>
                                                <Typography level="title-sm" sx={{ color: 'inherit' }}>
                                                    {item.label}
                                                </Typography>
                                            </ListItemContent>
                                        </ListItemButton>
                                    )}
                                </ListItem>
                            ))}
                        </List>
                    </Box>

                    <Box sx={{ p: 2 }}>
                        <Divider sx={{ mb: 2 }} />

                        {/* User Profile */}
                        {isSidebarCollapsed ? (
                            <Tooltip title={user?.name || ''} placement="right">
                                <Dropdown>
                                    <MenuButton
                                        variant="plain"
                                        sx={{
                                            width: '100%',
                                            p: 1,
                                            borderRadius: 'sm',
                                            '&:hover': {
                                                bgcolor: 'background.level1',
                                            },
                                            display: 'flex',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Avatar
                                            size="sm"
                                            sx={{
                                                bgcolor: 'primary.500',
                                                color: 'white',
                                            }}
                                        >
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </Avatar>
                                    </MenuButton>
                                    <Menu placement="right-start" sx={{ minWidth: 200 }}>
                                        <Box sx={{ px: 2, py: 1.5 }}>
                                            <Typography level="title-sm">{user?.name}</Typography>
                                            <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                                                {user?.email}
                                            </Typography>
                                        </Box>
                                        <Divider />
                                        <MenuItem onClick={toggleTheme}>
                                            <ListItemDecorator>
                                                {mode === 'light' ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />}
                                            </ListItemDecorator>
                                            {mode === 'light' ? 'Dark' : 'Light'} Mode
                                        </MenuItem>
                                        <Divider />
                                        <MenuItem onClick={handleLogout} color="danger">
                                            <ListItemDecorator>
                                                <LogoutRoundedIcon />
                                            </ListItemDecorator>
                                            Logout
                                        </MenuItem>
                                    </Menu>
                                </Dropdown>
                            </Tooltip>
                        ) : (
                            <Dropdown>
                                <MenuButton
                                    variant="plain"
                                    sx={{
                                        width: '100%',
                                        p: 1.5,
                                        borderRadius: 'md',
                                        '&:hover': {
                                            bgcolor: 'background.level1',
                                        },
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Avatar
                                            size="sm"
                                            sx={{
                                                bgcolor: 'primary.500',
                                                color: 'white',
                                            }}
                                        >
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <Box sx={{ flex: 1, textAlign: 'left' }}>
                                            <Typography level="title-sm">
                                                {user?.name}
                                            </Typography>
                                            <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                                                {user?.email}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </MenuButton>
                                <Menu placement="top-start" sx={{ minWidth: 200 }}>
                                    <MenuItem onClick={toggleTheme}>
                                        <ListItemDecorator>
                                            {mode === 'light' ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />}
                                        </ListItemDecorator>
                                        {mode === 'light' ? 'Dark' : 'Light'} Mode
                                    </MenuItem>
                                    <Divider />
                                    <MenuItem onClick={handleLogout} color="danger">
                                        <ListItemDecorator>
                                            <LogoutRoundedIcon />
                                        </ListItemDecorator>
                                        Logout
                                    </MenuItem>
                                </Menu>
                            </Dropdown>
                        )}
                    </Box>
                </Sheet>

                {/* Desktop Header */}
                <Sheet
                    sx={{
                        display: { xs: 'none', md: 'flex' },
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        zIndex: 1100,
                        p: 2,
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.surface',
                    }}
                >
                    <IconButton
                        onClick={toggleSidebar}
                        variant="soft"
                        color="neutral"
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography level="title-lg" fontWeight="bold">
                        Cybermax
                    </Typography>

                    {/* Right Side Icons */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {/* Notification Bell */}
                        <NotificationDropdown />

                        {/* Dark Mode Toggle */}
                        <IconButton
                            variant="plain"
                            color="neutral"
                            onClick={toggleTheme}
                        >
                            {mode === 'light' ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />}
                        </IconButton>

                        {/* User Profile Menu - Minimal Dashboard Style */}
                        <Dropdown>
                            <MenuButton
                                slots={{ root: IconButton }}
                                slotProps={{ root: { variant: 'plain', color: 'neutral' } }}
                            >
                                <Avatar
                                    size="sm"
                                    sx={{
                                        bgcolor: 'primary.500',
                                        color: 'white',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        '&:hover': {
                                            transform: 'scale(1.05)',
                                            boxShadow: '0 0 0 3px rgba(6, 182, 212, 0.25)',
                                        },
                                    }}
                                >
                                    {user?.name?.charAt(0).toUpperCase()}
                                </Avatar>
                            </MenuButton>
                            <Menu
                                placement="bottom-end"
                                sx={{
                                    minWidth: 280,
                                    p: 0,
                                    overflow: 'hidden',
                                    borderRadius: '12px',
                                    boxShadow: '0 0 2px 0 rgba(145,158,171,0.2), 0 12px 24px -4px rgba(145,158,171,0.12)',
                                }}
                            >
                                {/* Profile Header */}
                                <Box
                                    sx={{
                                        px: 2.5,
                                        py: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                        bgcolor: 'background.level1',
                                        borderBottom: '1px dashed',
                                        borderColor: 'divider',
                                    }}
                                >
                                    <Avatar
                                        size="lg"
                                        sx={{
                                            bgcolor: 'primary.500',
                                            color: 'white',
                                            fontSize: '1.25rem',
                                            fontWeight: 700,
                                            width: 48,
                                            height: 48,
                                        }}
                                    >
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </Avatar>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography
                                            level="title-sm"
                                            fontWeight={700}
                                            sx={{ lineHeight: 1.4 }}
                                        >
                                            {user?.name}
                                        </Typography>
                                        <Typography
                                            level="body-xs"
                                            sx={{
                                                color: 'text.tertiary',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {user?.email}
                                        </Typography>
                                        <Chip
                                            size="sm"
                                            variant="soft"
                                            color={user?.role === 'ADMIN' ? 'primary' : 'neutral'}
                                            sx={{
                                                mt: 0.5,
                                                fontSize: '0.65rem',
                                                fontWeight: 700,
                                                letterSpacing: '0.5px',
                                                px: 1,
                                                textTransform: 'uppercase',
                                            }}
                                        >
                                            {user?.role}
                                        </Chip>
                                    </Box>
                                </Box>

                                {/* Navigation Items */}
                                <Box sx={{ py: 1 }}>
                                    <MenuItem
                                        component={NextLink}
                                        href="/dashboard"
                                        sx={{ py: 1.25, px: 2.5, gap: 1.5, fontSize: '0.875rem' }}
                                    >
                                        <ListItemDecorator sx={{ minWidth: 28 }}>
                                            <HomeRoundedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                                        </ListItemDecorator>
                                        Home
                                    </MenuItem>
                                    <MenuItem
                                        component={NextLink}
                                        href="/dashboard/profile"
                                        sx={{ py: 1.25, px: 2.5, gap: 1.5, fontSize: '0.875rem' }}
                                    >
                                        <ListItemDecorator sx={{ minWidth: 28 }}>
                                            <PersonRoundedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                                        </ListItemDecorator>
                                        Profile
                                    </MenuItem>
                                    <MenuItem
                                        component={NextLink}
                                        href="/dashboard/documents"
                                        sx={{ py: 1.25, px: 2.5, gap: 1.5, fontSize: '0.875rem' }}
                                    >
                                        <ListItemDecorator sx={{ minWidth: 28 }}>
                                            <DescriptionRoundedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                                        </ListItemDecorator>
                                        My Documents
                                    </MenuItem>
                                    <MenuItem
                                        onClick={toggleTheme}
                                        sx={{ py: 1.25, px: 2.5, gap: 1.5, fontSize: '0.875rem' }}
                                    >
                                        <ListItemDecorator sx={{ minWidth: 28 }}>
                                            {mode === 'light'
                                                ? <DarkModeRoundedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                                                : <LightModeRoundedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                                            }
                                        </ListItemDecorator>
                                        {mode === 'light' ? 'Dark' : 'Light'} Mode
                                    </MenuItem>
                                </Box>

                                <Divider sx={{ borderStyle: 'dashed' }} />

                                {/* Logout */}
                                <Box sx={{ p: 1 }}>
                                    <MenuItem
                                        onClick={handleLogout}
                                        color="danger"
                                        sx={{
                                            py: 1.25,
                                            px: 2.5,
                                            gap: 1.5,
                                            fontSize: '0.875rem',
                                            fontWeight: 600,
                                            borderRadius: '8px',
                                        }}
                                    >
                                        <ListItemDecorator sx={{ minWidth: 28 }}>
                                            <LogoutRoundedIcon sx={{ fontSize: 20 }} />
                                        </ListItemDecorator>
                                        Logout
                                    </MenuItem>
                                </Box>
                            </Menu>
                        </Dropdown>
                    </Box>
                </Sheet>

                {/* Mobile Header */}
                <Sheet
                    sx={{
                        display: { xs: 'flex', md: 'none' },
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        zIndex: 1000,
                        p: 2,
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.surface',
                    }}
                >
                    <Typography level="title-lg" fontWeight="bold">
                        Cybermax
                    </Typography>
                    <IconButton onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
                    </IconButton>
                </Sheet>

                {/* Mobile Sidebar */}
                {isMobileMenuOpen && (
                    <Sheet
                        sx={{
                            display: { xs: 'flex', md: 'none' },
                            position: 'fixed',
                            top: 64,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 999,
                            p: 2,
                            flexDirection: 'column',
                            gap: 2,
                            bgcolor: 'background.surface',
                        }}
                    >
                        <List sx={{ '--ListItem-radius': '8px', '--List-gap': '4px' }}>
                            {navItems.map((item) => (
                                <ListItem key={item.href}>
                                    <ListItemButton
                                        component={NextLink}
                                        href={item.href}
                                        selected={pathname === item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <ListItemDecorator>{item.icon}</ListItemDecorator>
                                        <ListItemContent>{item.label}</ListItemContent>
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>

                        <Box sx={{ mt: 'auto' }}>
                            <Divider sx={{ mb: 2 }} />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                                <Avatar size="sm">{user?.name?.charAt(0).toUpperCase()}</Avatar>
                                <Box>
                                    <Typography level="title-sm">{user?.name}</Typography>
                                    <Typography level="body-xs">{user?.email}</Typography>
                                </Box>
                            </Box>
                            <List sx={{ '--ListItem-radius': '8px' }}>
                                <ListItem>
                                    <ListItemButton onClick={toggleTheme}>
                                        <ListItemDecorator>
                                            {mode === 'light' ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />}
                                        </ListItemDecorator>
                                        <ListItemContent>
                                            {mode === 'light' ? 'Dark' : 'Light'} Mode
                                        </ListItemContent>
                                    </ListItemButton>
                                </ListItem>
                                <ListItem>
                                    <ListItemButton onClick={handleLogout} color="danger">
                                        <ListItemDecorator>
                                            <LogoutRoundedIcon />
                                        </ListItemDecorator>
                                        <ListItemContent>Logout</ListItemContent>
                                    </ListItemButton>
                                </ListItem>
                            </List>
                        </Box>
                    </Sheet>
                )}

                {/* Main Content */}
                <Box
                    component="main"
                    sx={{
                        flex: 1,
                        p: { xs: 2, md: 3 },
                        pt: { xs: 10, md: 10 },
                        minHeight: '100vh',
                        bgcolor: mode === 'dark' ? 'rgba(20, 26, 33, 0.85)' : 'transparent',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    {/* ══════ FULL ANIMATED BACKGROUND ══════ */}
                    <style>{`
                    @keyframes orbitalFloat {
                        0% { transform: translate(0, 0) rotate(0deg) scale(1); }
                        20% { transform: translate(80px, -120px) rotate(72deg) scale(1.1); }
                        40% { transform: translate(-60px, -200px) rotate(144deg) scale(0.95); }
                        60% { transform: translate(100px, -100px) rotate(216deg) scale(1.15); }
                        80% { transform: translate(-40px, -50px) rotate(288deg) scale(1.05); }
                        100% { transform: translate(0, 0) rotate(360deg) scale(1); }
                    }
                    @keyframes driftFloat {
                        0%, 100% { transform: translate(0, 0) scale(1); }
                        25% { transform: translate(-100px, -80px) scale(1.2); }
                        50% { transform: translate(60px, -180px) scale(0.8); }
                        75% { transform: translate(-30px, -60px) scale(1.1); }
                    }
                    @keyframes zigzagFloat {
                        0% { transform: translate(0, 0) rotate(0deg); }
                        16% { transform: translate(70px, -60px) rotate(60deg); }
                        33% { transform: translate(-50px, -140px) rotate(120deg); }
                        50% { transform: translate(90px, -200px) rotate(180deg); }
                        66% { transform: translate(-70px, -140px) rotate(240deg); }
                        83% { transform: translate(40px, -60px) rotate(300deg); }
                        100% { transform: translate(0, 0) rotate(360deg); }
                    }
                    @keyframes breatheFloat {
                        0%, 100% { transform: scale(1); opacity: 0.3; }
                        50% { transform: scale(1.4); opacity: 0.6; }
                    }
                    @keyframes wanderFloat {
                        0% { transform: translate(0, 0) rotate(0deg); }
                        25% { transform: translate(120px, -40px) rotate(90deg); }
                        50% { transform: translate(-80px, -160px) rotate(180deg); }
                        75% { transform: translate(60px, -240px) rotate(270deg); }
                        100% { transform: translate(0, 0) rotate(360deg); }
                    }
                    @keyframes meshGradient {
                        0% { background-position: 0% 0%; }
                        25% { background-position: 100% 0%; }
                        50% { background-position: 100% 100%; }
                        75% { background-position: 0% 100%; }
                        100% { background-position: 0% 0%; }
                    }
                    @keyframes colorShift {
                        0%, 100% { filter: hue-rotate(0deg); }
                        50% { filter: hue-rotate(30deg); }
                    }
                `}</style>

                    {/* Animated mesh gradient base */}
                    <Box sx={{
                        position: 'absolute', top: '-50%', left: '-50%', right: '-50%', bottom: '-50%',
                        background: mode === 'dark'
                            ? `
                            radial-gradient(circle at 20% 30%, rgba(0,167,111,0.15) 0%, transparent 40%),
                            radial-gradient(circle at 80% 20%, rgba(0,101,255,0.12) 0%, transparent 40%),
                            radial-gradient(circle at 50% 70%, rgba(142,51,255,0.10) 0%, transparent 40%),
                            radial-gradient(circle at 10% 80%, rgba(0,184,217,0.12) 0%, transparent 40%),
                            radial-gradient(circle at 90% 60%, rgba(255,86,48,0.08) 0%, transparent 40%)
                        `
                            : `
                            radial-gradient(circle at 20% 30%, rgba(0,167,111,0.25) 0%, transparent 40%),
                            radial-gradient(circle at 80% 20%, rgba(0,101,255,0.20) 0%, transparent 40%),
                            radial-gradient(circle at 50% 70%, rgba(142,51,255,0.18) 0%, transparent 40%),
                            radial-gradient(circle at 10% 80%, rgba(0,184,217,0.20) 0%, transparent 40%),
                            radial-gradient(circle at 90% 60%, rgba(255,86,48,0.15) 0%, transparent 40%)
                        `,
                        backgroundSize: '200% 200%',
                        animation: 'meshGradient 20s ease infinite, colorShift 30s ease infinite',
                        pointerEvents: 'none', zIndex: 0,
                    }} />

                    {/* Floating orbs - FULL */}
                    {[
                        // Large primary orbs
                        { size: 500, top: '-5%', left: '70%', color: '#00A76F', anim: 'orbitalFloat', dur: '25s', opD: 0.20, opL: 0.45, blurD: 90, blurL: 60 },
                        { size: 450, top: '15%', left: '-10%', color: '#0065FF', anim: 'driftFloat', dur: '30s', opD: 0.18, opL: 0.40, blurD: 85, blurL: 55 },
                        { size: 400, top: '45%', left: '60%', color: '#8E33FF', anim: 'zigzagFloat', dur: '28s', opD: 0.20, opL: 0.42, blurD: 80, blurL: 55 },
                        // Medium accent orbs
                        { size: 320, top: '65%', left: '5%', color: '#FFAB00', anim: 'wanderFloat', dur: '22s', opD: 0.16, opL: 0.38, blurD: 70, blurL: 45 },
                        { size: 300, top: '5%', left: '25%', color: '#FF5630', anim: 'breatheFloat', dur: '18s', opD: 0.14, opL: 0.30, blurD: 65, blurL: 45 },
                        { size: 280, top: '80%', left: '50%', color: '#00B8D9', anim: 'orbitalFloat', dur: '32s', opD: 0.18, opL: 0.38, blurD: 75, blurL: 50 },
                        // Small vivid accents
                        { size: 200, top: '35%', left: '40%', color: '#36B37E', anim: 'driftFloat', dur: '20s', opD: 0.22, opL: 0.50, blurD: 55, blurL: 35 },
                        { size: 180, top: '55%', left: '85%', color: '#6554C0', anim: 'zigzagFloat', dur: '24s', opD: 0.16, opL: 0.35, blurD: 50, blurL: 35 },
                        { size: 150, top: '90%', left: '25%', color: '#FF8B00', anim: 'wanderFloat', dur: '26s', opD: 0.14, opL: 0.32, blurD: 45, blurL: 30 },
                        { size: 120, top: '20%', left: '55%', color: '#00C9A7', anim: 'breatheFloat', dur: '15s', opD: 0.20, opL: 0.45, blurD: 40, blurL: 28 },
                    ].map((s, i) => (
                        <Box key={i} sx={{
                            position: 'absolute', width: s.size, height: s.size,
                            top: s.top, left: s.left, borderRadius: '50%',
                            bgcolor: s.color,
                            opacity: mode === 'dark' ? s.opD : s.opL,
                            filter: `blur(${mode === 'dark' ? s.blurD : s.blurL}px)`,
                            animation: `${s.anim} ${s.dur} ease-in-out infinite`,
                            pointerEvents: 'none', zIndex: 0,
                        }} />
                    ))}

                    {/* Content layer */}
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                        {children}
                    </Box>
                </Box>
            </Box>
            <Snackbar
                open={wsNotif.open}
                onClose={() => setWsNotif({ ...wsNotif, open: false })}
                autoHideDuration={5000}
                variant="soft"
                color="primary"
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                sx={{ zIndex: 9999 }}
            >
                <Box>
                    <Typography level="title-sm" sx={{ fontWeight: 700 }}>
                        🔔 {wsNotif.title}
                    </Typography>
                    <Typography level="body-xs">
                        {wsNotif.message}
                    </Typography>
                </Box>
            </Snackbar>
        </>
    );
}
