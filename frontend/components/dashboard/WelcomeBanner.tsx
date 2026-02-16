'use client';

import { useAuthStore } from '@/store/auth';
import { Sparkles, TrendingUp, Upload } from 'lucide-react';
import Link from 'next/link';

interface WelcomeBannerProps {
    stats?: {
        total: number;
        active: number;
        pending: number;
    };
}

export default function WelcomeBanner({ stats }: WelcomeBannerProps) {
    const { user } = useAuthStore();

    return (
        <div className="relative bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl p-8 overflow-hidden shadow-2xl">
            {/* Animated Background Shapes */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <div className="absolute top-10 right-20 w-64 h-64 bg-cyan-400 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-10 left-20 w-80 h-80 bg-cyan-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between space-y-6 md:space-y-0">
                {/* Welcome Text */}
                <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                        <Sparkles className="w-6 h-6 text-cyan-400" />
                        <h1 className="text-3xl md:text-4xl font-bold text-white">
                            Welcome back, {user?.name || 'User'}!
                        </h1>
                    </div>
                    <p className="text-gray-300 text-lg">
                        Here's what's happening with your documents today.
                    </p>

                    {/* Quick Stats */}
                    {stats && (
                        <div className="flex items-center space-x-6 mt-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                                <span className="text-sm text-gray-400">
                                    <span className="text-2xl font-bold text-white">{stats.total}</span> Total
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-sm text-gray-400">
                                    <span className="text-2xl font-bold text-white">{stats.active}</span> Active
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                <span className="text-sm text-gray-400">
                                    <span className="text-2xl font-bold text-white">{stats.pending}</span> Pending
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Upload Button - Only for non-admin users */}
                {user?.role !== 'ADMIN' && (
                    <Link
                        href="/dashboard/documents"
                        className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center space-x-3 shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 transform hover:-translate-y-0.5"
                    >
                        <Upload className="w-5 h-5" />
                        <span>Upload Document</span>
                        <TrendingUp className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                )}
            </div>
        </div>
    );
}
