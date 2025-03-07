# Harmoni Codebase Index

## Project Structure Overview

```
harmoni/
├── frontend/           # React frontend application
│   └── src/
│       ├── assets/    # Static assets (images, fonts)
│       ├── components/# Reusable UI components
│       ├── contexts/  # React context providers
│       ├── hooks/     # Custom React hooks
│       ├── pages/     # Page components
│       ├── providers/ # Provider components
│       ├── services/  # API and service integrations
│       ├── styles/    # CSS and styling files
│       ├── types/     # TypeScript type definitions
│       └── utils/     # Utility functions
├── backend/           # Node.js backend application
├── docs/             # Project documentation
├── scripts/          # Build and utility scripts
└── dist/             # Build output directory
```

## Key Files Index

### Configuration Files
- `.env` - Development environment variables
- `.env.production` - Production environment variables
- `.env.staging` - Staging environment variables
- `tsconfig.json` - TypeScript configuration
- `package.json` - Project dependencies and scripts
- `docker-compose.yml` - Docker configuration
- `Dockerfile` - Docker build configuration

### Documentation
- `README.md` - Project overview and setup instructions
- `docs/codebase-overview.md` - Detailed codebase documentation
- `DEPLOYMENT-CHECKLIST.md` - Deployment preparation guide
- `frontend/src/README-wellbeing.md` - Wellbeing feature documentation

### Frontend Core Files
- `frontend/src/App.tsx` - Main application component
- `frontend/src/index.tsx` - Application entry point
- `frontend/src/main.tsx` - Vite entry point
- `frontend/src/App.css` - Global application styles
- `frontend/src/index.css` - Root styles

### Frontend Features

#### Authentication
- `frontend/src/contexts/AuthContext.tsx` - Authentication context provider
- `frontend/src/hooks/useAuth.ts` - Authentication hook
- `frontend/src/services/authService.ts` - Authentication service

#### Study Schedule
- `frontend/src/pages/StudySchedule.tsx` - Study schedule page
- `frontend/src/components/StudyScheduleCard.tsx` - Schedule card component
- `frontend/src/services/studyScheduleService.ts` - Schedule management service

#### Wellbeing
- `frontend/src/pages/WellbeingSuitePage.tsx` - Wellbeing dashboard
- `frontend/src/components/MoodRatingModal.tsx` - Mood tracking component
- `frontend/src/services/wellbeingService.ts` - Wellbeing data service

#### Exams
- `frontend/src/pages/ExamsList.tsx` - Exam listing page
- `frontend/src/pages/ExamAttempt.tsx` - Exam taking interface
- `frontend/src/services/examService.ts` - Exam management service

#### Store
- `frontend/src/pages/Store.tsx` - Digital product store
- `frontend/src/components/ProductCard.tsx` - Product display component
- `frontend/src/services/productService.ts` - Product management service

### Recent Updates

#### March 2025
- Exam and Wellbeing Routes Restoration
- OpenAI Integration for Study Schedule Generation

#### October 2024
- User Profile UI and Functionality Enhancements
- Enhanced Error Handling and Mock Data Integration

#### September 2024
- Study Schedule Feature Implementation
- Mobile Authentication and Connectivity Improvements

## Search Tips

### Finding Components
- Components are located in `frontend/src/components/`
- Page components are in `frontend/src/pages/`
- Each component typically has an associated CSS file in `frontend/src/styles/`

### Finding API Integration
- Service files in `frontend/src/services/` handle API calls
- API routes are defined in `routes.json`
- Mock data implementations are in service files with "mock" in their name

### Finding Types
- TypeScript interfaces and types are in `frontend/src/types/`
- Component props types are typically defined in the component files
- API response types are in service files

### Finding Styles
- Global styles are in `frontend/src/App.css` and `frontend/src/index.css`
- Component-specific styles are in `frontend/src/styles/`
- Theme variables and utilities are in style utility files

## Common Tasks

### Adding a New Feature
1. Create component in `frontend/src/components/` or `frontend/src/pages/`
2. Add styles in `frontend/src/styles/`
3. Create service in `frontend/src/services/` if needed
4. Add types in `frontend/src/types/`
5. Update routes in `App.tsx` if needed

### Modifying Authentication
1. Check `frontend/src/contexts/AuthContext.tsx`
2. Update `frontend/src/services/authService.ts`
3. Modify `frontend/src/hooks/useAuth.ts` if needed

### Adding API Endpoints
1. Add route to `routes.json`
2. Create or update service in `frontend/src/services/`
3. Add types for request/response in `frontend/src/types/`
4. Implement mock data if needed for development

### Styling Changes
1. Check component-specific CSS in `frontend/src/styles/`
2. Global styles in `frontend/src/App.css`
3. Theme variables in style utility files 