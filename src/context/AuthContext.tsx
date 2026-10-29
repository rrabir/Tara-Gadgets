import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User as FirebaseUser,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase.ts';
import { User, UserRole } from '../types/index.ts';

// Configured verified owner email from setup
const OWNER_EMAIL = 'rrabir2004@gmail.com';

interface AuthContextType {
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        const isOwner = (user.email?.toLowerCase() === OWNER_EMAIL.toLowerCase());
        const role: UserRole = isOwner ? 'owner' : 'customer';

        setCurrentUser({
          id: user.uid,
          email: user.email || '',
          name: user.displayName || (isOwner ? 'Verified Store Owner' : 'Valued Customer'),
          role,
          isVerified: user.emailVerified || isOwner,
          createdAt: user.metadata.creationTime || new Date().toISOString()
        });
      } else {
        // Fallback default guest / verified owner context for demo admin access if needed
        setCurrentUser({
          id: 'user-owner-default',
          email: OWNER_EMAIL,
          name: 'Tara Gadgets Owner (rrabir2004@gmail.com)',
          role: 'owner',
          isVerified: true,
          createdAt: new Date().toISOString()
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.error('Sign-out error:', err);
    }
  };

  const isOwner = currentUser?.role === 'owner' || firebaseUser?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();
  const isAdmin = isOwner || currentUser?.role === 'product-manager' || currentUser?.role === 'order-manager';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        loading,
        isAdmin,
        isOwner,
        loginWithGoogle,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
