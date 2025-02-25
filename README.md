# Question Bank Application

This is a question bank application designed to help students prepare for the 11+ entrance exams. The application allows users to manage a collection of questions, including adding, fetching, and deleting questions.

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

The application will be available at `http://localhost:3000`.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.

## License

This project is licensed under the MIT License.