'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useColorScheme } from '@mui/joy/styles';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Chip from '@mui/joy/Chip';
import IconButton from '@mui/joy/IconButton';
import Input from '@mui/joy/Input';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import Stack from '@mui/joy/Stack';
import Table from '@mui/joy/Table';
import Typography from '@mui/joy/Typography';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Textarea from '@mui/joy/Textarea';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import CircularProgress from '@mui/joy/CircularProgress';
import LinearProgress from '@mui/joy/LinearProgress';
import Snackbar from '@mui/joy/Snackbar';
import Avatar from '@mui/joy/Avatar';
import Tooltip from '@mui/joy/Tooltip';
import Divider from '@mui/joy/Divider';
import Switch from '@mui/joy/Switch';

// Icons
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import FolderOpenRoundedIcon from '@mui/icons-material/FolderOpenRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import BackupRoundedIcon from '@mui/icons-material/BackupRounded';

interface Document {
    id: string;
    title: string;
    description: string;
    documentType: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    status: string;
    createdAt: string;
    createdBy: { name: string };
}

/* ── Minimal color tokens ── */
const minimal = {
    green: { main: '#00A76F', lighter: '#C8FAD6', contrastText: '#004B50' },
    blue: { main: '#0065FF', lighter: '#D6E4FF' },
    warning: { main: '#FFAB00', lighter: '#FFF5CC', contrastText: '#7A4100' },
    error: { main: '#FF5630', lighter: '#FFE9D5', contrastText: '#7A0916' },
    purple: { main: '#8E33FF', lighter: '#EFD6FF' },
};

/* ── File icon by type ── */
function getFileIcon(mimeType: string, fileName: string) {
    if (mimeType?.includes('pdf') || fileName?.endsWith('.pdf'))
        return <PictureAsPdfRoundedIcon sx={{ fontSize: 20, color: minimal.error.main }} />;
    if (mimeType?.includes('image'))
        return <ImageRoundedIcon sx={{ fontSize: 20, color: minimal.blue.main }} />;
    if (mimeType?.includes('word') || mimeType?.includes('document'))
        return <ArticleRoundedIcon sx={{ fontSize: 20, color: '#0065FF' }} />;
    return <InsertDriveFileRoundedIcon sx={{ fontSize: 20, color: minimal.green.main }} />;
}

/* ── Doc type chip color ── */
function getTypeColor(type: string): { bg: string; color: string; darkBg: string } {
    switch (type) {
        case 'CONTRACT':
            return { bg: minimal.blue.lighter, color: minimal.blue.main, darkBg: 'rgba(0, 101, 255, 0.16)' };
        case 'INVOICE':
            return { bg: minimal.purple.lighter, color: minimal.purple.main, darkBg: 'rgba(142, 51, 255, 0.16)' };
        case 'REPORT':
            return { bg: minimal.green.lighter, color: minimal.green.main, darkBg: 'rgba(0, 167, 111, 0.16)' };
        case 'PROPOSAL':
            return { bg: minimal.warning.lighter, color: minimal.warning.contrastText, darkBg: 'rgba(255, 171, 0, 0.16)' };
        default:
            return { bg: 'rgba(145, 158, 171, 0.08)', color: 'inherit', darkBg: 'rgba(145, 158, 171, 0.12)' };
    }
}

/* ── Format document ID with type prefix ── */
function getDocumentId(id: number | string, type: string): string {
    const prefixMap: Record<string, string> = {
        INVOICE: 'INV',
        REPORT: 'RPT',
        CONTRACT: 'KTR',
        PROPOSAL: 'PRP',
        OTHER: 'OTH',
    };
    const prefix = prefixMap[type] || 'DOC';
    const shortId = String(id).substring(0, 8);
    return `${prefix}-${shortId}`;
}

