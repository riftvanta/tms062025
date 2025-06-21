# Financial Transfer Management System (TMS)

A mobile-first Progressive Web Application (PWA) for managing financial transfers between exchange offices and administrators.

## 🎯 Project Overview

This internal webapp enables secure financial transfer management between our company and exchange office partners. Built with Next.js 15, Firebase, and TypeScript for optimal mobile performance.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Custom username-based system

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tms-webapp
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Edit `.env.local` with your Firebase configuration.

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## 📱 Features

- **Mobile-First Design**: Optimized for 320px - 768px screens
- **Real-time Updates**: Live order status and balance tracking
- **File Management**: Secure screenshot upload and sharing
- **Role-Based Access**: Admin and Exchange Office user roles
- **Order Management**: Incoming and outgoing transfer workflows
- **Chat System**: Real-time messaging between admin and exchanges

## 🏗️ Project Structure

```
├── app/                 # Next.js App Router
├── components/          # Reusable UI components
├── lib/                # Utilities and Firebase config
├── types/              # TypeScript type definitions
├── public/             # Static assets
└── firebase.json       # Firebase configuration
```

## 🔐 Authentication

- Username-based authentication (3-50 characters)
- Role-based access control (Admin vs Exchange)
- No public registration - admin-controlled accounts
- Session management with HTTP-only cookies

## 📊 Order System

- **Order ID Format**: TYYMMXXXX (e.g., T25060001)
- **Status Workflow**: Submitted → Pending Review → Approved/Rejected → Processing → Completed
- **Transfer Types**: Incoming and Outgoing transfers
- **Real-time Tracking**: Live status updates across all users

## 🔥 Firebase Configuration

The app uses Firebase for:
- **Firestore**: Real-time database for orders, users, and messages
- **Storage**: Secure file uploads with 5MB limit
- **Analytics**: Performance monitoring

## 🧪 Development

### Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

### Performance Targets

- **Bundle Size**: < 100KB per page
- **LCP**: < 2.5 seconds on 3G
- **TTI**: < 3 seconds on mobile

## 📝 Environment Variables

Required environment variables (see `.env.example`):

- Firebase configuration keys
- Session secrets
- JWT secrets
- Environment-specific settings

## 🚀 Deployment

This app is configured for deployment on Vercel with automatic Firebase integration.

## 📄 License

Internal company use only.

---

Built with ❤️ for internal financial transfer management. 