import React, { useState, useEffect } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, profile, updateProfile } = useAuth();

  useEffect(() => {
    if (user && profile) {
      if (profile.className) {
        navigate('/');
      } else {
        // Automatically set to 9°B if no class is set
        updateProfile({ className: '9°B' }).catch(console.error);
      }
    }
  }, [user, profile, navigate, updateProfile]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center px-6 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-10"
      >
        <div className="text-center space-y-6">
          <div className="relative w-40 h-40 mx-auto rounded-full overflow-hidden shadow-2xl border-4 border-white bg-white flex items-center justify-center">
            <img 
              src="https://i.ibb.co/yFbrQtht/graduation.png" 
              alt="Logo Formatura" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1523050853063-91589436026e?auto=format&fit=crop&q=80&w=400";
              }}
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-[#004d4d] tracking-tight">Formatura 2026</h1>
            <p className="text-blue-400 text-sm font-medium">Portal do Aluno e Administração</p>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white text-blue-900 font-bold py-4 rounded-2xl border border-blue-100 shadow-lg flex items-center justify-center gap-3 hover:bg-blue-50 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-900"></div>
            ) : (
              <>
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                Entrar com Google
              </>
            )}
          </button>
          <p className="text-center text-[11px] text-blue-300 font-semibold uppercase tracking-widest">
            Acesso restrito e seguro
          </p>
        </div>

        <div className="pt-8 text-center">
          <div className="inline-block px-4 py-2 bg-blue-100/50 rounded-full border border-blue-200">
            <p className="text-[10px] text-blue-500 font-bold">
              © 2026 Formatura
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
