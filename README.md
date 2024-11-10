# Online Quiz Telegram Bot

This is an online quiz bot for Telegram, developed with Node.js, MongoDB, and TypeScript. Users can take quizzes, track their scores, and receive instant feedback. Admins can create, update, and manage quiz questions directly in MongoDB.

## Features

- **Multiple-choice quizzes**: Users answer questions and receive feedback.
- **Score tracking**: Users’ scores are stored in MongoDB.
- **Admin controls**: Add and manage questions in MongoDB.
- **User-friendly interface**: Interactive commands and buttons for easy navigation.

## Tech Stack

- **Node.js**: Server runtime
- **MongoDB**: Database to store questions and scores
- **TypeScript**: Type-safe JavaScript superset for maintainable code
- **Telegram Bot API**: Interface to interact with users on Telegram

## Getting Started

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org) (v14+)
- [MongoDB](https://www.mongodb.com/) (local or cloud instance)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. Clone this repository:
    ```bash
    git clone https://github.com/yourusername/online-quiz-telegram-bot.git
    cd online-quiz-telegram-bot
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Set up environment variables:

   Create a `.env` file in the root directory and add the following:
   ```plaintext
   BOT_TOKEN=your-telegram-bot-token
   MONGODB_URI=your-mongodb-uri
