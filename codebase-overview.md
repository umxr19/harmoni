# Codebase Overview

## Project Structure

The project follows a standard React application structure with TypeScript:

- `frontend/`: Contains the React frontend application
  - `src/`: Source code for the frontend
    - `components/`: Reusable UI components
    - `contexts/`: React context providers
    - `hooks/`: Custom React hooks
    - `pages/`: Page components that represent routes
    - `services/`: API and utility services
    - `styles/`: CSS and styling files
    - `types/`: TypeScript type definitions
    - `utils/`: Utility functions
  - `public/`: Static assets
  - `vite.config.ts`: Vite configuration

- `backend/`: Contains the Express.js backend application
  - `src/`: Source code for the backend
    - `controllers/`: Request handlers
    - `middleware/`: Express middleware
    - `models/`: Database models
    - `routes/`: API route definitions
    - `services/`: Business logic services
    - `utils/`: Utility functions
  - `config/`: Configuration files
  - `tests/`: Backend tests

## Key Components

### Frontend

1. **Authentication**
   - `AuthContext.tsx`: Provides authentication state and methods
   - `LoginPage.tsx`: Handles user login
   - `RegisterPage.tsx`: Handles user registration

2. **Dashboard**
   - `StudentDashboard.tsx`: Main dashboard for students
   - `TeacherDashboard.tsx`: Main dashboard for teachers
   - `AdminDashboard.tsx`: Main dashboard for administrators

3. **Learning Components**
   - `QuestionCard.tsx`: Displays individual questions
   - `PracticeSession.tsx`: Manages practice sessions
   - `ExamSession.tsx`: Manages exam sessions

4. **Progress Visualization**
   - `SimpleProgressChart.tsx`: Lightweight progress bar component
   - `ActivityCard.tsx`: Component for displaying user activity items

5. **Navigation**
   - `Navbar.tsx`: Main navigation bar
   - `Sidebar.tsx`: Side navigation menu

### Backend

1. **Authentication**
   - `authController.js`: Handles authentication requests
   - `authMiddleware.js`: Verifies JWT tokens

2. **User Management**
   - `userController.js`: Handles user-related requests
   - `userModel.js`: User database model

3. **Content Management**
   - `questionController.js`: Handles question-related requests
   - `examController.js`: Handles exam-related requests

4. **Analytics**
   - `analyticsController.js`: Handles analytics requests
   - `analyticsService.js`: Processes analytics data

## Recent Updates

### React "Invalid Hook Call" Error Resolution (June 2023)

We resolved critical "Invalid hook call" errors in our React dashboard when using chart libraries (react-chartjs-2). The issue was caused by multiple React instances in the application, leading to hooks being called in invalid contexts.

**Root Causes Identified:**
1. Version mismatch between root package.json (React v19.0.0) and frontend package.json (React v18.2.0)
2. Improper module resolution in Vite configuration
3. Lack of proper React instance management in chart components

**Implemented Solutions:**
1. **Unified React Versions:**
   - Aligned React and ReactDOM versions across root and frontend package.json files to v18.2.0
   - Created diagnostic scripts to detect version mismatches

2. **Enhanced Vite Configuration:**
   - Added module resolution aliases to ensure all imports use the same React instance
   - Configured optimizeDeps to properly bundle React dependencies
   - Added force bundling of React and ReactDOM to prevent duplicates

3. **Improved Component Architecture:**
   - Created a ChartJSWrapper component to ensure chart libraries use the correct React instance
   - Added global React instance management through reactUtils
   - Implemented proper TypeScript interfaces for window objects

4. **Added Diagnostic Tools:**
   - Created `check-react-versions.js` script to detect React version mismatches
   - Implemented `fix-dependencies.js` script to automatically resolve duplicate dependencies
   - Added runtime detection of multiple React instances through `reactVersionCheck.ts`

5. **ES Module Compatibility:**
   - Updated scripts to use ES module syntax instead of CommonJS
   - Added proper module resolution flags for Node.js scripts
   - Fixed TypeScript interfaces for global objects

**Technical Implementation Details:**
- Used `fileURLToPath` and `import.meta.url` for ES module path resolution
- Implemented proper TypeScript declarations for global window objects
- Added dynamic imports for ReactDOM to avoid bundling issues
- Created a global React instance management system through `reactUtils.ts`
- Added comprehensive error handling throughout the chart components

**Modified Files:**
- `package.json`: Updated React versions to match frontend
- `frontend/vite.config.ts`: Enhanced module resolution and bundling
- `frontend/src/components/ChartJSWrapper.tsx`: Created wrapper for chart components
- `frontend/src/utils/reactUtils.ts`: Added global React instance management
- `frontend/src/utils/reactVersionCheck.ts`: Added runtime detection of React instances
- `frontend/scripts/check-react-versions.js`: Created diagnostic script
- `frontend/scripts/fix-dependencies.js`: Created dependency fixing script

