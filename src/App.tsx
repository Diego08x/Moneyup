import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Plus, 
  History, 
  BrainCircuit, 
  X, 
  ArrowUpRight, 
  ArrowDownRight,
  PieChart as PieChartIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import ReactMarkdown from 'react-markdown';

import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utils ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  description: string;
}

interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  color: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

const CATEGORIES = {
  income: ['Sueldo', 'Freelance', 'Regalo', 'Inversión', 'Otros'],
  expense: ['Comida', 'Transporte', 'Entretenimiento', 'Vivienda', 'Suscripciones', 'Educación', 'Salud', 'Otros']
};

const CATEGORY_COLORS: Record<string, string> = {
  Comida: '#fbbf24',
  Transporte: '#60a5fa',
  Entretenimiento: '#f472b6',
  Vivienda: '#a78bfa',
  Suscripciones: '#34d399',
  Educación: '#fb7185',
  Salud: '#cffafe',
  Sueldo: '#10b981',
  Otros: '#94a3b8'
};

const LEARN_TOPICS = [
  { 
    title: "La Regla 50/30/20", 
    desc: "Divide tus ingresos: 50% necesidades, 30% deseos, 20% ahorros.", 
    icon: "📊" 
  },
  { 
    title: "Interés Compuesto", 
    desc: "El dinero trabajando para ti. Empieza hoy, no mañana.", 
    icon: "📈" 
  },
  { 
    title: "Fondo de Emergencia", 
    desc: "Ahorra al menos 3 meses de tus gastos básicos para imprevistos.", 
    icon: "🛡️" 
  },
  { 
    title: "Crédito Inteligente", 
    desc: "Las tarjetas de crédito no son dinero extra, son préstamos que deben pagarse cada mes.", 
    icon: "💳" 
  },
];

// --- Components ---

const Card = ({ children, className, id, onClick }: { children: React.ReactNode, className?: string, id?: string, onClick?: () => void }) => (
  <div id={id} onClick={onClick} className={cn("bg-slate-900 border border-slate-800 rounded-[2rem] p-6 shadow-xl", className)}>
    {children}
  </div>
);