export default function DocumentsPage() {
    const user = useAuthStore((state) => state.user);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadData, setUploadData] = useState({
        title: '',
        description: '',
        documentType: '',
        file: null as File | null,
    });
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('Document uploaded successfully!');
    const { mode } = useColorScheme();
    const isDark = mode === 'dark';

    // Edit Document States
    const [showEditModal, setShowEditModal] = useState(false);
    const [showRequestPermissionModal, setShowRequestPermissionModal] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const [editData, setEditData] = useState({
        title: '',
        description: '',
        documentType: '',
    });
    const [permissionReason, setPermissionReason] = useState('');
    const [editLoading, setEditLoading] = useState(false);
    const [requestLoading, setRequestLoading] = useState(false);

    // Replace File States
    const [showReplaceModal, setShowReplaceModal] = useState(false);
    const [replaceFile, setReplaceFile] = useState<File | null>(null);
    const [replaceReason, setReplaceReason] = useState('');
    const [replaceLoading, setReplaceLoading] = useState(false);
    const [backingUp, setBackingUp] = useState(false);
    const [autoBackup, setAutoBackup] = useState(false);
    const [autoBackupLoading, setAutoBackupLoading] = useState(false);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const response = await api.get('/documents', {
                params: { search, page: 1, limit: 50 },
            });
            setDocuments(response.data.data);
        } catch (error) {
            console.error('Failed to fetch documents:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, [search]);

    // Fetch auto backup status
    useEffect(() => {
        const fetchAutoBackupStatus = async () => {
            try {
                const res = await api.get('/users/me');
                setAutoBackup(res.data.autoBackup || false);
            } catch (e) { }
        };
        fetchAutoBackupStatus();
    }, []);

    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file && file.size > MAX_FILE_SIZE) {
            alert(`File terlalu besar! Maksimum ${formatFileSize(MAX_FILE_SIZE)}. File Anda: ${formatFileSize(file.size)}`);
            e.target.value = '';
            return;
        }
        setUploadData({ ...uploadData, file });
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadData.file) return;

        if (uploadData.file.size > MAX_FILE_SIZE) {
            alert(`File terlalu besar! Maksimum ${formatFileSize(MAX_FILE_SIZE)}.`);
            return;
        }

        const formData = new FormData();
        formData.append('file', uploadData.file);
        formData.append('title', uploadData.title);
        formData.append('description', uploadData.description);
        formData.append('documentType', uploadData.documentType);

        try {
            setUploading(true);
            setUploadProgress(0);
            await api.post('/documents', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percent = progressEvent.total
                        ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                        : 0;
                    setUploadProgress(percent);
                },
            });
            setShowUploadModal(false);
            setUploadData({ title: '', description: '', documentType: '', file: null });
            setUploadProgress(0);
            setSuccessMessage('Document uploaded successfully!');
            setShowSuccess(true);
            fetchDocuments();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleDownload = async (id: string, fileName: string) => {
        try {
            const response = await api.get(`/documents/${id}/download`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert('Download failed');
        }
    };

    const handleView = async (id: string, fileName: string) => {
        try {
            const response = await api.get(`/documents/${id}/download`, {
                responseType: 'blob',
            });
            const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/octet-stream' });
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (error) {
            alert('Failed to open document');
        }
    };

    const handleDelete = async (id: string) => {
        const reason = prompt('Please provide a reason for deletion:');
        if (!reason) return;

        try {
            await api.delete(`/documents/${id}`, {
                data: { reason },
            });
            setSuccessMessage('Delete request submitted! Waiting for admin approval.');
            setShowSuccess(true);
            fetchDocuments();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to submit delete request');
        }
    };

    const handleEditClick = async (doc: Document) => {
        setSelectedDocument(doc);
        setEditData({
            title: doc.title,
            description: doc.description,
            documentType: doc.documentType,
        });
        setShowEditModal(true);
    };

    const handleReplaceClick = (doc: Document) => {
        setSelectedDocument(doc);
        setReplaceFile(null);
        setReplaceReason('');
        setShowReplaceModal(true);
    };

    const handleReplaceSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDocument || !replaceFile || !replaceReason) return;

        const formData = new FormData();
        formData.append('file', replaceFile);
        formData.append('reason', replaceReason);

        try {
            setReplaceLoading(true);
            await api.post(`/documents/${selectedDocument.id}/replace`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setShowReplaceModal(false);
            setSuccessMessage('Replace request submitted! Waiting for admin approval.');
            setShowSuccess(true);
            fetchDocuments();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to submit replace request');
        } finally {
            setReplaceLoading(false);
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDocument) return;

        try {
            setEditLoading(true);
            await api.patch(`/documents/${selectedDocument.id}`, editData);
            setShowEditModal(false);
            setSuccessMessage('Document updated successfully!');
            setShowSuccess(true);
            fetchDocuments();
        } catch (error: any) {
            if (error.response?.status === 403) {
                setShowEditModal(false);
                setShowRequestPermissionModal(true);
            } else {
                alert(error.response?.data?.message || 'Failed to update document');
            }
        } finally {
            setEditLoading(false);
        }
    };

    const handleRequestPermission = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDocument || !permissionReason) return;

        try {
            setRequestLoading(true);
            await api.post('/permission-requests', {
                documentId: selectedDocument.id,
                requestReason: permissionReason,
            });
            setShowRequestPermissionModal(false);
            setPermissionReason('');
            setSuccessMessage('Permission request submitted! Waiting for admin approval.');
            setShowSuccess(true);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to submit permission request');
        } finally {
            setRequestLoading(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusChip = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return (
                    <Chip
                        size="sm"
                        variant="soft"
                        sx={{
                            bgcolor: isDark ? 'rgba(0, 167, 111, 0.16)' : minimal.green.lighter,
                            color: minimal.green.main,
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            borderRadius: '6px',
                        }}
                    >
                        Active
                    </Chip>
                );
            case 'PENDING_DELETE':
                return (
                    <Chip
                        size="sm"
                        variant="soft"
                        sx={{
                            bgcolor: isDark ? 'rgba(255, 86, 48, 0.16)' : minimal.error.lighter,
                            color: minimal.error.main,
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            borderRadius: '6px',
                        }}
                    >
                        Pending Delete
                    </Chip>
                );
            case 'PENDING_REPLACE':
                return (
                    <Chip
                        size="sm"
                        variant="soft"
                        sx={{
                            bgcolor: isDark ? 'rgba(255, 171, 0, 0.16)' : minimal.warning.lighter,
                            color: isDark ? minimal.warning.main : minimal.warning.contrastText,
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            borderRadius: '6px',
                        }}
                    >
                        Pending Replace
                    </Chip>
                );
            default:
                return (
                    <Chip size="sm" variant="soft" sx={{ fontWeight: 700, fontSize: '0.7rem', borderRadius: '6px' }}>
                        {status.replace('_', ' ')}
                    </Chip>
                );
        }
    };

    const cardBg = isDark ? 'rgba(145, 158, 171, 0.08)' : '#fff';
    const cardShadow = isDark
        ? 'none'
        : '0 0 2px 0 rgba(145,158,171,0.2), 0 12px 24px -4px rgba(145,158,171,0.12)';
    const cardBorder = isDark ? '1px solid rgba(145, 158, 171, 0.16)' : 'none';

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
            {/* ═══════════ HEADER ═══════════ */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 2,
                    mb: 3,
                }}
            >
                <Box>
                    <Typography
                        level="h2"
                        sx={{
                            fontWeight: 700,
                            color: 'text.primary',
                            letterSpacing: '-0.5px',
                            mb: 0.5,
                        }}
                    >
                        Documents
                    </Typography>
                    <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
                        {documents.length} document{documents.length !== 1 ? 's' : ''} found
                    </Typography>
                </Box>

                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Tooltip title="Refresh" variant="soft">
                        <IconButton
                            variant="soft"
                            color="neutral"
                            onClick={fetchDocuments}
                            sx={{
                                borderRadius: '10px',
                                '--IconButton-size': '40px',
                            }}
                        >
                            <RefreshRoundedIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Backup semua dokumen" variant="soft">
                        <IconButton
                            variant="soft"
                            color="primary"
                            loading={backingUp}
                            onClick={async () => {
                                try {
                                    setBackingUp(true);
                                    const response = await api.get('/documents/backup', {
                                        responseType: 'blob',
                                    });
                                    const url = window.URL.createObjectURL(new Blob([response.data]));
                                    const link = document.createElement('a');
                                    link.href = url;
                                    const disposition = response.headers['content-disposition'];
                                    const filename = disposition
                                        ? disposition.split('filename="')[1]?.replace('"', '') || 'backup.zip'
                                        : 'backup.zip';
                                    link.setAttribute('download', filename);
                                    document.body.appendChild(link);
                                    link.click();
                                    link.remove();
                                    window.URL.revokeObjectURL(url);
                                    setSuccessMessage('Backup downloaded successfully!');
                                    setShowSuccess(true);
                                } catch (error) {
                                    alert('Backup failed. Please try again.');
                                } finally {
                                    setBackingUp(false);
                                }
                            }}
                            sx={{
                                borderRadius: '10px',
                                '--IconButton-size': '40px',
                            }}
                        >
                            <BackupRoundedIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip
                        title={autoBackup ? 'Auto backup aktif (setiap tanggal 1)' : 'Aktifkan auto backup bulanan'}
                        variant="soft"
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <Switch
                                checked={autoBackup}
                                disabled={autoBackupLoading}
                                onChange={async (e) => {
                                    const newValue = e.target.checked;
                                    try {
                                        setAutoBackupLoading(true);
                                        await api.patch('/users/auto-backup', { autoBackup: newValue });
                                        setAutoBackup(newValue);
                                        setSuccessMessage(newValue ? 'Auto backup bulanan diaktifkan!' : 'Auto backup bulanan dinonaktifkan');
                                        setShowSuccess(true);
                                    } catch (error) {
                                        alert('Gagal mengubah pengaturan auto backup');
                                    } finally {
                                        setAutoBackupLoading(false);
                                    }
                                }}
                                size="sm"
                                sx={{
                                    '--Switch-trackWidth': '36px',
                                    '--Switch-trackHeight': '20px',
                                    '--Switch-thumbSize': '16px',
                                }}
                            />
                            <Typography level="body-xs" sx={{ fontWeight: 600, color: autoBackup ? minimal.green.main : 'text.tertiary', display: { xs: 'none', sm: 'block' } }}>
                                Auto
                            </Typography>
                        </Box>
                    </Tooltip>
                    {user?.role !== 'ADMIN' && (
                        <Button
                            startDecorator={<AddRoundedIcon />}
                            onClick={() => setShowUploadModal(true)}
                            sx={{
                                bgcolor: minimal.green.contrastText,
                                color: '#fff',
                                fontWeight: 700,
                                borderRadius: '10px',
                                px: { xs: 1.5, sm: 2.5 },
                                py: 1,
                                boxShadow: '0 8px 16px 0 rgba(0, 75, 80, 0.24)',
                                '&:hover': {
                                    bgcolor: '#00363A',
                                    transform: 'translateY(-1px)',
                                },
                                transition: 'all 0.2s ease',
                                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                            }}
                        >
                            <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>Upload</Box>
                        </Button>
                    )}
                </Stack>
            </Box>

            {/* ═══════════ SEARCH + TABLE CARD ═══════════ */}
            <Card
                variant="plain"
                sx={{
                    borderRadius: '16px',
                    bgcolor: cardBg,
                    boxShadow: cardShadow,
                    border: cardBorder,
                    overflow: 'hidden',
                }}
            >
                {/* Search bar inside card */}
                <Box sx={{ p: 2.5, pb: 0 }}>
                    <Input
                        placeholder="Search by title, description, filename, ID code, or date..."
                        startDecorator={<SearchRoundedIcon sx={{ color: 'text.tertiary' }} />}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        sx={{
                            '--Input-focusedThickness': '1px',
                            '--Input-radius': '10px',
                            bgcolor: isDark ? 'rgba(145, 158, 171, 0.08)' : 'rgba(145, 158, 171, 0.06)',
                            border: 'none',
                            py: 1,
                            fontSize: '0.875rem',
                            '&:focus-within': {
                                bgcolor: isDark ? 'rgba(145, 158, 171, 0.12)' : 'rgba(145, 158, 171, 0.08)',
                            },
                        }}
                    />
                </Box>

                {/* Filter chips */}
                <Box sx={{ px: 2.5, pt: 1.5, pb: 0.5, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                    <FilterListRoundedIcon sx={{ fontSize: 18, color: 'text.tertiary', mr: 0.5 }} />
                    {[
                        { key: 'ALL', label: 'Semua', color: '#637381' },
                        { key: 'CONTRACT', label: 'Kontrak', color: minimal.blue.main },
                        { key: 'INVOICE', label: 'Invoice', color: minimal.purple.main },
                        { key: 'REPORT', label: 'Laporan', color: minimal.green.main },
                        { key: 'PROPOSAL', label: 'Proposal', color: minimal.warning.contrastText },
                    ].map((f) => (
                        <Chip
                            key={f.key}
                            size="sm"
                            variant={typeFilter === f.key ? 'solid' : 'soft'}
                            onClick={() => setTypeFilter(f.key)}
                            sx={{
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                borderRadius: '8px',
                                px: 1.5,
                                transition: 'all 0.2s ease',
                                ...(typeFilter === f.key
                                    ? {
                                        bgcolor: f.color,
                                        color: '#fff',
                                        boxShadow: `0 4px 8px ${f.color}40`,
                                    }
                                    : {
                                        bgcolor: isDark ? 'rgba(145,158,171,0.08)' : 'rgba(145,158,171,0.06)',
                                        color: 'text.secondary',
                                        '&:hover': {
                                            bgcolor: isDark ? 'rgba(145,158,171,0.16)' : 'rgba(145,158,171,0.12)',
                                        },
                                    }),
                            }}
                        >
                            {f.label}
                        </Chip>
                    ))}
                </Box>

                {/* Table */}
                <CardContent sx={{ p: 0, overflow: 'auto' }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 6 }}>
                            <CircularProgress size="lg" sx={{ '--CircularProgress-size': '72px' }}>
                                <img src="/images/cybermax-logo.png" alt="Cybermax" style={{ width: 36, height: 36, objectFit: 'contain' }} />
                            </CircularProgress>
                        </Box>
                    ) : (() => {
                        const searchLower = search.toLowerCase();
                        const filteredDocuments = documents.filter(doc => {
                            const matchesType = typeFilter === 'ALL' || doc.documentType === typeFilter;
                            const docId = getDocumentId(doc.id, doc.documentType).toLowerCase();
                            const docDate = formatDate(doc.createdAt).toLowerCase();
                            const matchesSearch = !search ||
                                doc.title.toLowerCase().includes(searchLower) ||
                                (doc.description || '').toLowerCase().includes(searchLower) ||
                                doc.fileName.toLowerCase().includes(searchLower) ||
                                docId.includes(searchLower) ||
                                docDate.includes(searchLower);
                            return matchesType && matchesSearch;
                        });
                        return filteredDocuments.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 8, px: 3 }}>
                                <Avatar
                                    sx={{
                                        width: 64,
                                        height: 64,
                                        bgcolor: isDark ? 'rgba(145, 158, 171, 0.12)' : 'rgba(145, 158, 171, 0.08)',
                                        mx: 'auto',
                                        mb: 2,
                                    }}
                                >
                                    <FolderOpenRoundedIcon sx={{ fontSize: 32, color: 'text.tertiary' }} />
                                </Avatar>
                                <Typography level="title-md" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                                    No documents found
                                </Typography>
                                <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
                                    {search ? 'Try a different search term' : 'Upload your first document to get started'}
                                </Typography>
                            </Box>
                        ) : (
                            <>
                                {/* ═══ MOBILE CARD VIEW (xs, sm) ═══ */}
                                <Box sx={{ display: { xs: 'block', md: 'none' }, p: 2 }}>
                                    <Stack spacing={1.5}>
                                        {filteredDocuments.map((doc) => {
                                            const typeColor = getTypeColor(doc.documentType);
                                            return (
                                                <Card
                                                    key={doc.id}
                                                    variant="outlined"
                                                    sx={{
                                                        borderRadius: '12px',
                                                        border: isDark ? '1px solid rgba(145,158,171,0.16)' : '1px solid rgba(145,158,171,0.16)',
                                                        bgcolor: isDark ? 'rgba(145,158,171,0.04)' : 'rgba(145,158,171,0.02)',
                                                        transition: 'all 0.2s ease',
                                                        '&:active': {
                                                            transform: 'scale(0.98)',
                                                        },
                                                    }}
                                                >
                                                    <CardContent sx={{ p: 2 }}>
                                                        {/* Top row: icon + title + status */}
                                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
                                                            <Avatar
                                                                variant="soft"
                                                                sx={{
                                                                    width: 38,
                                                                    height: 38,
                                                                    borderRadius: '10px',
                                                                    bgcolor: isDark
                                                                        ? 'rgba(145, 158, 171, 0.12)'
                                                                        : 'rgba(145, 158, 171, 0.06)',
                                                                    flexShrink: 0,
                                                                }}
                                                            >
                                                                {getFileIcon(doc.mimeType, doc.fileName)}
                                                            </Avatar>
                                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                                <Typography
                                                                    level="title-sm"
                                                                    sx={{
                                                                        fontWeight: 600,
                                                                        color: 'text.primary',
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        whiteSpace: 'nowrap',
                                                                        mb: 0.25,
                                                                    }}
                                                                >
                                                                    {doc.title}
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
                                                                    {doc.fileName}
                                                                </Typography>
                                                            </Box>
                                                        </Box>

                                                        {/* Chips row: type + status */}
                                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
                                                            <Chip
                                                                size="sm"
                                                                variant="soft"
                                                                sx={{
                                                                    bgcolor: isDark ? typeColor.darkBg : typeColor.bg,
                                                                    color: typeColor.color,
                                                                    fontWeight: 700,
                                                                    fontSize: '0.65rem',
                                                                    borderRadius: '6px',
                                                                    textTransform: 'capitalize',
                                                                }}
                                                            >
                                                                {doc.documentType.toLowerCase()}
                                                            </Chip>
                                                            {getStatusChip(doc.status)}
                                                        </Box>

                                                        {/* Bottom row: meta + actions */}
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Box sx={{ display: 'flex', gap: 2 }}>
                                                                <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                                                                    {formatFileSize(doc.fileSize)}
                                                                </Typography>
                                                                <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                                                                    {formatDate(doc.createdAt)}
                                                                </Typography>
                                                            </Box>
                                                            <Stack direction="row" spacing={0.5}>
                                                                <IconButton
                                                                    size="sm"
                                                                    variant="soft"
                                                                    color="primary"
                                                                    onClick={() => handleDownload(doc.id, doc.fileName)}
                                                                    sx={{ borderRadius: '8px', '--IconButton-size': '32px' }}
                                                                >
                                                                    <DownloadRoundedIcon sx={{ fontSize: 16 }} />
                                                                </IconButton>
                                                                <IconButton
                                                                    size="sm"
                                                                    variant="soft"
                                                                    color="success"
                                                                    onClick={() => handleView(doc.id, doc.fileName)}
                                                                    sx={{ borderRadius: '8px', '--IconButton-size': '32px' }}
                                                                >
                                                                    <VisibilityRoundedIcon sx={{ fontSize: 16 }} />
                                                                </IconButton>
                                                                {doc.status === 'ACTIVE' && (
                                                                    <>
                                                                        <IconButton
                                                                            size="sm"
                                                                            variant="soft"
                                                                            color="neutral"
                                                                            onClick={() => handleEditClick(doc)}
                                                                            sx={{ borderRadius: '8px', '--IconButton-size': '32px' }}
                                                                        >
                                                                            <EditRoundedIcon sx={{ fontSize: 16 }} />
                                                                        </IconButton>
                                                                        {user?.role !== 'ADMIN' && (
                                                                            <IconButton
                                                                                size="sm"
                                                                                variant="soft"
                                                                                color="warning"
                                                                                onClick={() => handleReplaceClick(doc)}
                                                                                sx={{ borderRadius: '8px', '--IconButton-size': '32px' }}
                                                                            >
                                                                                <SwapHorizRoundedIcon sx={{ fontSize: 16 }} />
                                                                            </IconButton>
                                                                        )}
                                                                        <IconButton
                                                                            size="sm"
                                                                            variant="soft"
                                                                            color="danger"
                                                                            onClick={() => handleDelete(doc.id)}
                                                                            sx={{ borderRadius: '8px', '--IconButton-size': '32px' }}
                                                                        >
                                                                            <DeleteRoundedIcon sx={{ fontSize: 16 }} />
                                                                        </IconButton>
                                                                    </>
                                                                )}
                                                            </Stack>
                                                        </Box>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </Stack>
                                </Box>

                                {/* ═══ DESKTOP TABLE VIEW (md+) ═══ */}
                                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                                    <Table
                                        stickyHeader
                                        hoverRow
                                        sx={{
                                            '--TableCell-headBackground': isDark
                                                ? 'rgba(145, 158, 171, 0.06)'
                                                : 'rgba(145, 158, 171, 0.04)',
                                            '& thead th': {
                                                color: 'text.secondary',
                                                fontWeight: 600,
                                                fontSize: '0.8rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                py: 1.5,
                                                borderBottom: '1px solid',
                                                borderColor: isDark ? 'rgba(145, 158, 171, 0.16)' : 'rgba(145, 158, 171, 0.2)',
                                            },
                                            '& tbody td': {
                                                py: 1.75,
                                                borderBottom: '1px dashed',
                                                borderColor: isDark ? 'rgba(145, 158, 171, 0.12)' : 'rgba(145, 158, 171, 0.12)',
                                            },
                                            '& tbody tr:last-child td': {
                                                borderBottom: 'none',
                                            },
                                            '& tbody tr:hover': {
                                                bgcolor: isDark ? 'rgba(145, 158, 171, 0.06)' : 'rgba(145, 158, 171, 0.04)',
                                            },
                                        }}
                                    >
                                        <thead>
                                            <tr>
                                                <th style={{ width: '8%', paddingLeft: 24 }}>ID</th>
                                                <th style={{ width: '32%' }}>Document</th>
                                                <th style={{ width: '10%' }}>Type</th>
                                                <th style={{ width: '10%' }}>Size</th>
                                                <th style={{ width: '12%' }}>Status</th>
                                                <th style={{ width: '14%' }}>Created</th>
                                                <th style={{ width: '14%', textAlign: 'right', paddingRight: 24 }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredDocuments.map((doc) => {
                                                const typeColor = getTypeColor(doc.documentType);
                                                return (
                                                    <tr key={doc.id}>
                                                        {/* ID column */}
                                                        <td style={{ paddingLeft: 24 }}>
                                                            <Typography level="body-xs" sx={{ fontFamily: 'monospace', color: 'text.tertiary', fontWeight: 600 }}>
                                                                {getDocumentId(doc.id, doc.documentType)}
                                                            </Typography>
                                                        </td>
                                                        {/* Document column with file icon */}
                                                        <td>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                                <Avatar
                                                                    variant="soft"
                                                                    sx={{
                                                                        width: 40,
                                                                        height: 40,
                                                                        borderRadius: '10px',
                                                                        bgcolor: isDark
                                                                            ? 'rgba(145, 158, 171, 0.12)'
                                                                            : 'rgba(145, 158, 171, 0.06)',
                                                                    }}
                                                                >
                                                                    {getFileIcon(doc.mimeType, doc.fileName)}
                                                                </Avatar>
                                                                <Box sx={{ minWidth: 0 }}>
                                                                    <Typography
                                                                        level="title-sm"
                                                                        sx={{
                                                                            fontWeight: 600,
                                                                            color: 'text.primary',
                                                                            overflow: 'hidden',
                                                                            textOverflow: 'ellipsis',
                                                                            whiteSpace: 'nowrap',
                                                                        }}
                                                                    >
                                                                        {doc.title}
                                                                    </Typography>
                                                                    <Typography
                                                                        level="body-xs"
                                                                        sx={{
                                                                            color: 'text.tertiary',
                                                                            overflow: 'hidden',
                                                                            textOverflow: 'ellipsis',
                                                                            whiteSpace: 'nowrap',
                                                                            maxWidth: 250,
                                                                        }}
                                                                    >
                                                                        {doc.fileName}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        </td>

                                                        {/* Type column with colored chip */}
                                                        <td>
                                                            <Chip
                                                                size="sm"
                                                                variant="soft"
                                                                sx={{
                                                                    bgcolor: isDark ? typeColor.darkBg : typeColor.bg,
                                                                    color: typeColor.color,
                                                                    fontWeight: 700,
                                                                    fontSize: '0.7rem',
                                                                    borderRadius: '6px',
                                                                    textTransform: 'capitalize',
                                                                }}
                                                            >
                                                                {doc.documentType.toLowerCase()}
                                                            </Chip>
                                                        </td>

                                                        {/* Size */}
                                                        <td>
                                                            <Typography level="body-sm" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                                                {formatFileSize(doc.fileSize)}
                                                            </Typography>
                                                        </td>

                                                        {/* Status */}
                                                        <td>{getStatusChip(doc.status)}</td>

                                                        {/* Date */}
                                                        <td>
                                                            <Typography level="body-sm" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                                                {formatDate(doc.createdAt)}
                                                            </Typography>
                                                        </td>

                                                        {/* Actions */}
                                                        <td style={{ paddingRight: 24 }}>
                                                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                                <Tooltip title="Download" variant="soft" size="sm">
                                                                    <IconButton
                                                                        size="sm"
                                                                        variant="soft"
                                                                        color="primary"
                                                                        onClick={() => handleDownload(doc.id, doc.fileName)}
                                                                        sx={{ borderRadius: '8px' }}
                                                                    >
                                                                        <DownloadRoundedIcon sx={{ fontSize: 18 }} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="View" variant="soft" size="sm">
                                                                    <IconButton
                                                                        size="sm"
                                                                        variant="soft"
                                                                        color="success"
                                                                        onClick={() => handleView(doc.id, doc.fileName)}
                                                                        sx={{ borderRadius: '8px' }}
                                                                    >
                                                                        <VisibilityRoundedIcon sx={{ fontSize: 18 }} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                {doc.status === 'ACTIVE' && (
                                                                    <>
                                                                        <Tooltip title="Edit" variant="soft" size="sm">
                                                                            <IconButton
                                                                                size="sm"
                                                                                variant="soft"
                                                                                color="neutral"
                                                                                onClick={() => handleEditClick(doc)}
                                                                                sx={{ borderRadius: '8px' }}
                                                                            >
                                                                                <EditRoundedIcon sx={{ fontSize: 18 }} />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                        {user?.role !== 'ADMIN' && (
                                                                            <Tooltip title="Replace File" variant="soft" size="sm">
                                                                                <IconButton
                                                                                    size="sm"
                                                                                    variant="soft"
                                                                                    color="warning"
                                                                                    onClick={() => handleReplaceClick(doc)}
                                                                                    sx={{ borderRadius: '8px' }}
                                                                                >
                                                                                    <SwapHorizRoundedIcon sx={{ fontSize: 18 }} />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                        )}
                                                                        <Tooltip title="Delete" variant="soft" size="sm">
                                                                            <IconButton
                                                                                size="sm"
                                                                                variant="soft"
                                                                                color="danger"
                                                                                onClick={() => handleDelete(doc.id)}
                                                                                sx={{ borderRadius: '8px' }}
                                                                            >
                                                                                <DeleteRoundedIcon sx={{ fontSize: 18 }} />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    </>
                                                                )}
                                                            </Stack>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </Table>
                                </Box>
                            </>
                        );
                    })()}
                </CardContent>
            </Card>

            {/* ═══════════ UPLOAD MODAL ═══════════ */}
            <Modal open={showUploadModal} onClose={() => setShowUploadModal(false)}>
                <ModalDialog
                    sx={{
                        maxWidth: 520,
                        width: '100%',
                        borderRadius: '16px',
                        p: 3,
                        bgcolor: isDark ? '#1C252E' : '#fff',
                    }}
                >
                    <ModalClose />
                    <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                            <Avatar
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '10px',
                                    bgcolor: isDark ? 'rgba(0, 167, 111, 0.16)' : minimal.green.lighter,
                                    color: minimal.green.main,
                                }}
                            >
                                <CloudUploadRoundedIcon sx={{ fontSize: 22 }} />
                            </Avatar>
                            <Typography level="title-lg" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                Upload Document
                            </Typography>
                        </Box>
                        <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
                            Upload a new document to the system
                        </Typography>
                    </Box>

                    <Divider sx={{ mb: 2.5, borderStyle: 'dashed' }} />

                    <form onSubmit={handleUpload}>
                        <Stack spacing={2.5}>
                            <FormControl required>
                                <FormLabel sx={{ fontWeight: 600, color: 'text.primary' }}>Title</FormLabel>
                                <Input
                                    placeholder="Enter document title..."
                                    value={uploadData.title}
                                    onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                                    sx={{ '--Input-radius': '10px' }}
                                />
                            </FormControl>

                            <FormControl required>
                                <FormLabel sx={{ fontWeight: 600, color: 'text.primary' }}>Description</FormLabel>
                                <Textarea
                                    minRows={3}
                                    placeholder="Enter document description..."
                                    value={uploadData.description}
                                    onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                                    sx={{ '--Textarea-radius': '10px' }}
                                />
                            </FormControl>

                            <FormControl required>
                                <FormLabel sx={{ fontWeight: 600, color: 'text.primary' }}>Document Type</FormLabel>
                                <Select
                                    placeholder="Select type..."
                                    value={uploadData.documentType}
                                    onChange={(_, value) => setUploadData({ ...uploadData, documentType: value || '' })}
                                    sx={{ borderRadius: '10px' }}
                                >
                                    <Option value="CONTRACT">Contract</Option>
                                    <Option value="INVOICE">Invoice</Option>
                                    <Option value="REPORT">Report</Option>
                                    <Option value="PROPOSAL">Proposal</Option>
                                    <Option value="OTHER">Other</Option>
                                </Select>
                            </FormControl>

                            <FormControl required>
                                <FormLabel sx={{ fontWeight: 600, color: 'text.primary' }}>File</FormLabel>
                                <Input
                                    type="file"
                                    onChange={handleFileSelect}
                                    sx={{ '--Input-radius': '10px' }}
                                />
                                <Typography level="body-xs" sx={{ color: 'text.tertiary', mt: 0.5 }}>
                                    Maksimum 100MB
                                </Typography>
                            </FormControl>

                            {/* File info */}
                            {uploadData.file && (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                        p: 1.5,
                                        borderRadius: '10px',
                                        bgcolor: isDark ? 'rgba(0, 167, 111, 0.08)' : 'rgba(0, 167, 111, 0.06)',
                                        border: '1px dashed',
                                        borderColor: isDark ? 'rgba(0, 167, 111, 0.3)' : 'rgba(0, 167, 111, 0.2)',
                                    }}
                                >
                                    <InsertDriveFileRoundedIcon sx={{ fontSize: 20, color: minimal.green.main }} />
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography level="body-sm" sx={{ fontWeight: 600, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {uploadData.file.name}
                                        </Typography>
                                        <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                                            {formatFileSize(uploadData.file.size)}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}

                            {/* Upload progress bar */}
                            {uploading && (
                                <Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                                        <Typography level="body-xs" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                            Uploading...
                                        </Typography>
                                        <Typography level="body-xs" sx={{ fontWeight: 700, color: minimal.green.main }}>
                                            {uploadProgress}%
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        determinate
                                        value={uploadProgress}
                                        sx={{
                                            '--LinearProgress-radius': '8px',
                                            '--LinearProgress-thickness': '8px',
                                            bgcolor: isDark ? 'rgba(0, 167, 111, 0.12)' : 'rgba(0, 167, 111, 0.08)',
                                            '& .MuiLinearProgress-bar': {
                                                bgcolor: minimal.green.main,
                                            },
                                        }}
                                    />
                                </Box>
                            )}

                            <Button
                                type="submit"
                                loading={uploading}
                                disabled={uploading}
                                fullWidth
                                sx={{
                                    bgcolor: minimal.green.contrastText,
                                    color: '#fff',
                                    fontWeight: 700,
                                    borderRadius: '10px',
                                    py: 1.2,
                                    mt: 1,
                                    boxShadow: '0 8px 16px 0 rgba(0, 75, 80, 0.24)',
                                    '&:hover': { bgcolor: '#00363A' },
                                }}
                            >
                                {uploading ? `Uploading... ${uploadProgress}%` : 'Upload Document'}
                            </Button>
                        </Stack>
                    </form>
                </ModalDialog>
            </Modal>

            {/* ═══════════ EDIT MODAL ═══════════ */}
            <Modal open={showEditModal} onClose={() => setShowEditModal(false)}>
                <ModalDialog
                    sx={{
                        maxWidth: 520,
                        width: '100%',
                        borderRadius: '16px',
                        p: 3,
                        bgcolor: isDark ? '#1C252E' : '#fff',
                    }}
                >
                    <ModalClose />
                    <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                            <Avatar
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '10px',
                                    bgcolor: isDark ? 'rgba(0, 101, 255, 0.16)' : minimal.blue.lighter,
                                    color: minimal.blue.main,
                                }}
                            >
                                <EditRoundedIcon sx={{ fontSize: 22 }} />
                            </Avatar>
                            <Typography level="title-lg" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                Edit Document
                            </Typography>
                        </Box>
                        <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
                            Update document information
                        </Typography>
                    </Box>

                    <Divider sx={{ mb: 2.5, borderStyle: 'dashed' }} />

                    <form onSubmit={handleEditSubmit}>
                        <Stack spacing={2.5}>
                            <FormControl required>
                                <FormLabel sx={{ fontWeight: 600, color: 'text.primary' }}>Title</FormLabel>
                                <Input
                                    value={editData.title}
                                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                    sx={{ '--Input-radius': '10px' }}
                                />
                            </FormControl>

                            <FormControl required>
                                <FormLabel sx={{ fontWeight: 600, color: 'text.primary' }}>Description</FormLabel>
                                <Textarea
                                    minRows={3}
                                    value={editData.description}
                                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                    sx={{ '--Textarea-radius': '10px' }}
                                />
                            </FormControl>

                            <FormControl required>
                                <FormLabel sx={{ fontWeight: 600, color: 'text.primary' }}>Document Type</FormLabel>
                                <Select
                                    value={editData.documentType}
                                    onChange={(_, value) => setEditData({ ...editData, documentType: value || '' })}
                                    sx={{ borderRadius: '10px' }}
                                >
                                    <Option value="CONTRACT">Contract</Option>
                                    <Option value="INVOICE">Invoice</Option>
                                    <Option value="REPORT">Report</Option>
                                    <Option value="PROPOSAL">Proposal</Option>
                                    <Option value="OTHER">Other</Option>
                                </Select>
                            </FormControl>

                            <Button
                                type="submit"
                                loading={editLoading}
                                fullWidth
                                sx={{
                                    bgcolor: minimal.green.contrastText,
                                    color: '#fff',
                                    fontWeight: 700,
                                    borderRadius: '10px',
                                    py: 1.2,
                                    mt: 1,
                                    boxShadow: '0 8px 16px 0 rgba(0, 75, 80, 0.24)',
                                    '&:hover': { bgcolor: '#00363A' },
                                }}
                            >
                                Save Changes
                            </Button>
                        </Stack>
                    </form>
                </ModalDialog>
            </Modal>

            {/* ═══════════ REQUEST PERMISSION MODAL ═══════════ */}
            <Modal open={showRequestPermissionModal} onClose={() => setShowRequestPermissionModal(false)}>
                <ModalDialog
                    sx={{
                        maxWidth: 520,
                        width: '100%',
                        borderRadius: '16px',
                        p: 3,
                        bgcolor: isDark ? '#1C252E' : '#fff',
                    }}
                >
                    <ModalClose />
                    <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                            <Avatar
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '10px',
                                    bgcolor: isDark ? 'rgba(255, 171, 0, 0.16)' : minimal.warning.lighter,
                                    color: minimal.warning.main,
                                }}
                            >
                                <DescriptionRoundedIcon sx={{ fontSize: 22 }} />
                            </Avatar>
                            <Typography level="title-lg" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                Request Edit Permission
                            </Typography>
                        </Box>
                        <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
                            Admin approval is required to edit this document
                        </Typography>
                    </Box>

                    <Divider sx={{ mb: 2.5, borderStyle: 'dashed' }} />

                    <form onSubmit={handleRequestPermission}>
                        <Stack spacing={2.5}>
                            <FormControl required>
                                <FormLabel sx={{ fontWeight: 600, color: 'text.primary' }}>Document</FormLabel>
                                <Input
                                    value={selectedDocument?.title || ''}
                                    disabled
                                    sx={{ '--Input-radius': '10px' }}
                                />
                            </FormControl>

                            <FormControl required>
                                <FormLabel sx={{ fontWeight: 600, color: 'text.primary' }}>Reason for Edit</FormLabel>
                                <Textarea
                                    minRows={4}
                                    placeholder="Please explain why you need to edit this document..."
                                    value={permissionReason}
                                    onChange={(e) => setPermissionReason(e.target.value)}
                                    sx={{ '--Textarea-radius': '10px' }}
                                />
                            </FormControl>

                            <Button
                                type="submit"
                                loading={requestLoading}
                                fullWidth
                                sx={{
                                    bgcolor: minimal.warning.main,
                                    color: '#fff',
                                    fontWeight: 700,
                                    borderRadius: '10px',
                                    py: 1.2,
                                    mt: 1,
                                    boxShadow: '0 8px 16px 0 rgba(255, 171, 0, 0.24)',
                                    '&:hover': { bgcolor: '#B76E00' },
                                }}
                            >
                                Submit Request
                            </Button>
                        </Stack>
                    </form>
                </ModalDialog>
            </Modal>

            {/* ═══════════ REPLACE FILE MODAL ═══════════ */}
            <Modal open={showReplaceModal} onClose={() => setShowReplaceModal(false)}>
                <ModalDialog
                    sx={{
                        maxWidth: 520,
                        width: { xs: 'calc(100% - 32px)', sm: '100%' },
                        borderRadius: '16px',
                        p: { xs: 2, sm: 3 },
                        bgcolor: isDark ? '#1C252E' : '#fff',
                    }}
                >
                    <ModalClose />
                    <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                            <Avatar
                                sx={{
                                    bgcolor: isDark ? 'rgba(255, 171, 0, 0.16)' : minimal.warning.lighter,
                                    color: minimal.warning.main,
                                    borderRadius: '12px',
                                    width: 44,
                                    height: 44,
                                }}
                            >
                                <SwapHorizRoundedIcon />
                            </Avatar>
                            <Box>
                                <Typography level="title-lg" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                    Replace File
                                </Typography>
                                <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
                                    Upload a new file to replace the current one
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    <form onSubmit={handleReplaceSubmit}>
                        <Stack spacing={2.5}>
                            {/* Current document info */}
                            <Box sx={{
                                p: 2,
                                borderRadius: '10px',
                                bgcolor: isDark ? 'rgba(145,158,171,0.06)' : 'rgba(145,158,171,0.04)',
                                border: '1px dashed',
                                borderColor: isDark ? 'rgba(145,158,171,0.16)' : 'rgba(145,158,171,0.2)',
                            }}>
                                <Typography level="body-xs" sx={{ color: 'text.tertiary', mb: 0.5, fontWeight: 600 }}>
                                    Replacing document:
                                </Typography>
                                <Typography level="body-sm" sx={{ color: 'text.primary', fontWeight: 600 }}>
                                    {selectedDocument?.title}
                                </Typography>
                                <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                                    {selectedDocument?.fileName}
                                </Typography>
                            </Box>

                            {/* File upload */}
                            <FormControl required>
                                <FormLabel sx={{ fontWeight: 600, color: 'text.primary' }}>New File</FormLabel>
                                <Button
                                    component="label"
                                    variant="outlined"
                                    color="neutral"
                                    startDecorator={<CloudUploadRoundedIcon />}
                                    sx={{
                                        borderRadius: '10px',
                                        borderStyle: 'dashed',
                                        py: 3,
                                        color: replaceFile ? minimal.green.main : 'text.tertiary',
                                        borderColor: replaceFile
                                            ? minimal.green.main
                                            : isDark ? 'rgba(145,158,171,0.24)' : 'rgba(145,158,171,0.32)',
                                        bgcolor: replaceFile
                                            ? (isDark ? 'rgba(0,167,111,0.08)' : 'rgba(0,167,111,0.04)')
                                            : 'transparent',
                                        '&:hover': {
                                            borderColor: minimal.warning.main,
                                            bgcolor: isDark ? 'rgba(255,171,0,0.06)' : 'rgba(255,171,0,0.04)',
                                        },
                                    }}
                                >
                                    {replaceFile ? replaceFile.name : 'Click to select a new file'}
                                    <input
                                        type="file"
                                        hidden
                                        onChange={(e) => setReplaceFile(e.target.files?.[0] || null)}
                                    />
                                </Button>
                                {replaceFile && (
                                    <Typography level="body-xs" sx={{ mt: 0.5, color: 'text.tertiary' }}>
                                        {(replaceFile.size / 1024).toFixed(1)} KB
                                    </Typography>
                                )}
                            </FormControl>

                            {/* Reason */}
                            <FormControl required>
                                <FormLabel sx={{ fontWeight: 600, color: 'text.primary' }}>Reason for Replace</FormLabel>
                                <Textarea
                                    minRows={3}
                                    placeholder="Explain why you want to replace this file..."
                                    value={replaceReason}
                                    onChange={(e) => setReplaceReason(e.target.value)}
                                    sx={{ '--Textarea-radius': '10px' }}
                                />
                            </FormControl>

                            <Button
                                type="submit"
                                loading={replaceLoading}
                                disabled={!replaceFile || !replaceReason}
                                fullWidth
                                sx={{
                                    bgcolor: minimal.warning.main,
                                    color: '#fff',
                                    fontWeight: 700,
                                    borderRadius: '10px',
                                    py: 1.2,
                                    mt: 1,
                                    boxShadow: '0 8px 16px 0 rgba(255, 171, 0, 0.24)',
                                    '&:hover': { bgcolor: '#B76E00' },
                                }}
                            >
                                Submit Replace Request
                            </Button>
                        </Stack>
                    </form>
                </ModalDialog>
            </Modal>

            {/* ═══════════ SUCCESS SNACKBAR ═══════════ */}
            <Snackbar
                open={showSuccess}
                autoHideDuration={3000}
                onClose={() => setShowSuccess(false)}
                variant="soft"
                color="success"
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                startDecorator={<CheckCircleRoundedIcon />}
                sx={{
                    borderRadius: '12px',
                    fontWeight: 600,
                    boxShadow: isDark
                        ? '0 8px 16px 0 rgba(0,0,0,0.24)'
                        : '0 8px 16px 0 rgba(0, 167, 111, 0.16)',
                }}
            >
                {successMessage}
            </Snackbar>
        </Box>
    );
}
