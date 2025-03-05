# Wellbeing Features

This document provides an overview of the wellbeing features implemented in the Harmoni application.

## Features Overview

The wellbeing suite includes:

1. **Mood Tracking**: Allows users to record their mood using emoji ratings after completing exams or practice sessions.
2. **Journal**: Enables users to write journal entries with tags to reflect on their learning experiences.
3. **Wellbeing Suite Dashboard**: Provides an overview of mood trends and journal entries.

## Components

### Mood Rating

- **MoodRatingModal**: A modal dialog that appears after completing exams or practice sessions, allowing users to rate their mood.
- **MoodRatingService**: A service component that determines when to show the mood rating modal.

### Journal

- **Journal**: A component that allows users to create and view journal entries with tags.
- **JournalPage**: A page component that wraps the Journal component with authentication.

### Wellbeing Suite

- **WellbeingSuite**: A dashboard component that displays mood trends and recent journal entries.
- **WellbeingSuitePage**: A page component that wraps the WellbeingSuite component with authentication.

## API Endpoints

The wellbeing features use the following API endpoints:

### Mood Rating

- `GET /api/wellbeing/mood-ratings`: Get mood ratings for a specific timeframe
- `POST /api/wellbeing/mood-ratings`: Submit a new mood rating

### Journal

- `GET /api/wellbeing/journal`: Get journal entries for a specific timeframe
- `POST /api/wellbeing/journal`: Create a new journal entry
- `DELETE /api/wellbeing/journal/:id`: Delete a journal entry

### Wellbeing Summary

- `GET /api/wellbeing/summary`: Get a summary of wellbeing data including mood trends and journal statistics

## Integration Points

The wellbeing features are integrated into the application at the following points:

1. **Navigation**: Added to the main navigation menu
2. **Dashboard**: Added as a section on the student dashboard
3. **Exam/Practice Results**: Mood rating prompts appear after completing exams or practice sessions

## Future Enhancements

Potential future enhancements for the wellbeing features include:

1. **Mood Correlations**: Analyze correlations between mood ratings and academic performance
2. **Wellbeing Insights**: Provide insights and recommendations based on mood trends
3. **Guided Reflections**: Add guided reflection prompts for journal entries
4. **Wellbeing Resources**: Include resources for managing stress and anxiety related to studying
5. **Teacher Insights**: Allow teachers to view anonymized wellbeing data for their classes 