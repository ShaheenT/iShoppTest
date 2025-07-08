# iShopp - Social Sharing App for Supermarket Specials

## Overview

iShopp is an Instagram-like social sharing application specifically designed for supermarket in-store specials. The platform allows users to discover, share, and interact with real-time special offers from various stores. Built with a modern full-stack architecture using React, Node.js, Express, and PostgreSQL.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API endpoints for CRUD operations
- **Session Management**: Express session handling with PostgreSQL store
- **Error Handling**: Centralized error middleware with structured responses

### Database Strategy
- **Primary Database**: PostgreSQL with persistent cloud hosting
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema evolution
- **Data Validation**: Zod for runtime type checking and validation
- **Data Seeding**: Automatic database population with youth-oriented sample data
- **Connection**: Neon serverless PostgreSQL with websocket support

## Key Components

### Authentication System
- User registration and login endpoints
- Password-based authentication (ready for enhancement with hashing)
- Session-based user management
- User profile management with avatar support

### Deal Management
- CRUD operations for deal posts
- Image upload and storage
- Category-based organization
- Store association and location tracking
- Real-time pricing and discount calculations
- Expiration date handling

### Social Features
- Like/unlike functionality for deals
- Commenting system with user attribution
- Real-time interaction tracking
- Social sharing capabilities

### Shopping Lists
- Personal shopping list management
- Add deals directly to lists
- List item management and organization

### Token Economy
- iShopp token (ITK) reward system
- Token balance tracking per user
- Potential for future gamification features

## Data Flow

1. **User Registration/Login**: Client sends credentials → Server validates → Session created → User data returned
2. **Deal Discovery**: Client requests deals → Server queries database with user context → Formatted deals with interaction status returned
3. **Deal Interaction**: User action (like/comment) → Server updates database → Real-time UI feedback → Query cache invalidation
4. **Deal Creation**: User submits deal form → Validation → Image processing → Database storage → Cache update
5. **Search**: Query input → Server search across deals → Filtered results with user context

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless connection
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI components
- **react-hook-form**: Form state management
- **zod**: Schema validation

### Development Tools
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Replit integration
- **tsx**: TypeScript execution for development

### UI and Styling
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library
- **embla-carousel-react**: Touch-friendly carousels

## Deployment Strategy

### Development Environment
- Vite dev server with HMR for frontend
- TSX for backend development with hot reload
- Integrated error handling and logging
- Replit-specific optimizations for cloud development

### Production Build
- Vite builds optimized frontend bundle
- ESBuild compiles backend to single JavaScript file
- Static assets served from dist/public
- Database migrations handled via Drizzle Kit

### Environment Configuration
- DATABASE_URL for PostgreSQL connection
- NODE_ENV for environment-specific behavior
- Session configuration for production security

## Changelog

- July 02, 2025: Initial setup with in-memory storage
- July 02, 2025: Added PostgreSQL database integration with Drizzle ORM
- July 02, 2025: Enhanced with youth-focused features including TikTok-style interactions, gamification challenges, and social engagement elements

## User Preferences

Preferred communication style: Simple, everyday language.