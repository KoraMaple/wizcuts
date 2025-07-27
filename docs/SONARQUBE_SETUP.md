# SonarQube Cloud Integration Guide

This guide explains how to set up and use SonarQube Cloud for code quality analysis in the WizCuts
project.

## Overview

The project has been configured to use SonarQube Cloud instead of Codecov for code quality and
coverage analysis. SonarQube provides comprehensive code quality metrics including:

- Code coverage analysis
- Security vulnerability detection
- Code smell identification
- Maintainability metrics
- Reliability assessments

## Setup Requirements

### 1. SonarQube Cloud Account

- Create an account at [SonarCloud.io](https://sonarcloud.io)
- Link your GitHub account
- Create a new organization or use an existing one

### 2. Project Configuration

- Create a new project in SonarQube Cloud
- Choose "GitHub" as the repository source
- Select your repository: `wizcuts`
- Note down your organization key and project key

### 3. GitHub Secrets Configuration

Add the following secrets to your GitHub repository:

```bash
SONAR_TOKEN: Your SonarQube Cloud token
```

To get your SonarQube token:

1. Go to SonarCloud.io → My Account → Security
2. Generate a new token
3. Copy the token and add it to GitHub Secrets

## Configuration Files

### sonar-project.properties

The main configuration file located at the project root:

```properties
# Project identification
sonar.projectKey=wizcuts-barber-shop
sonar.organization=your-org-key  # Update with your organization key
sonar.projectName=WizCuts Barber Shop
sonar.projectVersion=1.0.0

# Source code configuration
sonar.sources=frontend/src,backend/src
sonar.tests=frontend/src,backend/src
sonar.test.inclusions=**/*.test.ts,**/*.test.tsx,**/*.spec.ts,**/*.spec.tsx

# Coverage reports
sonar.typescript.lcov.reportPaths=frontend/coverage/lcov.info,backend/coverage/lcov.info
sonar.javascript.lcov.reportPaths=frontend/coverage/lcov.info,backend/coverage/lcov.info
```

**Important**: Update the `sonar.organization` value with your actual organization key from
SonarCloud.

## CI/CD Integration

The GitHub Actions workflow (`.github/workflows/ci-cd.yml`) includes:

1. **Frontend Tests & Coverage**: Runs tests and generates coverage reports
2. **Backend Tests & Coverage**: Runs tests and generates coverage reports
3. **SonarCloud Analysis**: Analyzes code quality and uploads coverage
4. **Security Scan**: Runs Trivy security scanner
5. **Deployment**: Deploys to staging/production based on branch

### Workflow Jobs

```yaml
sonarcloud:
  name: SonarCloud Analysis
  runs-on: ubuntu-latest
  needs: [frontend-test, backend-test]

  steps:
    - name: SonarCloud Scan
      uses: SonarSource/sonarcloud-github-action@master
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

## Coverage Configuration

### Frontend (Jest + Next.js)

- Test framework: Jest with jsdom environment
- Coverage reporters: text, html, json, lcov
- Coverage threshold: 70% for all metrics
- Setup file: `frontend/jest.setup.js`

### Backend (Jest + NestJS)

- Test framework: Jest with ts-jest
- Coverage reporters: text, html, json, lcov
- Coverage threshold: 60% for all metrics
- Setup file: `backend/test/setup.ts`

## Quality Gates

SonarQube Cloud will enforce quality gates based on:

- **Coverage**: Minimum coverage thresholds
- **Duplicated Lines**: Maximum allowed code duplication
- **Maintainability Rating**: A-E rating for maintainability
- **Reliability Rating**: A-E rating for reliability
- **Security Rating**: A-E rating for security

## Running Tests Locally

### Frontend

```bash
cd frontend
npm test                # Run tests
npm run test:coverage   # Run with coverage
npm run test:watch      # Run in watch mode
```

### Backend

```bash
cd backend
npm test                # Run tests
npm run test:coverage   # Run with coverage
npm run test:watch      # Run in watch mode
```

## Monitoring and Reports

### SonarCloud Dashboard

Access your project dashboard at: `https://sonarcloud.io/project/overview?id=wizcuts-barber-shop`

### GitHub Integration

- Pull request decoration with quality metrics
- Status checks that can block merging
- Comments on PRs with quality gate results

## Troubleshooting

### Common Issues

1. **Missing SONAR_TOKEN**
   - Ensure the token is added to GitHub Secrets
   - Verify the token has the correct permissions

2. **Organization Key Mismatch**
   - Update `sonar.organization` in `sonar-project.properties`
   - Use the exact key from your SonarCloud organization

3. **Coverage Reports Not Found**
   - Ensure tests are running successfully
   - Check that coverage artifacts are being uploaded
   - Verify coverage file paths in sonar configuration

4. **Quality Gate Failures**
   - Review the specific metrics failing
   - Check coverage thresholds in Jest configurations
   - Address code smells and security issues

### Debug Mode

Enable debug logging in GitHub Actions:

```yaml
- name: SonarCloud Scan
  uses: SonarSource/sonarcloud-github-action@master
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
    SONAR_SCANNER_OPTS: '-Dsonar.verbose=true'
```

## Migration from Codecov

The project has been migrated from Codecov to SonarQube Cloud. Key changes:

1. **Removed**: Codecov action from CI/CD workflow
2. **Added**: SonarCloud action with coverage upload
3. **Updated**: Jest configurations for compatible coverage reports
4. **Added**: SonarQube project configuration file

## Best Practices

1. **Write Tests**: Maintain high test coverage
2. **Regular Monitoring**: Check SonarCloud dashboard regularly
3. **Address Issues**: Fix security and maintainability issues promptly
4. **Quality Gates**: Don't bypass quality gate failures
5. **Documentation**: Update tests and documentation together

## Support

- [SonarQube Documentation](https://docs.sonarqube.org/)
- [SonarCloud Documentation](https://docs.sonarcloud.io/)
- [GitHub Actions Integration](https://github.com/SonarSource/sonarcloud-github-action)

For project-specific issues, check the GitHub Actions logs and SonarCloud project dashboard.
