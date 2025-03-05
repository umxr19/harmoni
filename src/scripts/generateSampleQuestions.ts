import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Question from '../models/question';
import logger from '../utils/logger';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/question-bank')
  .then(() => logger.info('Connected to MongoDB'))
  .catch(err => logger.error('MongoDB connection error:', err));

const sampleQuestions = [
  // Verbal Reasoning Questions (10)
  {
    question: "What is the relationship between 'book' and 'read' similar to the relationship between 'food' and...?",
    options: [
      { text: "Cook", isCorrect: false },
      { text: "Eat", isCorrect: true },
      { text: "Recipe", isCorrect: false },
      { text: "Hungry", isCorrect: false }
    ],
    explanation: "The relationship is action performed with the object. You read a book, and you eat food.",
    category: ["Verbal Reasoning"],
    subCategory: "Word Analogies",
    difficulty: "easy",
    estimatedTime: 30
  },
  {
    question: "Find the word that means the opposite of 'generous':",
    options: [
      { text: "Kind", isCorrect: false },
      { text: "Giving", isCorrect: false },
      { text: "Stingy", isCorrect: true },
      { text: "Wealthy", isCorrect: false }
    ],
    explanation: "Stingy means unwilling to spend or give, which is the opposite of generous.",
    category: ["Verbal Reasoning"],
    subCategory: "Antonyms",
    difficulty: "easy",
    estimatedTime: 25
  },
  {
    question: "Complete the sequence: A, C, E, G, ?",
    options: [
      { text: "H", isCorrect: false },
      { text: "I", isCorrect: true },
      { text: "J", isCorrect: false },
      { text: "K", isCorrect: false }
    ],
    explanation: "The sequence consists of alternate letters of the alphabet. A, C, E, G, I.",
    category: ["Verbal Reasoning"],
    subCategory: "Letter Sequences",
    difficulty: "medium",
    estimatedTime: 40
  },
  {
    question: "If 'FRIEND' is coded as 'GSJFOE', how would 'CANDLE' be coded?",
    options: [
      { text: "DBOEMF", isCorrect: true },
      { text: "DBOEFM", isCorrect: false },
      { text: "DECANL", isCorrect: false },
      { text: "DCAENL", isCorrect: false }
    ],
    explanation: "Each letter is replaced with the next letter in the alphabet. C→D, A→B, N→O, etc.",
    category: ["Verbal Reasoning"],
    subCategory: "Coding",
    difficulty: "medium",
    estimatedTime: 45
  },
  {
    question: "Which word does not belong in this group?",
    options: [
      { text: "Apple", isCorrect: false },
      { text: "Banana", isCorrect: false },
      { text: "Carrot", isCorrect: true },
      { text: "Orange", isCorrect: false }
    ],
    explanation: "Carrot is a vegetable, while all others are fruits.",
    category: ["Verbal Reasoning"],
    subCategory: "Classification",
    difficulty: "easy",
    estimatedTime: 30
  },
  {
    question: "Find the missing word: Sky is to blue as grass is to...",
    options: [
      { text: "Long", isCorrect: false },
      { text: "Green", isCorrect: true },
      { text: "Soft", isCorrect: false },
      { text: "Ground", isCorrect: false }
    ],
    explanation: "Blue is the typical color of the sky, and green is the typical color of grass.",
    category: ["Verbal Reasoning"],
    subCategory: "Word Analogies",
    difficulty: "easy",
    estimatedTime: 25
  },
  {
    question: "If you rearrange the letters 'CIFAIPC', you would have the name of a:",
    options: [
      { text: "City", isCorrect: false },
      { text: "Country", isCorrect: false },
      { text: "Ocean", isCorrect: true },
      { text: "Animal", isCorrect: false }
    ],
    explanation: "The letters rearranged spell 'PACIFIC', which is an ocean.",
    category: ["Verbal Reasoning"],
    subCategory: "Anagrams",
    difficulty: "hard",
    estimatedTime: 50
  },
  {
    question: "Complete the sequence: 1, 4, 9, 16, 25, ?",
    options: [
      { text: "30", isCorrect: false },
      { text: "36", isCorrect: true },
      { text: "40", isCorrect: false },
      { text: "49", isCorrect: false }
    ],
    explanation: "These are square numbers: 1², 2², 3², 4², 5², and the next is 6² = 36.",
    category: ["Verbal Reasoning"],
    subCategory: "Number Sequences",
    difficulty: "medium",
    estimatedTime: 40
  },
  {
    question: "Which word means the same as 'benevolent'?",
    options: [
      { text: "Kind", isCorrect: true },
      { text: "Strict", isCorrect: false },
      { text: "Clever", isCorrect: false },
      { text: "Wealthy", isCorrect: false }
    ],
    explanation: "Benevolent means kind or charitable, showing goodwill.",
    category: ["Verbal Reasoning"],
    subCategory: "Synonyms",
    difficulty: "hard",
    estimatedTime: 35
  },
  {
    question: "If it takes 5 machines 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?",
    options: [
      { text: "5 minutes", isCorrect: true },
      { text: "100 minutes", isCorrect: false },
      { text: "20 minutes", isCorrect: false },
      { text: "500 minutes", isCorrect: false }
    ],
    explanation: "Each machine makes 1 widget in 5 minutes. So 100 machines will make 100 widgets in 5 minutes.",
    category: ["Verbal Reasoning"],
    subCategory: "Word Problems",
    difficulty: "hard",
    estimatedTime: 60
  },

  // Non-Verbal Reasoning Questions (5)
  {
    question: "Which shape comes next in this sequence?",
    options: [
      { text: "Triangle", isCorrect: false },
      { text: "Square", isCorrect: false },
      { text: "Circle", isCorrect: true },
      { text: "Pentagon", isCorrect: false }
    ],
    explanation: "The sequence follows: Triangle, Square, Pentagon, Triangle, Square, Pentagon... so Circle is not part of the pattern.",
    category: ["Non-Verbal Reasoning"],
    subCategory: "Pattern Recognition",
    difficulty: "medium",
    estimatedTime: 45,
    imageUrl: "https://example.com/pattern1.jpg" // You would need actual image URLs
  },
  {
    question: "Which is the odd one out?",
    options: [
      { text: "Image A", isCorrect: false },
      { text: "Image B", isCorrect: true },
      { text: "Image C", isCorrect: false },
      { text: "Image D", isCorrect: false }
    ],
    explanation: "Image B is the only one where the shapes are not symmetrically arranged.",
    category: ["Non-Verbal Reasoning"],
    subCategory: "Odd One Out",
    difficulty: "medium",
    estimatedTime: 50,
    imageUrl: "https://example.com/oddoneout1.jpg"
  },
  {
    question: "If the paper shape is folded as shown, which resulting shape would you see?",
    options: [
      { text: "Shape A", isCorrect: false },
      { text: "Shape B", isCorrect: false },
      { text: "Shape C", isCorrect: true },
      { text: "Shape D", isCorrect: false }
    ],
    explanation: "When folded along the dotted lines, the resulting shape would be C due to the overlapping sections.",
    category: ["Non-Verbal Reasoning"],
    subCategory: "Spatial Awareness",
    difficulty: "hard",
    estimatedTime: 60,
    imageUrl: "https://example.com/folding1.jpg"
  },
  {
    question: "Which cube can be made from this net?",
    options: [
      { text: "Cube A", isCorrect: false },
      { text: "Cube B", isCorrect: true },
      { text: "Cube C", isCorrect: false },
      { text: "Cube D", isCorrect: false }
    ],
    explanation: "When folded, the net creates Cube B with the correct arrangement of faces.",
    category: ["Non-Verbal Reasoning"],
    subCategory: "Spatial Awareness",
    difficulty: "hard",
    estimatedTime: 55,
    imageUrl: "https://example.com/net1.jpg"
  },
  {
    question: "Which image completes the sequence?",
    options: [
      { text: "Image A", isCorrect: false },
      { text: "Image B", isCorrect: false },
      { text: "Image C", isCorrect: true },
      { text: "Image D", isCorrect: false }
    ],
    explanation: "The pattern rotates 90° clockwise each time while alternating between black and white sections.",
    category: ["Non-Verbal Reasoning"],
    subCategory: "Sequence Problems",
    difficulty: "medium",
    estimatedTime: 50,
    imageUrl: "https://example.com/sequence1.jpg"
  },

  // Mathematics Questions (10)
  {
    question: "Calculate: 24 × 7 - 36 ÷ 4",
    options: [
      { text: "159", isCorrect: false },
      { text: "168", isCorrect: false },
      { text: "177", isCorrect: true },
      { text: "186", isCorrect: false }
    ],
    explanation: "Following order of operations: 24 × 7 - 36 ÷ 4 = 168 - 9 = 177",
    category: ["Mathematics"],
    subCategory: "Arithmetic Operations",
    difficulty: "medium",
    estimatedTime: 45
  },
  {
    question: "What is 3/4 of 240?",
    options: [
      { text: "160", isCorrect: false },
      { text: "180", isCorrect: true },
      { text: "190", isCorrect: false },
      { text: "210", isCorrect: false }
    ],
    explanation: "3/4 of 240 = 3 × 240 ÷ 4 = 720 ÷ 4 = 180",
    category: ["Mathematics"],
    subCategory: "Fractions",
    difficulty: "easy",
    estimatedTime: 30
  },
  {
    question: "If a shirt costs £24 and is discounted by 25%, what is the sale price?",
    options: [
      { text: "£16", isCorrect: false },
      { text: "£18", isCorrect: true },
      { text: "£19", isCorrect: false },
      { text: "£20", isCorrect: false }
    ],
    explanation: "25% of £24 is £6. So the sale price is £24 - £6 = £18.",
    category: ["Mathematics"],
    subCategory: "Percentages",
    difficulty: "easy",
    estimatedTime: 40
  },
  {
    question: "The perimeter of a square is 36cm. What is its area?",
    options: [
      { text: "36cm²", isCorrect: false },
      { text: "64cm²", isCorrect: false },
      { text: "81cm²", isCorrect: true },
      { text: "100cm²", isCorrect: false }
    ],
    explanation: "Perimeter = 4 × side, so side = 36 ÷ 4 = 9cm. Area = side² = 9² = 81cm².",
    category: ["Mathematics"],
    subCategory: "Geometry",
    difficulty: "medium",
    estimatedTime: 45
  },
  {
    question: "A train travels at 60 miles per hour. How far will it travel in 2.5 hours?",
    options: [
      { text: "120 miles", isCorrect: false },
      { text: "150 miles", isCorrect: true },
      { text: "180 miles", isCorrect: false },
      { text: "200 miles", isCorrect: false }
    ],
    explanation: "Distance = Speed × Time = 60 × 2.5 = 150 miles",
    category: ["Mathematics"],
    subCategory: "Word Problems",
    difficulty: "easy",
    estimatedTime: 35
  },
  {
    question: "What is the value of x in the equation 3x + 7 = 22?",
    options: [
      { text: "5", isCorrect: true },
      { text: "6", isCorrect: false },
      { text: "7", isCorrect: false },
      { text: "8", isCorrect: false }
    ],
    explanation: "3x + 7 = 22, so 3x = 15, therefore x = 5",
    category: ["Mathematics"],
    subCategory: "Algebra",
    difficulty: "medium",
    estimatedTime: 40
  },
  {
    question: "What is the next number in this sequence: 2, 6, 12, 20, 30, ?",
    options: [
      { text: "36", isCorrect: false },
      { text: "40", isCorrect: false },
      { text: "42", isCorrect: true },
      { text: "48", isCorrect: false }
    ],
    explanation: "The differences between consecutive terms are 4, 6, 8, 10, 12. So the next number is 30 + 12 = 42.",
    category: ["Mathematics"],
    subCategory: "Number Sequences",
    difficulty: "hard",
    estimatedTime: 50
  },
  {
    question: "A rectangle has a length of 12cm and a width of 8cm. What is its area?",
    options: [
      { text: "20cm²", isCorrect: false },
      { text: "40cm²", isCorrect: false },
      { text: "96cm²", isCorrect: true },
      { text: "120cm²", isCorrect: false }
    ],
    explanation: "Area of rectangle = length × width = 12 × 8 = 96cm²",
    category: ["Mathematics"],
    subCategory: "Geometry",
    difficulty: "easy",
    estimatedTime: 30
  },
  {
    question: "If 5 apples cost £1.25, how much would 8 apples cost?",
    options: [
      { text: "£1.60", isCorrect: false },
      { text: "£2.00", isCorrect: true },
      { text: "£2.25", isCorrect: false },
      { text: "£2.50", isCorrect: false }
    ],
    explanation: "Cost per apple = £1.25 ÷ 5 = £0.25. So 8 apples cost 8 × £0.25 = £2.00",
    category: ["Mathematics"],
    subCategory: "Word Problems",
    difficulty: "medium",
    estimatedTime: 45
  },
  {
    question: "What is 15% of 240?",
    options: [
      { text: "24", isCorrect: false },
      { text: "36", isCorrect: true },
      { text: "42", isCorrect: false },
      { text: "48", isCorrect: false }
    ],
    explanation: "15% of 240 = 0.15 × 240 = 36",
    category: ["Mathematics"],
    subCategory: "Percentages",
    difficulty: "medium",
    estimatedTime: 40
  },

  // English Questions (5)
  {
    question: "Read the passage: 'The old man walked slowly through the park, watching the children play. He smiled as he remembered his own childhood days.' What is the main emotion felt by the old man?",
    options: [
      { text: "Sadness", isCorrect: false },
      { text: "Anger", isCorrect: false },
      { text: "Nostalgia", isCorrect: true },
      { text: "Fear", isCorrect: false }
    ],
    explanation: "The old man is smiling as he remembers his childhood, indicating nostalgia (fond memories of the past).",
    category: ["English"],
    subCategory: "Comprehension",
    difficulty: "medium",
    estimatedTime: 50
  },
  {
    question: "Which sentence contains a grammatical error?",
    options: [
      { text: "She went to the store yesterday.", isCorrect: false },
      { text: "They're going to they're favorite restaurant.", isCorrect: true },
      { text: "The children played in the garden.", isCorrect: false },
      { text: "He has been working hard all day.", isCorrect: false }
    ],
    explanation: "The second 'they're' should be 'their' (possessive form).",
    category: ["English"],
    subCategory: "Grammar",
    difficulty: "medium",
    estimatedTime: 35
  },
  {
    question: "Choose the word that best completes the sentence: 'The detective found a ____ of evidence at the crime scene.'",
    options: [
      { text: "piece", isCorrect: false },
      { text: "wealth", isCorrect: false },
      { text: "pile", isCorrect: false },
      { text: "plethora", isCorrect: true }
    ],
    explanation: "'Plethora' means a large or excessive amount, which best fits the context of finding a lot of evidence.",
    category: ["English"],
    subCategory: "Vocabulary",
    difficulty: "hard",
    estimatedTime: 40
  },
  {
    question: "Where should the comma be placed in this sentence? 'After finishing dinner the family watched a movie.'",
    options: [
      { text: "After 'After'", isCorrect: false },
      { text: "After 'finishing'", isCorrect: false },
      { text: "After 'dinner'", isCorrect: true },
      { text: "No comma needed", isCorrect: false }
    ],
    explanation: "A comma is needed after 'dinner' to separate the introductory clause from the main clause.",
    category: ["English"],
    subCategory: "Punctuation",
    difficulty: "easy",
    estimatedTime: 30
  },
  {
    question: "Read the passage: 'The sun was setting, casting long shadows across the field. Sarah watched as the sky turned from blue to orange to deep purple.' What time of day is described?",
    options: [
      { text: "Morning", isCorrect: false },
      { text: "Midday", isCorrect: false },
      { text: "Evening", isCorrect: true },
      { text: "Midnight", isCorrect: false }
    ],
    explanation: "The passage describes a sunset with the sky changing colors, which happens in the evening.",
    category: ["English"],
    subCategory: "Comprehension",
    difficulty: "easy",
    estimatedTime: 35
  }
];

const importQuestions = async () => {
  try {
    // Clear existing questions (optional)
    // await Question.deleteMany({});
    
    // Insert sample questions
    await Question.insertMany(sampleQuestions);
    
    logger.info(`Successfully imported ${sampleQuestions.length} sample questions`);
    mongoose.disconnect();
  } catch (error) {
    logger.error('Error generating sample questions:', error);
    mongoose.disconnect();
  }
};

importQuestions(); 