import React from 'react';
import RegisterForm from '@/components/auth/RegisterForm';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const CodeSignupPage: React.FC = () => {
  return (
    <ProtectedRoute requireAuth={false}>
      <RegisterForm />
    </ProtectedRoute>
  );
};

export default CodeSignupPage;