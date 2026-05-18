-- Ejecuta este script en el editor SQL de Supabase para crear las tablas necesarias.

-- 1. Tabla de transacciones
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  category TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  description TEXT,
  userId TEXT NOT NULL -- Usamos TEXT para compatibilidad simple con el Mock User por ahora
);

-- 2. Tabla de metas (goals)
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  target DECIMAL(12,2) NOT NULL,
  current DECIMAL(12,2) DEFAULT 0 NOT NULL,
  color TEXT NOT NULL,
  userId TEXT NOT NULL
);

-- Habilitar tiempo real para estas tablas
-- Ve a Database > Replication > 'supabase_realtime' publication en tu panel de Supabase
-- Y añade las tablas 'transactions' y 'goals'.
