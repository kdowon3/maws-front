
import React from "react";
import Navbar from "@/components/dashboard/Navbar";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import { Home, Users, FileText, Mail, Settings, LogOut } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  // 여기에 사이드바 항목 정의
  const sidebarItems = [
    { icon: <Home size={20} />, label: "대시보드", href: "/" },
    { icon: <Users size={20} />, label: "고객 관리", href: "/clients" },
    { icon: <FileText size={20} />, label: "보증서", href: "/certificates" },
    { icon: <Mail size={20} />, label: "메시지", href: "/messages" },
    { icon: <Settings size={20} />, label: "설정", href: "/settings" }
  ];
  
  return (
    <div className="min-h-screen bg-brand-lightGray">
      <Navbar />
      
      <div className="flex">
        <div className="hidden md:block w-64 bg-white h-[calc(100vh-4rem)] border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-medium text-brand-blue mb-4">MAWS</h2>
            <nav>
              <ul className="space-y-1">
                {sidebarItems.map((item, index) => (
                  <li key={index}>
                    <a 
                      href={item.href}
                      className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-brand-lightGray"
                    >
                      <span className="text-brand-blue mr-3">{item.icon}</span>
                      <span>{item.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div className="absolute bottom-4 w-64 p-4 border-t border-gray-100">
            <button className="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-brand-lightGray w-full">
              <LogOut size={20} className="mr-3 text-gray-500" />
              <span>로그아웃</span>
            </button>
          </div>
        </div>
        
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500 text-center">
            © 2025 MAWS. 갤러리 실무 자동화 시스템.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;
