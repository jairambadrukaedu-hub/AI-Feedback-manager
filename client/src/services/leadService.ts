import axios from 'axios';
import { Lead, LeadFormData, ApiResponse, CallResponse, BulkCallResponse } from '../types/Lead';

// Use relative URL for API calls so it works both locally and through ngrok
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const leadService = {
  // Get all customers (filtered by campaign type)
  async getLeads(campaignType?: 'feedback' | 'marketing'): Promise<{ leads: Lead[]; total: number; pending: number }> {
    const params = campaignType ? { campaign_type: campaignType } : {};
    const response = await api.get('/leads', { params });
    return response.data;
  },

  // Create single customer
  async createLead(leadData: LeadFormData): Promise<{ message: string; id: number; campaign_type?: string }> {
    console.log('🌐 leadService.createLead called with:', leadData);
    console.log('🎯 API URL:', `${API_BASE_URL}/leads`);
    try {
      const response = await api.post('/leads', leadData);
      console.log('✅ leadService.createLead response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ leadService.createLead error:', error);
      throw error;
    }
  },

  // Upload bulk customers from file
  async uploadBulkLeads(file: File, campaignType?: 'feedback' | 'marketing'): Promise<{ message: string; count: number }> {
    const formData = new FormData();
    formData.append('csvFile', file);
    if (campaignType) {
      formData.append('campaign_type', campaignType);
    }
    
    const response = await api.post('/leads/bulk', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Call single customer
  async callLead(leadId: number): Promise<CallResponse> {
    const response = await api.post(`/call/${leadId}`);
    return response.data;
  },

  // Bulk call all pending customers
  async bulkCallLeads(): Promise<BulkCallResponse> {
    const response = await api.post('/call/bulk');
    return response.data;
  },

  // Delete customer
  async deleteLead(leadId: number): Promise<{ message: string }> {
    const response = await api.delete(`/leads/${leadId}`);
    return response.data;
  },

  // Download sample CSV
  async downloadSampleCSV(): Promise<Blob> {
    const response = await api.get('/sample-csv', {
      responseType: 'blob',
    });
    return response.data;
  },
};