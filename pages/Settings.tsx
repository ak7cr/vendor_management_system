import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Administrators from './Administrators';

const Settings = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your system administrators</p>
        </div>
        
        <Administrators insideSettings={true} />
      </div>
    </DashboardLayout>
  );
};

export default Settings; 