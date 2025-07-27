# SonarQube Troubleshooting Guide

## Quick Setup Checklist

Before troubleshooting, ensure you have completed these setup steps:

1. ✅ Created SonarCloud account and linked GitHub
2. ✅ Created project in SonarCloud
3. ✅ Added `SONAR_TOKEN` to GitHub Secrets
4. ✅ Updated `sonar.organization` in `sonar-project.properties`
5. ✅ Pushed code to trigger CI/CD pipeline

## Common Issues and Solutions

### 1. SonarCloud Analysis Failed

**Symptom**: CI/CD workflow fails at the SonarCloud step

**Possible Causes & Solutions**:

#### Missing SONAR_TOKEN

```
Error: Please provide a valid token
```

- Check GitHub repository settings → Secrets and variables → Actions
- Verify `SONAR_TOKEN` is present and correct
- Generate new token if needed: SonarCloud → My Account → Security

#### Wrong Organization Key

```
Error: Invalid project key
```

- Update `sonar.organization` in `sonar-project.properties`
- Use exact organization key from SonarCloud (not display name)
- Check project key matches your SonarCloud project

#### Coverage Files Not Found

```
Warning: No coverage reports found
```

- Ensure tests are running successfully in CI
- Check test commands include `--coverage` flag
- Verify coverage artifacts are uploaded before SonarCloud job

### 2. Coverage Reports Issues

**Symptom**: SonarCloud shows 0% coverage despite successful tests

**Solutions**:

- Check lcov.info files are generated in coverage directories
- Verify file paths in `sonar.typescript.lcov.reportPaths`
- Ensure coverage artifacts are downloaded in SonarCloud job
- Test coverage generation locally:

  ```bash
  cd frontend && npm run test:coverage
  cd backend && npm run test:coverage
  ```

### 3. Quality Gate Failures

**Symptom**: Pull requests blocked by failing quality gate

**Common Issues**:

- Coverage below threshold (70% frontend, 60% backend)
- Security vulnerabilities detected
- Code smells or maintainability issues
- Duplicated code blocks

**Solutions**:

- Write additional tests to increase coverage
- Fix security issues identified by SonarCloud
- Refactor code to address maintainability issues
- Remove or extract duplicated code

### 4. GitHub Integration Not Working

**Symptom**: No SonarCloud comments on pull requests

**Solutions**:

- Check GitHub App permissions in SonarCloud
- Verify repository is properly connected in SonarCloud
- Ensure workflow runs on pull request events
- Check branch protection rules don't conflict

### 5. Module-specific Issues

#### Frontend Module

```bash
# Test Jest configuration
cd frontend
npm test -- --passWithNoTests

# Check coverage generation
npm run test:coverage
ls -la coverage/
```

#### Backend Module

```bash
# Test NestJS testing setup
cd backend
npm test

# Check database connection in tests
npm run test:coverage
```

## Debug Commands

### Local Testing

```bash
# Run tests with verbose output
npm test -- --verbose

# Generate coverage reports
npm run test:coverage

# Check file structure
find . -name "lcov.info" -ls
find . -name "coverage" -type d
```

### CI/CD Debugging

Enable debug mode in GitHub Actions:

```yaml
env:
  SONAR_SCANNER_OPTS: '-Dsonar.verbose=true'
  ACTIONS_STEP_DEBUG: true
```

## Getting Help

1. **Check SonarCloud Logs**: Project → Activity → Background Tasks
2. **GitHub Actions Logs**: Repository → Actions → Failed workflow
3. **SonarCloud Documentation**: [docs.sonarcloud.io](https://docs.sonarcloud.io)
4. **Community Support**: [community.sonarsource.com](https://community.sonarsource.com)

## Useful Commands

### Reset Coverage

```bash
# Clean coverage directories
rm -rf frontend/coverage backend/coverage

# Regenerate coverage
cd frontend && npm run test:coverage
cd backend && npm run test:coverage
```

### Manual SonarCloud Scan

```bash
# Install SonarScanner CLI (optional)
npm install -g sonarqube-scanner

# Run local scan (requires token)
sonar-scanner \
  -Dsonar.projectKey=wizcuts-barber-shop \
  -Dsonar.organization=your-org-key \
  -Dsonar.host.url=https://sonarcloud.io \
  -Dsonar.login=your-token
```

### Check GitHub Secrets

```bash
# Via GitHub CLI (if installed)
gh secret list

# Verify token permissions
curl -H "Authorization: token $SONAR_TOKEN" \
     https://sonarcloud.io/api/authentication/validate
```

## Prevention Tips

1. **Test Locally**: Always run tests with coverage before pushing
2. **Incremental Improvement**: Gradually increase coverage instead of large drops
3. **Regular Monitoring**: Check SonarCloud dashboard weekly
4. **Quality Focus**: Address code smells promptly
5. **Security First**: Fix security issues immediately

Remember: Quality gates are there to help maintain code quality. Don't bypass them without good
reason!
