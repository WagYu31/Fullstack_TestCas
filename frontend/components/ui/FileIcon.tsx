import { FileText, FileImage, FileSpreadsheet, FileCode, File, FileVideo, FileAudio, Archive } from 'lucide-react';

interface FileIconProps {
    mimeType: string;
    className?: string;
}

export default function FileIcon({ mimeType, className = 'w-5 h-5' }: FileIconProps) {
    const getIcon = () => {
        if (mimeType.startsWith('image/')) {
            return <FileImage className={className} />;
        }
        if (mimeType.includes('pdf')) {
            return <FileText className={`${className} text-red-500`} />;
        }
        if (mimeType.includes('word') || mimeType.includes('document')) {
            return <FileText className={`${className} text-blue-500`} />;
        }
        if (mimeType.includes('sheet') || mimeType.includes('excel')) {
            return <FileSpreadsheet className={`${className} text-green-500`} />;
        }
        if (mimeType.includes('video/')) {
            return <FileVideo className={className} />;
        }
        if (mimeType.includes('audio/')) {
            return <FileAudio className={className} />;
        }
        if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('compressed')) {
            return <Archive className={className} />;
        }
        if (mimeType.includes('code') || mimeType.includes('javascript') || mimeType.includes('python')) {
            return <FileCode className={className} />;
        }
        return <File className={className} />;
    };

    return getIcon();
}
