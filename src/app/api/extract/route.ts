import { NextResponse } from "next/server";
import OpenAI from "openai";

// Configura el cliente de DeepSeek imitando la API de OpenAI
const openai = new OpenAI({
  baseURL: "https://api.deepseek.com/v1",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: "Extrae el nombre del cliente, la cuenta CLABE (18 dígitos) y el banco (si se menciona). Responde SOLO en formato JSON estricto con las claves: 'name', 'clabe', 'bank', 'notes' (para info extra). Si no encuentras algo, déjalo null. Ejemplo: {\"name\": \"Juan Perez\", \"clabe\": \"012345678901234567\", \"bank\": \"BBVA\", \"notes\": null}",
        },
        { role: "user", content: text },
      ],
      response_format: { type: "json_object" },
    });

    const resultText = completion.choices[0].message.content || "{}";
    const data = JSON.parse(resultText);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Deepseek Error:", error);
    return NextResponse.json({ error: "Error extrayendo datos con la IA" }, { status: 500 });
  }
}
