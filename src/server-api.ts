import express from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const getAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("No se encontró la API Key de Gemini. Por favor agrégala en Configuración > Secretos.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

// AI Advisor endpoint
app.post("/api/advisor", async (req, res) => {
  try {
    const ai = getAIClient();
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

    res.json({ advice: response.text || "No pude generar un consejo en este momento." });
  } catch (error: any) {
    console.error("AI Advisor Error:", error);
    res.status(500).json({ error: "Failed to get advice", details: error.message });
  }
});

// General Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const ai = getAIClient();
    const { messages, userProfile, transactions } = req.body;

    const lastMessage = messages[messages.length - 1].text;
    const history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `Eres "MoneyUp Advisor", un asistente financiero personal amigable y experto.
        Datos del usuario actual:
        - Nombre: ${userProfile.displayName || 'Mateo'}
        - Balance: $${userProfile.walletBalance}
        - Últimas transacciones: ${JSON.stringify(transactions.slice(0, 5))}
        Responde de forma concisa, motivadora y en español. Usa emojis.`,
      },
      history: history
    });

    const response = await chat.sendMessage({ message: lastMessage });

    res.json({ text: response.text || "Perdona, no pude procesar eso. ¿Puedes repetirlo?" });
  } catch (error: any) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: "Error de comunicación", details: error.message });
  }
});

export { app };
