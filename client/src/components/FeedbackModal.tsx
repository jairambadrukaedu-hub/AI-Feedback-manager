import React from 'react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName: string;
  feedback: string;
  phone: string;
  email: string;
  calledAt: string | null;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  customerName,
  feedback,
  phone,
  email,
  calledAt
}) => {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const parseFeedback = (feedbackText: string) => {
    if (!feedbackText) return null;
    
    try {
      // Try to parse as JSON first
      const feedbackData = JSON.parse(feedbackText);
      
      // Extract key customer responses from transcript
      const extractCustomerResponses = (transcript: string) => {
        if (!transcript) return {};
        
        const responses: { [key: string]: string } = {};
        const lines = transcript.split('\n');
        
        let currentQuestion = '';
        for (const line of lines) {
          if (line.startsWith('AI:')) {
            const aiText = line.replace('AI:', '').trim().toLowerCase();
            if (aiText.includes('how satisfied') || aiText.includes('rate it')) {
              currentQuestion = 'satisfaction';
            } else if (aiText.includes('especially helpful') || aiText.includes('impressive')) {
              currentQuestion = 'helpful';
            } else if (aiText.includes('suggestions') || aiText.includes('improve')) {
              currentQuestion = 'suggestions';
            } else if (aiText.includes('interested in') && aiText.includes('future')) {
              currentQuestion = 'future_interest';
            }
          } else if (line.startsWith('User:') && currentQuestion) {
            const userResponse = line.replace('User:', '').trim();
            responses[currentQuestion] = userResponse;
            currentQuestion = '';
          }
        }
        
        return responses;
      };

      const customerResponses = extractCustomerResponses(feedbackData.transcript || '');
      
      return {
        summary: feedbackData.summary || feedbackData.analysis?.summary || '',
        transcript: feedbackData.transcript || '',
        duration: feedbackData.duration || 0,
        endedReason: feedbackData.endedReason || '',
        status: feedbackData.status || '',
        customerResponses,
        isJSON: true
      };
    } catch {
      // If not JSON, treat as plain text and parse manually
      const sections = feedbackText.split('\n\n');
      const parsed: any = { isJSON: false };
      
      sections.forEach(section => {
        if (section.startsWith('Summary:')) {
          parsed.summary = section.replace('Summary:', '').trim();
        } else if (section.startsWith('Feedback:')) {
          parsed.feedback = section.replace('Feedback:', '').trim();
        } else if (section.startsWith('Transcript:')) {
          parsed.transcript = section.replace('Transcript:', '').trim();
        } else if (section.startsWith('Duration:')) {
          parsed.duration = section.replace('Duration:', '').trim();
        } else if (section.startsWith('Ended:')) {
          parsed.endedReason = section.replace('Ended:', '').trim();
        }
      });
      
      return parsed;
    }
  };

  const feedbackData = parseFeedback(feedback);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900">
              Conversation Summary
            </h3>
            <div className="mt-2 text-sm text-gray-600">
              <p><strong>Customer:</strong> {customerName}</p>
              <p><strong>Phone:</strong> {phone}</p>
              <p><strong>Email:</strong> {email}</p>
              {calledAt && <p><strong>Called At:</strong> {formatDate(calledAt)}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {feedbackData ? (
            <div className="space-y-4">
              {/* Customer Response Summary */}
              {feedbackData.customerResponses && Object.keys(feedbackData.customerResponses).length > 0 && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                    <span className="text-xl mr-2">✅</span>
                    Customer Feedback Summary
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {feedbackData.customerResponses.satisfaction && (
                      <div className="bg-white p-3 rounded border">
                        <div className="font-medium text-gray-900">Service Rating</div>
                        <div className="text-green-700 font-semibold text-lg">
                          {feedbackData.customerResponses.satisfaction}
                        </div>
                      </div>
                    )}
                    {feedbackData.customerResponses.helpful && (
                      <div className="bg-white p-3 rounded border">
                        <div className="font-medium text-gray-900">What Was Helpful</div>
                        <div className="text-gray-700">
                          {feedbackData.customerResponses.helpful}
                        </div>
                      </div>
                    )}
                    {feedbackData.customerResponses.suggestions && (
                      <div className="bg-white p-3 rounded border">
                        <div className="font-medium text-gray-900">Suggestions</div>
                        <div className="text-gray-700">
                          {feedbackData.customerResponses.suggestions}
                        </div>
                      </div>
                    )}
                    {feedbackData.customerResponses.future_interest && (
                      <div className="bg-white p-3 rounded border">
                        <div className="font-medium text-gray-900">Future Services Interest</div>
                        <div className="text-blue-700 font-semibold">
                          {feedbackData.customerResponses.future_interest}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Call Performance */}
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                  <span className="text-xl mr-2">�</span>
                  Call Performance
                </h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center bg-white p-3 rounded border">
                    <div className="font-medium text-gray-900">Duration</div>
                    <div className="text-blue-700 font-bold text-lg">
                      {typeof feedbackData.duration === 'number' ? 
                        formatDuration(feedbackData.duration) : 
                        feedbackData.duration || 'N/A'}
                    </div>
                  </div>
                  <div className="text-center bg-white p-3 rounded border">
                    <div className="font-medium text-gray-900">Status</div>
                    <div className="text-green-700 font-semibold">
                      {feedbackData.status || 'Completed'}
                    </div>
                  </div>
                  <div className="text-center bg-white p-3 rounded border">
                    <div className="font-medium text-gray-900">End Reason</div>
                    <div className="text-gray-700">
                      {feedbackData.endedReason || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Performance Summary */}
              {feedbackData.summary && (
                <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-3 flex items-center">
                    <span className="text-xl mr-2">🤖</span>
                    AI Assistant Performance
                  </h4>
                  <div className="text-purple-800 text-sm leading-relaxed whitespace-pre-line">
                    {feedbackData.summary}
                  </div>
                </div>
              )}

              {/* Full Transcript */}
              {feedbackData.transcript && (
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="text-xl mr-2">💬</span>
                    Full Conversation
                  </h4>
                  <div className="bg-white p-3 rounded border max-h-40 overflow-y-auto">
                    <pre className="text-gray-700 whitespace-pre-wrap text-sm font-mono leading-relaxed">
                      {feedbackData.transcript}
                    </pre>
                  </div>
                </div>
              )}

              {/* Legacy text format fallback */}
              {!feedbackData.isJSON && feedbackData.feedback && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">💬 Customer Feedback</h4>
                  <p className="text-green-800">{feedbackData.feedback}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              No feedback data available
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};