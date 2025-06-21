import {
  collection,
  doc,
  addDoc,
  updateDoc,
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
import { Message, ChatThread, ApiResponse } from '../../types';
import { getErrorMessage } from '../utils';

const MESSAGES_COLLECTION = 'messages';

// Message Operations
export async function createMessage(messageData: Omit<Message, 'id' | 'timestamp'>): Promise<ApiResponse<Message>> {
  try {
    const now = Timestamp.now();
    const messageWithTimestamp = {
      ...messageData,
      timestamp: now,
    };

    const docRef = await addDoc(collection(db, MESSAGES_COLLECTION), messageWithTimestamp);
    
    const newMessage: Message = {
      id: docRef.id,
      ...messageData,
      timestamp: now.toDate(),
    };

    return {
      success: true,
      data: newMessage,
      message: 'Message sent successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
      message: 'Failed to send message',
    };
  }
}

export async function getMessagesByOrder(orderId: string, limitCount: number = 50): Promise<ApiResponse<Message[]>> {
  try {
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where('orderId', '==', orderId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const messages: Message[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp.toDate(),
      } as Message;
    }).reverse(); // Reverse to get chronological order

    return {
      success: true,
      data: messages,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
      message: 'Failed to fetch messages',
    };
  }
}

export async function markMessageAsRead(messageId: string): Promise<ApiResponse<void>> {
  try {
    const docRef = doc(db, MESSAGES_COLLECTION, messageId);
    await updateDoc(docRef, { isRead: true });

    return {
      success: true,
      message: 'Message marked as read',
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
      message: 'Failed to mark message as read',
    };
  }
}

export async function markOrderMessagesAsRead(orderId: string, userId: string): Promise<ApiResponse<void>> {
  try {
    // Get unread messages for this order that are not from the current user
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where('orderId', '==', orderId),
      where('senderId', '!=', userId),
      where('isRead', '==', false)
    );

    const querySnapshot = await getDocs(q);
    
    // Mark all messages as read
    const updatePromises = querySnapshot.docs.map(doc => 
      updateDoc(doc.ref, { isRead: true })
    );

    await Promise.all(updatePromises);

    return {
      success: true,
      message: 'All messages marked as read',
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
      message: 'Failed to mark messages as read',
    };
  }
}

export async function getUnreadMessageCount(orderId: string, userId: string): Promise<ApiResponse<number>> {
  try {
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where('orderId', '==', orderId),
      where('senderId', '!=', userId),
      where('isRead', '==', false)
    );

    const querySnapshot = await getDocs(q);
    
    return {
      success: true,
      data: querySnapshot.size,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
      message: 'Failed to get unread message count',
    };
  }
}

// Create a system message for order status changes
export async function createSystemMessage(orderId: string, message: string): Promise<ApiResponse<Message>> {
  return createMessage({
    orderId,
    senderId: 'system',
    senderRole: 'admin',
    message,
    messageType: 'system',
    isRead: false,
  });
}

// Real-time Listeners
export function subscribeToOrderMessages(
  orderId: string,
  callback: (messages: Message[]) => void,
  limitCount: number = 50
): () => void {
  const q = query(
    collection(db, MESSAGES_COLLECTION),
    where('orderId', '==', orderId),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );

  return onSnapshot(
    q,
    (querySnapshot) => {
      const messages: Message[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp.toDate(),
        } as Message;
      }).reverse(); // Reverse to get chronological order

      callback(messages);
    },
    (error) => {
      console.error('Error in messages subscription:', error);
      callback([]);
    }
  );
}

export function subscribeToUnreadCount(
  orderId: string,
  userId: string,
  callback: (count: number) => void
): () => void {
  const q = query(
    collection(db, MESSAGES_COLLECTION),
    where('orderId', '==', orderId),
    where('senderId', '!=', userId),
    where('isRead', '==', false)
  );

  return onSnapshot(
    q,
    (querySnapshot) => {
      callback(querySnapshot.size);
    },
    (error) => {
      console.error('Error in unread count subscription:', error);
      callback(0);
    }
  );
}

// Chat Thread utilities
export async function getChatThread(orderId: string, userId: string): Promise<ApiResponse<ChatThread>> {
  try {
    const messagesResult = await getMessagesByOrder(orderId);
    if (!messagesResult.success || !messagesResult.data) {
      throw new Error('Failed to fetch messages');
    }

    const unreadCountResult = await getUnreadMessageCount(orderId, userId);
    if (!unreadCountResult.success) {
      throw new Error('Failed to get unread count');
    }

    const messages = messagesResult.data;
    const lastMessage = messages.length > 0 ? messages[messages.length - 1] : undefined;
    
    // Get unique participant IDs
    const participantSet = new Set(messages.map(msg => msg.senderId));
    const participants = Array.from(participantSet);

    const chatThread: ChatThread = {
      orderId,
      messages,
      lastMessage,
      unreadCount: unreadCountResult.data || 0,
      participants,
    };

    return {
      success: true,
      data: chatThread,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
      message: 'Failed to get chat thread',
    };
  }
}

export function subscribeToChatThread(
  orderId: string,
  userId: string,
  callback: (chatThread: ChatThread) => void
): () => void {
  // Subscribe to messages
  const messagesUnsubscribe = subscribeToOrderMessages(orderId, (messages) => {
    // Get unread count
    getUnreadMessageCount(orderId, userId).then((unreadResult) => {
      const lastMessage = messages.length > 0 ? messages[messages.length - 1] : undefined;
      
      // Get unique participant IDs
      const participantSet = new Set(messages.map(msg => msg.senderId));
      const participants = Array.from(participantSet);

      const chatThread: ChatThread = {
        orderId,
        messages,
        lastMessage,
        unreadCount: unreadResult.data || 0,
        participants,
      };

      callback(chatThread);
    });
  });

  return messagesUnsubscribe;
} 