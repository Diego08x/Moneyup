import React from 'react';
import { motion } from 'motion/react';
import { LogIn, TrendingUp } from 'lucide-react';
import { signInWithGoogle } from '../lib/supabase';

interface LoginProps {
  onLoginSuccess?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [currentHost, setCurrentHost] = React.useState("");

  React.useEffect(() => {
    setCurrentHost(window.location.hostname);
    console.log("Current hostname:", window.location.hostname);
    console.log("Current href:", window.location.href);
  }, []);

  const handleLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await signInWithGoogle();
      if (onLoginSuccess) onLoginSuccess();
    } catch (err: any) {
      console.error("Login failed:", err);
      let message = "Error al iniciar sesión. Por favor intenta de nuevo.";
      
      if (err.message) {
        message = `Error de Autenticación: ${err.message}`;
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
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-sans">
      {/* Background Video Layer */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-slate-950/70 z-10 backdrop-blur-[2px]" />
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source 
            src="https://assets.mixkit.co/videos/preview/mixkit-abstract-technology-vj-loop-background-30232-large.mp4" 
            type="video/mp4" 
          />
        </video>
      </div>

      {/* Decorative Orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse delay-700" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-20 w-full max-w-[460px] px-6"
      >
        <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[40px] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden">
          {/* Top Branding Section */}
          <div className="mb-12">
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-emerald-500 rounded-3xl flex items-center justify-center mb-8 mx-auto shadow-2xl shadow-indigo-500/40 ring-1 ring-white/20"
            >
              <TrendingUp className="text-white w-10 h-10" />
            </motion.div>
            
            <h1 className="text-5xl font-black text-center tracking-tighter text-white mb-3 italic">
              Money<span className="text-indigo-400">Up</span>
            </h1>
            <p className="text-slate-400 font-bold text-center text-[10px] tracking-[0.3em] uppercase">
              Control Financiero Inteligente
            </p>
          </div>

          <div className="relative z-10 space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Bienvenido</h2>
              <p className="text-slate-500 text-sm">Gestiona tus finanzas con el poder de la IA.</p>
            </div>
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-5 rounded-3xl text-sm font-medium text-left ring-1 ring-rose-500/30"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span className="font-black tracking-widest text-[10px] uppercase">Aviso de Sistema</span>
                </div>
                <p className="leading-tight text-xs opacity-90">{error}</p>
                <button 
                  onClick={openInNewTab}
                  className="mt-4 block w-full bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-2xl text-[10px] font-black transition-all active:scale-95 uppercase tracking-widest"
                >
                  Continuar en Ventana Nueva
                </button>
              </motion.div>
            )}

            <motion.button 
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative w-full bg-white text-slate-950 py-5 rounded-2xl font-black flex items-center justify-center gap-4 transition-all shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? (
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-2 border-slate-950 border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                    ACCEDER CON GOOGLE
                  </>
                )}
              </div>
            </motion.button>
            
            <button 
              onClick={() => window.location.reload()}
              className="w-full text-slate-500 text-[10px] uppercase font-black tracking-widest hover:text-white transition-colors py-2"
            >
              🔄 Recargar Interfaz
            </button>
          </div>
          
          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col items-center">
            <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em] font-black italic">
              Military-Grade Encryption
            </p>
            <div className="flex gap-4 mt-4 opacity-10 grayscale">
              <div className="w-10 h-6 border border-white rounded-md" />
              <div className="w-10 h-6 border border-white rounded-md" />
              <div className="w-10 h-6 border border-white rounded-md" />
            </div>
          </div>
        </div>
        
        <p className="mt-10 text-center text-slate-500 text-[10px] font-bold tracking-widest uppercase opacity-50">
          PRODUCIDO POR MONEYUP LTD. © 2024
        </p>
      </motion.div>
    </div>
  );
};
