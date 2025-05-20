import React, { useState } from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import Image from 'next/image';

const Navbar = () => {
    const [imageError, setImageError] = useState(false);

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center md:hidden">
                        <button className="p-2 rounded-md text-gray-600 hover:bg-gray-100">
                            <Menu size={24} />
                        </button>
                    </div>

                    <div className="flex items-center">
                        <div className="hidden md:block">
                            {!imageError ? (
                                <Image
                                    src="/logo.svg"
                                    alt="MAWS Logo"
                                    width={120}
                                    height={48}
                                    className="h-12 w-auto"
                                    onError={() => setImageError(true)}
                                    priority
                                />
                            ) : (
                                <span className="text-xl font-bold text-brand-blue">MAWS</span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 relative">
                            <Bell size={20} />
                            <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500"></span>
                        </button>

                        <div className="flex items-center">
                            <span className="text-sm text-gray-500 mr-4 hidden md:block">관리자</span>
                            <button className="flex items-center justify-center h-8 w-8 rounded-full bg-brand-blue text-white">
                                A
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
