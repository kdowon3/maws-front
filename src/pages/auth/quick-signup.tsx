import React from "react";
import QuickSignupForm from "@/components/auth/QuickSignupForm";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const QuickSignupPage: React.FC = () => {
  return (
    <ProtectedRoute requireAuth={false}>
      <QuickSignupForm />
    </ProtectedRoute>
  );
};

export default QuickSignupPage;
