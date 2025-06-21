import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  QueryConstraint,
  runTransaction,
  increment,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Order, OrderStatus, OrderFilters, ApiResponse, OrderStatistics } from '../../types';
import { getErrorMessage, getJordanTime } from '../utils';

const COLLECTION_NAME = 'orders';
const COUNTERS_COLLECTION = 'counters';

// Order ID Generation
async function generateOrderId(): Promise<string> {
  const now = getJordanTime();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const monthKey = `${year}${month}`;

  return runTransaction(db, async (transaction) => {
    const counterRef = doc(db, COUNTERS_COLLECTION, `orders_${monthKey}`);
    const counterDoc = await transaction.get(counterRef);

    let currentCount = 1;
    if (counterDoc.exists()) {
      currentCount = counterDoc.data().count + 1;
      transaction.update(counterRef, { count: increment(1) });
    } else {
      transaction.set(counterRef, { count: 1, month: monthKey });
    }

    const sequence = currentCount.toString().padStart(4, '0');
    return `T${year}${month}${sequence}`;
  });
}

// CRUD Operations
export async function createOrder(orderData: Omit<Order, 'id' | 'orderId' | 'timestamps'>): Promise<ApiResponse<Order>> {
  try {
    const orderId = await generateOrderId();
    const now = Timestamp.now();
    
    const orderWithMetadata = {
      ...orderData,
      orderId,
      timestamps: {
        created: now,
        updated: now,
      },
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), orderWithMetadata);
    
    const newOrder: Order = {
      id: docRef.id,
      orderId,
      ...orderData,
      timestamps: {
        created: now.toDate(),
        updated: now.toDate(),
      },
    };

    return {
      success: true,
      data: newOrder,
      message: 'Order created successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
      message: 'Failed to create order',
    };
  }
}

export async function getOrderById(orderId: string): Promise<ApiResponse<Order | null>> {
  try {
    const docRef = doc(db, COLLECTION_NAME, orderId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const order: Order = {
        id: docSnap.id,
        ...data,
        timestamps: {
          ...data.timestamps,
          created: data.timestamps.created.toDate(),
          updated: data.timestamps.updated.toDate(),
          completed: data.timestamps.completed?.toDate(),
          approved: data.timestamps.approved?.toDate(),
          rejected: data.timestamps.rejected?.toDate(),
        },
      } as Order;

      return {
        success: true,
        data: order,
      };
    } else {
      return {
        success: true,
        data: null,
        message: 'Order not found',
      };
    }
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
      message: 'Failed to fetch order',
    };
  }
}

export async function getOrderByOrderId(orderId: string): Promise<ApiResponse<Order | null>> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('orderId', '==', orderId),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      const order: Order = {
        id: doc.id,
        ...data,
        timestamps: {
          ...data.timestamps,
          created: data.timestamps.created.toDate(),
          updated: data.timestamps.updated.toDate(),
          completed: data.timestamps.completed?.toDate(),
          approved: data.timestamps.approved?.toDate(),
          rejected: data.timestamps.rejected?.toDate(),
        },
      } as Order;

      return {
        success: true,
        data: order,
      };
    } else {
      return {
        success: true,
        data: null,
        message: 'Order not found',
      };
    }
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
      message: 'Failed to fetch order by order ID',
    };
  }
}

export async function updateOrder(orderId: string, updates: Partial<Omit<Order, 'id' | 'orderId' | 'timestamps'>>): Promise<ApiResponse<Order>> {
  try {
    const docRef = doc(db, COLLECTION_NAME, orderId);
    const now = Timestamp.now();
    
    const updateData: any = {
      ...updates,
      'timestamps.updated': now,
    };

    if (updates.status) {
      switch (updates.status) {
        case 'approved':
          updateData['timestamps.approved'] = now;
          break;
        case 'rejected':
          updateData['timestamps.rejected'] = now;
          break;
        case 'completed':
          updateData['timestamps.completed'] = now;
          break;
      }
    }

    await updateDoc(docRef, updateData);
    const result = await getOrderById(orderId);
    
    if (result.success && result.data) {
      return {
        success: true,
        data: result.data,
        message: 'Order updated successfully',
      };
    } else {
      throw new Error('Failed to fetch updated order');
    }
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
      message: 'Failed to update order',
    };
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus, notes?: string): Promise<ApiResponse<Order>> {
  const updates: any = { status };
  
  if (notes) {
    if (status === 'rejected') {
      updates.rejectionReason = notes;
    } else {
      updates.adminNotes = notes;
    }
  }

  return updateOrder(orderId, updates);
}

export async function deleteOrder(orderId: string): Promise<ApiResponse<void>> {
  try {
    const docRef = doc(db, COLLECTION_NAME, orderId);
    await deleteDoc(docRef);

    return {
      success: true,
      message: 'Order deleted successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
      message: 'Failed to delete order',
    };
  }
}

