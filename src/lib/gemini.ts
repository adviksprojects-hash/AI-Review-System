import { GoogleGenerativeAI } from "@google/generative-ai";
import { Business, ReviewOption, SupportedLanguage } from "./types";

const fallbackReviews = (
  business: Business,
  rating: number,
  lang: SupportedLanguage
): ReviewOption[] => {
  const name = business.name;
  const cat = business.category;
  const city = business.city;
  const kw = business.keywords.slice(0, 3).join(", ");

  if (lang === "mr") {
    if (rating >= 4) {
      return [
        {
          id: 1,
          title: "अतिशय उत्तम आणि समाधानी",
          tone: "Enthusiastic",
          text: `${city} मधील ${name} येथे माझा अनुभव खूप छान राहिला! येथील ${kw ? kw + ' आणि ' : ''}सेवा अतिशय दर्जेदार आहे. कर्मचारी अतिशय नम्र व सहकार्य करणारे आहेत. नक्कीच पुन्हा भेट देईन!`,
        },
        {
          id: 2,
          title: "सविस्तर आणि दर्जेदार अनुभव",
          tone: "Detailed",
          text: `${name} (${cat}) हे ${city} मधील खरोखरच एक उत्तम ठिकाण आहे. येथील स्वच्छता, वेळेवर मिळणारी सर्व्हिस आणि दर्जा सर्वच बाबतीत समाधानकारक आहे. जर तुम्ही उत्तम अनुभवाच्या शोधात असाल तर नक्की भेट द्या.`,
        },
        {
          id: 3,
          title: "थोडक्यात आणि प्रभावी",
          tone: "Concise",
          text: `उत्कृष्ट सेवा आणि वागणूक! ${name} मधील प्रत्येक गोष्ट उत्तम आहे. ५ स्टार नक्कीच पात्र आहेत!`,
        },
        {
          id: 4,
          title: "खरोखरच कौतुकास्पद",
          tone: "Authentic",
          text: `मी पहिल्यांदाच ${name} येथे आलो होतो, पण येथील आदरातिथ्य आणि सेवा मनाला खूप भावली. ${kw ? kw + ' साठी ' : ''}हे ठिकाण सर्वोत्तम आहे. सर्वांना शिफारस करेन!`,
        },
        {
          id: 5,
          title: "विश्वासू आणि व्यावसायिक",
          tone: "Professional",
          text: `${city} मध्ये अशा दर्जेदार सेवेची गरज होती. ${name} कडून वेळेत आणि प्रामाणिकपणे काम मिळाले. मनःपूर्वक धन्यवाद!`,
        },
      ];
    } else {
      return [
        {
          id: 1,
          title: "साधारण अनुभव",
          tone: "Authentic",
          text: `${name} येथील अनुभव ठीकठाक राहिला. सेवेत आणि वेळेच्या व्यवस्थापनात अजून थोडी सुधारणा करता येऊ शकते.`,
        },
        {
          id: 2,
          title: "सुधारणेस वाव",
          tone: "Detailed",
          text: `${cat} म्हणून अपेक्षा थोडी जास्त होती. कर्मचाऱ्यांनी ग्राहकांच्या प्रतिसादावर थोडे अधिक लक्ष दिल्यास नक्कीच अधिक चांगले होईल.`,
        },
        {
          id: 3,
          title: "मध्यम प्रतिसाद",
          tone: "Concise",
          text: `अनुभव सरासरी होता, काही गोष्टी चांगल्या होत्या तर काही ठिकाणी सुधारणेची गरज भासली.`,
        },
        {
          id: 4,
          title: "प्रामाणिक मत",
          tone: "Professional",
          text: `${name} मधील काही सेवा समाधानकारक होत्या, परंतु अजून चांगल्या दर्जाची अपेक्षा आहे.`,
        },
        {
          id: 5,
          title: "पुढील वेळेस अधिक चांगल्या सेवेची अपेक्षा",
          tone: "Enthusiastic",
          text: `व्यवस्थापनाने सेवेच्या गतीकडे व दर्जाकडे अधिक लक्ष दिल्यास ग्राहकांचा अनुभव अजून सुखकर होईल.`,
        },
      ];
    }
  }

  if (lang === "hi") {
    if (rating >= 4) {
      return [
        {
          id: 1,
          title: "शानदार और बेहतरीन अनुभव",
          tone: "Enthusiastic",
          text: `${city} में ${name} पर मेरा अनुभव बहुत ही जबरदस्त रहा! यहाँ की सर्विस और स्टाफ का व्यवहार दिल जीत लेने वाला है। ${kw ? 'खासकर ' + kw + ' बहुत बढ़िया था। ' : ''}पूरी तरह से संतुष्ट!`,
        },
        {
          id: 2,
          title: "विस्तृत और भरोसेमंद समीक्षा",
          tone: "Detailed",
          text: `अगर आप ${city} में बेहतरीन ${cat} की तलाश कर रहे हैं, तो ${name} सबसे सही विकल्प है। यहाँ सफाई, समय की पाबंदी और काम की गुणवत्ता अव्वल दर्जे की है। जरूर ट्राई करें!`,
        },
        {
          id: 3,
          title: "कम शब्दों में उत्तम",
          tone: "Concise",
          text: `बहुत ही बढ़िया सर्विस और दोस्ताना स्टाफ! ${name} को मेरी तरफ से पूरे 5 स्टार रेटिंग।`,
        },
        {
          id: 4,
          title: "सच्चा और प्रामाणिक अनुभव",
          tone: "Authentic",
          text: `पहली बार यहाँ आने पर भी बहुत अच्छा महसूस हुआ। ${name} की टीम सचमुच अपने ग्राहकों की खुशी का ध्यान रखती है। Highly Recommended!`,
        },
        {
          id: 5,
          title: "प्रोफेशनल और समय के पाबंद",
          tone: "Professional",
          text: `${name} का काम वाकई काबिले तारीफ है। कम समय में उत्कृष्ट काम करके दिया। ${city} में ऐसा अनुभव बहुत कम मिलता है।`,
        },
      ];
    } else {
      return [
        {
          id: 1,
          title: "औसत अनुभव",
          tone: "Authentic",
          text: `${name} पर अनुभव ठीक-ठाक रहा, लेकिन सर्विस में थोड़ा और सुधार किया जा सकता है।`,
        },
        {
          id: 2,
          title: "सुधार की गुंजाइश",
          tone: "Detailed",
          text: `${cat} के हिसाब से उम्मीदें थोड़ी ज्यादा थीं। स्टाफ को ग्राहकों के समय और संतुष्टि पर और ध्यान देना चाहिए।`,
        },
        {
          id: 3,
          title: "साधारण अनुभव",
          tone: "Concise",
          text: `अनुभव सामान्य रहा, उम्मीद है कि अगली बार और बेहतर सेवा मिलेगी।`,
        },
        {
          id: 4,
          title: "ईमानदार प्रतिक्रिया",
          tone: "Professional",
          text: `कुछ चीजें अच्छी थीं लेकिन कुल मिलाकर अनुभव और बेहतर हो सकता था।`,
        },
        {
          id: 5,
          title: "ग्राहकों के लिए सुझाव",
          tone: "Enthusiastic",
          text: `मैनेजमेंट को स्पीड और क्वालिटी पर थोड़ा और काम करने की जरूरत है।`,
        },
      ];
    }
  }

  // English fallback
  if (rating >= 4) {
    return [
      {
        id: 1,
        title: "Outstanding & Highly Recommended",
        tone: "Enthusiastic",
        text: `Had an incredible experience with ${name} in ${city}! The quality and attention to detail were top-notch. ${kw ? `Loved their ${kw}. ` : ''}The team is super welcoming and professional. Will definitely visit again!`,
      },
      {
        id: 2,
        title: "Detailed & Thoroughly Impressed",
        tone: "Detailed",
        text: `If you are looking for the best ${cat} in ${city}, look no further than ${name}. Prompt service, transparent communication, and genuine care for customers. Truly worth every star!`,
      },
      {
        id: 3,
        title: "Short & Sweet",
        tone: "Concise",
        text: `Superb experience at ${name}! Fast, friendly, and exceptional quality. Deserves a solid 5 stars!`,
      },
      {
        id: 4,
        title: "Authentic Customer Story",
        tone: "Authentic",
        text: `I visited ${name} based on good recommendations, and they exceeded all my expectations. Great atmosphere and attentive staff. Strongly recommended to everyone in ${city}!`,
      },
      {
        id: 5,
        title: "Professional & Reliable",
        tone: "Professional",
        text: `Extremely pleased with the high level of professionalism at ${name}. Everything was handled seamlessly with great precision. Kudos to the entire team!`,
      },
    ];
  } else {
    return [
      {
        id: 1,
        title: "Average Experience",
        tone: "Authentic",
        text: `My experience at ${name} was average. The basic service was okay, but there is room for improvement in response time and customer handling.`,
      },
      {
        id: 2,
        title: "Needs Some Improvement",
        tone: "Detailed",
        text: `Had decent expectations from ${name} as a leading ${cat} in ${city}, but a few aspects could be refined for a smoother customer journey.`,
      },
      {
        id: 3,
        title: "Decent but Can Be Better",
        tone: "Concise",
        text: `Service was satisfactory, though expecting higher standards in future visits.`,
      },
      {
        id: 4,
        title: "Constructive Feedback",
        tone: "Professional",
        text: `The staff was polite, but service speed and overall coordination need attention. Hoping for an improved experience next time.`,
      },
      {
        id: 5,
        title: "Room for Growth",
        tone: "Enthusiastic",
        text: `Good location and potential, but management should focus more on customer care and finishing quality.`,
      },
    ];
  }
};

