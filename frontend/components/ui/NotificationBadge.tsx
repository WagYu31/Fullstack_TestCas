'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCheck, Clock, FileText } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

interface Notification {
    id: number;
    type: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export default function NotificationBadge() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch notifications on mount
    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await api.get('/notifications');
            setNotifications(response.data);
            const unread = response.data.filter((n: Notification) => !n.isRead).length;
            setUnreadCount(unread);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    // Mark as read
    const markAsRead = async (id: number) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev =>
                prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        try {
            await api.patch('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    // Toggle dropdown
    const toggleDropdown = () => {
        if (!isOpen) {
            fetchNotifications();
        }
        setIsOpen(!isOpen);
    };

    // Get icon based on notification type
    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'DOCUMENT_APPROVED':
            case 'DOCUMENT_REJECTED':
                return <FileText className="w-5 h-5" />;
            default:
                return <Bell className="w-5 h-5" />;
        }
    };

    // Format time ago
    const formatTimeAgo = (date: string) => {
        const now = new Date();
        const notifDate = new Date(date);
        const diffInSeconds = Math.floor((now.getTime() - notifDate.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Notification Bell Button */}
            <button
                onClick={toggleDropdown}
                className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                aria-label="Notifications"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-[32rem] flex flex-col">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
                            {unreadCount > 0 && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">{unreadCount} unread</p>
                            )}
                        </div>
                        <div className="flex items-center space-x-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                                >
                                    Mark all read
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="overflow-y-auto flex-1">
                        {loading ? (
                            <div className="px-4 py-12 text-center">
                                <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Loading...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="px-4 py-12 text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-3">
                                    <Bell className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                                </div>
                                <p className="text-gray-900 dark:text-white font-medium">No notifications</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">You're all caught up!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {notifications && notifications.length > 0 && notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition cursor-pointer ${!notification.isRead ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
                                            }`}
                                        onClick={() => !notification.isRead && markAsRead(notification.id)}
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${notification.type === 'DOCUMENT_APPROVED'
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                                : notification.type === 'DOCUMENT_REJECTED'
                                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                                }`}>
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm ${!notification.isRead
                                                    ? 'font-semibold text-gray-900 dark:text-white'
                                                    : 'text-gray-700 dark:text-gray-300'
                                                    }`}>
                                                    {notification.message}
                                                </p>
                                                <div className="flex items-center mt-1 space-x-2">
                                                    <Clock className="w-3 h-3 text-gray-400" />
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {formatTimeAgo(notification.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                            {!notification.isRead && (
                                                <div className="flex-shrink-0 w-2 h-2 bg-primary-600 rounded-full"></div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer - Removed since notifications page is deleted */}
                </div>
            )}
        </div>
    );
}
