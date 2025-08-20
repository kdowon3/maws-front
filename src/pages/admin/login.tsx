import React from 'react';
import { useRouter } from 'next/router';
import AdminLogin from '@/components/admin/AdminLogin';

const AdminLoginPage: React.FC = () => {
  const router = useRouter();

  const handleLoginSuccess = () => {
    router.push('/admin');
  };

  return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
};

export default AdminLoginPage;