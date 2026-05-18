import React from 'react';
import { motion } from 'motion/react';
import { LogIn, TrendingUp } from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';

interface LoginProps {
  onLoginSuccess?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await signInWithGoogle();
      if (onLoginSuccess) onLoginSuccess();
    } catch (err: any) {
      console.error("Login failed:", err);
      let message = "Error al iniciar sesión. Por favor intenta de nuevo.";
      
      if (err.code === 'auth/popup-blocked') {
        message = "El navegador bloqueó la ventana de inicio de sesión. Prueba abrir la aplicación en una pestaña nueva.";
      } else if (err.code === 'auth/cancelled-popup-request') {
        message = "La ventana de inicio de sesión se cerró. Inténtalo de nuevo.";
      } else if (err.code === 'auth/unauthorized-domain') {
        message = "Dominio no autorizado. Debes añadir este dominio en la consola de Firebase (Autenticación > Ajustes > Dominios autorizados).";
      } else if (err.message) {
        message = `Error: ${err.message}`;
      }
      
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const openInNewTab = () => {
    window.open(window.location.href, '_blank');
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
            Dashboard Financiero Pro
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl space-y-8 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-center mb-2">Bienvenido</h2>
            <p className="text-slate-500 text-sm text-center mb-8">Accede para sincronizar tus finanzas.</p>
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl text-xs font-bold mb-6 text-left"
              >
                <div className="mb-2 font-black">UPS! ALGO SALIÓ MAL</div>
                {error}
                <button 
                  onClick={openInNewTab}
                  className="mt-3 block w-full bg-rose-500 text-white py-2 rounded-xl text-[10px] hover:bg-rose-600 transition-colors"
                >
                  ABRIR EN NUEVA PESTAÑA
                </button>
              </motion.div>
            )}

            <button 
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-white text-slate-950 py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-slate-200 transition-all active:scale-95 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full"
                />
              ) : (
                <>
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                  ENTRAR CON GOOGLE
                </>
              )}
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
