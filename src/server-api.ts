import express from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// AI Advisor endpoint
app.post("/api/advisor", async (req, res) => {
  try {
    const { transactions, userProfile } = req.body;
    
    let transactionsContext = "";
    if (transactions && transactions.length > 0) {
      transactionsContext = transactions.map((t: any) => 
        `- ${new Date(t.date).toLocaleDateString()}: ${t.type === 'income' ? '+' : '-'}$${t.amount} (${t.category}) ${t.description ? `[${t.description}]` : ''}`
      ).join('\n');
    } else {
      transactionsContext = "No hay transacciones registradas aún.";
    }

    const prompt = `
      Eres "MoneyUp Advisor", un asistente financiero experto, divertido y motivador para jóvenes de entre 18 y 25 años.
      Tu misión es ayudar al usuario a mejorar sus finanzas personales con consejos accionables y directos.

      CONTEXTO DEL USUARIO:
      - Nombre: ${userProfile.displayName || 'Usuario'}
      - Balance Actual: $${userProfile.walletBalance}
      - Transacciones Recientes:
      ${transactionsContext}

      INSTRUCCIONES:
      1. Proporciona un análisis breve de sus hábitos de gasto e ingreso.
      2. Da 3 consejos específicos para que ahorre más o gestione mejor su dinero.
      3. Usa un tono cercano, con energía "cool" pero profesional.
      4. Si no hay gastos registrados, anímalo a empezar.
      5. Formatea la respuesta estrictamente con Markdown (usa negritas, listas y emojis).
      6. Responde en Español.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    res.json({ advice: response.text });
  } catch (error) {
    console.error("AI Advisor Error:", error);
    res.status(500).json({ error: "Failed to get advice" });
  }
});

// General Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, userProfile, transactions } = req.body;

    const lastMessage = messages[messages.length - 1].text;
    
    // Using a system instruction and history to give context
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [{ text: `Eres "MoneyUp Advisor", un asistente financiero personal amigable. 
          Usuario: ${userProfile.displayName || 'Usuario'}
          Balance: $${userProfile.walletBalance}
          Recientes: ${JSON.stringify(transactions.slice(0, 3))}
          Responde de forma breve y motivadora.` }]
        },
        {
          role: "model",
          parts: [{ text: "¡Entendido! Soy tu MoneyUp Advisor. ¿En qué te puedo ayudar?" }]
        },
        ...messages.map((m: any) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        }))
      ]
    });

    res.json({ text: response.text });
  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: "Failed to chat" });
  }
});

export { app };