// Query Operations
export async function getOrders(filters?: OrderFilters): Promise<ApiResponse<Order[]>> {
  try {
    let q = query(collection(db, COLLECTION_NAME));
    const constraints: QueryConstraint[] = [];

    if (filters?.status && filters.status.length > 0) {
      constraints.push(where('status', 'in', filters.status));
    }

    if (filters?.type && filters.type.length > 0) {
      constraints.push(where('type', 'in', filters.type));
    }

    if (filters?.exchangeId) {
      constraints.push(where('exchangeId', '==', filters.exchangeId));
    }

    constraints.push(orderBy('timestamps.created', 'desc'));

    if (constraints.length > 0) {
      q = query(collection(db, COLLECTION_NAME), ...constraints);
    }

    const querySnapshot = await getDocs(q);
    const orders: Order[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timestamps: {
          ...data.timestamps,
          created: data.timestamps.created.toDate(),
          updated: data.timestamps.updated.toDate(),
          completed: data.timestamps.completed?.toDate(),
          approved: data.timestamps.approved?.toDate(),
          rejected: data.timestamps.rejected?.toDate(),
        },
      } as Order;
    });

    return {
      success: true,
      data: orders,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
      message: 'Failed to fetch orders',
    };
  }
}

export async function getOrdersByExchange(exchangeId: string, filters?: Omit<OrderFilters, 'exchangeId'>): Promise<ApiResponse<Order[]>> {
  return getOrders({ ...filters, exchangeId });
}

export async function getPendingOrders(): Promise<ApiResponse<Order[]>> {
  return getOrders({ status: ['submitted', 'pending_review'] });
}

// Statistics
export async function getOrderStatistics(exchangeId?: string): Promise<ApiResponse<OrderStatistics>> {
  try {
    const filters: OrderFilters = exchangeId ? { exchangeId } : {};
    const ordersResult = await getOrders(filters);
    
    if (!ordersResult.success || !ordersResult.data) {
      throw new Error('Failed to fetch orders for statistics');
    }

    const orders = ordersResult.data;
    
    const stats: OrderStatistics = {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => ['submitted', 'pending_review', 'approved', 'processing'].includes(o.status)).length,
      completedOrders: orders.filter(o => o.status === 'completed').length,
      rejectedOrders: orders.filter(o => o.status === 'rejected').length,
      totalAmount: orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.submittedAmount, 0),
      totalCommission: orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.commission, 0),
      averageProcessingTime: 0, // Calculate based on timestamps
    };

    // Calculate average processing time for completed orders
    const completedOrders = orders.filter(o => o.status === 'completed' && o.timestamps.completed);
    if (completedOrders.length > 0) {
      const totalProcessingTime = completedOrders.reduce((sum, order) => {
        const created = order.timestamps.created.getTime();
        const completed = order.timestamps.completed!.getTime();
        return sum + (completed - created);
      }, 0);
      
      stats.averageProcessingTime = Math.round(totalProcessingTime / completedOrders.length / (1000 * 60 * 60)); // Convert to hours
    }

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
      message: 'Failed to calculate order statistics',
    };
  }
}

// Real-time Listeners
export function subscribeToOrder(orderId: string, callback: (order: Order | null) => void): () => void {
  const docRef = doc(db, COLLECTION_NAME, orderId);
  
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const order: Order = {
          id: docSnap.id,
          ...data,
          timestamps: {
            ...data.timestamps,
            created: data.timestamps.created.toDate(),
            updated: data.timestamps.updated.toDate(),
            completed: data.timestamps.completed?.toDate(),
            approved: data.timestamps.approved?.toDate(),
            rejected: data.timestamps.rejected?.toDate(),
          },
        } as Order;
        callback(order);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('Error in order subscription:', error);
      callback(null);
    }
  );
}

export function subscribeToOrders(
  callback: (orders: Order[]) => void,
  filters?: OrderFilters
): () => void {
  let q = query(collection(db, COLLECTION_NAME));
  const constraints: QueryConstraint[] = [];

  if (filters?.status && filters.status.length > 0) {
    constraints.push(where('status', 'in', filters.status));
  }

  if (filters?.type && filters.type.length > 0) {
    constraints.push(where('type', 'in', filters.type));
  }

  if (filters?.exchangeId) {
    constraints.push(where('exchangeId', '==', filters.exchangeId));
  }

  constraints.push(orderBy('timestamps.created', 'desc'));

  if (constraints.length > 0) {
    q = query(collection(db, COLLECTION_NAME), ...constraints);
  }

  return onSnapshot(
    q,
    (querySnapshot) => {
      const orders: Order[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamps: {
            ...data.timestamps,
            created: data.timestamps.created.toDate(),
            updated: data.timestamps.updated.toDate(),
            completed: data.timestamps.completed?.toDate(),
            approved: data.timestamps.approved?.toDate(),
            rejected: data.timestamps.rejected?.toDate(),
          },
        } as Order;
      });

      callback(orders);
    },
    (error) => {
      console.error('Error in orders subscription:', error);
      callback([]);
    }
  );
}

export function subscribeToPendingOrders(callback: (orders: Order[]) => void): () => void {
  return subscribeToOrders(callback, { status: ['submitted', 'pending_review'] });
}

export function subscribeToExchangeOrders(exchangeId: string, callback: (orders: Order[]) => void): () => void {
  return subscribeToOrders(callback, { exchangeId });
} 