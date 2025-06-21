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
  onSnapshot,
  Timestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '../firebase';
import { PlatformBank, BankAssignment, ApiResponse } from '../../types';
import { getErrorMessage } from '../utils';

const PLATFORM_BANKS_COLLECTION = 'platformBanks';
const BANK_ASSIGNMENTS_COLLECTION = 'bankAssignments';

// Platform Banks Operations
export async function createPlatformBank(bankData: Omit<PlatformBank, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<PlatformBank>> {
  try {
    const now = Timestamp.now();
    const bankWithTimestamps = {
      ...bankData,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, PLATFORM_BANKS_COLLECTION), bankWithTimestamps);
    
    const newBank: PlatformBank = {
      id: docRef.id,
      ...bankData,
      createdAt: now.toDate(),
      updatedAt: now.toDate(),
    };

    return {
      success: true,
      data: newBank,
      message: 'Platform bank created successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
      message: 'Failed to create platform bank',
    };
  }
}

export async function getPlatformBankById(bankId: string): Promise<ApiResponse<PlatformBank | null>> {
  try {
    const docRef = doc(db, PLATFORM_BANKS_COLLECTION, bankId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const bank: PlatformBank = {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as PlatformBank;

      return {
        success: true,
        data: bank,
      };
    } else {
      return {
        success: true,
        data: null,
        message: 'Platform bank not found',
      };
    }
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
      message: 'Failed to fetch platform bank',
    };
  }
}

export async function updatePlatformBank(bankId: string, updates: Partial<Omit<PlatformBank, 'id' | 'createdAt'>>): Promise<ApiResponse<PlatformBank>> {
  try {
    const docRef = doc(db, PLATFORM_BANKS_COLLECTION, bankId);
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    await updateDoc(docRef, updateData);

    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const bank: PlatformBank = {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as PlatformBank;

      return {
        success: true,
        data: bank,
        message: 'Platform bank updated successfully',
      };
    } else {
      throw new Error('Bank not found after update');
    }
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
      message: 'Failed to update platform bank',
    };
  }
}

export async function deletePlatformBank(bankId: string): Promise<ApiResponse<void>> {
  try {
    const docRef = doc(db, PLATFORM_BANKS_COLLECTION, bankId);
    await deleteDoc(docRef);

    return {
      success: true,
      message: 'Platform bank deleted successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
      message: 'Failed to delete platform bank',
    };
  }
}

export async function getPlatformBanks(activeOnly: boolean = false): Promise<ApiResponse<PlatformBank[]>> {
  try {
    let q = query(collection(db, PLATFORM_BANKS_COLLECTION), orderBy('createdAt', 'desc'));
    
    if (activeOnly) {
      q = query(collection(db, PLATFORM_BANKS_COLLECTION), where('isActive', '==', true), orderBy('createdAt', 'desc'));
    }

    const querySnapshot = await getDocs(q);
    const banks: PlatformBank[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as PlatformBank;
    });

    return {
      success: true,
      data: banks,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
      message: 'Failed to fetch platform banks',
    };
  }
}

export async function updatePlatformBankBalance(bankId: string, newBalance: number): Promise<ApiResponse<PlatformBank>> {
  return updatePlatformBank(bankId, { balance: newBalance });
}

// Bank Assignments Operations
export async function createBankAssignment(assignmentData: Omit<BankAssignment, 'id' | 'createdAt'>): Promise<ApiResponse<BankAssignment>> {
  try {
    const now = Timestamp.now();
    const assignmentWithTimestamp = {
      ...assignmentData,
      createdAt: now,
    };

    const docRef = await addDoc(collection(db, BANK_ASSIGNMENTS_COLLECTION), assignmentWithTimestamp);
    
    const newAssignment: BankAssignment = {
      id: docRef.id,
      ...assignmentData,
      createdAt: now.toDate(),
    };

    return {
      success: true,
      data: newAssignment,
      message: 'Bank assignment created successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
      message: 'Failed to create bank assignment',
    };
  }
}

