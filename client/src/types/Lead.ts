export interface Lead {
  id: number;
  name: string;
  phone: string;
  email: string;
  status: 'pending' | 'calling' | 'completed' | 'rejected';
  feedback?: string;
  campaign_type?: 'feedback' | 'marketing';
  created_at: string;
  called_at?: string;
}

export interface LeadFormData {
  name: string;
  phone: string;
  email: string;
  campaign_type?: 'feedback' | 'marketing';
}

export interface ApiResponse<T> {
  data?: T;
  leads?: Lead[];
  total?: number;
  pending?: number;
  message?: string;
  error?: string;
}

export interface CallResponse {
  message: string;
  callId: string;
}

export interface BulkCallResponse {
  message: string;
  results: Array<{
    leadId: number;
    name: string;
    callId: string;
  }>;
}

export interface AuthResponse {
  success: boolean;
  role?: 'feedback' | 'marketing';
  message: string;
}