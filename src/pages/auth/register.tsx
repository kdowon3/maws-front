import React from "react";
import SignupOptions from "@/components/auth/SignupOptions";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const RegisterPage: React.FC = () => {
  return (
    <ProtectedRoute requireAuth={false}>
      <SignupOptions />
    </ProtectedRoute>
  );
};

export default RegisterPage;
