# Financial Transfer Management System - Development Phases

> **AI Development Assistant Prompts for Progressive Mobile Web Application (PWA)**

## 📋 Project Overview

**Target**: Mobile-first PWA for financial transfer management between exchange offices and admin
**Tech Stack**: Next.js 15 + Firebase Firestore + Firebase Storage + TypeScript
**Performance**: < 100KB bundle, < 2.5s LCP, optimized for 3G/4G networks in Jordan

---

## 🏗️ Phase 1: Project Setup & Infrastructure

### **Phase 1.0: Basic Git Setup & Environment Configuration**
```
Initialize version control for internal company webapp:

Basic Git Setup:
- Initialize git repository: git init
- Create .gitignore file for Node.js, Next.js, and Firebase
- Set up basic README.md with project overview and setup instructions
- Create initial commit with project structure
- Configure git user settings for the team

Environment Configuration:
- Create .env.local file with Firebase configuration
- Set up basic environment variables for development and production
- Configure Firebase project settings

.env.example Structure:
```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCzSdinuYgAjW_L4TtRwFLhgBQFtfF20vc
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tms062025.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tms062025
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tms062025.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=74384661952
NEXT_PUBLIC_FIREBASE_APP_ID=1:74384661952:web:7677c88aab847834ebfc25
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-X0WSS2PRCV

# Environment Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Security Configuration
SESSION_SECRET=your_super_secret_session_key_here
BCRYPT_SALT_ROUNDS=12
JWT_SECRET=your_jwt_secret_here
```

Basic Development Setup:
- Configure ESLint and Prettier for code quality
- Set up basic VS Code settings for consistent formatting
- Configure TypeScript for type safety
- Set up basic Firebase security rules for internal use
```

### **Phase 1.1: Initial Project Setup**
```
Create a new Next.js 15 project with the following requirements:
- Use TypeScript for type safety
- Configure for mobile-first responsive design (320px - 768px)
- Set up Tailwind CSS with mobile-optimized breakpoints
- Configure for PWA with service worker support
- Set up ESLint and Prettier for code quality
- Create proper folder structure:
  - /app (App Router)
  - /components (UI components)
  - /lib (utilities, Firebase config)
  - /types (TypeScript definitions)
  - /public (static assets)
- Configure next.config.js for mobile performance optimization
- Set up package.json with all required dependencies
```

### **Phase 1.2: Firebase Configuration**
```
Set up Firebase integration with the following services and configuration:

Firebase Project Configuration:
- apiKey: "AIzaSyCzSdinuYgAjW_L4TtRwFLhgBQFtfF20vc"
- authDomain: "tms062025.firebaseapp.com"
- projectId: "tms062025"
- storageBucket: "tms062025.firebasestorage.app"
- messagingSenderId: "74384661952"
- appId: "1:74384661952:web:7677c88aab847834ebfc25"
- measurementId: "G-X0WSS2PRCV"

Firebase Services Setup:
- Firebase Firestore for real-time database
- Firebase Storage for file uploads
- Firebase Authentication (custom implementation)
- Firebase Analytics for performance monitoring

Environment Variables Setup:
- Create .env.local file with Firebase configuration
- Add Firebase config to environment variables for security
- Set up different environments (development/production)

Security Configuration:
- Configure Firebase Security Rules for:
  - User isolation (exchanges can only see their data)
  - Admin full access
  - File upload security (5MB limit, image formats only)
- Set up Firebase configuration file with environment variables
- Create Firebase utility functions for common operations
- Initialize Firebase SDK in the application
```

### **Phase 1.3: TypeScript Types & Interfaces**
```
Create comprehensive TypeScript definitions for:
- User types (Admin, Exchange Office)
- Order types (Incoming/Outgoing transfers)
- Bank and payment method types
- Message/chat types
- Balance and commission types
- File upload types
- Include all required and optional fields as specified in features
- Use proper enum types for status workflows
- Export all types from a central types file
```

---

## 🔐 Phase 2: Authentication System

### **Phase 2.1: Username-Based Authentication**
```
Implement secure username-based authentication system:
- Create login page optimized for mobile
- Username validation (3-50 chars, alphanumeric + underscore/hyphen)
- Password hashing with bcrypt (12 salt rounds)
- Session management with HTTP-only cookies
- Role-based access control (Admin vs Exchange)
- No public registration - admin-controlled only
- Rate limiting for brute force protection
- Automatic session expiration
- Responsive login form with proper mobile UX
```

