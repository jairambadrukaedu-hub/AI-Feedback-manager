# Feedback Manager 🎯

An AI-powered customer feedback collection system with automated calling capabilities using Vapi API.

![Feedback Manager](https://img.shields.io/badge/Status-Production_Ready-brightgreen)
![Node.js](https://img.shields.io/badge/Node.js-v18+-blue)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## Features

- **Lead Management**: Create, view, and manage customer leads
- **AI-Powered Calls**: Integrate with Vapi API for automated voice calls
- **Bulk Upload**: Upload leads via CSV/Excel files
- **Real-time Updates**: Track call status and feedback
- **Modern UI**: Clean, responsive interface built with React and TailwindCSS

## Technology Stack

### Frontend
- React 18 with TypeScript
- TailwindCSS for styling
- Axios for API communication

### Backend
- Node.js with Express
- SQLite database
- Multer for file uploads
- CSV/Excel parsing

### Integrations
- **Vapi API**: AI voice assistant for customer calls
- **Twilio**: Phone service integration
- **ElevenLabs**: Voice synthesis (via Vapi)

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository and navigate to the project directory

2. Install all dependencies:
```bash
npm run install-all
```

3. Set up environment variables:
```bash
# Copy the example environment file
cp server/.env.example server/.env
```

4. Update the `.env` file with your actual API keys:
```
VAPI_API_KEY=your_vapi_private_key
VAPI_PUBLIC_KEY=your_vapi_public_key
VAPI_ASSISTANT_ID=your_vapi_assistant_id
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

### Running the Application

Start both frontend and backend servers:
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend React app on `http://localhost:3000`

### Individual Server Commands

Backend only:
```bash
npm run server
```

Frontend only:
```bash
npm run client
```

## API Endpoints

### Leads Management
- `GET /api/leads` - Get all leads
- `POST /api/leads` - Create a new lead
- `POST /api/leads/bulk` - Bulk upload leads from CSV/Excel
- `DELETE /api/leads/:id` - Delete a lead

### Calling Features
- `POST /api/call/:id` - Initiate AI call to a specific lead
- `POST /api/call/bulk` - Initiate AI calls to all pending leads
- `POST /api/webhook/call-completed` - Webhook for call completion

### Utilities
- `GET /api/sample-csv` - Download sample CSV template

## File Upload Format

When uploading CSV/Excel files, ensure they have the following columns:
- `name` - Customer name
- `phone` - Phone number (with country code recommended)
- `email` - Email address

Example:
```csv
name,phone,email
John Doe,+1234567890,john@example.com
Jane Smith,+1987654321,jane@example.com
```

## Vapi Integration

The application integrates with Vapi API for AI-powered voice calls. To enable actual calling:

1. Sign up for a Vapi account at https://vapi.ai
2. Create an assistant and note the Assistant ID
3. Configure your phone number and voice settings
4. Update the environment variables with your credentials

## Development

### Project Structure
```
/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   └── ...
├── server/                 # Node.js backend
│   ├── index.js           # Main server file
│   ├── .env               # Environment variables
│   └── package.json
└── package.json           # Root package.json
```

### Database

The application uses SQLite for simplicity. The database file (`leads.db`) is created automatically in the server directory.

### Customization

To customize the AI calling behavior, modify the assistant configuration in the Vapi dashboard or update the `initiateVapiCall` function in `server/index.js`.

## Deployment

### Production Build

Build the frontend for production:
```bash
cd client && npm run build
```

### Environment Variables

Ensure all production environment variables are set:
- API keys for Vapi and Twilio
- Database configuration
- CORS settings

## Troubleshooting

### Common Issues

1. **File upload not working**: Check file permissions in the `server/uploads/` directory
2. **API calls failing**: Verify environment variables are set correctly
3. **Database errors**: Ensure SQLite3 is properly installed

### Logs

Check server logs for debugging information. The server logs API requests, call attempts, and error messages.

## Support

For issues or questions:
1. Check the console logs (both browser and server)
2. Verify API credentials are correct
3. Ensure phone numbers are in the correct format for your region

## License

This project is licensed under the MIT License.