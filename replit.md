# JavaScript Quiz Application

## Overview

This is a modern, interactive JavaScript quiz application built with React, TypeScript, and Express. The app allows developers to test their JavaScript knowledge through carefully crafted questions with immediate feedback and detailed explanations. It features a clean, responsive design and provides comprehensive analytics on user performance.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: React Context API for quiz state management
- **Data Fetching**: TanStack React Query for server state management
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **API Design**: RESTful APIs with JSON responses
- **Session Management**: Token-based quiz sessions
- **Error Handling**: Centralized error middleware

### Database Schema
The application uses a PostgreSQL database with the following key entities:
- **Categories**: Question categories (JavaScript Basics, etc.)
- **Difficulties**: Easy, Medium, Hard with point values
- **Questions**: Quiz questions with code examples and explanations
- **Options**: Multiple choice answers for each question
- **Users**: Anonymous user tracking
- **Quiz Sessions**: Individual quiz attempts with tokens
- **Answers**: User responses to questions
- **Question Stats**: Performance analytics per question

## Key Components

### Quiz Flow Management
- **QuizProvider**: Context provider managing quiz state across components
- **Quiz State**: Tracks current question, user answers, score, and session data
- **Session Management**: Token-based sessions for tracking individual quiz attempts

### User Interface Components
- **QuestionCard**: Displays questions with syntax-highlighted code blocks
- **ProgressBar**: Visual progress indicator with smooth animations
- **Timer**: Real-time timer tracking time spent per question
- **FeedbackModal**: Immediate feedback with explanations after each answer
- **ShareModal**: Social sharing functionality for quiz results

### Data Management
- **Storage Interface**: Abstracted database operations with comprehensive methods
- **Query Optimization**: Efficient random question selection and caching
- **Analytics**: Real-time statistics tracking for question performance

## Data Flow

1. **Quiz Initialization**: User starts quiz → creates anonymous session → fetches random questions
2. **Question Display**: Questions loaded with options, category, and difficulty metadata
3. **Answer Submission**: User selects answer → validates against correct option → provides immediate feedback
4. **Progress Tracking**: Each answer updates session state, score, and analytics
5. **Results Generation**: Quiz completion → calculates performance metrics → generates shareable results
6. **Analytics Update**: Question statistics updated for future difficulty balancing

## External Dependencies

### Database
- **Neon PostgreSQL**: Serverless PostgreSQL database for scalable data storage
- **Drizzle ORM**: Type-safe database queries with schema validation
- **Connection Pooling**: Optimized database connections for performance

### UI Libraries
- **Radix UI**: Accessible, unstyled UI primitives for complex components
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Lucide Icons**: Consistent icon library for visual elements

### Development Tools
- **TypeScript**: Static type checking across frontend and backend
- **Vite**: Fast build tool with Hot Module Replacement
- **TanStack Query**: Powerful data synchronization and caching

## Deployment Strategy

### Build Process
- **Client Build**: Vite builds React app to static files in `dist/public`
- **Server Build**: ESBuild bundles Express server to `dist/index.js`
- **Environment**: Production/development modes with appropriate optimizations

### Development Workflow
- **Hot Reload**: Vite middleware integrated with Express for seamless development
- **Database Migrations**: Drizzle Kit handles schema changes and migrations
- **Error Handling**: Development error overlay with runtime error modal

### Production Considerations
- **Static Serving**: Express serves built React app as static files
- **Database Connection**: Environment-based DATABASE_URL configuration
- **Session Security**: Secure token generation for quiz sessions
- **Performance**: Optimized queries and efficient state management

The application follows a modern full-stack architecture with clear separation of concerns, type safety throughout, and optimized user experience with immediate feedback and smooth interactions.