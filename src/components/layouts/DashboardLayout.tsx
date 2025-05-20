import React from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/dashboard/Navbar';
import { Home, Users, FileText, Mail, Settings, LogOut, PaintBucket, MessageSquare } from 'lucide-react';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const navItems = [
    {
        name: '대시보드',
        path: '/dashboard',
        icon: <Home size={20} />,
    },
    {
        name: '고객 관리',
        path: '/clients',
        icon: <Users size={20} />,
    },
    {
        name: '작품 관리',
        path: '/artworks',
        icon: <PaintBucket size={20} />,
    },
    {
        name: '메시지 발송',
        path: '/messaging',
        icon: <MessageSquare size={20} />,
    },
];

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const router = useRouter();
    const currentPath = router.pathname;

    // 여기에 사이드바 항목 정의
    const sidebarItems = [
        { icon: <Home size={20} />, label: '대시보드', href: '/dashboard' },
        { icon: <Users size={20} />, label: '고객 관리', href: '/clients' },
        { icon: <FileText size={20} />, label: '작품 관리', href: '/artworks' },
        { icon: <Mail size={20} />, label: '메시지', href: '/messaging' },
        { icon: <Settings size={20} />, label: '설정', href: '/settings' },
    ];

    return (
        <div className="min-h-screen bg-brand-lightGray">
            <Navbar />

            <div className="flex">
                <div className="hidden md:block w-64 bg-white h-[calc(100vh-4rem)] border-r border-gray-200 overflow-y-auto overflow-x-hidden sticky top-16">
                    <div className="p-4">
                        <nav>
                            <ul className="space-y-1">
                                {sidebarItems.map((item, index) => {
                                    const isActive =
                                        currentPath === item.href ||
                                        (item.href !== '/' && currentPath.startsWith(item.href));

                                    return (
                                        <li key={index}>
                                            <a
                                                href={item.href}
                                                className={`flex items-center px-4 py-3 rounded-lg transition-colors whitespace-nowrap overflow-hidden text-ellipsis truncate ${
                                                    isActive
                                                        ? 'bg-brand-blue text-white'
                                                        : 'text-gray-700 hover:bg-brand-lightGray'
                                                }`}
                                            >
                                                <span className={`mr-3 ${isActive ? 'text-white' : 'text-brand-blue'}`}>
                                                    {item.icon}
                                                </span>
                                                <span className="truncate overflow-hidden text-ellipsis whitespace-nowrap">
                                                    {item.label}
                                                </span>
                                            </a>
                                        </li>
                                    );
                                })}
                            </ul>
                        </nav>
                    </div>
                    <div className="absolute bottom-4 w-64 p-4 border-t border-gray-100">
                        <button className="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-brand-lightGray w-full truncate overflow-hidden text-ellipsis whitespace-nowrap">
                            <LogOut size={20} className="mr-3 text-gray-500" />
                            <span>로그아웃</span>
                        </button>
                    </div>
                </div>

                <div className="flex-1">
                    <main className="p-6 md:p-8 max-w-7xl mx-auto w-full">{children}</main>
                    <footer className="bg-white border-t border-gray-200 mt-8">
                        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                            <p className="text-sm text-gray-500 text-center">© 2025 MAWS. 갤러리 실무 자동화 시스템.</p>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
