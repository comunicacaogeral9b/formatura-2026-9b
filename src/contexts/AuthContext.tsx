import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  logout: async () => {},
  updateProfile: async () => {},
});

const ADMIN_EMAIL = 'mayaramonteiro.lisboa@gmail.com';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
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
      } else {
        const role: UserRole = user.email === ADMIN_EMAIL ? 'admin' : 'user';
        const newProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          role,
          className: '9°B' // Default to 9°B
        };
        setDoc(userDocRef, newProfile).catch(console.error);
        setProfile(newProfile);
      }
      setLoading(false);
    }, (error) => {
      console.error("Profile listener error:", error);
      setLoading(false);
    });

    return unsubProfile;
  }, [user]);

  const isAdmin = profile?.role === 'admin' || user?.email === ADMIN_EMAIL;

  const logout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, data, { merge: true });
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
