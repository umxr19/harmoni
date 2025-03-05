# API Troubleshooting Guide

This document provides guidance on troubleshooting common API issues in the Harmoni platform.

## Recent Enhancements

We've implemented several improvements to address 401 Unauthorized and 404 Not Found errors:

### Authentication Enhancements

1. **Enhanced Authentication Middleware**
   - Added detailed logging of authentication attempts
   - Improved error messages with specific details about authentication failures
   - Added support for token expiration handling
   - Implemented development mode fallback for easier testing

2. **Frontend Authentication Handling**
   - Updated token retrieval to check multiple storage locations
   - Added automatic redirection to login on authentication failures
   - Improved error logging for authentication issues

### Route Management Improvements

1. **Route-specific Fixes**
   - Added explicit route for `/api/analytics/student/current` to handle current user analytics
   - Fixed parameter handling in analytics controller to properly use the authenticated user's ID

2. **404 Error Prevention**
   - Added a global 404 handler for API routes with detailed error messages
   - Implemented route debugging tools to help identify missing routes

### Error Handling and Logging

1. **Global Error Handler**
   - Created a comprehensive error handler middleware
   - Added support for different error types (validation, cast, duplicate key, JWT)
   - Improved error response format with consistent structure

2. **Request Logging**
   - Added detailed request logging middleware
   - Implemented response time tracking
   - Added logging for request details including headers, body, and parameters

### Debugging Tools

1. **Debug Routes**
   - Added `/api/debug/routes` to list all registered routes
   - Added `/api/debug/auth` to test authentication
   - Added `/api/debug/error/:code` to test error handling
   - Added `/api/debug/headers` to echo request headers

## Troubleshooting Steps

If you encounter API issues, follow these steps:

1. **Check Authentication**
   - Verify that you're sending a valid authentication token
   - Check that the token hasn't expired
   - Use the `/api/debug/auth` endpoint to test authentication

2. **Verify Routes**
   - Use the `/api/debug/routes` endpoint to list all available routes
   - Check that you're using the correct HTTP method (GET, POST, PUT, DELETE)
   - Verify that the route path is correct

3. **Check Request Format**
   - Ensure you're sending the correct data format (JSON)
   - Verify that required parameters are included
   - Use the `/api/debug/headers` endpoint to check your request headers

4. **Review Logs**
   - Check the server logs for detailed error information
   - Look for authentication failures, route mismatches, or validation errors
   - Note any error codes and messages for troubleshooting

## Common Issues and Solutions

### 401 Unauthorized

- **Issue**: Missing or invalid authentication token
- **Solution**: Ensure you're sending a valid token in the Authorization header
- **Example**: `Authorization: Bearer your-token-here`

### 404 Not Found

- **Issue**: Route doesn't exist or is incorrectly formatted
- **Solution**: Check the available routes and ensure you're using the correct path
- **Example**: Use `/api/analytics/student/current` instead of `/api/analytics/current`

### 500 Server Error

- **Issue**: Unexpected error on the server
- **Solution**: Check the server logs for detailed error information
- **Example**: Database connection issues, validation errors, or code exceptions

## Testing API Endpoints

Use the following tools to test API endpoints:

1. **Postman**: Create and save API requests for testing
2. **Browser DevTools**: Check network requests and responses
3. **Curl**: Test API endpoints from the command line

Example curl command to test authentication:

```bash
curl -X GET http://localhost:3000/api/debug/auth \
  -H "Authorization: Bearer your-token-here"
```

## Contact Support

If you continue to experience issues after following these troubleshooting steps, please contact support with the following information:

1. Detailed description of the issue
2. Steps to reproduce the problem
3. Error messages and codes
 