# WizCuts Backend API

A luxury barber shop backend API built with NestJS, Drizzle ORM, PostgreSQL, and Clerk
authentication.

## Features

- **Authentication**: Clerk-based authentication for secure user management
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **API Documentation**: Swagger/OpenAPI documentation
- **Validation**: Request validation with class-validator
- **CORS**: Configured for frontend integration

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: Clerk
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator

## Setup

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Environment Configuration**:

   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your configuration:
   - Database URL
   - Clerk keys
   - Frontend URL

3. **Database Setup**:

   ```bash
   # Generate migrations
   npm run db:generate

   # Run migrations
   npm run db:migrate
   ```

4. **Start the application**:

   ```bash
   # Development mode
   npm run start:dev

   # Production mode
   npm run start:prod
   ```

## API Endpoints

### Barbers

- `GET /api/barbers` - Get all active barbers
- `GET /api/barbers/:id` - Get barber by ID
- `GET /api/barbers/available?date=YYYY-MM-DD` - Get available barbers for date
- `POST /api/barbers` - Create new barber (Auth required)
- `PATCH /api/barbers/:id` - Update barber (Auth required)
- `DELETE /api/barbers/:id` - Delete barber (Auth required)

### Bookings

- `GET /api/bookings` - Get bookings with filters
- `GET /api/bookings/:id` - Get booking by ID
- `POST /api/bookings` - Create new booking
- `PATCH /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

## Database Schema

### Core Entities

- **Barbers**: Barber profiles with skills and availability
- **Services**: Service catalog with pricing
- **Bookings**: Customer appointments with Clerk user integration
- **Availabilities**: Barber weekly schedule
- **BarberServices**: Many-to-many relationship for barber-specific pricing

## Authentication

The API uses Clerk for authentication. Protected endpoints require a Bearer token:

```
Authorization: Bearer <clerk_session_token>
```

## Development

```bash
# Watch mode
npm run start:dev

# Database studio (visual database browser)
npm run db:studio

# Generate new migration after schema changes
npm run db:generate
```

## API Documentation

When running in development, visit:

- **Swagger UI**: http://localhost:3001/api/docs
- **Database Studio**: http://localhost:4983 (when running `npm run db:studio`)

## Environment Variables

```env
DATABASE_URL=postgresql://username:password@localhost:5432/wizcuts
CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can
take to ensure it runs as efficiently as possible. Check out the
[deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out
[Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau
makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building
features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video
  [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few
  clicks.
- Visualize your application graph and interact with the NestJS application in real-time using
  [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official
  [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and
  [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official
  [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the
amazing backers. If you'd like to join them, please
[read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
