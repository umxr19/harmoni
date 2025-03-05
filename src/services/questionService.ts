import Question, { IQuestion } from '../models/question';

export interface SearchFilters {
    search?: string;
    category?: string[];
    difficulty?: 'easy' | 'medium' | 'hard';
    page?: number;
    limit?: number;
}

class QuestionService {
    private questions: any[] = [];

    public async getAllQuestions(): Promise<any[]> {
        return this.questions;
    }

    public async addQuestion(question: IQuestion): Promise<IQuestion> {
        this.questions.push(question);
        return question;
    }

    public async searchQuestions(filters: SearchFilters): Promise<IQuestion[]> {
        const query: any = {};
        
        if (filters.search) {
            query.$text = { $search: filters.search };
        }
        
        if (filters.category) {
            query.category = { $in: filters.category };
        }
        
        if (filters.difficulty) {
            query.difficulty = filters.difficulty;
        }

        return await Question.find(query)
            .skip((filters.page! - 1) * filters.limit!)
            .limit(filters.limit!);
    }

    public async getCategories(): Promise<string[]> {
        const categories = await Question.distinct('category'); // Assuming 'category' is a field in your Question model
        return categories;
    }

    public async getQuestions(): Promise<IQuestion[]> {
        return await Question.find(); // Fetch all questions
    }

    public async getQuestionById(id: string): Promise<IQuestion | null> {
        return await Question.findById(id); // Fetch question by ID
    }

    public async updateQuestion(id: string, questionData: Partial<IQuestion>): Promise<IQuestion | null> {
        return await Question.findByIdAndUpdate(id, questionData, { new: true }); // Update question
    }

    public async deleteQuestion(id: string): Promise<IQuestion | null> {
        return await Question.findByIdAndDelete(id); // Delete question
    }
}

export default QuestionService;
