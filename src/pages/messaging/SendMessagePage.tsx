
import React from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import SendMessageInterface from '@/components/messaging/SendMessageInterface';

const SendMessagePage: React.FC = () => {
  return (
    <DashboardLayout>
      <SendMessageInterface />
    </DashboardLayout>
  );
};

export default SendMessagePage;
