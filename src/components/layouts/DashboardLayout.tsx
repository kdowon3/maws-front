import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, CircleUser, PaintBucket, MessageSquare } from 'lucide-react';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const location = useLocation();
    const currentPath = location.pathname;

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

    const isActive = (path: string) => {
        if (path === '/dashboard' && currentPath === '/') return true;
        return currentPath.startsWith(path);
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* 사이드바 */}
            <aside className="fixed inset-y-0 left-0 bg-white shadow-md w-64 hidden md:flex flex-col z-10">
                <div className="flex items-center justify-center h-16 border-b">
                    <Link to="/" className="text-xl font-bold text-brand-blue">
                        MAWS
                    </Link>
                </div>

                <nav className="flex-1 p-4">
                    <ul className="space-y-2">
                        {navItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`flex items-center p-2 rounded-lg transition-colors ${
                                        isActive(item.path)
                                            ? 'bg-brand-blue text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    {item.icon}
                                    <span className="ml-3">{item.name}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="border-t p-4">
                    <div className="flex items-center">
                        <CircleUser size={32} className="text-gray-400" />
                        <div className="ml-3">
                            <p className="text-sm font-medium">김갤러리</p>
                            <p className="text-xs text-gray-500">admin@gallery.com</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* 모바일 상단바 */}
            <div className="md:hidden fixed top-0 inset-x-0 bg-white border-b z-10 h-16 flex items-center justify-between px-4">
                <Link to="/" className="text-xl font-bold text-brand-blue">
                    MAWS
                </Link>
                <CircleUser size={28} className="text-gray-400" />
            </div>

            {/* 모바일 하단 네비게이션 */}
            <div className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t z-10 h-16 flex items-center justify-around">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex flex-col items-center justify-center h-full w-full ${
                            isActive(item.path) ? 'text-brand-blue' : 'text-gray-500'
                        }`}
                    >
                        {item.icon}
                        <span className="text-xs mt-1">{item.name}</span>
                    </Link>
                ))}
            </div>

            {/* 메인 콘텐츠 */}
            <div className="flex-1 md:ml-64 pt-16 md:pt-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>
            </div>
        </div>
    );
};

export default DashboardLayout;
