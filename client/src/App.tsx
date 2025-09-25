import React, { useState, useEffect, useCallback } from 'react';
import { CreateLead } from './components/CreateLead';
import { BulkUpload } from './components/BulkUpload';
import { ManageLeads } from './components/ManageLeads';
import { Login } from './components/Login';
import { LogoutButton } from './components/LogoutButton';
import { leadService } from './services/leadService';
import { Lead, LeadFormData } from './types/Lead';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'bulk' | 'manage'>('manage');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [pendingCalls, setPendingCalls] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const showNotification = useCallback((type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
  }, []);

  const fetchLeads = useCallback(async () => {
    try {
      const response = await leadService.getLeads();
      
      // Sort leads: completed first, then rejected, then calling, then pending
      const sortedLeads = response.leads.sort((a: Lead, b: Lead) => {
        const statusOrder = { 'completed': 0, 'rejected': 1, 'calling': 2, 'pending': 3 };
        const aOrder = statusOrder[a.status as keyof typeof statusOrder] ?? 4;
        const bOrder = statusOrder[b.status as keyof typeof statusOrder] ?? 4;
        
        if (aOrder !== bOrder) {
          return aOrder - bOrder;
        }
        
        // If same status, sort by creation date (newest first)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      setLeads(sortedLeads);
      setTotalLeads(response.total);
      setPendingCalls(response.pending);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
      showNotification('error', 'Failed to fetch leads. Make sure the backend server is running.');
    }
  }, [showNotification]);

  // Check if user is already logged in on page load
  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchLeads();
    }
  }, [fetchLeads, isLoggedIn]);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  // If not logged in, show login screen
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  const handleCreateLead = async (leadData: LeadFormData) => {
    console.log('🚀 handleCreateLead called with data:', leadData);
    setIsLoading(true);
    try {
      console.log('📡 Making API call to create lead...');
      const result = await leadService.createLead(leadData);
      console.log('✅ API call successful:', result);
      showNotification('success', 'Customer created successfully!');
      await fetchLeads();
    } catch (error: any) {
      console.error('❌ Failed to create lead:', error);
      let errorMessage = 'Failed to create customer';
      
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running on port 5000.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      showNotification('error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkUpload = async (file: File) => {
    setIsLoading(true);
    try {
      const response = await leadService.uploadBulkLeads(file);
      showNotification('success', response.message);
      await fetchLeads();
    } catch (error: any) {
      console.error('Failed to upload leads:', error);
      showNotification('error', error.response?.data?.error || 'Failed to upload leads');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadSample = async () => {
    try {
      const blob = await leadService.downloadSampleCSV();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'sample-leads.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download sample CSV:', error);
      showNotification('error', 'Failed to download sample CSV');
    }
  };

  const handleCallLead = async (leadId: number) => {
    setIsLoading(true);
    try {
      const response = await leadService.callLead(leadId);
      showNotification('success', response.message);
      await fetchLeads();
    } catch (error: any) {
      console.error('Failed to call lead:', error);
      showNotification('error', error.response?.data?.error || 'Failed to initiate call');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkCall = async () => {
    setIsLoading(true);
    try {
      const response = await leadService.bulkCallLeads();
      showNotification('success', response.message);
      await fetchLeads();
    } catch (error: any) {
      console.error('Failed to initiate bulk calls:', error);
      showNotification('error', error.response?.data?.error || 'Failed to initiate bulk calls');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/calls/check-status', {
        method: 'POST',
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh leads after checking statuses
        await fetchLeads();
        
        // Show notification
        if (result.updated > 0) {
          showNotification('success', `✅ Updated ${result.updated} calls with feedback!`);
        } else {
          showNotification('success', `ℹ️ Checked ${result.total} calls - no new feedback yet`);
        }
      } else {
        showNotification('error', 'Failed to check call statuses');
      }
    } catch (error) {
      console.error('Error checking call statuses:', error);
      showNotification('error', 'Error checking call statuses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLead = async (leadId: number) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      setIsLoading(true);
      try {
        await leadService.deleteLead(leadId);
        showNotification('success', 'Lead deleted successfully');
        await fetchLeads();
      } catch (error: any) {
        console.error('Failed to delete lead:', error);
        showNotification('error', error.response?.data?.error || 'Failed to delete lead');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Feedback Manager</h1>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <span>Total Customers:</span>
                  <span className="font-semibold text-gray-900">{totalLeads}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>Pending Feedback:</span>
                  <span className="font-semibold" style={{ color: '#f59e0b' }}>{pendingCalls}</span>
                </div>
              </div>
              <LogoutButton onLogout={handleLogout} />
            </div>
          </div>
        </div>
      </header>

      {/* Notification */}
      {notification && (
        <div className="max-w-7xl mx-auto px-4 p-4">
          <div className={`rounded-md p-4 ${
            notification.type === 'success' ? 'bg-green-50 text-green-700 border border-green-300' : 
            'bg-red-50 text-red-700 border border-red-300'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {notification.type === 'success' ? (
                  <svg className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div style={{ marginLeft: '0.75rem' }}>
                <p className="text-sm font-medium">{notification.message}</p>
              </div>
              <div style={{ marginLeft: 'auto', paddingLeft: '0.75rem' }}>
                <button
                  onClick={() => setNotification(null)}
                  className={`inline-flex text-sm ${
                    notification.type === 'success' ? 'text-green-600' : 
                    'text-red-600'
                  }`}
                  style={{ cursor: 'pointer' }}
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div style={{ borderBottom: '1px solid #e5e7eb' }}>
          <nav className="flex space-x-8" style={{ marginBottom: '-1px' }}>
            <button
              onClick={() => setActiveTab('create')}
              className={`py-2 px-1 font-medium text-sm ${
                activeTab === 'create'
                  ? 'text-blue-600'
                  : 'text-gray-500'
              }`}
              style={{ 
                borderBottom: activeTab === 'create' ? '2px solid #2563eb' : '2px solid transparent',
                cursor: 'pointer'
              }}
            >
              Add Customer
            </button>
            <button
              onClick={() => setActiveTab('bulk')}
              className={`py-2 px-1 font-medium text-sm ${
                activeTab === 'bulk'
                  ? 'text-blue-600'
                  : 'text-gray-500'
              }`}
              style={{ 
                borderBottom: activeTab === 'bulk' ? '2px solid #2563eb' : '2px solid transparent',
                cursor: 'pointer'
              }}
            >
              Bulk Upload
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`py-2 px-1 font-medium text-sm ${
                activeTab === 'manage'
                  ? 'text-blue-600'
                  : 'text-gray-500'
              }`}
              style={{ 
                borderBottom: activeTab === 'manage' ? '2px solid #2563eb' : '2px solid transparent',
                cursor: 'pointer'
              }}
            >
              Manage Customers ({totalLeads})
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'create' && (
          <CreateLead onSubmit={handleCreateLead} isLoading={isLoading} />
        )}
        {activeTab === 'bulk' && (
          <BulkUpload
            onUpload={handleBulkUpload}
            onDownloadSample={handleDownloadSample}
            isLoading={isLoading}
          />
        )}
        {activeTab === 'manage' && (
          <ManageLeads
            leads={leads}
            totalLeads={totalLeads}
            pendingCalls={pendingCalls}
            onCallLead={handleCallLead}
            onBulkCall={handleBulkCall}
            onDeleteLead={handleDeleteLead}
            onRefresh={fetchLeads}
            onCheckStatus={handleCheckStatus}
            isLoading={isLoading}
          />
        )}
      </main>
    </div>
  );
}

export default App;
