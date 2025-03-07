import { StudySchedulePreferences, MoodRating } from '../types';

// ... existing code ...

saveSchedulePreferences: async (preferences: StudySchedulePreferences) => {
  if (isOfflineMode) {
    return mockApi.saveSchedulePreferences(preferences);
  }
  const response = await axios.post('/api/study-schedule/preferences', preferences);
  return response.data;
},

// ... existing code ...

markDayCompleted: async (date: string, mood: number | null = null) => {
  if (isOfflineMode) {
    return mockApi.markDayCompleted(date, mood);
  }
  const response = await axios.post('/api/study-schedule/complete', { date, mood });
  return response.data;
},

// ... existing code ...

const updatedDays = schedule.days.map((day: { date: string }) => {
  if (day.date === date) {
    return { ...day, completed: true };
  }
  return day;
}); 