### **Phase 2.2: Authentication Context & Middleware**
```
Create authentication infrastructure:
- React Context for auth state management
- Custom hooks (useAuth, useRequireAuth)
- Middleware for route protection
- Automatic redirect logic based on user role
- Session persistence and restoration
- Logout functionality
- Loading states for auth operations
- Error handling for authentication failures
```

---

## 🗄️ Phase 3: Database Schema & Models

### **Phase 3.1: Firestore Collections Setup**
```
Create Firestore database schema:

1. Users Collection:
   - username (unique, string)
   - password (hashed, string) 
   - role ('admin' | 'exchange')
   - exchangeName (string, optional)
   - contactInfo (object, optional)
   - balance (number, default 0)
   - commissionRates (object with incoming/outgoing rates)
   - assignedBanks (array of bank IDs)
   - status ('active' | 'inactive')
   - createdAt, updatedAt (timestamps)

2. Orders Collection:
   - orderId (custom format: TYYMMXXXX)
   - exchangeId (reference to user)
   - type ('incoming' | 'outgoing')
   - status (enum: submitted, pending_review, approved, rejected, processing, completed, cancelled)
   - submittedAmount (number)
   - finalAmount (number, for incoming)
   - commission (number)
   - cliqDetails (object with alias name OR mobile number)
   - recipientDetails (object)
   - bankUsed (string)
   - platformBankUsed (string, for outgoing)
   - screenshots (array of file URLs)
   - adminNotes (string)
   - rejectionReason (string)
   - timestamps (created, updated, completed)

3. Platform Banks Collection & Bank Assignments Collection
```

### **Phase 3.2: Database Operations & Real-time Listeners**
```
Create database operation functions:
- CRUD operations for all collections
- Real-time Firestore listeners for:
  - Order status changes
  - Balance updates
  - Bank assignment changes
  - Chat messages
- Proper error handling and retry logic
- Connection management and cleanup
- Query optimization for mobile performance
- Data validation before Firestore operations
```

---

## 👥 Phase 4: Admin User Management

### **Phase 4.1: Admin Dashboard Layout**
```
Create admin dashboard with mobile-first design:
- Responsive navigation (collapsible sidebar for mobile)
- Real-time statistics overview
- Quick action buttons for common tasks
- Order management interface
- User management section
- Bank management interface
- Platform bank balance monitoring
- Mobile-optimized data tables
- Touch-friendly UI elements
```

### **Phase 4.2: Exchange Office Management**
```
Implement exchange office management features:
- Create exchange office accounts with unique usernames
- Set initial balances (positive, negative, or zero allowed)
- Configure commission rates (fixed amount or percentage)
- Assign banks for incoming transfers (private/public assignment)
- Manage exchange office status (active/inactive)
- View exchange office profiles and transaction history
- Real-time balance monitoring
- Mobile-optimized forms and interfaces
```

### **Phase 4.3: Platform Bank Management**
```
Create platform bank management system:
- Add/edit platform bank accounts
- Track platform bank balances separately from exchange balances
- Assign platform banks to exchanges for incoming transfers
- Manage public vs private bank assignments
- Real-time platform bank balance updates
- Bank selection for outgoing transfers
- Mobile-responsive bank management interface
```

---

## Phase 5: Order Management Core

### **Phase 5.1: Order Creation System**
```
Implement order creation for both types:

Outgoing Transfer Orders:
- Mobile form with CliQ payment fields (alias name OR mobile number)
- Jordanian mobile number validation (00962 or 07/8/9 format)
- Amount input with JOD currency
- Optional recipient and bank fields
- Real-time commission calculation
- Form validation and error handling
- Mobile-optimized input fields

Incoming Transfer Orders:
- Amount input field
- Payment proof screenshot upload
- Bank selection from assigned banks only
- Optional sender name field
- File upload with progress indicator
- Mobile camera integration for screenshots
```

### **Phase 5.2: Order Status Workflow**
```
Create order status management system:
- Status workflow: Submitted → Pending Review → Approved/Rejected → Processing → Completed
- Admin actions for each status transition
- Exchange actions (edit, cancel, request cancellation)
- Real-time status updates across all users
- Status-specific UI components
- Mobile-optimized status indicators
- Proper validation for status transitions
- Balance calculations only on completion
```

