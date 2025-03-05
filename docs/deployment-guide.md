# Question Bank Application Deployment Guide

This guide provides detailed instructions for deploying the Question Bank Application to various environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Continuous Integration/Continuous Deployment](#continuous-integrationcontinuous-deployment)
7. [Monitoring and Maintenance](#monitoring-and-maintenance)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have the following:

- Node.js (v16+) installed
- MongoDB Atlas account (or other MongoDB hosting)
- AWS, Heroku, or Vercel account for hosting
- Domain name (optional but recommended)
- SSL certificate (for HTTPS)
- Stripe account (for payment processing)

## Environment Setup

### Environment Variables

Create appropriate environment files for each environment:

- `.env.development` - Local development
- `.env.staging` - Staging environment
- `.env.production` - Production environment

Ensure each file contains the necessary variables with appropriate values for that environment.

### Security Considerations

1. **JWT Secret**
   - Use a strong, unique JWT secret for each environment
   - Minimum 32 characters recommended
   - Example: `openssl rand -base64 32`

2. **Database Credentials**
   - Use separate database users for each environment
   - Restrict permissions to only what's necessary
   - Use strong passwords

3. **API Keys**
   - Use test API keys for development/staging
   - Use production API keys only in production
   - Never commit API keys to version control

## Database Setup

### MongoDB Atlas Setup

1. **Create a Cluster**
   ```
   - Log in to MongoDB Atlas
   - Create a new project (if needed)
   - Build a new cluster
   - Choose your preferred cloud provider and region
   ```

2. **Configure Database Access**
   ```
   - Create a database user with appropriate permissions
   - Set a strong password
   - Restrict network access or whitelist IPs
   ```

3. **Create Collections**
   ```
   - Connect to your cluster
   - Create a new database (e.g., 'question-bank')
   - Create initial collections:
     - users
     - questions
     - exams
     - attempts
     - classrooms
     - products
     - purchases
   ```

4. **Create Indexes**
   ```
   - Run the create-indexes script:
     npm run create-indexes
   ```

## Backend Deployment

### Option 1: Heroku Deployment

1. **Create Heroku App**
   ```bash
   heroku create question-bank-app
   ```

2. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your_mongodb_uri
   heroku config:set JWT_SECRET=your_jwt_secret
   # Set all other environment variables
   ```

3. **Deploy Application**
   ```bash
   git push heroku main
   ```

4. **Scale Dynos (Optional)**
   ```bash
   heroku ps:scale web=1
   ```

### Option 2: AWS Elastic Beanstalk

1. **Initialize EB Application**
   ```bash
   eb init question-bank-app
   ```

2. **Create Environment**
   ```bash
   eb create production
   ```

3. **Set Environment Variables**
   ```bash
   eb setenv NODE_ENV=production MONGODB_URI=your_mongodb_uri JWT_SECRET=your_jwt_secret
   ```

4. **Deploy Application**
   ```bash
   eb deploy
   ```

### Option 3: Docker Deployment

1. **Build Docker Image**
   ```bash
   docker build -t question-bank-backend .
   ```

2. **Run Container**
   ```bash
   docker run -p 8080:8080 --env-file .env.production question-bank-backend
   ```

3. **Docker Compose (Full Stack)**
   ```bash
   docker-compose -f docker-compose.yml up -d
   ```

## Frontend Deployment

### Option 1: Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy to Vercel**
   ```bash
   cd frontend
   vercel
   ```

3. **Deploy to Production**
   ```bash
   vercel --prod
   ```

4. **Configure Environment Variables**
   - Set `REACT_APP_API_URL` to your backend API URL
   - Set other environment variables as needed

### Option 2: Netlify Deployment

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

3. **Deploy to Netlify**
   ```bash
   netlify deploy --dir=dist
   ```

4. **Deploy to Production**
   ```bash
   netlify deploy --dir=dist --prod
   ```

5. **Configure Environment Variables**
   - In Netlify dashboard, set environment variables
   - Set up redirects for SPA routing

## Continuous Integration/Continuous Deployment

### GitHub Actions Setup

1. **Create Workflow File**
   - Use the provided `.github/workflows/main.yml`
   - Customize as needed for your specific requirements

2. **Set Up Secrets**
   - In GitHub repository settings, add secrets:
     - `HEROKU_API_KEY`
     - `HEROKU_EMAIL`
     - `VERCEL_TOKEN`
     - `VERCEL_ORG_ID`
     - `VERCEL_PROJECT_ID`

3. **Configure Branch Protection**
   - Require status checks to pass before merging
   - Require pull request reviews

### Automated Testing

1. **Unit Tests**
   ```bash
   npm test
   ```

2. **Integration Tests**
   ```bash
   npm run test:integration
   ```

3. **End-to-End Tests**
   ```bash
   npm run test:e2e
   ```

## Monitoring and Maintenance

### Application Monitoring

1. **Set Up New Relic**
   - Create New Relic account
   - Install New Relic agent
   - Configure monitoring

2. **Set Up Sentry for Error Tracking**
   - Create Sentry account
   - Install Sentry SDK
   - Configure error reporting

### Database Monitoring

1. **MongoDB Atlas Monitoring**
   - Enable performance alerts
   - Set up database metrics monitoring
   - Configure backup schedule

### Log Management

1. **Centralized Logging**
   - Set up Papertrail or similar service
   - Configure log forwarding
   - Set up log retention policies

### Regular Maintenance Tasks

1. **Database Maintenance**
   ```bash
   # Run database cleanup script monthly
   npm run db:cleanup
   
   # Verify database indexes
   npm run db:verify-indexes
   ```

2. **Dependency Updates**
   ```bash
   # Check for outdated dependencies
   npm outdated
   
   # Update dependencies
   npm update
   
   # Run security audit
   npm audit fix
   ```

## Troubleshooting

### Common Issues

1. **Connection Issues**
   - Check MongoDB connection string
   - Verify network access settings
   - Check for firewall restrictions

2. **Authentication Issues**
   - Verify JWT secret is correctly set
   - Check token expiration settings
   - Ensure cookies are properly configured

3. **Performance Issues**
   - Check database indexes
   - Verify rate limiting settings
   - Monitor server resources

### Debugging Tools

1. **Backend Logs**
   ```bash
   heroku logs --tail  # For Heroku
   eb logs             # For Elastic Beanstalk
   docker logs <container_id>  # For Docker
   ```

2. **Frontend Debugging**
   - Use browser developer tools
   - Check network requests
   - Verify environment variables

### Support Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Heroku Documentation](https://devcenter.heroku.com/)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)
- [Docker Documentation](https://docs.docker.com/)

## Conclusion

Following this deployment guide will help you successfully deploy the Question Bank Application to your chosen environment. Remember to regularly monitor the application, perform maintenance tasks, and keep dependencies updated for optimal performance and security. 