export async function getBankAssignmentsByExchange(exchangeId: string): Promise<ApiResponse<BankAssignment[]>> {
  try {
    const q = query(
      collection(db, BANK_ASSIGNMENTS_COLLECTION),
      where('exchangeId', '==', exchangeId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const assignments: BankAssignment[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
      } as BankAssignment;
    });

    return {
      success: true,
      data: assignments,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
      message: 'Failed to fetch bank assignments',
    };
  }
}

export async function updateBankAssignment(assignmentId: string, updates: Partial<Omit<BankAssignment, 'id' | 'createdAt'>>): Promise<ApiResponse<BankAssignment>> {
  try {
    const docRef = doc(db, BANK_ASSIGNMENTS_COLLECTION, assignmentId);
    await updateDoc(docRef, updates);

    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const assignment: BankAssignment = {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt.toDate(),
      } as BankAssignment;

      return {
        success: true,
        data: assignment,
        message: 'Bank assignment updated successfully',
      };
    } else {
      throw new Error('Assignment not found after update');
    }
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
      message: 'Failed to update bank assignment',
    };
  }
}

export async function deleteBankAssignment(assignmentId: string): Promise<ApiResponse<void>> {
  try {
    const docRef = doc(db, BANK_ASSIGNMENTS_COLLECTION, assignmentId);
    await deleteDoc(docRef);

    return {
      success: true,
      message: 'Bank assignment deleted successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
      message: 'Failed to delete bank assignment',
    };
  }
}



// Get assigned banks for an exchange with bank details
export async function getAssignedBanksForExchange(exchangeId: string): Promise<ApiResponse<PlatformBank[]>> {
  try {
    // Get assignments for the exchange
    const assignmentsResult = await getBankAssignmentsByExchange(exchangeId);
    if (!assignmentsResult.success || !assignmentsResult.data) {
      return {
        success: false,
        error: assignmentsResult.error || 'Failed to fetch assignments',
        message: assignmentsResult.message || 'Failed to fetch bank assignments',
      };
    }

    const bankIds = assignmentsResult.data.map(assignment => assignment.bankId);
    
    if (bankIds.length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    // Get bank details for assigned banks
    const banksResult = await getPlatformBanks(true);
    if (!banksResult.success || !banksResult.data) {
      return banksResult;
    }

    const assignedBanks = banksResult.data.filter(bank => bankIds.includes(bank.id));

    return {
      success: true,
      data: assignedBanks,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
      message: 'Failed to fetch assigned banks for exchange',
    };
  }
}

// Real-time Listeners
export function subscribeToPlatformBanks(callback: (banks: PlatformBank[]) => void, activeOnly: boolean = false): () => void {
  let q = query(collection(db, PLATFORM_BANKS_COLLECTION), orderBy('createdAt', 'desc'));
  
  if (activeOnly) {
    q = query(collection(db, PLATFORM_BANKS_COLLECTION), where('isActive', '==', true), orderBy('createdAt', 'desc'));
  }

  return onSnapshot(
    q,
    (querySnapshot) => {
      const banks: PlatformBank[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as PlatformBank;
      });

      callback(banks);
    },
    (error) => {
      console.error('Error in platform banks subscription:', error);
      callback([]);
    }
  );
}

export function subscribeToBankAssignments(exchangeId: string, callback: (assignments: BankAssignment[]) => void): () => void {
  const q = query(
    collection(db, BANK_ASSIGNMENTS_COLLECTION),
    where('exchangeId', '==', exchangeId),
    where('isActive', '==', true),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (querySnapshot) => {
      const assignments: BankAssignment[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
        } as BankAssignment;
      });

      callback(assignments);
    },
    (error) => {
      console.error('Error in bank assignments subscription:', error);
      callback([]);
    }
  );
} 