This fix ensures that all components use the same React instance, preventing "Invalid hook call" errors and improving application stability.

### Student Dashboard Enhancements (May 2023)

We've made significant improvements to the student dashboard and related components to enhance reliability, user experience, and error handling:

1. **Replaced Complex Charts with Simple Components**: 
   - Replaced the error-prone Recharts implementation with custom, lightweight progress visualization components (`SimpleProgressChart` and `ActivityCard`).
   - This resolved numerous TypeScript errors and improved performance.

2. **Improved Error Handling**: 
   - Added comprehensive error handling with graceful fallbacks to mock data when API connections fail.
   - Implemented a visual indicator when the dashboard is displaying mock data instead of real data.

3. **API Service Improvements**:
   - Implemented automatic fallbacks to mock data during development.
   - Enhanced error logging for easier debugging.
   - Added a health check endpoint to verify API connectivity.
   - Updated the Vite development server to proxy API requests, avoiding CORS issues.
   - Disabled `withCredentials` in development mode to prevent CORS issues with wildcard origins.

4. **New Components**:
   - `SimpleProgressChart`: A lightweight progress bar component that shows completion percentages.
   - `ActivityCard`: A clean card component for displaying user activity items.

5. **Styling Improvements**:
   - Created dedicated CSS files for new components.
   - Implemented a consistent color scheme across all dashboard elements.
   - Enhanced visual hierarchy for better information display.

6. **Technical Debt Reduction**:
   - Eliminated complex libraries causing TypeScript errors.
   - Streamlined data flow between components and services.
   - Improved TypeScript type definitions for better code reliability.

7. **Backend Integration**:
   - Standardized API paths with consistent `/api` prefixes.
   - Provided guidance for proper CORS configuration on the backend.

### UI Redesign and Mobile Optimization (November 2023)

We've completed a significant redesign of the application's user interface with a focus on mobile optimization and improved user experience:

1. **Home Page Redesign**:
   - Replaced the "Why Choose Us" boxes with app section cards for a more app-like experience
   - Implemented a responsive grid layout that adapts to different screen sizes
   - Added emoji icons for each section (Dashboard, Practice, Exams, Wellbeing, Classrooms, Store)
   - Simplified the hero section with a more focused welcome message
   - Removed duplicate footer content to streamline the UI

2. **Header Component Updates**:
   - Replaced the mobile menu button with a user avatar/profile picture
   - Added functionality to navigate to the user's profile when clicking the avatar
   - Implemented a function to display the user's initial as an avatar when logged in
   - Simplified the header structure for better mobile usability
   - Improved responsive design for various screen sizes

3. **Footer Simplification**:
   - Streamlined the footer to only include essential copyright information
   - Removed redundant navigation links to improve mobile experience
   - Ensured consistent styling across the application

4. **Mobile-First Styling**:
   - Created dedicated mobile.css file with responsive styles
   - Implemented proper styling for the app section icons on mobile devices
   - Added media queries to adjust layouts for different screen widths (768px, 576px, 375px)
   - Enhanced touch targets for better mobile interaction
   - Improved input and button styling for touch devices

5. **CSS Optimization**:
   - Removed conflicting and unused styles
   - Consolidated styling in appropriate CSS files
   - Improved consistency in styling across components
   - Enhanced visual hierarchy for better information display

6. **Mobile Testing**:
   - Conducted testing on iOS devices (iPhone with iOS 18.1.1)
   - Verified API connectivity and authentication on mobile devices
   - Confirmed responsive design works correctly on mobile browsers
   - Tested user flows including dashboard access, classroom management, and wellbeing features
   - Identified and fixed issues with icon display and duplicate content

7. **Technical Implementation**:
   - Updated Home.tsx to implement the new app section card design
   - Modified Home.css to support responsive grid layout
   - Enhanced mobile.css with specific styles for smaller screens
   - Updated App.css to remove conflicting styles
   - Ensured proper styling for emoji icons with the app-section-icon class

### Development Environment Issues (November 2023)

During our development and testing process, we encountered and resolved several environment-specific issues:

1. **PowerShell Command Execution**:
   - Identified an issue with the `&&` operator in PowerShell on Windows systems
   - PowerShell doesn't support the `&&` operator for command chaining like bash/sh shells
   - Error message: `The token '&&' is not a valid statement separator in this version`
   - **Solution**: Replace `&&` with semicolon and `-and` operator or use separate commands:
     ```powershell
     # Instead of: cd frontend && npm run dev
     cd frontend; npm run dev
     
     # Or use separate commands:
     cd frontend
     npm run dev
     ```

