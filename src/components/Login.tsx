import React from 'react';
import { motion } from 'motion/react';
import { LogIn, TrendingUp } from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';

interface LoginProps {
  onLoginSuccess?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      if (onLoginSuccess) onLoginSuccess();
    } catch (error) {
      console.error("Login failed:", error);
      alert("Error al iniciar sesión. Por favor intenta de nuevo.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-12">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12 }}
            className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/40 mb-6"
          >
            <TrendingUp size={40} className="text-white" />
          </motion.div>
          <h1 className="text-5xl font-black italic text-white tracking-tighter mb-2">
            Money<span className="text-indigo-400">Up</span>
          </h1>
          <p className="text-slate-500 font-medium text-center">
            Toma el control total de tus finanzas con el poder de la IA.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl space-y-8 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-center mb-2">Bienvenido de nuevo</h2>
            <p className="text-slate-500 text-sm text-center mb-8">Inicia sesión para sincronizar tus datos en todos tus dispositivos.</p>
            
            <button 
              onClick={handleLogin}
              className="w-full bg-white text-slate-950 py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-slate-200 transition-all active:scale-95 shadow-xl"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              Continuar con Google
            </button>
            
            <p className="mt-8 text-[10px] text-slate-600 text-center uppercase tracking-widest font-bold">
              Seguridad de grado bancario AES-256
            </p>
          </div>
          
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl"></div>
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="mt-12 text-center text-slate-600 text-xs">
          Al continuar, aceptas nuestros términos de servicio y políticas de privacidad.
        </div>
      </motion.div>
    </div>
  );
};
