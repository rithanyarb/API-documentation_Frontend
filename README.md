# API Documentation Generator - Frontend

A modern React-based frontend application for generating beautiful, interactive API documentation from multiple sources including OpenAPI specifications, cURL commands, backend ZIP files, and GitHub repositories.

## Prerequisites

Make sure the following are installed:
* **Node.js** - v18.17.0
* **npm** (comes with Node.js)

## Features

- **Multiple Input Methods**: Support for OpenAPI JSON/YAML, cURL commands, backend ZIP files, and GitHub repositories
- **Interactive Testing**: Built-in API endpoint testing with real-time results
- **User Authentication**: Google OAuth integration with session management
- **Analytics Dashboard**: Track feature usage with beautiful charts and statistics
- **Responsive Design**: Modern UI with Tailwind CSS styling
- **Real-time Editing**: Edit and test API endpoints on the fly

## Tech Stack

- **Vite + React jsx** - Frontend framework
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Axios** - HTTP client for API requests
- **Vite** - Fast development build tool

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── EditableEndpointCard.jsx    # Editable API endpoint testing card
│   ├── EndpointCard.jsx            # Read-only API endpoint display
│   ├── Layout.jsx                  # Main application layout
│   ├── LoginScreen.jsx             # Google OAuth login page
│   ├── DocumentationActions.jsx   # View/download generated docs
│   ├── PieChart.jsx                # Analytics pie chart component
│   ├── StatsCard.jsx               # Statistics display card
│   └── TemplatesDisplay.jsx        # Display multiple API endpoints
├── pages/                # Main page components
│   ├── Home.jsx                    # Dashboard with analytics
│   ├── OpenAPIJSON.jsx             # OpenAPI upload page
│   ├── CurlCommand.jsx             # cURL command input page
│   ├── BackendZIP.jsx              # Backend ZIP upload page
│   └── GitHubRepository.jsx        # GitHub repo integration page
├── context/              # React Context providers
│   ├── AuthContext.jsx             # Authentication state management
│   └── AnalyticsContext.jsx        # Analytics tracking and stats
├── hooks/                # Custom React hooks
│   └── useApi.js                   # API request handling hook
├── router/               # Application routing
│   └── index.jsx                   # Main router configuration
├── api.js                # API client and endpoints
├── App.jsx               # Root component
├── main.jsx              # Application entry point
└── index.css             # Global styles and Tailwind imports
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd api-docs-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:8000
   VITE_KAAYLABS_CODE:your_own_password_code
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:5173`

## To run frontend

- `npm run dev` - Start development server

## Core Components

### Authentication
- **Google OAuth Integration**: Secure login with session-based authentication
- **Protected Routes**: Automatic redirection for unauthenticated users
- **User Profile**: Display user information and logout functionality

### API Documentation Generation
- **OpenAPI JSON/YAML**: Upload from URL or file with base URL configuration
- **cURL Commands**: Convert cURL commands to interactive documentation
- **Backend ZIP**: Analyze backend code for automatic API discovery
- **GitHub Integration**: Clone and analyze repositories for API endpoints

### Interactive Testing
- **Endpoint Testing**: Test API endpoints directly from the interface
- **Real-time Results**: View response data, headers, and status codes
- **Editable Parameters**: Modify headers, body, and URL before testing
- **Error Handling**: Clear error messages and debugging information

### Analytics Dashboard
- **Global Statistics**: View platform-wide usage statistics
- **Personal Analytics**: Track your individual feature usage
- **Interactive Charts**: Beautiful pie charts showing usage distribution
- **Real-time Tracking**: Automatic tracking of feature interactions

## API Integration

The frontend communicates with a FastAPI backend through RESTful endpoints:

- **Authentication**: `/api/v1/authentication/*`
- **OpenAPI**: `/api/v1/openapi/*`
- **cURL**: `/api/v1/curl/*`
- **Code Analysis**: `/api/v1/code/*`
- **Testing**: `/api/v1/test-endpoint`
- **Analytics**: `/api/v1/analytics/*`

## Configuration

### Environment Variables
- `VITE_API_URL`: Backend API base URL (default: http://localhost:8000)

### Tailwind CSS
The project uses Tailwind CSS for styling with a custom configuration:
- Responsive design patterns
- Custom color schemes
- Gradient backgrounds
- Animation utilities

## Key Features Explained

### Editable Endpoint Cards
- Edit API endpoints inline
- Test with modified parameters
- Save/cancel functionality
- Reset to original values
- Copy request/response data

### Analytics Tracking
- Automatic feature usage tracking
- Global and personal statistics
- Real-time chart updates
- Navigation tracking

### Error Handling
- Comprehensive error boundaries
- User-friendly error messages
- API error response handling
- Loading states for better UX

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

Free to use for personal and educational purposes.

## Author

Made with ❤️ by **RB Rithanya**
