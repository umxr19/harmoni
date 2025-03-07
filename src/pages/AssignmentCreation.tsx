import React, { useState, useEffect } from 'react';
import { Question } from '../types';

interface AssignmentFormData {
  title: string;
  description: string;
  dueDate: string;
  classroomId: string;
  questions: Question[];
  searchQuery?: string;
  categories?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
}

const AssignmentCreation: React.FC = () => {
  const [formData, setFormData] = useState<AssignmentFormData>({
    title: '',
    description: '',
    dueDate: '',
    classroomId: '',
    questions: [],
    searchQuery: '',
    categories: [],
    difficulty: undefined
  });

  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    let filtered = [...questions];

    if (formData.searchQuery) {
      const query = formData.searchQuery.toLowerCase();
      filtered = filtered.filter(q => 
        q.title.toLowerCase().includes(query) || 
        q.content.toLowerCase().includes(query)
      );
    }

    if (formData.categories && formData.categories.length > 0) {
      filtered = filtered.filter(q => 
        formData.categories!.some(cat => q.category.includes(cat))
      );
    }

    if (formData.difficulty) {
      filtered = filtered.filter(q => q.difficulty === formData.difficulty);
    }

    setFilteredQuestions(filtered);
  }, [formData.searchQuery, formData.categories, formData.difficulty, questions]);

  const handleSearch = (query: string) => {
    setFormData(prev => ({ ...prev, searchQuery: query }));
  };

  const handleCategoryChange = (category: string) => {
    const updatedCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    
    setSelectedCategories(updatedCategories);
    setFormData(prev => ({ ...prev, categories: updatedCategories }));
  };

  // ... rest of the component code ...

  return (
    <div>
      {/* Component JSX */}
    </div>
  );
};

export default AssignmentCreation; 