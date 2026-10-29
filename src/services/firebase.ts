import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Product, Order, StoreSettings, AuditLogEntry } from '../types/index.ts';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore with the provisioned database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Firebase Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Operation Types for error diagnosis as mandated by the skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection check as required by Firebase skill
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline or unreachable, using local fallback.');
      return false;
    }
    // Any permission or other response means client reached server
    return true;
  }
}

// Fire initial test on boot
testFirestoreConnection().catch(() => {});

// Firestore Database Service for Products
export const firestoreService = {
  // Products
  async getProducts(): Promise<Product[]> {
    const path = 'products';
    try {
      const snap = await getDocs(collection(db, path));
      const list: Product[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Product);
      });
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
      return [];
    }
  },

  async setProduct(product: Product): Promise<void> {
    const path = `products/${product.id}`;
    try {
      await setDoc(doc(db, 'products', product.id), {
        ...product,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  async deleteProduct(id: string): Promise<void> {
    const path = `products/${id}`;
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  },

  // Orders
  async saveOrder(order: Order): Promise<void> {
    const path = `orders/${order.id}`;
    try {
      await setDoc(doc(db, 'orders', order.id), {
        ...order,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  async getOrders(): Promise<Order[]> {
    const path = 'orders';
    try {
      const snap = await getDocs(collection(db, path));
      const list: Order[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Order);
      });
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
      return [];
    }
  },

  async updateOrderStatus(orderId: string, status: string, note?: string): Promise<void> {
    const path = `orders/${orderId}`;
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        orderStatus: status,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  },

  // Audit Logs
  async addAuditLog(entry: AuditLogEntry): Promise<void> {
    const path = `auditLogs/${entry.id}`;
    try {
      await setDoc(doc(db, 'auditLogs', entry.id), entry);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  // Store Settings
  async getSettings(): Promise<StoreSettings | null> {
    const path = 'settings/store_config';
    try {
      const snap = await getDoc(doc(db, 'settings', 'store_config'));
      if (snap.exists()) {
        return snap.data() as StoreSettings;
      }
      return null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return null;
    }
  },

  async saveSettings(settings: StoreSettings): Promise<void> {
    const path = 'settings/store_config';
    try {
      await setDoc(doc(db, 'settings', 'store_config'), settings, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }
};