### **Phase 5.3: Order ID Generation & Management**
```
Implement custom order ID system:
- Generate TYYMMXXXX format (T25060001 for first order in June 2025)
- Sequential numbering reset monthly
- Ensure uniqueness within pattern
- Use Jordanian timezone (Asia/Amman) for all timestamps
- Atomic counter operations to prevent duplicates
- Error handling for ID generation failures
```

### **Phase 5.4: Admin Order Review Interface**
```
Comprehensive admin dashboard:
- Real-time order monitoring with live updates
- Advanced filtering (status, type, search, date range)
- Sortable columns (date, amount, status)
- Bulk selection and actions (approve/reject multiple orders)
- Statistics dashboard (pending, processing, completed, rejected)
- Mobile-responsive design
- Quick action buttons for status transitions
```

### **Phase 5.5: Real-time Chat System**
```
Order-specific chat functionality:
- Real-time messaging between admin and exchanges
- Order-specific chat threads
- Message validation and security
- System messages for status changes
- Role-based access control
- Message history persistence
- Mobile-optimized chat interface
```

### **Phase 5.6: File Upload API Endpoints**
```
Secure file management system:
- Firebase Storage integration
- File upload security rules (5MB limit, image formats only)
- Virus scanning integration
- Proper file naming and organization
- Access control based on user roles
- Upload progress tracking
- Mobile-optimized file selection
- Error handling for upload failures
```

---

## Phase 6: Real-time Features

### **Phase 6.1: Enhanced Real-time Order Updates**
```
Advanced real-time order synchronization:
- Firebase listeners with optimized performance
- Real-time balance updates for exchanges and platform banks
- Live order editing notifications with instant feedback
- Smart admin notifications for new orders
- Role-based exchange notifications for status changes
- Memory leak prevention with proper listener cleanup
- Offline handling with automatic sync on reconnection
- Mobile-optimized real-time UI updates with animations
```

### **Phase 6.2: Advanced Notification System**
```
Comprehensive notification infrastructure:
- Context-based notification state management
- Real-time notification panel with interactive UI
- Toast notification system with immediate feedback
- Connection status monitoring (online/offline)
- Smart notification categorization and priority
- Auto-dismiss and action-based notifications
- Mobile-responsive notification interactions
- Notification history and management system
```

### **Phase 6.3: Real-time Activity Indicators**
```
Live activity monitoring and feedback:
- Real-time activity indicators with pulse animations
- Connection quality monitoring and visual feedback
- Action loading states for all operations
- Live performance indicators and metrics
- Active user counters and status displays
- Real-time statistics with live updates
- Mobile-optimized activity displays
- Network-aware interface adaptations
```

### **Phase 6.4: Enhanced Mobile Real-time UX**
```
Mobile-first real-time experience:
- Touch-optimized notification interactions
- Gesture support for notification management
- Network-aware performance optimizations
- Battery-conscious update patterns
- Instant visual feedback (< 100ms latency)
- Mobile-specific loading indicators
- Responsive real-time interface components
- Progressive enhancement for slower connections
```

---

## Phase 7: File Management & Screenshots

### **Phase 7.1: Enhanced Firebase Storage Integration**
```
Comprehensive file management system:
- Firebase Storage configuration with organized file structure
- Enhanced security rules with role-based access control
- File upload validation (5MB limit, image formats)
- Hierarchical file organization by type and user
- Advanced metadata storage and retrieval
- Upload progress tracking with real-time feedback
- Mobile-optimized file selection with camera integration
- Comprehensive error handling and retry mechanisms
- Audit logging for all file operations
- User isolation and admin privilege management
```

### **Phase 7.2: Advanced Photo Viewer & Sharing**
```
Production-ready image management:
- Full-screen image viewer with native fullscreen API
- Mobile touch gestures (swipe, zoom, pan, rotate)
- Keyboard navigation (arrows, ESC, +/-, F, R)
- WhatsApp sharing integration with Web Share API fallback
- Direct download functionality with proper filename handling
- Multi-image gallery with navigation dots and counters
- Loading states with skeleton screens and error handling
- Performance optimization with Next.js Image component
- Cross-browser compatibility including Safari iOS
- Memory-efficient image loading with cleanup
```

