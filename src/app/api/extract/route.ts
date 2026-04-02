import { NextResponse } from "next/server";
import OpenAI from "openai";
import { db } from "@/db";
import { scans } from "@/db/schema";
import { lt } from "drizzle-orm";
import Tesseract from "tesseract.js";

// Configura el cliente de DeepSeek imitando la API de OpenAI
const openai = new OpenAI({
  baseURL: "https://api.deepseek.com/v1",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { text, image } = await req.json();

    // Limpieza de imágenes antiguas (más de 1 día) al momento de cada petición para no saturar
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    await db.delete(scans).where(lt(scans.createdAt, yesterday));

    let scanId = null;
    let extractedImageText = "";

    if (image) {
      // Guardar imagen
      const [newScan] = await db.insert(scans).values({ imageData: image }).returning({ id: scans.id });
      scanId = newScan.id;

      // Extraer texto usando OCR
      try {
        const ocrResult = await Tesseract.recognize(image, 'spa');
        extractedImageText = ocrResult.data.text;
      } catch (e) {
        console.error("Error en OCR:", e);
      }
    }

    const messages: any[] = [
      {
        role: "system",
        content: "Extrae el nombre del cliente, la cuenta CLABE (18 dígitos) y el banco (si se menciona). Responde SOLO en formato JSON estricto con las claves: 'name', 'clabe', 'bank', 'notes' (para info extra). Si no encuentras algo, déjalo null. Ejemplo: {\"name\": \"Juan Perez\", \"clabe\": \"012345678901234567\", \"bank\": \"BBVA\", \"notes\": null}",
      }
    ];

    let combinedUserText = "";
    if (text) {
      combinedUserText += text + "\n";
    }
    if (extractedImageText) {
      combinedUserText += "\nTEXTO EXTRAÍDO DE LA IMAGEN:\n" + extractedImageText;
    }

    messages.push({ role: "user", content: combinedUserText || "Sin texto" });

    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: messages,
      response_format: { type: "json_object" },
    });

    const resultText = completion.choices[0].message.content || "{}";
    const data = JSON.parse(resultText);

    return NextResponse.json({ ...data, scanId });
  } catch (error) {
    console.error("Deepseek Error:", error);
    return NextResponse.json({ error: "Error extrayendo datos con la IA" }, { status: 500 });
  }
}

