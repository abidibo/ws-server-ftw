# Publishing Guide

This document explains how to publish `@abidibo/ws-server-ftw` to npm using GitHub Actions.

## Prerequisites

Before you can publish, you need to configure the following GitHub secrets:

### 1. NPM_TOKEN (Required for publishing to npm)

1. Go to [npmjs.com](https://www.npmjs.com/) and log in
2. Click on your profile icon → "Access Tokens"
3. Click "Generate New Token" → "Classic Token"
4. Select "Automation" type (allows publishing from CI/CD)
5. Copy the generated token
6. Go to your GitHub repository → Settings → Secrets and variables → Actions
7. Click "New repository secret"
8. Name: `NPM_TOKEN`
9. Value: Paste your npm token
10. Click "Add secret"

### 2. GitHub Token (Automatic - no setup required)

The `GITHUB_TOKEN` is automatically provided by GitHub Actions and is used for:
- Sending coverage data to Coveralls
- No manual setup required

## Workflow Overview

The GitHub Actions workflow (`.github/workflows/publish.yml`) has three jobs:

### 1. Test Job
- **Triggers**: On all pushes and pull requests to master/main
- **Node versions**: Tests on Node 18.x, 20.x, and 22.x
- **Actions**:
  - Installs dependencies
  - Runs tests
  - Builds the package

### 2. Coverage Job
- **Triggers**: On pushes to master/main or version tags
- **Requires**: Test job must pass
- **Actions**:
  - Generates test coverage
  - Sends coverage report to Coveralls using built-in GitHub Action

### 3. Publish Job
- **Triggers**: Only on version tags (v*.*.*)
- **Requires**: Test job must pass
- **Actions**:
  - Builds the package
  - Publishes to npm with public access

## How to Publish a New Version

1. **Update the version** in `package.json`:
   ```bash
   npm version patch  # for bug fixes (0.2.0 → 0.2.1)
   npm version minor  # for new features (0.2.0 → 0.3.0)
   npm version major  # for breaking changes (0.2.0 → 1.0.0)
   ```

2. **Push the tag** to GitHub:
   ```bash
   git push origin master --tags
   ```

3. **Watch the workflow**:
   - Go to your repository → Actions tab
   - You should see the workflow running
   - The workflow will:
     - Run tests on multiple Node versions
     - Publish coverage to Coveralls
     - Publish to npm if all tests pass

4. **Verify publication**:
   - Check [npmjs.com/package/@abidibo/ws-server-ftw](https://www.npmjs.com/package/@abidibo/ws-server-ftw)
   - The new version should appear within a few minutes

## Troubleshooting

### Publishing fails with "403 Forbidden"
- Check that your `NPM_TOKEN` is valid and has automation permissions
- Verify the token is correctly set in GitHub Secrets

### Coverage not appearing on Coveralls
- Ensure your repository is connected to [Coveralls.io](https://coveralls.io/)
- Sign in to Coveralls with your GitHub account
- Add your repository to Coveralls
- The GitHub Action will automatically send coverage data

### Tests failing in CI but passing locally
- Check the Node version (CI tests on 18.x, 20.x, 22.x)
- Ensure all dependencies are properly declared in `package.json`
- Review the Actions logs for detailed error messages

## Manual Publishing (Alternative)

If you prefer to publish manually:

1. Ensure tests pass: `npm test`
2. Build the package: `npm run build`
3. Log in to npm: `npm login`
4. Publish: `npm publish --access public`

## Package Scope

The package is published under the `@abidibo` scope. The `--access public` flag is required for scoped packages to be publicly accessible on npm.
