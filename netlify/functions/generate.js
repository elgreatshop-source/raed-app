import { GoogleGenAI, Type } from '@google/genai';

export const handler = async (event) => {
  // 1. إعدادات الأمان والسماح للواجهة بالاتصال
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    // 2. التحقق من المفتاح السري
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      return { 
        statusCode: 200, 
        headers, 
        body: JSON.stringify({ success: false, error: "مفتاح API مفقود في Netlify." }) 
      };
    }

    // 3. قراءة البيانات المرسلة من التطبيق
    const body = JSON.parse(event.body || "{}");

    // 4. تجهيز النص للذكاء الاصطناعي
    const promptText = `
    أنت خبير بيداغوجي في مقاربة "مدارس الريادة" بالمغرب.
    قم بتوليد JSON منسق بدقة وفق الـ Schema المطلوبة ليتم عرضه في التطبيق.
    معطيات الدرس:
    العربية: ${body.arabicLessonInput || 'لم يتم الإدخال'}
    الرياضيات: ${body.mathLessonInput || 'لم يتم الإدخال'}
    الفرنسية: ${body.frenchLessonInput || 'لم يتم الإدخال'}
    التوجيهات: ${body.customInstructions || 'بدون توجيهات'}
    `;

    // 5. الاتصال بجوجل (باستخدام النموذج المستقر 1.5)
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: promptText,
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

    // 6. إعادة النتيجة بنجاح للتطبيق
    return { 
      statusCode: 200, 
      headers, 
      body: JSON.stringify({ success: true, data: JSON.parse(response.text || '{}') }) 
    };

  } catch (error) {
    // 7. في حال حدوث أي خطأ، سنلتقطه هنا لمنع انهيار الخادم
    console.error(error);
    return { 
      statusCode: 200, 
      headers, 
      body: JSON.stringify({ success: false, error: "رسالة الخطأ: " + error.message }) 
    };
  }
};
