/**
 * Utility functions for generating random encouraging messages
 * for use across different service pages
 */

/**
 * Returns a random message from an array of messages
 * @param messages Array of possible messages
 * @returns A randomly selected message
 */
export const getRandomMessage = (messages: string[]): string => {
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
};

/**
 * Common message collections for different sections
 */
export const messageCollections = {
  // Welcome messages with username placeholder
  welcomeMessages: [
    "Hey there, %USERNAME%! Ready to excel today? 👋",
    "Welcome back, %USERNAME%! Let's achieve greatness 👋",
    "Hello, %USERNAME%! Excited to see you again 👋",
    "Great to see you, %USERNAME%! Let's make progress 👋",
    "Hi %USERNAME%! Your learning journey continues 👋"
  ],
  
  // Dashboard section headings
  dashboardHeadings: {
    progress: [
      "Your learning journey",
      "Progress at a glance",
      "See how far you've come",
      "Your educational growth",
      "Tracking your achievements"
    ],
    upcoming: [
      "What's next for you",
      "Your upcoming challenges",
      "Prepare for what's ahead",
      "Your next learning steps",
      "Upcoming opportunities"
    ],
    performance: [
      "Your academic strengths",
      "Performance insights",
      "Where you're excelling",
      "Your learning metrics",
      "Achievement highlights"
    ],
    recent: [
      "Your latest achievements",
      "Recent learning activities",
      "What you've been working on",
      "Your recent progress",
      "Latest study sessions"
    ],
    classrooms: [
      "Your learning spaces",
      "Connected classrooms",
      "Your educational groups",
      "Learning communities",
      "Your class connections"
    ],
    wellbeing: [
      "Balance & wellness",
      "Mind & body health",
      "Your wellbeing center",
      "Mental fitness tools",
      "Emotional wellness hub"
    ]
  },
  
  // Practice section headings
  practiceHeadings: {
    recommended: [
      "Tailored for your growth",
      "Suggested practice for you",
      "Personalized challenges",
      "Your learning pathway",
      "Recommended for your level"
    ],
    recent: [
      "Continue where you left off",
      "Your recent practice sessions",
      "Pick up from here",
      "Your learning continuity",
      "Recently explored topics"
    ]
  },
  
  // Wellbeing section headings
  wellbeingHeadings: {
    mood: [
      "How are you feeling today?",
      "Your emotions matter to us!",
      "Track your mood journey here",
      "Every feeling is valid and important",
      "Your emotional wellbeing at a glance"
    ],
    study: [
      "Your dedication is inspiring!",
      "Every minute counts toward success",
      "Building knowledge, one hour at a time",
      "Time invested in your bright future",
      "Your commitment shows in these hours"
    ],
    recentMood: [
      "Your mood patterns tell a story",
      "Reflecting on your emotional journey",
      "See how your mood has been trending",
      "Your recent emotional landscape",
      "Tracking your feelings over time"
    ],
    journal: [
      "Your thoughts, captured in time",
      "Reflections of your inner world",
      "Your journey in your own words",
      "Moments of insight and growth",
      "Your personal growth journey"
    ]
  }
};

/**
 * Generates a personalized welcome message with the user's name
 * @param username The user's name (or default if not available)
 * @returns A personalized welcome message
 */
export const getPersonalizedWelcomeMessage = (username: string = 'friend'): string => {
  const message = getRandomMessage(messageCollections.welcomeMessages);
  return message.replace('%USERNAME%', username);
};

/**
 * Generates a set of random headings for a specific page type
 * @param pageType The type of page ('dashboard', 'practice', 'wellbeing', etc.)
 * @returns An object with random headings for each section
 */
export const getRandomHeadings = (pageType: 'dashboard' | 'practice' | 'wellbeing'): Record<string, string> => {
  const headings: Record<string, string> = {};
  
  switch (pageType) {
    case 'dashboard':
      Object.keys(messageCollections.dashboardHeadings).forEach(key => {
        const collection = messageCollections.dashboardHeadings[key as keyof typeof messageCollections.dashboardHeadings];
        headings[key] = getRandomMessage(collection);
      });
      break;
    case 'practice':
      Object.keys(messageCollections.practiceHeadings).forEach(key => {
        const collection = messageCollections.practiceHeadings[key as keyof typeof messageCollections.practiceHeadings];
        headings[key] = getRandomMessage(collection);
      });
      break;
    case 'wellbeing':
      Object.keys(messageCollections.wellbeingHeadings).forEach(key => {
        const collection = messageCollections.wellbeingHeadings[key as keyof typeof messageCollections.wellbeingHeadings];
        headings[key] = getRandomMessage(collection);
      });
      break;
    default:
      break;
  }
  
  return headings;
}; 