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

// --- Components ---

const Card = ({ children, className, id }: { children: React.ReactNode, className?: string, id?: string }) => (
  <div id={id} className={cn("bg-slate-900 border border-slate-800 rounded-[2rem] p-6 shadow-xl", className)}>
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
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('moneyup_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  
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
      const resp = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          transactions: transactions.slice(0, 10),
          userProfile: { displayName: 'User', walletBalance: balance }
        }),
      });
      const data = await resp.json();
      setAiAdvice(data.advice);
    } catch (err) {
      console.error(err);
      setAiAdvice("Lo siento, no pude obtener consejos en este momento.");
    } finally {
      setIsAskingAi(false);
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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <TrendingUp className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white italic">
              Money<span className="text-indigo-400">Up</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <button className="text-sm font-bold text-indigo-400">Dashboard</button>
            <button className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Mis Metas</button>
            <button className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Movimientos</button>
            <button className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Aprende</button>
          </div>

          <div className="flex items-center gap-4">
             <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-indigo-500 transition-all active:scale-95 shadow-lg shadow-indigo-500/10 font-bold text-sm"
            >
              <Plus size={18} />
              <span>Nuevo</span>
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border border-slate-800 hidden sm:block"></div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <StatCard id="balance-card" title="Balance Total" amount={balance} type="balance" icon={Wallet} />
          <StatCard id="income-card" title="Ingresos Semanales" amount={totals.income} type="income" icon={ArrowUpRight} />
          <StatCard id="expense-card" title="Gastos Semanales" amount={totals.expense} type="expense" icon={ArrowDownRight} />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Chart */}
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
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Metas de Ahorro</h3>
                </div>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-xs mb-2"><span className="text-slate-400">Fondo de Emergencia</span><span className="font-bold text-white">75%</span></div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 w-3/4"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-2"><span className="text-slate-400">Viaje a Cancún</span><span className="font-bold text-white">32%</span></div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 w-1/3"></div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Categorías</h3>
                </div>
                <div className="space-y-4">
                  {CATEGORIES.expense.slice(0, 4).map(cat => (
                    <div key={cat} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-bold text-indigo-400">
                        {cat.substring(0,2).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-white">{cat}</p>
                        <div className="h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                           <div className="h-full bg-slate-600 w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <Card className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white border-none shadow-2xl shadow-indigo-500/20 relative overflow-hidden flex flex-col h-full min-h-[500px]">
              <div className="relative z-10 p-2">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <h3 className="text-sm font-bold uppercase tracking-wider">MoneyUp AI Coach</h3>
                </div>
                <p className="text-xs text-indigo-100 mb-6 leading-relaxed opacity-80">
                  Asistente inteligente analizando tus movimientos en tiempo real.
                </p>

                <div className="space-y-3 mb-6 flex-1">
                  {!aiAdvice ? (
                    <>
                      <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl rounded-tl-none border border-white/10">
                        <p className="text-xs leading-relaxed">¡Hola! Soy tu coach financiero. Analizaré tus gastos para ayudarte a ahorrar. 🍕</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl rounded-tl-none border border-white/10">
                        <p className="text-xs leading-relaxed">¿Sabías que has gastado menos en delivery esta semana? ¡Buen trabajo! 🚀</p>
                      </div>
                    </>
                  ) : (
                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl rounded-tl-none border border-white/10">
                       <div className="prose prose-invert prose-xs text-indigo-50 max-w-none">
                          <ReactMarkdown>{aiAdvice}</ReactMarkdown>
                       </div>
                    </div>
                  )}
                </div>

                <div className="mt-auto pt-6 border-t border-white/10">
                   <button 
                    onClick={getAiAdvice}
                    disabled={isAskingAi}
                    className="w-full bg-white text-indigo-600 py-3 rounded-xl font-bold text-sm shadow-xl hover:bg-slate-50 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mb-4"
                  >
                    {isAskingAi ? "Analizando..." : "Obtener Consejo Pro"}
                  </button>
                  
                  <div className="flex gap-2 bg-slate-900/40 rounded-xl p-2 border border-white/10">
                    <input type="text" placeholder="Pregúntale a MoneyUp..." className="bg-transparent text-xs flex-1 outline-none px-2 text-white" />
                    <button className="bg-white/20 p-2 rounded-lg text-white">
                      <TrendingUp size={14} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Últimos Movimientos</h3>
                <span className="text-[10px] text-slate-500 font-medium cursor-pointer hover:text-white">Ver todos</span>
              </div>
              
              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-xs italic">
                    Esperando primer registro...
                  </div>
                ) : (
                  transactions.slice(0, 5).map((t) => (
                    <motion.div 
                      key={t.id}
                      layout
                      className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs",
                          t.type === 'income' ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-400"
                        )}>
                          {t.type === 'income' ? 'IN' : 'OT'}
                        </div>
                        <div>
                          <p className="font-bold text-xs text-white">{t.category}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{new Date(t.date).toLocaleDateString('es-CL')}</p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <p className={cn(
                          "font-bold text-xs",
                          t.type === 'income' ? "text-emerald-400" : "text-slate-300"
                        )}>
                          {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString('es-CL')}
                        </p>
                        <button 
                          onClick={() => setTransactions(transactions.filter(prev => prev.id !== t.id))}
                          className="p-1 hover:text-rose-400 text-slate-600 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
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
