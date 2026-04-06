import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInAnonymously, signOut, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
  loginWithCode: (code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  logout: async () => {},
  loginWithCode: async () => {},
});

const CODES = {
  ADMIN: 'ADM9B',
  STUDENT: 'TURMA9B'
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);
    const unsubProfile = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      }
      setLoading(false);
    }, (error) => {
      console.error("Profile listener error:", error);
      setLoading(false);
    });

    return unsubProfile;
  }, [user]);

  const isAdmin = profile?.role === 'admin';

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const loginWithCode = async (code: string) => {
    const upperCode = code.toUpperCase();
    let role: UserRole | null = null;

    if (upperCode === CODES.ADMIN) role = 'admin';
    else if (upperCode === CODES.STUDENT) role = 'user';

    if (!role) {
      throw new Error('Código inválido');
    }

    const { user: anonUser } = await signInAnonymously(auth);
    const userDocRef = doc(db, 'users', anonUser.uid);
    
    const newProfile: UserProfile = {
      uid: anonUser.uid,
      email: 'anonimo@formatura.com',
      role,
      className: '9°B'
    };

    await setDoc(userDocRef, newProfile);
    setProfile(newProfile);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, logout, loginWithCode }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
