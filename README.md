# Financial Transfer Management System (TMS)

> A mobile-first Progressive Web Application for managing financial transfers between exchange offices and administrators

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Latest-orange?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![PWA](https://img.shields.io/badge/PWA-Enabled-purple?style=flat-square)](https://web.dev/progressive-web-apps/)

## 📋 Project Overview

The Financial Transfer Management System is a secure, mobile-first PWA designed for managing financial transfers between exchange offices and administrative staff. Built with performance and security as top priorities, the system provides real-time order management, secure file handling, and comprehensive admin controls.

### 🎯 Key Features

- **Mobile-First Design**: Optimized for 320px-768px viewports with touch-friendly interactions
- **Real-Time Updates**: Live order status changes and notifications using Firebase Firestore
- **Secure Authentication**: Username-based authentication with role-based access control
- **File Management**: Secure screenshot uploads with 5MB limits and format validation
- **Order Management**: Complete workflow from submission to completion with admin oversight
- **PWA Capabilities**: Offline functionality, install prompts, and native app-like experience
- **Performance Optimized**: < 100KB bundle size, < 2.5s LCP on 3G/4G networks

### 🏗️ Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: Firebase Firestore, Firebase Storage, Firebase Authentication
- **Mobile**: Progressive Web App (PWA) with service workers
- **Performance**: Bundle optimization, code splitting, image optimization
- **Security**: Role-based access, file validation, user isolation

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0 or higher
- npm 9.0 or higher (or yarn/pnpm equivalent)
- Firebase project with Firestore and Storage enabled
- Git for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd financial-transfer-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your Firebase configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Firebase Setup**
   ```bash
   # Install Firebase CLI
   npm install -g firebase-tools
   
   # Login to Firebase
   firebase login
   
   # Initialize Firebase in your project
   firebase init
   ```

5. **Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Mobile Development

This application is designed mobile-first. For optimal development experience:

### Testing on Mobile Devices

1. **Local Network Testing**
   ```bash
   # Start dev server accessible from local network
   npm run dev -- --hostname 0.0.0.0
   ```
   
2. **Mobile Simulators**
   - Use Chrome DevTools device simulation
   - Test on iOS Safari and Android Chrome
   - Verify touch interactions and gestures

3. **Performance Testing**
   ```bash
   # Lighthouse CI for mobile performance
   npm run lighthouse:mobile
   ```

### PWA Testing

1. **Build and Serve**
   ```bash
   npm run build
   npm run start
   ```

2. **PWA Audit**
   - Open Chrome DevTools
   - Go to Lighthouse tab
   - Run PWA audit
   - Ensure all PWA criteria are met

## 🔧 Development Guidelines

### Code Quality

- **TypeScript**: Strict mode enabled, comprehensive type definitions
- **ESLint**: Configured for Next.js, React, and TypeScript
- **Prettier**: Consistent code formatting across the project
- **Husky**: Git hooks for pre-commit quality checks

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/) for consistent commit messages:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvements
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

**Examples:**
```bash
feat(auth): add username-based authentication
fix(orders): resolve order status update issue
docs(readme): update installation instructions
perf(images): optimize image loading for mobile
```

### Branch Strategy

- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: Feature development branches
- `hotfix/*`: Critical bug fixes
- `release/*`: Release preparation branches

## 🧪 Testing

### Running Tests

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

### Testing Strategy

- **Unit Tests**: Components, utilities, and business logic
- **Integration Tests**: Firebase operations and API endpoints
- **E2E Tests**: Critical user workflows and mobile interactions
- **Performance Tests**: Lighthouse audits and mobile performance
- **Security Tests**: Authentication flows and data access

## 🚀 Deployment

### Production Build

```bash
# Create optimized production build
npm run build

# Verify build locally
npm run start
```

### Firebase Deployment

```bash
# Deploy to Firebase Hosting
firebase deploy

# Deploy specific services
firebase deploy --only hosting
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

### Environment Configuration

Ensure the following environment variables are set in production:

- All Firebase configuration variables
- Security keys (SESSION_SECRET, JWT_SECRET)
- Performance monitoring tokens
- Analytics configuration

## 📊 Performance Targets

- **First Load JS**: < 100KB per page
- **Largest Contentful Paint (LCP)**: < 2.5 seconds on 3G
- **Time to Interactive (TTI)**: < 3 seconds on mobile
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms

## 🔒 Security

### Security Features

- **Authentication**: Secure username-based login with bcrypt hashing
- **Authorization**: Role-based access control (Admin/Exchange)
- **Data Isolation**: Users can only access their own data
- **File Security**: Upload validation, size limits, format restrictions
- **Session Management**: HTTP-only cookies with automatic expiration

### Security Best Practices

- Never commit sensitive data to version control
- Use environment variables for all configuration
- Regularly update dependencies for security patches
- Follow Firebase security rules best practices
- Implement rate limiting for API endpoints

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines before submitting pull requests.

### Getting Started

1. Fork the repository
2. Create a feature branch from `develop`
3. Make your changes following our code guidelines
4. Write tests for new features
5. Ensure all tests pass
6. Submit a pull request

### Pull Request Process

1. **Code Review**: All PRs require review from maintainers
2. **Quality Checks**: Automated tests and linting must pass
3. **Performance**: Ensure no performance regressions
4. **Security**: Review for security implications
5. **Mobile**: Test on mobile devices and simulators

### Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## 📞 Support

- **Documentation**: [Project Wiki](wiki-url)
- **Issues**: [GitHub Issues](issues-url)
- **Discussions**: [GitHub Discussions](discussions-url)
- **Security**: Report security issues to [security@example.com](mailto:security@example.com)

## 📄 License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Firebase team for the backend infrastructure
- React team for the component library
- All contributors who help improve this project

---

**Built with ❤️ for efficient financial transfer management** 