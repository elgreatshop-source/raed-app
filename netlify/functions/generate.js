import { GoogleGenAI, Type } from '@google/genai';

function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]+>/g, '').trim().slice(0, 15000);
}

function getGeminiClient(apiKey) {
  return new GoogleGenAI({ apiKey });
}

export const handler = async (event, context) => {
  // إعدادات CORS للسماح للواجهة بالاتصال
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      },
      body: ""
    };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    return { 
      statusCode: 500, 
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, error: "مفتاح API مفقود في إعدادات المنصة" }) 
    };
  }

  try {
    const ai = getGeminiClient(API_KEY);
    const body = JSON.parse(event.body);

    const {
      phase, date, dayName, teacherProfile,
      arabicLessonInput, mathLessonInput, frenchLessonInput, customInstructions,
      imagesBase64, documentsText, timetable
    } = body;

    const cleanDate = sanitizeInput(date) || new Date().toISOString().split('T')[0];
    const cleanDayName = sanitizeInput(dayName) || 'اليوم الدراسي';
    
    // استخراج بيانات الأستاذ
    const profile = {
      level: sanitizeInput(teacherProfile?.level) || 'المستوى الرابع',
      classGroup: sanitizeInput(teacherProfile?.classGroup) || '1',
      teachingMode: sanitizeInput(teacherProfile?.teachingMode) || 'bilingual',
    };

    const promptText = `
أنت خبير بيداغوجي ومفتش تربوي متخصص في مقاربة "مدارس الريادة" بالمغرب.
المطلوب تحليل الوثائق بدقة وبناء خطاطات ذهنية ومذكرة يومية موحدة.
معلومات الأستاذ:
- التاريخ: ${cleanDate} (${cleanDayName})
- المستوى: ${profile.level} - الفوج: ${profile.classGroup} - النمط: ${profile.teachingMode}
معطيات الدروس:
- العربية: ${sanitizeInput(arabicLessonInput)}
- الرياضيات: ${sanitizeInput(mathLessonInput)}
- الفرنسية: ${sanitizeInput(frenchLessonInput)}
توجيهات إضافية: ${sanitizeInput(customInstructions)}
قم بتوليد JSON منسق بدقة ليتم عرضه في التطبيق.`;

    const parts = [];
    if (imagesBase64 && Array.isArray(imagesBase64) && imagesBase64.length > 0) {
      const safeImages = imagesBase64.slice(0, 10);
      for (const img of safeImages) {
        if (img?.data && img?.mimeType) {
          parts.push({
            inlineData: {
              data: img.data.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, ''),
              mimeType: img.mimeType,
            },
          });
        }
      }
    }
    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            arabicMap: { type: Type.OBJECT },
            mathMap: { type: Type.OBJECT },
            frenchMap: { type: Type.OBJECT },
            dailyJournal: { type: Type.OBJECT }
          },
          required: ['arabicMap', 'mathMap', 'frenchMap', 'dailyJournal'],
        }
      }
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ success: true, data: JSON.parse(response.text || '{}') })
    };

  } catch (error) {
    console.error('Serverless Error:', error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, error: "حدث خطأ أثناء معالجة الدروس بالذكاء الاصطناعي." })
    };
  }
};