### **Phase 7.3: File Management Components**
```
Advanced file organization system:
- Enhanced FileManager with drag-and-drop upload
- FileGallery with search, filtering, and sorting
- Bulk file operations with multi-select functionality
- Advanced file API endpoints (/api/files) with pagination
- File categorization and tagging capabilities
- Grid and list view modes with responsive design
- Real-time file validation and progress tracking
- Mobile camera integration for direct photo capture
- Comprehensive utility functions (formatBytes, formatDate)
- Integration with existing notification and auth systems
```

---

## 📱 Phase 8: Mobile Optimization & PWA

### **Phase 8.1: Performance Optimization**
```
Optimize for mobile performance:
- Code splitting with dynamic imports
- Lazy loading for heavy components
- Image optimization with Next.js Image component
- Bundle size optimization (target < 100KB per page)
- SWC minification configuration
- CSS optimization for mobile
- Network-aware loading strategies
- 3G/4G network optimization
```

### **Phase 8.2: PWA Implementation**
```
Configure Progressive Web App features:
- Service worker registration
- App manifest configuration
- Offline functionality for critical operations
- Install prompts for mobile browsers
- Caching strategies with Workbox
- Background sync for offline actions
- Push notification setup (optional)
- App icons and splash screens
```

### **Phase 8.3: Mobile UX Enhancements**
```
Implement mobile-specific features:
- Touch-friendly navigation
- Swipe gestures where appropriate
- Pull-to-refresh functionality
- Mobile keyboard optimization
- Proper viewport configuration
- Responsive breakpoints (320px - 768px)
- Fast tap responses (remove 300ms delay)
- Mobile-specific loading states
```

---

## 🧪 Phase 9: Testing & Quality Assurance

### **Phase 9.1: Component Testing**
```
Implement comprehensive testing:
- Unit tests for utility functions
- Component testing with React Testing Library
- Firebase operations testing
- Authentication flow testing
- Order workflow testing
- Real-time functionality testing
- Mobile responsiveness testing
- File upload testing
```

### **Phase 9.2: Performance Testing**
```
Optimize and test performance:
- Lighthouse audits for mobile performance
- Bundle analyzer for size optimization
- Network throttling tests (3G simulation)
- Real device testing on various mobile devices
- Load testing for concurrent users
- Firebase performance monitoring
- Memory leak detection
- Battery usage optimization
```

---

## 🚀 Phase 10: Deployment & Production

### **Phase 10.1: Production Configuration**
```
Prepare for production deployment:
- Environment variable configuration
- Firebase production project setup
- Security rules validation
- SSL certificate configurationand 
- Domain setup and DNS configuration
- Production build optimization
- Error tracking setup (Sentry or similar)
- Analytics implementation
```

### **Phase 10.2: Monitoring & Maintenance**
```
Set up production monitoring:
- Firebase performance monitoring
- Error tracking and alerting
- User analytics and behavior tracking
- Performance metrics monitoring
- Uptime monitoring
- Backup strategies for Firestore data
- Update deployment strategies
- User feedback collection system
```

---

## 🔧 Development Guidelines

### **Code Quality Standards**
- TypeScript strict mode enabled
- ESLint + Prettier configuration
- Consistent naming conventions
- Comprehensive error handling
- Mobile-first responsive design
- Performance-first development approach
- Security-conscious coding practices
- Proper component composition

### **Mobile Performance Targets**
- First Load JS: < 100KB per page
- Largest Contentful Paint (LCP): < 2.5 seconds on 3G
- Time to Interactive (TTI): < 3 seconds on mobile
- Bundle size optimization with dynamic imports
- Aggressive caching strategies

### **Testing Strategy**
- Unit tests for business logic
- Integration tests for Firebase operations
- E2E tests for critical user workflows
- Mobile device testing on real devices
- Performance testing on 3G networks
- Accessibility testing for mobile users

---

## 📝 Implementation Notes

### **Key Technical Decisions**
- Next.js 15 App Router for optimal performance
- Firebase Firestore for real-time capabilities
- TypeScript for type safety and better DX
- Tailwind CSS for responsive design
- PWA for native-like mobile experience
- Username-based auth for internal system requirements

### **Critical Success Factors**
- Mobile-first design and development
- Real-time updates for better UX
- Secure file handling and user isolation
- Performance optimization for Jordanian networks
- Intuitive interface requiring minimal training
- Reliable balance and commission calculations

**Total Estimated Development Time**: 8-12 weeks for full implementation with testing and optimization. 