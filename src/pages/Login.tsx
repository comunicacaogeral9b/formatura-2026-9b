import React, { useState, useEffect } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, profile, loginWithCode } = useAuth();

  useEffect(() => {
    if (user && profile?.className) {
      navigate('/');
    }
  }, [user, profile, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    setLoading(true);
    setError('');
    try {
      await loginWithCode(code);
    } catch (err: any) {
      setError(err.message || 'Erro ao entrar. Verifique o código.');
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

        <div className="bg-white p-8 rounded-3xl shadow-xl border border-blue-100 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold text-blue-900">Código de Convite</h2>
            <p className="text-xs text-blue-400">Insira o código para acessar o portal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <input 
                type="text"
                placeholder="Digite seu código"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full p-4 rounded-2xl bg-blue-50 border-2 border-transparent focus:border-[#004d4d] outline-none text-center font-black text-xl tracking-widest text-[#004d4d] transition-all"
                maxLength={10}
              />
              {error && (
                <p className="text-[10px] text-red-500 font-bold text-center uppercase tracking-wider">
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !code}
              className="w-full bg-[#004d4d] text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 hover:bg-[#003d3d] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <>Entrar no Portal</>
              )}
            </button>
          </form>
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
