class QuestionService {
    private questions: any[] = [];

    public async getAllQuestions(): Promise<any[]> {
        return this.questions;
    }

    public async addQuestion(question: any): Promise<any> {
        this.questions.push(question);
        return question;
    }
}

export default QuestionService;
