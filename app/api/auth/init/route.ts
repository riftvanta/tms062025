import { NextResponse } from 'next/server';
import { collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { hashPassword } from '@/lib/auth';

export async function POST() {
  try {
    // Check if users already exist
    const usersRef = collection(db, 'users');
    const adminQuery = query(usersRef, where('username', '==', 'admin'));
    const exchangeQuery = query(usersRef, where('username', '==', 'exchange'));
    
    const [adminSnapshot, exchangeSnapshot] = await Promise.all([
      getDocs(adminQuery),
      getDocs(exchangeQuery)
    ]);

    const results = [];

    // Create admin user if doesn't exist
    if (adminSnapshot.empty) {
      const adminId = doc(collection(db, 'users')).id;
      const hashedAdminPassword = await hashPassword('admin123');
      
      await setDoc(doc(db, 'users', adminId), {
        username: 'admin',
        password: hashedAdminPassword,
        role: 'admin',
        exchangeName: null,
        contactInfo: {},
        balance: 0,
        commissionRates: {
          incoming: { type: 'fixed', value: 0 },
          outgoing: { type: 'fixed', value: 0 }
        },
        assignedBanks: [],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      results.push('Admin user created');
    } else {
      results.push('Admin user already exists');
    }

    // Create exchange user if doesn't exist
    if (exchangeSnapshot.empty) {
      const exchangeId = doc(collection(db, 'users')).id;
      const hashedExchangePassword = await hashPassword('exchange123');
      
      await setDoc(doc(db, 'users', exchangeId), {
        username: 'exchange',
        password: hashedExchangePassword,
        role: 'exchange',
        exchangeName: 'Test Exchange Office',
        contactInfo: {
          email: 'exchange@example.com',
          phone: '+962123456789'
        },
        balance: 1000,
        commissionRates: {
          incoming: { type: 'percentage', value: 2.5 },
          outgoing: { type: 'fixed', value: 5 }
        },
        assignedBanks: [],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      results.push('Exchange user created');
    } else {
      results.push('Exchange user already exists');
    }

    return NextResponse.json({
      success: true,
      message: 'Default users initialized',
      results,
    });
  } catch (error) {
    console.error('User initialization error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initialize users' },
      { status: 500 }
    );
  }
} 