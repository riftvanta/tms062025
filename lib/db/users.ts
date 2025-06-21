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
} from 'firebase/firestore';
import { db } from '../firebase';
import { User, UserFilters, ApiResponse } from '../../types';
import { getErrorMessage } from '../utils';

const COLLECTION_NAME = 'users';

// CRUD Operations
export async function createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<User>> {
  try {
    const now = Timestamp.now();
    const userWithTimestamps = {
      ...userData,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), userWithTimestamps);
    
    const newUser: User = {
      id: docRef.id,
      ...userData,
      createdAt: now.toDate(),
      updatedAt: now.toDate(),
    };

    return {
      success: true,
      data: newUser,
      message: 'User created successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
      message: 'Failed to create user',
    };
  }
}

export async function getUserById(userId: string): Promise<ApiResponse<User | null>> {
  try {
    const docRef = doc(db, COLLECTION_NAME, userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const user: User = {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as User;

      return {
        success: true,
        data: user,
      };
    } else {
      return {
        success: true,
        data: null,
        message: 'User not found',
      };
    }
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
      message: 'Failed to fetch user',
    };
  }
}

export async function getUserByUsername(username: string): Promise<ApiResponse<User | null>> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('username', '==', username),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      const user: User = {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as User;

      return {
        success: true,
        data: user,
      };
    } else {
      return {
        success: true,
        data: null,
        message: 'User not found',
      };
    }
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
      message: 'Failed to fetch user by username',
    };
  }
}

export async function updateUser(userId: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<ApiResponse<User>> {
  try {
    const docRef = doc(db, COLLECTION_NAME, userId);
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    await updateDoc(docRef, updateData);

    // Fetch updated user
    const result = await getUserById(userId);
    if (result.success && result.data) {
      return {
        success: true,
        data: result.data,
        message: 'User updated successfully',
      };
    } else {
      throw new Error('Failed to fetch updated user');
    }
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
      message: 'Failed to update user',
    };
  }
}

export async function deleteUser(userId: string): Promise<ApiResponse<void>> {
  try {
    const docRef = doc(db, COLLECTION_NAME, userId);
    await deleteDoc(docRef);

    return {
      success: true,
      message: 'User deleted successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
      message: 'Failed to delete user',
    };
  }
}

// Query Operations
export async function getUsers(filters?: UserFilters): Promise<ApiResponse<User[]>> {
  try {
    let q = query(collection(db, COLLECTION_NAME));
    const constraints: QueryConstraint[] = [];

    // Apply filters
    if (filters?.role && filters.role.length > 0) {
      constraints.push(where('role', 'in', filters.role));
    }

    if (filters?.status && filters.status.length > 0) {
      constraints.push(where('status', 'in', filters.status));
    }

    // Add ordering
    constraints.push(orderBy('createdAt', 'desc'));

    if (constraints.length > 0) {
      q = query(collection(db, COLLECTION_NAME), ...constraints);
    }

    const querySnapshot = await getDocs(q);
    const users: User[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as User;
    });

    // Apply client-side search filter (Firestore doesn't support full-text search)
    let filteredUsers = users;
    if (filters?.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filteredUsers = users.filter(user => 
        user.username.toLowerCase().includes(searchTerm) ||
        user.exchangeName?.toLowerCase().includes(searchTerm) ||
        user.contactInfo?.email?.toLowerCase().includes(searchTerm)
      );
    }

    return {
      success: true,
      data: filteredUsers,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
      message: 'Failed to fetch users',
    };
  }
}

export async function getExchangeUsers(): Promise<ApiResponse<User[]>> {
  return getUsers({ role: ['exchange'], status: ['active'] });
}

export async function updateUserBalance(userId: string, newBalance: number): Promise<ApiResponse<User>> {
  return updateUser(userId, { balance: newBalance });
}

// Real-time Listeners
export function subscribeToUser(userId: string, callback: (user: User | null) => void): () => void {
  const docRef = doc(db, COLLECTION_NAME, userId);
  
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const user: User = {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as User;
        callback(user);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('Error in user subscription:', error);
      callback(null);
    }
  );
}

export function subscribeToUsers(
  callback: (users: User[]) => void,
  filters?: UserFilters
): () => void {
  let q = query(collection(db, COLLECTION_NAME));
  const constraints: QueryConstraint[] = [];

  // Apply filters
  if (filters?.role && filters.role.length > 0) {
    constraints.push(where('role', 'in', filters.role));
  }

  if (filters?.status && filters.status.length > 0) {
    constraints.push(where('status', 'in', filters.status));
  }

  // Add ordering
  constraints.push(orderBy('createdAt', 'desc'));

  if (constraints.length > 0) {
    q = query(collection(db, COLLECTION_NAME), ...constraints);
  }

  return onSnapshot(
    q,
    (querySnapshot) => {
      const users: User[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as User;
      });

      // Apply client-side search filter
      let filteredUsers = users;
      if (filters?.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        filteredUsers = users.filter(user => 
          user.username.toLowerCase().includes(searchTerm) ||
          user.exchangeName?.toLowerCase().includes(searchTerm) ||
          user.contactInfo?.email?.toLowerCase().includes(searchTerm)
        );
      }

      callback(filteredUsers);
    },
    (error) => {
      console.error('Error in users subscription:', error);
      callback([]);
    }
  );
}

// Balance update listener for specific user
export function subscribeToUserBalance(userId: string, callback: (balance: number) => void): () => void {
  const docRef = doc(db, COLLECTION_NAME, userId);
  
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        callback(data.balance || 0);
      } else {
        callback(0);
      }
    },
    (error) => {
      console.error('Error in balance subscription:', error);
      callback(0);
    }
  );
} 