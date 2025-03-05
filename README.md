# Question Bank Application

A comprehensive educational application designed for 5-12-year-olds, tutors, teachers, and parents preparing for primary school and 11+ entrance exams.

## Features

- Add new questions to the question bank.
- Fetch existing questions.
- Delete questions from the question bank.

## Project Structure

```
question-bank-app
├── src
│   ├── app.ts                # Entry point of the application
│   ├── controllers
│   │   └── index.ts          # Controller for handling question-related requests
│   ├── models
│   │   └── question.ts        # Model defining the structure of a question
│   ├── routes
│   │   └── index.ts          # Route definitions for the application
│   ├── services
│   │   └── questionService.ts  # Service for managing questions
│   └── types
│       └── index.ts          # Type definitions for questions
├── package.json               # npm configuration file
├── tsconfig.json              # TypeScript configuration file
└── README.md                  # Project documentation
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd question-bank-app
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage

To start the application, run the following command:
```
npm start
```

The application will be available at `http://localhost:3001`.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.

## License

This project is licensed under the MIT License.

## Deployment & Optimization Guide

This guide provides instructions for optimizing and deploying the Question Bank Application.

### Prerequisites

- Node.js (v16+)
- MongoDB account
- AWS, Vercel, or similar hosting service account
- Basic knowledge of cloud deployment

## 1. Environment Optimization

### Production Environment Variables

Create a `.env.production` file with the following variables:

```
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=24h
SMTP_USER=your_email@example.com
SMTP_PASS=your_email_password
SMTP_FROM=noreply@yourdomain.com
FRONTEND_URL=https://your-production-domain.com
PORT=8080
```

**Security Recommendations:**
- Use a strong, unique JWT_SECRET (at least 32 characters)
- Store sensitive credentials in environment variables, not in code
- Use dedicated email service accounts for production

## 2. Backend Optimization

### Performance Optimizations

1. **Database Indexing**
   ```bash
   # Create indexes for frequently queried fields
   npm run create-indexes
   ```

2. **Implement Caching**
   - Add Redis caching for frequently accessed data
   - Cache question sets and user progress data

3. **API Rate Limiting**
   - Implement rate limiting to prevent abuse
   - Add the following to `backend/server.js`:

   ```javascript
   const rateLimit = require('express-rate-limit');
   
   const apiLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100, // limit each IP to 100 requests per windowMs
     message: 'Too many requests from this IP, please try again later'
   });
   
   // Apply to all API routes
   app.use('/api/', apiLimiter);
   ```

4. **Compression**
   - Add compression middleware:
   
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

## 3. Frontend Optimization

### Build Optimization

1. **Code Splitting**
   - Ensure dynamic imports are used for route-based code splitting
   - Update `frontend/vite.config.ts`:

   ```typescript
   export default defineConfig({
     plugins: [react()],
     build: {
       rollupOptions: {
         output: {
           manualChunks: {
             vendor: ['react', 'react-dom', 'react-router-dom'],
             charts: ['recharts'],
           }
         }
       },
       chunkSizeWarningLimit: 1000,
     },
     // ... other config
   })
   ```

2. **Asset Optimization**
   - Optimize images using compression tools
   - Use WebP format for images where possible
   - Implement lazy loading for images

3. **CSS Optimization**
   - Purge unused CSS
   - Minify CSS files
   - Consider using CSS-in-JS for better tree-shaking

## 4. Deployment Strategy

### Backend Deployment (Node.js)

#### Option 1: AWS Elastic Beanstalk

1. Install the EB CLI:
   ```bash
   pip install awsebcli
   ```

2. Initialize EB application:
   ```bash
   eb init question-bank-app
   ```

3. Create environment:
   ```bash
   eb create production
   ```

4. Deploy:
   ```bash
   eb deploy
   ```

#### Option 2: Heroku

1. Install Heroku CLI:
   ```bash
   npm install -g heroku
   ```

2. Login to Heroku:
   ```bash
   heroku login
   ```

3. Create Heroku app:
   ```bash
   heroku create question-bank-app
   ```

4. Set environment variables:
   ```bash
   heroku config:set NODE_ENV=production JWT_SECRET=your_secret
   ```

5. Deploy:
   ```bash
   git push heroku main
   ```

### Frontend Deployment (React)

#### Option 1: Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   cd frontend
   vercel
   ```

3. For production:
   ```bash
   vercel --prod
   ```

#### Option 2: Netlify

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

3. Deploy:
   ```bash
   netlify deploy --dir=dist
   ```

4. For production:
   ```bash
   netlify deploy --dir=dist --prod
   ```

## 5. Monitoring and Maintenance

### Monitoring Setup

1. **Application Monitoring**
   - Implement New Relic or Datadog for application performance monitoring
   - Set up alerts for critical errors and performance issues

2. **Error Tracking**
   - Implement Sentry for error tracking and reporting
   - Add to backend:
   
   ```javascript
   const Sentry = require('@sentry/node');
   Sentry.init({ dsn: 'your_sentry_dsn' });
   ```

3. **Log Management**
   - Use a centralized logging service like Loggly or Papertrail
   - Implement structured logging for better analysis

### Database Backups

1. **Automated Backups**
   - Set up daily MongoDB Atlas backups
   - Implement a backup retention policy

2. **Backup Testing**
   - Regularly test database restoration process
   - Document the restoration procedure

## 6. Scaling Strategy

### Horizontal Scaling

1. **Load Balancing**
   - Implement load balancing for backend services
   - Use AWS ELB or similar service

2. **Containerization**
   - Dockerize the application for consistent deployment
   - Use Kubernetes for orchestration in high-scale scenarios

### Vertical Scaling

1. **Resource Allocation**
   - Monitor resource usage and adjust server specifications as needed
   - Implement auto-scaling based on usage patterns

## 7. Security Hardening

1. **Security Headers**
   - Implement security headers:
   
   ```javascript
   const helmet = require('helmet');
   app.use(helmet());
   ```

2. **HTTPS Enforcement**
   - Redirect all HTTP traffic to HTTPS
   - Implement HSTS

3. **Regular Security Audits**
   - Conduct regular dependency audits
   - Perform penetration testing

## 8. CI/CD Pipeline

1. **GitHub Actions Setup**
   - Create `.github/workflows/main.yml` for automated testing and deployment
   - Implement staging and production deployment workflows

2. **Testing Integration**
   - Run automated tests before deployment
   - Implement code quality checks

## Getting Started with Development

```bash
# Clone the repository
git clone https://github.com/yourusername/question-bank-app.git

# Install dependencies
npm install
cd frontend && npm install

# Set up environment variables
cp .env.example .env

# Start development servers
npm run dev          # Backend
npm run frontend     # Frontend
```