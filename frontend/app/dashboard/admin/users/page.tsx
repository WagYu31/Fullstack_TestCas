'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useColorScheme } from '@mui/joy/styles';
import Box from '@mui/joy/Box';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Chip from '@mui/joy/Chip';
import IconButton from '@mui/joy/IconButton';
import Input from '@mui/joy/Input';
import Stack from '@mui/joy/Stack';
import Table from '@mui/joy/Table';
import Typography from '@mui/joy/Typography';
import CircularProgress from '@mui/joy/CircularProgress';
import Snackbar from '@mui/joy/Snackbar';
import Avatar from '@mui/joy/Avatar';
import Tooltip from '@mui/joy/Tooltip';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Button from '@mui/joy/Button';
import Divider from '@mui/joy/Divider';

import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';

// Icons
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import BackupRoundedIcon from '@mui/icons-material/BackupRounded';

interface UserData {
    id: string;
    name: string;
    email: string;
    role: 'USER' | 'ADMIN';
    createdAt: string;
    updatedAt: string;
}

export default function UserManagementPage() {
    const currentUser = useAuthStore((state) => state.user);
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [editUser, setEditUser] = useState<UserData | null>(null);
    const [editRole, setEditRole] = useState<'USER' | 'ADMIN'>('USER');
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editPassword, setEditPassword] = useState('');
    const [deleteUser, setDeleteUser] = useState<UserData | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'USER' as 'USER' | 'ADMIN' });
    const { mode } = useColorScheme();
    const isDark = mode === 'dark';

    const palette = {
        green: { main: '#00A76F', light: '#5BE49B', lighter: '#C8FAD6' },
        blue: { main: '#006C9C', light: '#61F3F3', lighter: '#CAFDF5' },
        purple: { main: '#7635DC', light: '#B985F4', lighter: '#EBD6FD' },
        warning: { main: '#B76E00', light: '#FFAB00', lighter: '#FFF5CC' },
        error: { main: '#B71D18', light: '#FF5630', lighter: '#FFE9D5' },
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleUserUpdate = async () => {
        if (!editUser) return;
        if (!editName.trim() || !editEmail.trim()) {
            alert('Name and email are required');
            return;
        }
        try {
            setActionLoading(true);
            await api.patch(`/users/${editUser.id}`, {
                name: editName,
                email: editEmail,
                role: editRole,
                ...(editPassword ? { password: editPassword } : {}),
            });
            setSuccessMessage(`User "${editName}" updated successfully`);
            setShowSuccess(true);
            setEditUser(null);
            setEditPassword('');
            fetchUsers();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to update user');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteUser) return;
        try {
            setActionLoading(true);
            await api.delete(`/users/${deleteUser.id}`);
            setSuccessMessage(`User "${deleteUser.name}" has been deleted`);
            setShowSuccess(true);
            setDeleteUser(null);
            fetchUsers();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to delete user');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCreateUser = async () => {
        if (!newUser.name || !newUser.email || !newUser.password) {
            alert('Please fill in all fields');
            return;
        }
        try {
            setActionLoading(true);
            await api.post('/users', newUser);
            setSuccessMessage(`User "${newUser.name}" created successfully`);
            setShowSuccess(true);
            setShowAddModal(false);
            setNewUser({ name: '', email: '', password: '', role: 'USER' });
            fetchUsers();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to create user');
        } finally {
            setActionLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
        });
    };

    const filteredUsers = users.filter((u) => {
        const matchSearch = u.name.toLowerCase().includes(search.toLowerCase())
            || u.email.toLowerCase().includes(search.toLowerCase());
        const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
        return matchSearch && matchRole;
    });

    const adminCount = users.filter(u => u.role === 'ADMIN').length;
    const userCount = users.filter(u => u.role === 'USER').length;

    const cardSx = {
        borderRadius: '16px',
        border: '1px solid',
        borderColor: isDark ? 'rgba(145,158,171,0.08)' : 'rgba(145,158,171,0.16)',
        bgcolor: isDark ? 'rgba(22,28,36,0.72)' : 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(20px)',
        boxShadow: isDark ? '0 8px 16px rgba(0,0,0,0.4)' : '0 8px 16px rgba(145,158,171,0.12)',
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
    };

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', width: '100%' }}>
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
                            User Management
                        </Typography>
                        <Typography level="body-sm" sx={{ color: 'text.tertiary', fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
                            {users.length} users registered
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                        <Button
                            startDecorator={<PersonAddRoundedIcon />}
                            onClick={() => setShowAddModal(true)}
                            sx={{
                                borderRadius: '12px',
                                fontWeight: 700,
                                bgcolor: palette.green.main,
                                '&:hover': { bgcolor: '#009961' },
                                px: { xs: 1.5, sm: 2 },
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            }}
                        >
                            <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>Add User</Box>
                            <Box sx={{ display: { xs: 'inline', sm: 'none' } }}>Add</Box>
                        </Button>
                        <Tooltip title="Refresh" variant="soft" size="sm">
                            <IconButton
                                onClick={fetchUsers}
                                variant="soft"
                                color="neutral"
                                sx={{ borderRadius: '12px' }}
                                loading={loading}
                            >
                                <RefreshRoundedIcon />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Box>
            </Box>

            {/* Stat cards */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
                gap: 2, mb: 3,
            }}>
                {[
                    { label: 'Total Users', value: users.length, icon: <GroupRoundedIcon />, color: palette.blue },
                    { label: 'Admins', value: adminCount, icon: <AdminPanelSettingsRoundedIcon />, color: palette.purple },
                    { label: 'Users', value: userCount, icon: <PersonRoundedIcon />, color: palette.green },
                ].map((stat, idx) => (
                    <Card key={stat.label} variant="plain" sx={{
                        ...cardSx,
                        animation: `fadeSlideUp 0.4s ease-out ${idx * 0.1}s both`,
                    }}>
                        <CardContent sx={{ p: 2.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 0.5, fontWeight: 600 }}>
                                        {stat.label}
                                    </Typography>
                                    <Typography sx={{ fontWeight: 800, fontSize: '1.75rem', color: 'text.primary', lineHeight: 1 }}>
                                        {stat.value}
                                    </Typography>
                                </Box>
                                <Avatar sx={{
                                    bgcolor: isDark ? `${stat.color.main}20` : stat.color.lighter,
                                    color: stat.color.main,
                                    width: 48, height: 48,
                                }}>
                                    {stat.icon}
                                </Avatar>
                            </Box>
                        </CardContent>
                    </Card>
                ))}
            </Box>

            {/* Main table card */}
            <Card variant="plain" sx={{
                ...cardSx,
                animation: 'fadeSlideUp 0.5s ease-out 0.3s both',
            }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    {/* Search & Filter */}
                    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: { xs: 'column', sm: 'row' }, flexWrap: 'wrap' }}>
                        <Input
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            startDecorator={<SearchRoundedIcon sx={{ color: 'text.tertiary' }} />}
                            sx={{
                                flex: 1, minWidth: 200, borderRadius: '12px',
                                '--Input-focusedThickness': '1px',
                                bgcolor: isDark ? 'rgba(145,158,171,0.06)' : 'rgba(145,158,171,0.04)',
                            }}
                        />
                        <Box sx={{ display: 'flex', gap: 0.75 }}>
                            {[
                                { key: 'ALL', label: 'All' },
                                { key: 'ADMIN', label: 'Admin', color: palette.purple.main },
                                { key: 'USER', label: 'User', color: palette.green.main },
                            ].map(f => (
                                <Box key={f.key}
                                    onClick={() => setRoleFilter(f.key)}
                                    sx={{
                                        cursor: 'pointer', px: 1.5, py: 0.75, borderRadius: '10px',
                                        fontSize: '0.8rem', fontWeight: roleFilter === f.key ? 700 : 500,
                                        color: roleFilter === f.key ? '#fff' : 'text.tertiary',
                                        bgcolor: roleFilter === f.key
                                            ? (f.color || (isDark ? 'rgba(145,158,171,0.4)' : 'rgba(145,158,171,0.5)'))
                                            : (isDark ? 'rgba(145,158,171,0.08)' : 'rgba(145,158,171,0.06)'),
                                        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                                        display: 'flex', alignItems: 'center',
                                        '&:hover': {
                                            bgcolor: roleFilter === f.key
                                                ? (f.color || (isDark ? 'rgba(145,158,171,0.5)' : 'rgba(145,158,171,0.6)'))
                                                : (isDark ? 'rgba(145,158,171,0.12)' : 'rgba(145,158,171,0.1)'),
                                        },
                                    }}>
                                    {f.label}
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                            <CircularProgress size="lg" sx={{ '--CircularProgress-size': '72px' }}>
                                <img src="/images/cybermax-logo.png" alt="Cybermax" style={{ width: 36, height: 36, objectFit: 'contain' }} />
                            </CircularProgress>
                        </Box>
                    ) : filteredUsers.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 8, color: 'text.tertiary' }}>
                            <GroupRoundedIcon sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
                            <Typography level="body-md">No users found</Typography>
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
                                        '& tbody tr': {
                                            transition: 'background 0.2s ease',
                                        },
                                        '& tbody td': { py: 1.5 },
                                    }}
                                >
                                    <thead>
                                        <tr>
                                            <th style={{ width: '40%' }}>User</th>
                                            <th style={{ width: '20%' }}>Role</th>
                                            <th style={{ width: '25%' }}>Joined</th>
                                            <th style={{ width: '15%', textAlign: 'right', paddingRight: 24 }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map((u, idx) => (
                                            <tr key={u.id} style={{ animation: `fadeSlideUp 0.3s ease-out ${idx * 0.05}s both` }}>
                                                <td>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Avatar
                                                            size="sm"
                                                            sx={{
                                                                bgcolor: u.role === 'ADMIN'
                                                                    ? (isDark ? `${palette.purple.main}30` : palette.purple.lighter)
                                                                    : (isDark ? `${palette.green.main}30` : palette.green.lighter),
                                                                color: u.role === 'ADMIN' ? palette.purple.main : palette.green.main,
                                                                fontWeight: 700, fontSize: '0.75rem',
                                                            }}
                                                        >
                                                            {u.name.charAt(0).toUpperCase()}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography level="body-sm" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                                                {u.name}
                                                                {u.id === currentUser?.id && (
                                                                    <Chip size="sm" variant="soft" color="primary" sx={{ ml: 1, fontSize: '0.6rem', fontWeight: 700 }}>
                                                                        You
                                                                    </Chip>
                                                                )}
                                                            </Typography>
                                                            <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                                                                {u.email}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </td>
                                                <td>
                                                    <Chip
                                                        size="sm"
                                                        variant="soft"
                                                        color={u.role === 'ADMIN' ? 'primary' : 'neutral'}
                                                        startDecorator={u.role === 'ADMIN'
                                                            ? <AdminPanelSettingsRoundedIcon sx={{ fontSize: 14 }} />
                                                            : <PersonRoundedIcon sx={{ fontSize: 14 }} />}
                                                        sx={{ fontWeight: 700, fontSize: '0.7rem', borderRadius: '8px' }}
                                                    >
                                                        {u.role}
                                                    </Chip>
                                                </td>
                                                <td>
                                                    <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                                                        {formatDate(u.createdAt)}
                                                    </Typography>
                                                </td>
                                                <td style={{ textAlign: 'right', paddingRight: 24 }}>
                                                    {u.id !== currentUser?.id && (
                                                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                            <Tooltip title="Backup Documents" variant="soft" size="sm">
                                                                <IconButton
                                                                    size="sm"
                                                                    variant="soft"
                                                                    color="success"
                                                                    onClick={async () => {
                                                                        try {
                                                                            const response = await api.get(`/documents/backup/${u.id}`, {
                                                                                responseType: 'blob',
                                                                            });
                                                                            const url = window.URL.createObjectURL(new Blob([response.data]));
                                                                            const link = document.createElement('a');
                                                                            link.href = url;
                                                                            const disposition = response.headers['content-disposition'];
                                                                            const filename = disposition
                                                                                ? disposition.split('filename="')[1]?.replace('"', '') || 'backup.zip'
                                                                                : `backup_${u.name.replace(/[^a-zA-Z0-9]/g, '_')}.zip`;
                                                                            link.setAttribute('download', filename);
                                                                            document.body.appendChild(link);
                                                                            link.click();
                                                                            link.remove();
                                                                            window.URL.revokeObjectURL(url);
                                                                        } catch (error) {
                                                                            alert('Backup failed. User may have no documents.');
                                                                        }
                                                                    }}
                                                                    sx={{ borderRadius: '8px' }}
                                                                >
                                                                    <BackupRoundedIcon sx={{ fontSize: 18 }} />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Edit User" variant="soft" size="sm">
                                                                <IconButton
                                                                    size="sm"
                                                                    variant="soft"
                                                                    color="primary"
                                                                    onClick={() => { setEditUser(u); setEditName(u.name); setEditEmail(u.email); setEditRole(u.role); }}
                                                                    sx={{ borderRadius: '8px' }}
                                                                >
                                                                    <EditRoundedIcon sx={{ fontSize: 18 }} />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Delete User" variant="soft" size="sm">
                                                                <IconButton
                                                                    size="sm"
                                                                    variant="soft"
                                                                    color="danger"
                                                                    onClick={() => setDeleteUser(u)}
                                                                    sx={{ borderRadius: '8px' }}
                                                                >
                                                                    <DeleteRoundedIcon sx={{ fontSize: 18 }} />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Stack>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Box>

                            {/* Mobile Card View - hidden on desktop */}
                            <Stack spacing={1.5} sx={{ display: { xs: 'flex', md: 'none' } }}>
                                {filteredUsers.map((u, idx) => (
                                    <Card
                                        key={u.id}
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
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
                                                <Avatar
                                                    size="md"
                                                    sx={{
                                                        bgcolor: u.role === 'ADMIN'
                                                            ? (isDark ? `${palette.purple.main}30` : palette.purple.lighter)
                                                            : (isDark ? `${palette.green.main}30` : palette.green.lighter),
                                                        color: u.role === 'ADMIN' ? palette.purple.main : palette.green.main,
                                                        fontWeight: 700, fontSize: '0.85rem', flexShrink: 0,
                                                    }}
                                                >
                                                    {u.name.charAt(0).toUpperCase()}
                                                </Avatar>
                                                <Box sx={{ minWidth: 0 }}>
                                                    <Typography level="body-sm" sx={{ fontWeight: 600, color: 'text.primary' }} noWrap>
                                                        {u.name}
                                                        {u.id === currentUser?.id && (
                                                            <Chip size="sm" variant="soft" color="primary" sx={{ ml: 0.75, fontSize: '0.55rem', fontWeight: 700 }}>
                                                                You
                                                            </Chip>
                                                        )}
                                                    </Typography>
                                                    <Typography level="body-xs" sx={{ color: 'text.tertiary' }} noWrap>
                                                        {u.email}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            {u.id !== currentUser?.id && (
                                                <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0, ml: 1 }}>
                                                    <IconButton
                                                        size="sm"
                                                        variant="soft"
                                                        color="success"
                                                        onClick={async () => {
                                                            try {
                                                                const response = await api.get(`/documents/backup/${u.id}`, {
                                                                    responseType: 'blob',
                                                                });
                                                                const url = window.URL.createObjectURL(new Blob([response.data]));
                                                                const link = document.createElement('a');
                                                                link.href = url;
                                                                link.setAttribute('download', `backup_${u.name.replace(/[^a-zA-Z0-9]/g, '_')}.zip`);
                                                                document.body.appendChild(link);
                                                                link.click();
                                                                link.remove();
                                                                window.URL.revokeObjectURL(url);
                                                            } catch (error) {
                                                                alert('Backup failed.');
                                                            }
                                                        }}
                                                        sx={{ borderRadius: '8px' }}
                                                    >
                                                        <BackupRoundedIcon sx={{ fontSize: 16 }} />
                                                    </IconButton>
                                                    <IconButton
                                                        size="sm"
                                                        variant="soft"
                                                        color="primary"
                                                        onClick={() => { setEditUser(u); setEditName(u.name); setEditEmail(u.email); setEditRole(u.role); }}
                                                        sx={{ borderRadius: '8px' }}
                                                    >
                                                        <EditRoundedIcon sx={{ fontSize: 16 }} />
                                                    </IconButton>
                                                    <IconButton
                                                        size="sm"
                                                        variant="soft"
                                                        color="danger"
                                                        onClick={() => setDeleteUser(u)}
                                                        sx={{ borderRadius: '8px' }}
                                                    >
                                                        <DeleteRoundedIcon sx={{ fontSize: 16 }} />
                                                    </IconButton>
                                                </Stack>
                                            )}
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1.5, pl: 0.5 }}>
                                            <Chip
                                                size="sm"
                                                variant="soft"
                                                color={u.role === 'ADMIN' ? 'primary' : 'neutral'}
                                                startDecorator={u.role === 'ADMIN'
                                                    ? <AdminPanelSettingsRoundedIcon sx={{ fontSize: 13 }} />
                                                    : <PersonRoundedIcon sx={{ fontSize: 13 }} />}
                                                sx={{ fontWeight: 700, fontSize: '0.65rem', borderRadius: '8px' }}
                                            >
                                                {u.role}
                                            </Chip>
                                            <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                                                Joined {formatDate(u.createdAt)}
                                            </Typography>
                                        </Box>
                                    </Card>
                                ))}
                            </Stack>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Add User Modal */}
            <Modal open={showAddModal} onClose={() => setShowAddModal(false)}>
                <ModalDialog sx={{
                    maxWidth: 460, borderRadius: '16px',
                    bgcolor: isDark ? 'rgba(33,43,54,0.95)' : 'rgba(255,255,255,0.98)',
                    backdropFilter: 'blur(20px)',
                }}>
                    <ModalClose />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <Avatar sx={{ bgcolor: isDark ? `${palette.green.main}20` : palette.green.lighter, color: palette.green.main }}>
                            <PersonAddRoundedIcon />
                        </Avatar>
                        <Typography level="title-lg" sx={{ fontWeight: 700 }}>
                            Add New User
                        </Typography>
                    </Box>
                    <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 2 }}>
                        Create a new user account
                    </Typography>
                    <Stack spacing={2}>
                        <FormControl required>
                            <FormLabel>Name</FormLabel>
                            <Input
                                placeholder="Full name"
                                value={newUser.name}
                                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                sx={{ borderRadius: '10px' }}
                            />
                        </FormControl>
                        <FormControl required>
                            <FormLabel>Email</FormLabel>
                            <Input
                                type="email"
                                placeholder="email@example.com"
                                value={newUser.email}
                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                sx={{ borderRadius: '10px' }}
                            />
                        </FormControl>
                        <FormControl required>
                            <FormLabel>Password</FormLabel>
                            <Input
                                type="password"
                                placeholder="Min. 6 characters"
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                sx={{ borderRadius: '10px' }}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Role</FormLabel>
                            <Select
                                value={newUser.role}
                                onChange={(_, val) => val && setNewUser({ ...newUser, role: val as 'USER' | 'ADMIN' })}
                                sx={{ borderRadius: '10px' }}
                            >
                                <Option value="USER">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <PersonRoundedIcon sx={{ fontSize: 18 }} /> User
                                    </Box>
                                </Option>
                                <Option value="ADMIN">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <AdminPanelSettingsRoundedIcon sx={{ fontSize: 18 }} /> Admin
                                    </Box>
                                </Option>
                            </Select>
                        </FormControl>
                    </Stack>
                    <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 3 }}>
                        <Button variant="plain" color="neutral" onClick={() => setShowAddModal(false)} sx={{ borderRadius: '10px' }}>
                            Cancel
                        </Button>
                        <Button
                            loading={actionLoading}
                            onClick={handleCreateUser}
                            sx={{ borderRadius: '10px', bgcolor: palette.green.main, '&:hover': { bgcolor: '#009961' } }}
                            startDecorator={<PersonAddRoundedIcon />}
                        >
                            Create User
                        </Button>
                    </Stack>
                </ModalDialog>
            </Modal>

            {/* Edit User Modal */}
            <Modal open={!!editUser} onClose={() => setEditUser(null)}>
                <ModalDialog sx={{
                    maxWidth: 460, borderRadius: '16px',
                    bgcolor: isDark ? 'rgba(33,43,54,0.95)' : 'rgba(255,255,255,0.98)',
                    backdropFilter: 'blur(20px)',
                }}>
                    <ModalClose />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <Avatar sx={{ bgcolor: isDark ? `${palette.blue.main}20` : palette.blue.lighter, color: palette.blue.main }}>
                            <EditRoundedIcon />
                        </Avatar>
                        <Typography level="title-lg" sx={{ fontWeight: 700 }}>
                            Edit User
                        </Typography>
                    </Box>
                    <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 2 }}>
                        Update profile for <strong>{editUser?.name}</strong>
                    </Typography>
                    <Stack spacing={2}>
                        <FormControl required>
                            <FormLabel>Name</FormLabel>
                            <Input
                                placeholder="Full name"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                sx={{ borderRadius: '10px' }}
                            />
                        </FormControl>
                        <FormControl required>
                            <FormLabel>Email</FormLabel>
                            <Input
                                type="email"
                                placeholder="email@example.com"
                                value={editEmail}
                                onChange={(e) => setEditEmail(e.target.value)}
                                sx={{ borderRadius: '10px' }}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>New Password</FormLabel>
                            <Input
                                type="password"
                                placeholder="Leave blank to keep current"
                                value={editPassword}
                                onChange={(e) => setEditPassword(e.target.value)}
                                sx={{ borderRadius: '10px' }}
                            />
                        </FormControl>
                        {editUser?.id !== currentUser?.id && (
                            <FormControl>
                                <FormLabel>Role</FormLabel>
                                <Select
                                    value={editRole}
                                    onChange={(_, val) => val && setEditRole(val as 'USER' | 'ADMIN')}
                                    sx={{ borderRadius: '10px' }}
                                >
                                    <Option value="USER">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <PersonRoundedIcon sx={{ fontSize: 18 }} /> User
                                        </Box>
                                    </Option>
                                    <Option value="ADMIN">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <AdminPanelSettingsRoundedIcon sx={{ fontSize: 18 }} /> Admin
                                        </Box>
                                    </Option>
                                </Select>
                            </FormControl>
                        )}
                    </Stack>
                    <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 3 }}>
                        <Button variant="plain" color="neutral" onClick={() => setEditUser(null)} sx={{ borderRadius: '10px' }}>
                            Cancel
                        </Button>
                        <Button
                            loading={actionLoading}
                            onClick={handleUserUpdate}
                            sx={{ borderRadius: '10px' }}
                            startDecorator={<CheckCircleRoundedIcon />}
                        >
                            Save Changes
                        </Button>
                    </Stack>
                </ModalDialog>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal open={!!deleteUser} onClose={() => setDeleteUser(null)}>
                <ModalDialog sx={{
                    maxWidth: 420, borderRadius: '16px',
                    bgcolor: isDark ? 'rgba(33,43,54,0.95)' : 'rgba(255,255,255,0.98)',
                    backdropFilter: 'blur(20px)',
                }}>
                    <ModalClose />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <Avatar sx={{ bgcolor: isDark ? 'rgba(183,29,24,0.16)' : palette.error.lighter, color: palette.error.light }}>
                            <WarningRoundedIcon />
                        </Avatar>
                        <Typography level="title-lg" sx={{ fontWeight: 700 }}>
                            Delete User
                        </Typography>
                    </Box>
                    <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 0.5 }}>
                        Are you sure you want to delete <strong>{deleteUser?.name}</strong>?
                    </Typography>
                    <Typography level="body-xs" sx={{ color: palette.error.light, mb: 3 }}>
                        This action cannot be undone. All documents owned by this user will also be affected.
                    </Typography>
                    <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                        <Button variant="plain" color="neutral" onClick={() => setDeleteUser(null)} sx={{ borderRadius: '10px' }}>
                            Cancel
                        </Button>
                        <Button
                            loading={actionLoading}
                            color="danger"
                            onClick={handleDelete}
                            sx={{ borderRadius: '10px' }}
                            startDecorator={<DeleteRoundedIcon />}
                        >
                            Delete
                        </Button>
                    </Stack>
                </ModalDialog>
            </Modal>

            {/* Success Snackbar */}
            <Snackbar
                open={showSuccess}
                onClose={() => setShowSuccess(false)}
                autoHideDuration={3000}
                color="success"
                variant="soft"
                startDecorator={<CheckCircleRoundedIcon />}
                sx={{ borderRadius: '12px' }}
            >
                {successMessage}
            </Snackbar>
        </Box>
    );
}
