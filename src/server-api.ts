import express from "express";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

let _aiClient: GoogleGenAI | null = null;

const getAIClient = () => {
  if (_aiClient) return _aiClient;
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("FATAL: GEMINI_API_KEY is missing from environment");
    throw new Error("No se configuró la llave GEMINI_API_KEY. Agrégala en Configuración > Secretos.");
  }
  _aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
  return _aiClient;
};

// AI Advisor endpoint
app.post("/api/advisor", async (req, res) => {
  console.log("[API] Advisor request");
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
      3. Usa un tono cercano, energético y profesional.
      4. Si no hay gastos registrados, anímalo a empezar.
      5. Responde estrictamente en Markdown y en Español.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("El modelo no generó ninguna respuesta de texto.");
    }

    res.json({ advice: text });
  } catch (error: any) {
    console.error("[API ERROR] Advisor:", error);
    res.status(500).json({ error: "Error al generar consejo", details: error.message });
  }
});

// General Chat endpoint
app.post("/api/chat", async (req, res) => {
  console.log("Chat request received");
  try {
    const ai = getAIClient();
    const { messages, userProfile, transactions } = req.body;

    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: "No hay mensajes en la solicitud" });
    }

    const lastMessage = messages[messages.length - 1].text;
    
    // Use generateContent directly for robustness
    const contents = [
      {
        role: "user",
        parts: [{ text: `Eres "MoneyUp Advisor", un asistente financiero experto.
        Usuario: ${userProfile.displayName || 'Diego'}
        Balance: $${userProfile.walletBalance}
        Últimas transacciones: ${JSON.stringify(transactions.slice(0, 5))}
        Responde de forma breve, motivadora y en español. Usa emojis. 👋` }]
      },
      {
        role: "model",
        parts: [{ text: "¡Hola! Estoy listo para ayudarte con tus finanzas. ¿Qué tienes en mente? 🚀" }]
      },
      ...messages.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }))
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contents,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("La IA no respondió nada. Por favor, intenta de nuevo.");
    }

    res.json({ text: text });
  } catch (error: any) {
    console.error("[API ERROR] Chat:", error);
    res.status(500).json({ 
      error: "Error en el chat", 
      details: error.message || "Desconocido",
      apiKeyPresent: !!process.env.GEMINI_API_KEY
    });
  }
});

export { app };