const StatCard = ({ title, amount, type, icon: Icon, id }: { title: string, amount: number, type: 'balance' | 'income' | 'expense', icon: any, id?: string }) => {
  const isIncome = type === 'income';
  const isExpense = type === 'expense';
  
  return (
    <Card id={id} className="relative overflow-hidden group border-slate-800 bg-slate-900">
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1">{title}</p>
          <h3 className="text-3xl font-black text-white tracking-tight">
            ${amount.toLocaleString('es-CL')}
          </h3>
        </div>
        <div className={cn(
          "p-3 rounded-2xl transition-all duration-300",
          isIncome ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : 
          isExpense ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : 
          "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
        )}>
          <Icon size={20} />
        </div>
      </div>
      <div className={cn(
        "absolute -bottom-10 -right-10 w-24 h-24 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-40",
        isIncome ? "bg-emerald-500" : 
        isExpense ? "bg-rose-500" : 
        "bg-indigo-500"
      )} />
    </Card>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'metas' | 'movimientos' | 'aprende'>('dashboard');
  
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('moneyup_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('moneyup_goals');
    return saved ? JSON.parse(saved) : [];
  });

  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isAskingAi, setIsAskingAi] = useState(false);

  // Form State
  const [newType, setNewType] = useState<'income' | 'expense'>('expense');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    localStorage.setItem('moneyup_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('moneyup_goals', JSON.stringify(goals));
  }, [goals]);

  const totals = transactions.reduce((acc, t) => {
    if (t.type === 'income') acc.income += t.amount;
    else acc.expense += t.amount;
    return acc;
  }, { income: 0, expense: 0 });

  const balance = totals.income - totals.expense;

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAmount || !newCategory) return;

    const transaction: Transaction = {
      id: crypto.randomUUID(),
      type: newType,
      amount: parseFloat(newAmount),
      category: newCategory,
      description: newDesc,
      date: new Date().toISOString(),
    };

    setTransactions([transaction, ...transactions]);
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setNewAmount('');
    setNewCategory('');
    setNewDesc('');
    setNewType('expense');
  };

  const getAiAdvice = async () => {
    setIsAskingAi(true);
    setAiAdvice(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const resp = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({ 
          transactions: transactions.slice(0, 10),
          userProfile: { displayName: 'User', walletBalance: balance }
        }),
      });
      
      clearTimeout(timeoutId);
      const data = await resp.json();
      
      if (!resp.ok) {
        throw new Error(data.details || data.error || "Error en el servidor");
      }
      
      setAiAdvice(data.advice || "No pude generar un consejo.");
    } catch (err: any) {
      console.error(err);
      if (err.name === 'AbortError') {
        setAiAdvice("La consulta tardó demasiado. Por favor intenta de nuevo.");
      } else {
        setAiAdvice(`Error: ${err.message || "No pude obtener consejos en este momento."}`);
      }
    } finally {
      setIsAskingAi(false);
    }
  };

  const handleAddGoal = () => {
    const name = prompt("Nombre de la meta:");
    const target = prompt("Monto objetivo:");
    if (!name || !target) return;

    const newGoal: Goal = {
      id: crypto.randomUUID(),
      name,
      target: parseFloat(target),
      current: 0,
      color: 'from-indigo-500 to-purple-500'
    };
    setGoals([...goals, newGoal]);
  };

  const handleDeleteGoal = (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta meta?")) {
      setGoals(goals.filter(g => g.id !== id));
    }
  };

  const handleUpdateGoal = (id: string) => {
    const amount = prompt("Monto a sumar:");
    if (!amount) return;

    setGoals(goals.map(g => {
      if (g.id === id) {
        return { ...g, current: Math.min(g.target, g.current + parseFloat(amount)) };
      }
      return g;
    }));
  };

  const filteredTransactions = transactions.filter(t => {
    if (filterType === 'all') return true;
    return t.type === filterType;
  });

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isTyping) return;

    const newUserMsg: ChatMessage = { role: 'user', text: chatInput };
    setChatMessages(prev => [...prev, newUserMsg]);
    setChatInput('');
    setIsTyping(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          messages: [...chatMessages, newUserMsg],
          userProfile: { displayName: 'Mateo', walletBalance: balance },
          transactions: transactions.slice(0, 10)
        })
      });
      
      clearTimeout(timeoutId);
      const data = await resp.json();
      
      if (!resp.ok) {
        throw new Error(data.details || data.error || "Error en el servidor");
      }
      
      setChatMessages(prev => [...prev, { role: 'assistant', text: data.text || "No obtuve respuesta del modelo." }]);
    } catch (err: any) {
      console.error(err);
      let errorMsg = "Hubo un error al conectar con Gemini.";
      if (err.name === 'AbortError') {
        errorMsg = "La conexión con la IA tardó demasiado. Por favor, reintenta.";
      } else if (err.message) {
        errorMsg = `Error: ${err.message}`;
      }
      setChatMessages(prev => [...prev, { role: 'assistant', text: errorMsg }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Chart Data
  const chartData = [
    { name: 'Ingresos', value: totals.income, color: '#10b981' },
    { name: 'Gastos', value: totals.expense, color: '#f43f5e' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950/50 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <TrendingUp className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white italic">
              Money<span className="text-indigo-400">Up</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={cn("text-sm transition-colors", activeTab === 'dashboard' ? "font-bold text-indigo-400" : "font-medium text-slate-400 hover:text-white")}
            >Dashboard</button>
            <button 
              onClick={() => setActiveTab('metas')} 
              className={cn("text-sm transition-colors", activeTab === 'metas' ? "font-bold text-indigo-400" : "font-medium text-slate-400 hover:text-white")}
            >Mis Metas</button>
            <button 
              onClick={() => setActiveTab('movimientos')} 
              className={cn("text-sm transition-colors", activeTab === 'movimientos' ? "font-bold text-indigo-400" : "font-medium text-slate-400 hover:text-white")}
            >Movimientos</button>
            <button 
              onClick={() => setActiveTab('aprende')} 
              className={cn("text-sm transition-colors", activeTab === 'aprende' ? "font-bold text-indigo-400" : "font-medium text-slate-400 hover:text-white")}
            >Aprende</button>
          </div>

          <div className="flex items-center gap-4">
             <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-indigo-500 transition-all active:scale-95 shadow-lg shadow-indigo-500/10 font-bold text-sm"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Nuevo Movimiento</span>
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border border-slate-800 hidden sm:block cursor-pointer" onClick={() => alert("¡Hola, Mateo! Estás en la versión Pro.")}></div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard id="balance-card" title="Balance Total" amount={balance} type="balance" icon={Wallet} />
                <StatCard id="income-card" title="Ingresos Semanales" amount={totals.income} type="income" icon={ArrowUpRight} />
                <StatCard id="expense-card" title="Gastos Semanales" amount={totals.expense} type="expense" icon={ArrowDownRight} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                  <Card className="h-[450px]">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-2xl font-bold text-white">Actividad Financiera</h3>
                        <p className="text-sm text-slate-500">Tus gastos han bajado un 12% vs la semana pasada</p>
                      </div>
                      <div className="flex gap-2 text-[10px] font-bold">
                        <span className="px-3 py-1 bg-slate-800 rounded-full text-slate-400">DIA</span>
                        <span className="px-3 py-1 bg-indigo-600 rounded-full text-white">SEM</span>
                        <span className="px-3 py-1 bg-slate-800 rounded-full text-slate-400">MES</span>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height="80%">
                      <BarChart data={chartData} margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} 
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} 
                          tickFormatter={(val) => `$${val/1000}k`}
                        />
                        <Tooltip 
                          cursor={{ fill: '#1e293b', opacity: 0.4 }}
                          contentStyle={{ 
                            backgroundColor: '#0f172a',
                            borderRadius: '16px', 
                            border: '1px solid #1e293b', 
                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)',
                            fontFamily: 'sans-serif'
                          }}
                        />
                        <Bar dataKey="value" radius={[12, 12, 12, 12]} barSize={60}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="cursor-pointer hover:bg-slate-800 transition-colors" onClick={() => setActiveTab('metas')}>
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Metas de Ahorro</h3>
                        <Plus size={14} className="text-indigo-400" />
                      </div>
                      <div className="space-y-6">
                        {goals.map(goal => (
                          <div key={goal.id}>
                            <div className="flex justify-between text-xs mb-2">
                              <span className="text-slate-400">{goal.name}</span>
                              <span className="font-bold text-white">{Math.round((goal.current / goal.target) * 100)}%</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                              <div className={cn("h-full bg-gradient-to-r w-[var(--progress)]", goal.color)} style={{ '--progress': `${(goal.current / goal.target) * 100}%` } as any}></div>
                            </div>
                          </div>
                        ))}
                        {goals.length === 0 && (
                          <div className="py-10 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
                            No hay metas activas.
                          </div>
                        )}
                      </div>
                    </Card>

                    <Card>
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Últimos Movimientos</h3>
                        <button 
                          onClick={() => setActiveTab('movimientos')}
                          className="text-[10px] text-indigo-400 font-bold hover:underline"
                        >VER TODOS</button>
                      </div>
                      <div className="space-y-4">
                        {transactions.slice(0, 4).map((t) => (
                          <div key={t.id} className="flex justify-between items-center text-xs">
                             <div className="flex items-center gap-2">
                               <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                               <span className="text-slate-300">{t.category}</span>
                             </div>
                             <span className={cn("font-bold", t.type === 'income' ? 'text-emerald-400' : 'text-slate-100')}>
                               {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString('es-CL')}
                             </span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                </div>

                {/* Sidebar AI Chat */}
                <div className="lg:col-span-4 space-y-8">
                  <Card className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white border-none shadow-2xl shadow-indigo-500/20 relative overflow-hidden flex flex-col h-full min-h-[500px]">
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="p-2 border-b border-white/10 mb-4 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                          <h3 className="text-sm font-bold uppercase tracking-wider">MoneyUp AI Coach</h3>
                        </div>
                        <p className="text-[10px] text-indigo-100 opacity-80 uppercase tracking-widest font-bold">Respuesta en tiempo real</p>
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar mb-4">
                        {chatMessages.length === 0 && (
                          <div className="space-y-4">
                             <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl rounded-tl-none border border-white/10">
                                <p className="text-xs leading-relaxed">¡Hola! Soy tu coach financiero personal. Pregúntame lo que quieras sobre tus gastos o cómo ahorrar más. 🚀</p>
                             </div>
                          </div>
                        )}
                        {chatMessages.map((msg, i) => (
                          <div key={i} className={cn(
                            "p-3 rounded-2xl border max-w-[85%] text-xs leading-relaxed",
                            msg.role === 'user' ? "bg-indigo-500/30 border-white/10 ml-auto rounded-tr-none" : "bg-white/10 border-white/10 mr-auto rounded-tl-none"
                          )}>
                             <div className="prose prose-invert prose-xs">
                               <ReactMarkdown>{msg.text}</ReactMarkdown>
                             </div>
                          </div>
                        ))}
                        {isTyping && (
                          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl rounded-tl-none border border-white/10 mr-auto flex gap-1">
                             <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                             <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                             <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                          </div>
                        )}
                      </div>

                      <form onSubmit={handleSendMessage} className="bg-slate-900/60 rounded-xl p-2 border border-white/10 flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Escribe tu duda..." 
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          className="bg-transparent text-xs flex-1 outline-none px-2 text-white placeholder:text-indigo-200/50" 
                        />
                        <button disabled={isTyping} className="bg-white text-indigo-600 p-2 rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50">
                          <ArrowUpRight size={14} />
                        </button>
                      </form>
                    </div>
                    <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'metas' && (
            <motion.div 
              key="metas"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-center">
                 <h2 className="text-3xl font-black text-white">Tus Metas</h2>
                 <button 
                  onClick={handleAddGoal}
                  className="bg-indigo-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-500 transition-colors"
                >
                   <Plus size={16} /> Nueva Meta
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {goals.map(goal => (
                  <Card key={goal.id} className="group hover:border-indigo-500/50 transition-all duration-300">
                    <div className="flex justify-between items-start mb-6">
                       <div className={cn("w-12 h-12 rounded-2xl bg-gradient-to-tr flex items-center justify-center text-white text-xl", goal.color)}>
                         🎯
                       </div>
                       <button onClick={() => handleDeleteGoal(goal.id)} className="text-slate-600 hover:text-rose-500 transition-colors"><X size={16}/></button>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{goal.name}</h3>
                    <div className="flex justify-between items-end mb-4">
                       <div>
                         <p className="text-xs text-slate-500">Logrado</p>
                         <p className="text-2xl font-black text-white">${goal.current.toLocaleString('es-CL')}</p>
                       </div>
                       <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Meta: ${goal.target.toLocaleString('es-CL')}</p>
                    </div>
                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden mb-6">
                       <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (goal.current/goal.target)*100)}%` }}
                        className={cn("h-full bg-gradient-to-r", goal.color)}
                       />
                    </div>
                    <button 
                      onClick={() => handleUpdateGoal(goal.id)}
                      className="w-full bg-indigo-600/10 text-indigo-400 py-3 rounded-xl font-bold text-sm hover:bg-indigo-600 hover:text-white transition-all border border-indigo-500/20"
                    >
                      Sumar Ahorro
                    </button>
                  </Card>
                ))}
                
                {goals.length === 0 && (
                  <div 
                    onClick={handleAddGoal}
                    className="md:col-span-2 lg:col-span-3 py-20 border-2 border-dashed border-slate-800 rounded-[2rem] flex flex-col items-center justify-center text-slate-500 hover:border-indigo-500/30 hover:text-slate-400 transition-all cursor-pointer group"
                  >
                    <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Plus size={32} />
                    </div>
                    <p className="font-bold">No tienes metas aún</p>
                    <p className="text-sm">Haz clic aquí para crear tu primera meta de ahorro</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'movimientos' && (
            <motion.div 
               key="movimientos"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <div className="flex justify-between items-center mb-8">
                   <h2 className="text-2xl font-black text-white">Registro Completo</h2>
                   <div className="flex gap-4">
                      <select 
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as any)}
                        className="bg-slate-800 text-xs px-3 py-2 rounded-lg border border-slate-700 outline-none text-white focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="all">Todos los tipos</option>
                        <option value="income">Ingresos</option>
                        <option value="expense">Gastos</option>
                      </select>
                   </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] text-slate-500 uppercase tracking-widest font-black border-b border-slate-800">
                        <th className="pb-4">Fecha</th>
                        <th className="pb-4">Categoría</th>
                        <th className="pb-4">Descripción</th>
                        <th className="pb-4 text-right">Monto</th>
                        <th className="pb-4"></th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {filteredTransactions.map(t => (
                        <tr key={t.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 group">
                          <td className="py-4 text-slate-400 font-mono">{new Date(t.date).toLocaleDateString()}</td>
                          <td className="py-4">
                            <span className="bg-slate-800 px-2 py-1 rounded text-[10px] font-bold text-indigo-400 uppercase">{t.category}</span>
                          </td>
                          <td className="py-4 text-slate-300">{t.description || '-'}</td>
                          <td className={cn("py-4 text-right font-black", t.type === 'income' ? 'text-emerald-400' : 'text-slate-100')}>
                            {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString('es-CL')}
                          </td>
                          <td className="py-4 text-right">
                             <button 
                              onClick={() => setTransactions(transactions.filter(prev => prev.id !== t.id))}
                              className="p-2 opacity-0 group-hover:opacity-100 hover:text-rose-500 transition-all"
                             >
                               <X size={14} />
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredTransactions.length === 0 && (
                    <div className="py-20 text-center text-slate-500">No hay movimientos que coincidan.</div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'aprende' && (
            <motion.div 
               key="aprende"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               className="max-w-4xl mx-auto"
            >
              <div className="text-center mb-12">
                <h2 className="text-4xl font-black text-white mb-4">Aprende Finanz-App</h2>
                <p className="text-slate-400">Domina tu dinero con lecciones cortas y directas.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {LEARN_TOPICS.map((topic, i) => (
                   <Card key={i} className="flex gap-6 items-start group hover:bg-slate-800 transition-colors cursor-pointer" 
                     onClick={() => {
                       setActiveTab('dashboard');
                       setChatInput(`Cuéntame más sobre ${topic.title}`);
                     }}
                   >
                     <div className="text-4xl">{topic.icon}</div>
                     <div>
                       <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">{topic.title}</h3>
                       <p className="text-sm text-slate-400 leading-relaxed">{topic.desc}</p>
                       <button className="mt-4 text-xs font-bold text-indigo-400">PREGUNTAR A IA →</button>
                     </div>
                   </Card>
                 ))}
              </div>

              <div className="mt-12 bg-indigo-600 rounded-[2rem] p-10 text-center space-y-6">
                 <h3 className="text-2xl font-black text-white italic">¿Quieres una asesoría personalizada?</h3>
                 <p className="text-indigo-100 opacity-80 max-w-xl mx-auto">Nuestro coach de IA puede analizar tus hábitos y crearte un plan de ahorro a medida. ¡Pregúntale en el chat!</p>
                 <button 
                  onClick={() => setActiveTab('dashboard')} 
                  className="bg-white text-indigo-600 px-8 py-3 rounded-2xl font-black shadow-xl"
                 >Ir al Chat</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="h-16 bg-slate-950 border-t border-slate-800 flex items-center justify-between px-10 text-[10px] text-slate-600 font-medium">
        <div>&copy; 2026 MoneyUp Financial Systems S.L.</div>
        <div className="flex gap-6">
          <span className="hover:text-slate-400 cursor-pointer">Soporte 24/7</span>
          <span className="hover:text-slate-400 cursor-pointer">Seguridad AES-256</span>
          <span className="hover:text-slate-400 cursor-pointer">Privacidad</span>
        </div>
      </footer>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-slate-900 rounded-[32px] overflow-hidden border border-slate-800 shadow-2xl"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-white">Añadir Movimiento</h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleAddTransaction} className="space-y-6">
                  {/* Toggle Type */}
                  <div className="p-1 bg-slate-800 rounded-2xl flex border border-slate-700">
                    <button 
                      type="button"
                      onClick={() => { setNewType('expense'); setNewCategory(''); }}
                      className={cn(
                        "flex-1 py-3 rounded-xl text-sm font-bold transition-all",
                        newType === 'expense' ? "bg-slate-700 text-rose-400 shadow-lg" : "text-slate-500"
                      )}
                    >
                      Gasto
                    </button>
                    <button 
                      type="button"
                      onClick={() => { setNewType('income'); setNewCategory(''); }}
                      className={cn(
                        "flex-1 py-3 rounded-xl text-sm font-bold transition-all",
                        newType === 'income' ? "bg-slate-700 text-emerald-400 shadow-lg" : "text-slate-500"
                      )}
                    >
                      Ingreso
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 px-1">Monto</label>
                    <div className="relative">
                       <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-slate-600">$</span>
                       <input 
                        type="number" 
                        required
                        placeholder="0"
                        value={newAmount}
                        onChange={(e) => setNewAmount(e.target.value)}
                        className="w-full pl-8 pr-4 py-4 bg-slate-800 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 font-mono text-xl text-white outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 px-1">Categoría</label>
                    <select 
                      required
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-4 py-4 bg-slate-800 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 text-sm text-white outline-none appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-slate-900">Selecciona...</option>
                      {CATEGORIES[newType].map(cat => (
                        <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 px-1">Descripción</label>
                    <input 
                      type="text" 
                      placeholder="Ej: Almuerzo en el centro"
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      className="w-full px-4 py-4 bg-slate-800 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 text-sm text-white outline-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    className={cn(
                      "w-full py-4 rounded-2xl font-bold text-white shadow-xl transition-all active:scale-[0.98]",
                      newType === 'income' ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/10" : "bg-rose-600 hover:bg-rose-500 shadow-rose-500/10"
                    )}
                  >
                    Guardar {newType === 'income' ? 'Ingreso' : 'Gasto'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