export async function generateReviewsWithGemini(params: {
  business: Business;
  rating: number;
  language: SupportedLanguage;
  aspects?: string[];
}): Promise<ReviewOption[]> {
  const { business, rating, language, aspects } = params;
  // Prioritize business-specific Gemini API key so tokens are consumed per business; fall back to system env key
  const apiKey = business.geminiApiKey?.trim() || process.env.GEMINI_API_KEY?.trim();

  // If no API key is provided, return intelligent high quality fallback
  if (!apiKey) {
    console.warn(`No Gemini API key available for business "${business.name}" (neither custom nor system default). Using intelligent template fallback generator.`);
    return fallbackReviews(business, rating, language);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-1.5-flash or gemini-2.0-flash for superfast, natural output
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const langName =
      language === "mr" ? "Marathi (मराठी)" : language === "hi" ? "Hindi (हिंदी)" : "English";

    const prompt = `
You are an expert Google Local Guide and customer review assistant.
Generate 5 DISTINCT, realistic, and persuasive Google Place review options for the following business:

Business Name: ${business.name}
Google Place ID: ${business.placeId}
Category: ${business.category}
City / Location: ${business.city}
Business Keywords/Highlights: ${business.keywords.join(", ")}
${business.customPrompt ? `Additional Instructions: ${business.customPrompt}` : ""}
${aspects && aspects.length > 0 ? `Customer Highlighted Aspects: ${aspects.join(", ")}` : ""}

Rating: ${rating} out of 5 Stars
Output Language: ${langName}

CRITICAL GUIDELINES:
1. Each of the 5 reviews MUST sound like an authentic real human customer review written on Google Maps.
2. DO NOT use generic clichés or robotic AI phrases. Weave in the city (${business.city}), category (${business.category}), and keywords naturally.
3. If Language is Marathi, write in natural, modern, polite Marathi (मराठी शुद्ध व बोलचालची भाषा).
4. If Language is Hindi, write in natural conversational Hindi (हिंदी).
5. If Language is English, write in engaging, natural English.
6. Provide exactly 5 distinct styles:
   - Option 1: Enthusiastic & Warm
   - Option 2: Detailed & Informative
   - Option 3: Concise & Direct
   - Option 4: Authentic Personal Experience
   - Option 5: Professional & Reliable
7. Return ONLY a valid JSON array of 5 objects with keys: "id" (number 1 to 5), "title" (short 2-4 word label in ${langName}), "tone" (one of: 'Enthusiastic', 'Detailed', 'Concise', 'Authentic', 'Professional'), and "text" (the review text).
No markdown backticks around JSON if possible, or wrap strictly in \`\`\`json.
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Clean JSON response
    const cleanedJson = responseText
      .replace(/^```json/m, "")
      .replace(/^```/m, "")
      .trim();

    const parsed: ReviewOption[] = JSON.parse(cleanedJson);
    if (Array.isArray(parsed) && parsed.length >= 1) {
      return parsed.slice(0, 5);
    }
    return fallbackReviews(business, rating, language);
  } catch (error) {
    console.error("Gemini API generation error:", error);
    // Graceful fallback to rich templates
    return fallbackReviews(business, rating, language);
  }
}
