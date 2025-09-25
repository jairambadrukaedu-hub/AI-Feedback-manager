import React, { useState } from 'react';
import { Lead } from '../types/Lead';
import { FeedbackModal } from './FeedbackModal';

interface ManageLeadsProps {
  leads: Lead[];
  totalLeads: number;
  pendingCalls: number;
  onCallLead: (leadId: number) => Promise<void>;
  onBulkCall: () => Promise<void>;
  onDeleteLead: (leadId: number) => Promise<void>;
  onRefresh: () => void;
  onCheckStatus: () => Promise<void>;
  isLoading: boolean;
}

export const ManageLeads: React.FC<ManageLeadsProps> = ({
  leads,
  totalLeads,
  pendingCalls,
  onCallLead,
  onBulkCall,
  onDeleteLead,
  onRefresh,
  onCheckStatus,
  isLoading,
}) => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const handleCheckStatus = async () => {
    setCheckingStatus(true);
    try {
      await onCheckStatus();
    } finally {
      setCheckingStatus(false);
    }
  };

  const openFeedbackModal = (lead: Lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const closeFeedbackModal = () => {
    setIsModalOpen(false);
    setSelectedLead(null);
  };

  const parseFeedback = (feedbackStr: string) => {
    if (!feedbackStr) return null;
    
    try {
      // Try to parse as JSON first
      const feedback = JSON.parse(feedbackStr);
      
      // Extract customer responses from transcript for a better preview
      const extractCustomerSummary = (transcript: string) => {
        if (!transcript) return 'Feedback available';
        
        const lines = transcript.split('\n');
        let satisfaction = '';
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (line.startsWith('AI:')) {
            const aiText = line.toLowerCase();
            if ((aiText.includes('how satisfied') || aiText.includes('rate it')) && i + 1 < lines.length) {
              const nextLine = lines[i + 1];
              if (nextLine.startsWith('User:')) {
                satisfaction = nextLine.replace('User:', '').trim();
                break;
              }
            }
          }
        }
        
        return satisfaction || 'Conversation completed';
      };
      
      const summary = extractCustomerSummary(feedback.transcript || '');
      
      return {
        summary: summary,
        transcript: feedback.transcript || '',
        duration: feedback.duration || 0,
        endedReason: feedback.endedReason || '',
        hasDetailedFeedback: true
      };
    } catch {
      // If not JSON, treat as plain text
      return {
        summary: feedbackStr.length > 50 ? feedbackStr.substring(0, 50) + '...' : feedbackStr,
        transcript: '',
        duration: 0,
        endedReason: '',
        hasDetailedFeedback: false
      };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#fbbf24';
      case 'calling': return '#3b82f6';
      case 'completed': return '#10b981';
      default: return '#6b7280';
    }
  };

  if (isLoading) {
    return <div className="loading">Loading customers...</div>;
  }

  return (
    <div className="manage-leads">
      <div className="header-section">
        <h2>Manage Customers</h2>
        <div className="stats">
          <span className="stat-item">Total: {totalLeads}</span>
          <span className="stat-item">Pending: {pendingCalls}</span>
        </div>
      </div>

      <div className="controls-section">
        <button 
          onClick={handleCheckStatus}
          disabled={checkingStatus}
          className="btn btn-secondary"
          style={{ marginRight: '10px' }}
        >
          {checkingStatus ? '🔄 Checking Status...' : '📞 Check Call Status'}
        </button>
        <button onClick={onRefresh} className="btn btn-secondary">
          🔄 Refresh
        </button>
        {pendingCalls > 0 && (
          <button onClick={onBulkCall} className="btn btn-primary" style={{ marginLeft: '10px' }}>
            📞 Call All ({pendingCalls})
          </button>
        )}
      </div>

      {leads.length === 0 ? (
        <div className="empty-state">
          <p>No customers found. Add some customers first!</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="leads-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Status</th>
                <th>Feedback</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => {
                const feedback = lead.feedback ? parseFeedback(lead.feedback) : null;
                
                return (
                  <tr key={lead.id}>
                    <td>{lead.id}</td>
                    <td>{lead.name}</td>
                    <td>{lead.phone}</td>
                    <td>{lead.email}</td>
                    <td>
                      <span 
                        className="status-badge" 
                        style={{ 
                          backgroundColor: getStatusColor(lead.status),
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="feedback-cell">
                      {feedback ? (
                        <div>
                          <div className="feedback-preview" style={{ 
                            maxWidth: '200px', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontSize: '14px',
                            marginBottom: '5px'
                          }}>
                            {feedback.hasDetailedFeedback ? (
                              <div>
                                <span style={{ 
                                  backgroundColor: feedback.summary.toLowerCase().includes('excellent') ? '#10b981' :
                                                 feedback.summary.toLowerCase().includes('good') ? '#3b82f6' :
                                                 feedback.summary.toLowerCase().includes('yes') ? '#10b981' : '#6b7280',
                                  color: 'white',
                                  padding: '2px 6px',
                                  borderRadius: '12px',
                                  fontSize: '11px',
                                  fontWeight: 'bold',
                                  marginRight: '5px'
                                }}>
                                  {feedback.summary}
                                </span>
                                <span style={{ color: '#6b7280', fontSize: '11px' }}>
                                  Conversation completed
                                </span>
                              </div>
                            ) : (
                              <span style={{ color: '#374151' }}>
                                {feedback.summary}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => openFeedbackModal(lead)}
                            className="btn btn-sm"
                            style={{
                              padding: '2px 8px',
                              fontSize: '12px',
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            View Details
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                          No feedback yet
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        {lead.status === 'pending' && (
                          <button
                            onClick={() => onCallLead(lead.id)}
                            className="btn btn-sm btn-primary"
                            style={{
                              padding: '4px 12px',
                              fontSize: '12px',
                              backgroundColor: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              marginRight: '5px'
                            }}
                          >
                            📞 Call
                          </button>
                        )}
                        {lead.status === 'calling' && (
                          <span style={{ color: '#3b82f6', fontSize: '12px' }}>
                            📞 In Progress...
                          </span>
                        )}
                        {lead.status === 'completed' && (
                          <span style={{ color: '#10b981', fontSize: '12px' }}>
                            ✅ Completed
                          </span>
                        )}
                        {lead.status === 'rejected' && (
                          <span style={{ color: '#ef4444', fontSize: '12px' }}>
                            ❌ Rejected
                          </span>
                        )}
                        <button
                          onClick={() => onDeleteLead(lead.id)}
                          className="btn btn-sm btn-danger"
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <FeedbackModal
        isOpen={isModalOpen}
        onClose={closeFeedbackModal}
        customerName={selectedLead?.name || ''}
        feedback={selectedLead?.feedback || ''}
        phone={selectedLead?.phone || ''}
        email={selectedLead?.email || ''}
        calledAt={selectedLead?.called_at || null}
      />
    </div>
  );
};