2. **Cross-Platform Development Considerations**:
   - Updated npm scripts in package.json to be compatible with both Windows and Unix-based systems
   - Added cross-env package to handle environment variables consistently across platforms
   - Documented platform-specific commands in the README for developer reference
   - Ensured all file paths use forward slashes for cross-platform compatibility

3. **Mobile Browser Testing**:
   - Successfully tested the application on iOS Safari (iPhone with iOS 18.1.1)
   - Verified API connectivity from mobile devices to our development server
   - Confirmed authentication flows work correctly on mobile browsers
   - Observed and logged network requests from mobile devices for debugging purposes

These findings have been documented to help future developers avoid similar issues and to establish best practices for cross-platform development in our project.

### API Connectivity and Authentication Testing (November 2023)

During our mobile testing, we captured and analyzed API request logs to ensure proper connectivity and authentication. Key findings include:

1. **Successful API Connectivity**:
   - Mobile devices successfully connected to our development API server (192.168.1.67:3001)
   - Requests properly included authentication tokens in the Authorization header
   - API responses were correctly processed by the mobile client

2. **Authentication Flow**:
   - JWT tokens were properly stored and included in API requests from mobile devices
   - Token format: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - User authentication state was correctly maintained throughout the session

3. **API Endpoints Tested**:
   - `/api/analytics/student/current`: Student analytics data retrieval
   - `/api/classrooms/student`: Student classroom information
   - `/api/classrooms/assignments/student`: Student assignments
   - `/api/exams/public`: Public exam listings
   - `/api/wellbeing/summary`: Wellbeing data summary
   - `/api/wellbeing/journal`: Journal entries

4. **Request Headers Analysis**:
   - User-Agent: `Mozilla/5.0 (iPhone; CPU iPhone OS 18_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1.1 Mobile/15E148 Safari/604.1`
   - Accept: `application/json, text/plain, */*`
   - Accept-Language: `en-GB,en;q=0.9`
   - Accept-Encoding: `gzip, deflate`
   - Origin and Referer headers correctly set to the frontend URL

5. **Performance Observations**:
   - API response times were acceptable on mobile devices
   - No significant latency issues were observed during testing
   - Cache headers were properly set to optimize repeat requests

This testing confirms that our application's API connectivity and authentication mechanisms work correctly on mobile devices, providing a solid foundation for further mobile optimization efforts.

### Next Steps

1. Continue mobile optimization for all application features
2. Implement progressive web app (PWA) capabilities
3. Enhance offline functionality for better mobile experience
4. Conduct user testing on various mobile devices and screen sizes
5. Optimize performance for users with slower mobile connections

### Rate Limiting and MongoDB Configuration (March 2024)

We've implemented and tested comprehensive rate limiting functionality and improved the MongoDB configuration:

1. **Rate Limiting Implementation**:
   - Added Redis-based rate limiting for API endpoints
   - Implemented two levels of rate limiting:
     - IP-based: 100 requests per 15 minutes
     - User-based: 3 requests per 24 hours (tracked in Redis)
   - Created debug endpoints for testing rate limits without consuming OpenAI tokens
   - Added proper error handling for rate limit exceeded scenarios

2. **MongoDB Configuration Improvements**:
   - Updated database configuration to support both local and Atlas connections
   - Added fallback to local MongoDB (mongodb://localhost:27017/question-bank) when Atlas URI is not available
   - Improved error handling for database connections
   - Enhanced logging for connection status and errors

3. **Testing Infrastructure**:
   - Created PowerShell test scripts for rate limit verification
   - Implemented debug endpoints for testing authentication and rate limiting
   - Added comprehensive logging for request tracking
   - Created mock endpoints to test rate limiting without consuming API resources

4. **Authentication Enhancements**:
   - Fixed issues with JWT token handling
   - Improved error messages for authentication failures
   - Added proper validation for authorization headers
   - Enhanced security for token-based authentication

5. **Development Environment**:
   - Added support for local MongoDB development
   - Configured Redis for local rate limiting
   - Improved environment variable handling
   - Enhanced logging for development debugging

These updates have significantly improved the application's reliability and security while making it easier to develop and test locally.

## Development Guidelines

### Code Style

- Use functional components with hooks for React components
- Follow TypeScript best practices for type safety
- Use async/await for asynchronous operations
- Write descriptive variable and function names
- Add comments for complex logic

### State Management

- Use React Context for global state
- Use useState and useReducer for component state
- Avoid prop drilling by using context or custom hooks

### API Calls

- Use the api.ts service for all API calls
- Handle loading and error states for all API calls
- Implement proper error handling and user feedback

### Testing

- Write unit tests for utility functions
- Write component tests for UI components
- Write integration tests for critical user flows

## Deployment

- Frontend is deployed to Vercel
- Backend is deployed to Heroku
- Database is hosted on MongoDB Atlas 