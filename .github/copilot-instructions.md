# Copilot Instructions for WizCuts Barber Shop

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a luxury barber shop web application with a monorepo structure:
- **Frontend**: Next.js 15.4.1, TypeScript, and Tailwind CSS
- **Backend**: NestJS API with TypeScript, Drizzle ORM, and Supabase
- **Target Audience**: Upscale clients seeking premium grooming experiences

## Project Structure
```
wizcuts/
├── frontend/          # Next.js application
├── backend/           # NestJS API
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── services/      # Business logic
│   │   ├── modules/       # Feature modules
│   │   ├── dto/           # Data transfer objects
│   │   ├── guards/        # Authentication & authorization
│   │   ├── config/        # Configuration services
│   │   └── schema/        # Database schema
│   └── test/          # Test files
└── .github/           # CI/CD workflows
```

## Design Guidelines
- **Color Palette**: Use luxurious, muted colors - deep blues, charcoal, black, gold accents
- **Typography**: Large, well-kerned fonts for headings (serif or clean sans-serif), modern readable body fonts
- **UI/UX**: Elegant, sophisticated design with subtle micro-interactions
- **Responsive**: Flawless experience across all devices

## Code Standards
### Frontend (Next.js)
- Use TypeScript for type safety
- Follow Next.js 15.4.1 App Router conventions
- Implement responsive design with Tailwind CSS
- Create reusable components with proper prop typing
- Use modern React patterns (hooks, function components)
- Ensure accessibility compliance
- Optimize for performance and SEO

### Backend (NestJS)
- Follow NestJS modular architecture principles
- Use dependency injection and decorators
- Implement proper error handling with HTTP exceptions
- Use DTOs for request/response validation
- Follow SOLID principles and clean architecture
- Use TypeScript strict mode
- Implement proper logging with NestJS Logger
- Use environment-based configuration

## Testing Requirements
### Backend Testing Standards
- **Every new feature MUST include comprehensive tests**
- Write unit tests for all services and controllers
- Include integration tests for API endpoints
- Test error scenarios and edge cases
- Maintain minimum 80% code coverage
- Use proper mocking for external dependencies
- Follow the AAA pattern (Arrange, Act, Assert)

### Test Structure
```
test/
├── unit/
│   ├── controllers/   # Controller unit tests
│   ├── services/      # Service unit tests
│   └── guards/        # Guard unit tests
├── integration/       # API integration tests
└── setup.ts          # Global test configuration
```

## Component Structure
### Frontend Components
- Create modular, reusable components
- Use proper naming conventions (PascalCase for components)
- Implement proper error boundaries
- Follow atomic design principles where applicable

## NestJS Module Architecture
### Module Organization
- Group related functionality into feature modules
- Use barrel exports for clean imports
- Implement proper module encapsulation
- Follow single responsibility principle

### Service Layer Guidelines
- Keep business logic in services, not controllers
- Use dependency injection for service dependencies
- Implement proper error handling and logging
- Create service interfaces for better testability

### Controller Guidelines
- Keep controllers thin - delegate to services
- Use proper HTTP status codes
- Implement request validation with DTOs
- Add Swagger documentation with decorators

### Database Integration
- Use Drizzle ORM for type-safe database operations
- Implement proper transaction handling
- Use database migrations for schema changes
- Follow database naming conventions

## Features to Implement
- Hero section with striking visuals
- Service highlights with iconography
- Team member profiles
- Image gallery
- Booking system/waitlist
- Contact information and map integration
- Testimonials carousel
- Social media integration
- Mobile-responsive navigation
