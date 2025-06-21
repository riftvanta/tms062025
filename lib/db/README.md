# Database Operations - Phase 3 Implementation

This directory contains all database operations and real-time listeners for the Financial Transfer Management System.

## 📁 File Structure

```
lib/db/
├── users.ts          # User management operations
├── orders.ts         # Order management with ID generation
├── banks.ts          # Platform banks and assignments
├── messages.ts       # Real-time chat functionality
├── index.ts          # Central exports
└── README.md         # Documentation
```

## 🗄️ Collections Overview

### Users Collection
- **Purpose**: Store user accounts (admin and exchange offices)
- **Security**: Username-based authentication, admin-controlled creation
- **Key Features**: Balance tracking, commission rates, bank assignments

### Orders Collection
- **Purpose**: Transfer orders with custom ID generation (TYYMMXXXX format)
- **Security**: User isolation, status-based access control
- **Key Features**: Real-time updates, automatic timestamps, Jordanian timezone

### Platform Banks Collection
- **Purpose**: Bank accounts managed by platform
- **Security**: Admin-only management, exchange read access
- **Key Features**: Balance tracking, active/inactive status

### Bank Assignments Collection
- **Purpose**: Assign platform banks to exchange offices
- **Security**: Admin-only management, exchange-specific access
- **Key Features**: Public/private assignments, active status

### Messages Collection
- **Purpose**: Order-specific real-time chat
- **Security**: Order-based access control
- **Key Features**: Real-time messaging, read status tracking

### Counters Collection
- **Purpose**: Sequential order ID generation
- **Security**: Admin-only access
- **Key Features**: Monthly reset, atomic operations

## 🔧 API Usage Examples

### User Operations

```typescript
import { createUser, getUserByUsername, subscribeToUser } from '@/lib/db';

// Create a new exchange user (admin only)
const result = await createUser({
  username: 'exchange1',
  password: 'hashedPassword',
  role: 'exchange',
  exchangeName: 'Jordan Exchange',
  balance: 1000,
  commissionRates: {
    incoming: { type: 'fixed', value: 5 },
    outgoing: { type: 'percentage', value: 2 }
  },
  assignedBanks: [],
  status: 'active'
});

// Get user by username (for login)
const user = await getUserByUsername('exchange1');

// Subscribe to user changes
const unsubscribe = subscribeToUser('userId', (user) => {
  console.log('User updated:', user);
});
```

### Order Operations

```typescript
import { createOrder, updateOrder, subscribeToOrders } from '@/lib/db';

// Create a new order (auto-generates ID like T25060001)
const order = await createOrder({
  exchangeId: 'userId',
  type: 'outgoing',
  status: 'submitted',
  submittedAmount: 1000,
  commission: 20,
  cliqDetails: {
    mobileNumber: '00962791234567'
  },
  screenshots: ['url1', 'url2']
});

// Update order status
await updateOrder('orderId', {
  status: 'approved',
  finalAmount: 980
});

// Subscribe to orders for an exchange
const unsubscribe = subscribeToOrders((orders) => {
  console.log('Orders updated:', orders);
}, { exchangeId: 'userId' });
```

### Bank Operations

```typescript
import { createPlatformBank, getAssignedBanksForExchange } from '@/lib/db';

// Create platform bank (admin only)
const bank = await createPlatformBank({
  name: 'Jordan Islamic Bank',
  accountNumber: '123456789',
  accountHolder: 'Transfer Management System',
  balance: 50000,
  isActive: true,
  type: 'public'
});

// Get banks assigned to exchange
const assignedBanks = await getAssignedBanksForExchange('exchangeId');
```

### Message Operations

```typescript
import { createMessage, subscribeToOrderMessages } from '@/lib/db';

// Send a message
await createMessage({
  orderId: 'orderId',
  senderId: 'userId',
  senderRole: 'exchange',
  message: 'Order submitted successfully',
  messageType: 'text',
  isRead: false
});

// Subscribe to order messages
const unsubscribe = subscribeToOrderMessages('orderId', (messages) => {
  console.log('Messages:', messages);
});
```

## 🔒 Security Features

### Firestore Rules
- **User Isolation**: Exchanges can only access their own data
- **Admin Privileges**: Full access to all collections
- **Status Checking**: Only active users can perform operations
- **Field-Level Security**: Limited update permissions for exchanges

### Storage Rules
- **File Size Limits**: 5MB maximum for images
- **Content Type Validation**: Only image files allowed
- **Access Control**: Order-based file access permissions
- **Upload Organization**: Structured file paths by order and user

## 🚀 Real-time Features

All collections support real-time updates using Firestore listeners:

- **Automatic Cleanup**: Listeners are properly disposed to prevent memory leaks
- **Error Handling**: Comprehensive error handling for connection issues
- **Performance Optimized**: Efficient queries with proper indexing
- **Mobile Optimized**: Network-aware updates for 3G/4G connections

## 📊 Query Optimization

### Indexes Required

Create composite indexes in Firebase console:

```
Collection: orders
Fields: exchangeId ASC, status ASC, timestamps.created DESC

Collection: orders  
Fields: status ASC, timestamps.created DESC

Collection: bankAssignments
Fields: exchangeId ASC, isActive ASC, createdAt DESC

Collection: messages
Fields: orderId ASC, timestamp DESC
```

## 🔧 Error Handling

All functions return `ApiResponse<T>` with consistent error handling:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

## 🌐 Timezone Handling

All timestamps use Jordanian timezone (Asia/Amman):
- Order creation uses Jordan time for ID generation
- All date operations respect local timezone
- UTC conversion handled automatically

## 📱 Mobile Optimization

- **Efficient Queries**: Minimize data transfer
- **Batch Operations**: Reduce number of database calls  
- **Connection Management**: Handle offline/online states
- **Caching Strategy**: Leverage Firestore offline persistence

## 🔄 Migration Guide

When updating database schema:

1. Update TypeScript types in `types/index.ts`
2. Update database operations in respective files
3. Update security rules in `firestore.rules` and `storage.rules`
4. Test with development data
5. Deploy rules before code changes

## 🧪 Testing

Use Firebase Emulator for testing:

```bash
firebase emulators:start --only firestore,storage
```

Set emulator configuration in tests:

```typescript
import { connectFirestoreEmulator } from 'firebase/firestore';
if (!getApps().length) {
  connectFirestoreEmulator(db, 'localhost', 8080);
}
```

## 📈 Monitoring

Monitor database performance:
- Query performance in Firebase console
- Real-time listener connection counts
- Storage usage and costs
- Security rule evaluations

---

**Phase 3 Complete**: Database Schema & Models with comprehensive CRUD operations, real-time listeners, and security rules. 