# WizCuts Barber Shop

A luxury barber shop web application built with Next.js 15.4.1, NestJS, and modern web technologies. This application provides an elegant, sophisticated experience for upscale clients seeking premium grooming services.

## 🚀 Features

- **Modern Frontend**: Next.js 15.4.1 with TypeScript and Tailwind CSS
- **Robust Backend**: NestJS with Drizzle ORM and PostgreSQL
- **Real-time Updates**: Supabase integration for live booking updates
- **Authentication**: Clerk integration for secure user management (✅ Implemented)
- **Booking Flow**: Sign-in required only for appointment confirmation
- **Responsive Design**: Mobile-first approach with elegant UI/UX
- **Booking System**: Interactive appointment scheduling
- **Service Management**: Dynamic service listings with pricing
- **Team Profiles**: Professional barber showcases
- **Gallery**: High-quality image showcase
- **Quality Assurance**: Comprehensive testing with SonarQube integration

## 🏗️ Architecture

### Frontend

- **Framework**: Next.js 15.4.1 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives
- **Animations**: Framer Motion
- **State Management**: React hooks and context

### Backend

- **Framework**: NestJS
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Clerk
- **Real-time**: Supabase for live updates
- **API Documentation**: Swagger/OpenAPI
- **Validation**: Class-validator and class-transformer

### Infrastructure

- **Frontend Deployment**: Vercel
- **Database**: PostgreSQL (production), Supabase (real-time features)
- **Storage**: Supabase Storage with local fallback
- **CI/CD**: GitHub Actions
- **Quality Analysis**: SonarQube Cloud
- **Security Scanning**: Trivy

## 🛠️ Development Setup

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- npm or yarn

### Environment Variables

#### Frontend (.env.local)

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### Backend (.env)

```env
DATABASE_URL=postgresql://username:password@localhost:5432/wizcuts
CLERK_SECRET_KEY=your_clerk_secret_key
JWT_SECRET=your_jwt_secret
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/wizcuts.git
   cd wizcuts
   ```

2. **Install frontend dependencies**

   ```bash
   cd frontend
   npm install
   ```

3. **Install backend dependencies**

   ```bash
   cd ../backend
   npm install
   ```

4. **Setup database**

   ```bash
   # Create database
   createdb wizcuts
   
   # Run migrations
   npm run db:push
   ```

5. **Start development servers**

   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run start:dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

The application will be available at:

- Frontend: <http://localhost:3000>
- Backend API: <http://localhost:3001>
- API Documentation: <http://localhost:3001/api>

## 🧪 Testing

### Frontend Testing

```bash
cd frontend
npm test                # Run Jest unit tests
npm run test:coverage   # Run with coverage
npm run test:watch      # Run in watch mode
npm run e2e             # Run Playwright E2E tests
npm run e2e:ui          # Run E2E tests with UI
npm run e2e:debug       # Debug E2E tests
```

### Backend Testing

```bash
cd backend
npm test                # Run tests
npm run test:coverage   # Run with coverage
npm run test:e2e        # Run e2e tests
```

### End-to-End Testing

The project uses Playwright for comprehensive E2E testing. See [E2E Testing Documentation](frontend/E2E_TESTING.md) for detailed setup and usage instructions.

```bash
cd frontend
npm run e2e:install     # Install Playwright browsers
npm run e2e             # Run all E2E tests
npm run e2e:report      # View test results
```

### Coverage Targets

- **Frontend**: 70% coverage threshold
- **Backend**: 60% coverage threshold
- **Current Status**: 40.89% overall coverage (targeting 80%)

## 📊 Code Quality

We use SonarQube Cloud for comprehensive code quality analysis:

- **Security**: Vulnerability detection and security hotspots
- **Maintainability**: Code smells and technical debt
- **Reliability**: Bug detection and reliability rating
- **Coverage**: Test coverage tracking and reporting

### Setup SonarQube

See [SonarQube Setup Guide](docs/SONARQUBE_SETUP.md) for detailed configuration instructions.

## 🚀 Deployment

### Staging

- **Branch**: `develop`
- **URL**: <https://wizcuts-staging.vercel.app>
- **Trigger**: Automatic on push to develop

### Production

- **Branch**: `main`
- **URL**: <https://wizcuts.com>
- **Trigger**: Automatic on push to main

### CI/CD Pipeline

The GitHub Actions workflow includes:

1. Frontend tests and coverage
2. Backend tests and coverage
3. SonarQube quality analysis
4. Security scanning with Trivy
5. Automated deployment to Vercel

## 📁 Project Structure

```
wizcuts/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # Reusable UI components
│   │   ├── lib/            # Utility functions
│   │   └── styles/         # Global styles
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # NestJS backend application
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   ├── common/         # Shared utilities
│   │   └── main.ts         # Application entry point
│   ├── test/               # Test files
│   └── package.json
├── docs/                   # Documentation
├── .github/
│   └── workflows/          # CI/CD workflows
└── README.md
```

## 🎨 Design System

### Color Palette

- **Primary**: Deep blues (#1e40af)
- **Secondary**: Charcoal (#374151)
- **Accent**: Gold (#f59e0b)
- **Background**: Black (#000000)
- **Text**: White/Light gray

### Typography

- **Headings**: Large, well-kerned fonts
- **Body**: Modern, readable sans-serif
- **Emphasis**: Serif for luxury feel

## 🔧 Development Guidelines

### Code Standards

- TypeScript for all code
- ESLint + Prettier for formatting
- Conventional commits
- Comprehensive testing
- Component-driven development

### Git Workflow

1. Create feature branch from `develop`
2. Make changes with tests
3. Run quality checks locally
4. Create pull request
5. Ensure CI/CD passes
6. Merge after review

## 📖 API Documentation

The backend API is fully documented with Swagger/OpenAPI:

- **Local**: <http://localhost:3001/api>
- **Staging**: <https://api-staging.wizcuts.com/api>
- **Production**: <https://api.wizcuts.com/api>

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Run quality checks
7. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For questions and support:

- Create an issue on GitHub
- Check the documentation in `docs/`
- Review the SonarQube dashboard for code quality insights

## 🔮 Roadmap

- [ ] Enhanced booking flow with calendar integration
- [ ] Email/SMS notification system
- [ ] Loyalty program integration
- [ ] Advanced analytics dashboard
- [ ] Mobile app development
- [ ] Payment integration
- [ ] Review and rating system

---

Built with ❤️ for luxury grooming experiences
