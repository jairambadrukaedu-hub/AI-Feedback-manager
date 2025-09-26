# Multi-Role AI Customer Care System Setup Guide

## 🎯 **System Overview**
Your application now supports **TWO AI systems** in one platform:
- **Customer Feedback AI** - Post-call feedback collection (existing)
- **Marketing AI** - Proactive outreach and lead qualification (new)

## 🔐 **Access Passwords**
- **Feedback System**: `feedback123`
- **Marketing System**: `marketing123`

## 🤖 **AI Configuration Required**

### Current Setup (Feedback AI - Working)
```env
FEEDBACK_ASSISTANT_ID=a8a7a43b-ffeb-429d-b986-e156b6a40bdf
FEEDBACK_PHONE_NUMBER_ID=720ecf1c-1434-4567-9e8f-ee59612843af
```

### Marketing AI Setup (Needed)
You need to provide these values from your Vapi dashboard:
```env
MARKETING_ASSISTANT_ID=YOUR_MARKETING_ASSISTANT_ID_HERE
MARKETING_PHONE_NUMBER_ID=YOUR_MARKETING_PHONE_NUMBER_ID_HERE
```

## 📋 **Steps to Complete Marketing Setup**

### 1. Create Marketing AI in Vapi Dashboard
1. Go to https://vapi.ai/dashboard
2. Create a new **Assistant** for marketing
3. Configure it with marketing-focused prompts like:
   ```
   You are a professional marketing representative calling potential customers about our services. 
   Your goal is to:
   - Introduce our company and services
   - Qualify leads based on their interest and needs
   - Schedule follow-up calls or demos if interested
   - Be polite and respect if they're not interested
   
   Keep the conversation natural, professional, and focused on understanding their needs.
   ```

### 2. Get Marketing Phone Number
1. In Vapi dashboard, add a new **Phone Number** for marketing calls
2. Or use the same number if you prefer (calls will be differentiated by assistant)

### 3. Update Environment Variables
Add to your server's environment variables:
```env
MARKETING_ASSISTANT_ID=your_new_assistant_id
MARKETING_PHONE_NUMBER_ID=your_phone_number_id
```

### 4. Optional: Custom Passwords
```env
FEEDBACK_PASSWORD=your_custom_feedback_password
MARKETING_PASSWORD=your_custom_marketing_password
```

## 🚀 **How It Works**

### User Experience:
1. **Login Page**: User enters password
2. **Role Detection**: System identifies if it's feedback or marketing
3. **Branded Interface**: UI shows appropriate branding and features
4. **Separate Data**: Each role only sees their campaign data

### Technical Flow:
1. **Authentication**: Password determines user role
2. **Campaign Filtering**: All data filtered by `campaign_type`
3. **AI Selection**: Calls use appropriate AI assistant
4. **Role-Specific UI**: Interface adapts to user role

## 🎨 **UI Differences by Role**

### Feedback System (💬)
- Blue branding
- "Customer Feedback" badge  
- "Call All" button
- "Feedback" column in table
- "Pending Feedback" counter

### Marketing System (📈)
- Green branding
- "Marketing Outreach" badge
- "Start Marketing Calls" button  
- "Results" column in table
- "Pending Calls" counter

## 📊 **Database Structure**
```sql
leads table:
- campaign_type: 'feedback' | 'marketing'
- All other fields remain the same
```

## 🔧 **API Endpoints Enhanced**
- `GET /api/leads?campaign_type=feedback` - Get feedback leads
- `GET /api/leads?campaign_type=marketing` - Get marketing leads  
- `POST /api/leads` - Create lead with campaign_type
- `POST /api/leads/bulk` - Bulk upload with campaign_type

## 🌐 **Live Application**
Visit: **https://ai-feedback-manager.onrender.com**

## 📝 **Next Steps**
1. **Test Current System**: Try both passwords to see role switching
2. **Create Marketing AI**: Set up new assistant in Vapi dashboard
3. **Configure Environment**: Add marketing AI credentials
4. **Test Marketing Flow**: Create marketing leads and test calls
5. **Customize Prompts**: Refine AI behavior for each role

## 💡 **Advanced Customization Ideas**
- Different webhook URLs for each campaign type
- Role-specific email templates  
- Custom fields per campaign type
- Advanced analytics per role
- Integration with CRM systems

---

**Ready for your Vapi marketing AI details!** 🚀