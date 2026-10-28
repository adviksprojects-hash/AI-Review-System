import { GoogleGenerativeAI } from "@google/generative-ai";
import { Business, ReviewOption, SupportedLanguage } from "./types";

// Supported active Google Gemini models with fallback chain
const CANDIDATE_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-3.8-flash",
  "gemini-flash-latest",
];

// Helper to shuffle array elements randomly
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Helper to pick random element
function pickOne<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Dynamic combinatorial review synthesizer.
 * Generates completely unique, fresh, and non-repeating reviews on every single invocation.
 * Strictly respects the business details (name, category, city, keywords), rating (1-5 stars),
 * and selected language (English, Marathi, Hindi).
 */
export const generateDynamicFallback = (
  business: Business,
  rating: number,
  lang: SupportedLanguage,
  aspects?: string[]
): ReviewOption[] => {
  const name = business.name || "Business";
  const cat = business.category || "Service";
  const city = business.city || "City";

  // Combine user-selected aspects with business keywords
  const rawKeywords = [
    ...(aspects && aspects.length > 0 ? aspects : []),
    ...(business.keywords && business.keywords.length > 0 ? business.keywords : []),
  ];

  // Default fallback keywords if none provided
  const defaultKwMr = ["उत्कृष्ट सेवा", "कर्मचाऱ्यांचे सहकार्य", "कामाचा दर्जा", "वाजवी दर", "स्वच्छता व शिस्त"];
  const defaultKwHi = ["शानदार सेवा", "स्टाफ का विनम्र व्यवहार", "काम की बेहतरीन क्वालिटी", "उचित दाम", "साफ-सफाई"];
  const defaultKwEn = ["prompt service", "courteous staff", "outstanding quality", "value for money", "clean and pleasant atmosphere"];

  const kwMr = rawKeywords.length > 0 ? rawKeywords : defaultKwMr;
  const kwHi = rawKeywords.length > 0 ? rawKeywords : defaultKwHi;
  const kwEn = rawKeywords.length > 0 ? rawKeywords : defaultKwEn;

  // -------------------------------------------------------------
  // MARATHI (मराठी) REVIEW GENERATION
  // -------------------------------------------------------------
  if (lang === "mr") {
    const shuffledKw = shuffle(kwMr);
    const kw1 = shuffledKw[0] || "उत्तम सेवा";
    const kw2 = shuffledKw[1] || "दर्जेदार अनुभव";
    const kw3 = shuffledKw[2] || "सहकार्य";

    if (rating >= 5) {
      const enthusiasticOpeners = shuffle([
        `मी नुकतीच ${city} मधील ${name} ला भेट दिली आणि अनुभव खरोखरच अप्रतिम होता!`,
        `${city} मध्ये जर सर्वोत्तम ${cat} शोधत असाल, तर ${name} हाच एकमेव उत्तम पर्याय आहे!`,
        `माझ्या मित्रांच्या जोरदार शिफारसीवरून मी ${name} येथे गेलो होतो आणि अपेक्षांपेक्षाही जास्त समाधान मिळाले!`,
        `पहिल्याच भेटीत ${name} ने आपल्या दर्जेदार सेवेने आमचे मन जिंकून घेतले!`,
        `गेल्या आठवड्यात संपूर्ण कुटुंबासह ${name} येथे गेलो होतो आणि सर्वांनाच हा अनुभव अतिशय आवडला!`,
        `${name} ची ऊर्जा, काम आणि आदरातिथ्य पाहून मन खरोखरच प्रसन्न झाले!`,
      ]);

      const enthusiasticMiddles = shuffle([
        `येथील ${kw1} अतिशय दर्जेदार आहे आणि स्टाफची वागणूक मनाला खूप भावली. स्वच्छता आणि वेळेचे नियोजन लाजवाब आहे.`,
        `विशेषतः ${kw1} आणि ${kw2} दोन्ही बाबतीत त्यांनी राखलेला दर्जा लाजवाब आहे. प्रत्येक ग्राहकाकडे आस्थेने लक्ष दिले जाते.`,
        `अतिशय प्रामाणिक काम, पारदर्शक व्यवहार आणि वाजवी दर! ${city} मध्ये असा अनुभव मिळणे खरोखरच दुर्मिळ आहे.`,
        `सेवा अत्यंत तत्पर आहे आणि कामामध्ये कमालीची स्वच्छता व शिस्त दिसून येते. कोणतीही अडचण न येता काम सुरळीत झाले.`,
        `${kw1} चा अनुभव कमाल होता! येथे ग्राहकांचा वेळ आणि पैसा दोन्ही सत्कारणी लागतो.`,
      ]);

      const detailedOpeners = shuffle([
        `${city} मधील ${name} येथे नुकतीच भेट देण्याचा योग आला आणि सर्व व्यवस्था अतिशय सुव्यवस्थित दिसली.`,
        `${name} मधील कामाची पद्धत, शिस्त आणि स्वच्छता पाहून मी खूप प्रभावित झालो आहे.`,
        `गेल्या काही महिन्यांपासून मी ${name} चा नियमित ग्राहक आहे आणि प्रत्येक वेळी सातत्यपूर्ण दर्जा मिळतो.`,
        `उत्कृष्ट नियोजन आणि विश्वासू कामासाठी ${name} खरोखरच एक आदर्श ठिकाण आहे.`,
      ]);

      const detailedMiddles = shuffle([
        `कर्मचाऱ्यांचे संभाषण अतिशय आदरयुक्त आहे. ${kw1} बाबत सर्व माहिती स्पष्टपणे समजावून सांगितली आणि ${kw2} चे काम वेळेत पूर्ण केले.`,
        `परिसर अतिशय स्वच्छ, सुरक्षित आणि प्रसन्न आहे. ग्राहकांच्या छोट्या छोट्या गरजांकडेही बारकाईने लक्ष दिले जाते, जे आजकाल कमी पाहायला मिळते.`,
        `${kw1} ची गुणवत्ता उत्तम आहे. दर अतिशय वाजवी आहेत आणि कामात १००% प्रामाणिकपणा दिसतो.`,
        `प्रवेश केल्यापासून ते काम पूर्ण होईपर्यंत कर्मचाऱ्यांचे सहकार्य मोलाचे ठरले. कामाची फिनिशिंग अप्रतिम आहे.`,
      ]);

      const authenticOpeners = shuffle([
        `प्रत्येक वेळी ${name} येथे येताना एक वेगळाच आनंद आणि कौटुंबिक आपुलकी जाणवते.`,
        `मी अनेक ठिकाणी ${cat} अनुभवले आहे, पण ${name} ची बातच काही वेगळी आहे.`,
        `${city} मध्ये चांगल्या सेवेचा शोध घेत असताना ${name} बद्दल कळाले आणि माझा निर्णय अगदी योग्य ठरला.`,
        `माझा वैयक्तिक अनुभव सांगायचा तर ${name} कडून १००% समाधान मिळाले.`,
      ]);

      const authenticMiddles = shuffle([
        `येथील शांत वातावरण आणि तत्पर सहकार्य यामुळे कामाचा ताण जाणवलाच नाही. ${kw1} मनासारखे झाले.`,
        `स्टाफने दाखवलेली आपुलकी आणि कामावरील निष्ठा वाखाणण्याजोगी आहे. ${kw2} चे काम अपेक्षेपेक्षा सुंदर झाले.`,
        `कोणतीही घाईगडबड न करता अगदी शांतपणे आणि कौशल्याने सर्व हाताळले गेले. अतिशय आनंद वाटला.`,
        `खरोखरच ग्राहकांच्या समाधानाला सर्वोच्च प्राधान्य दिले जाते. अशा ठिकाणी वारंवार भेट द्यावीशी वाटते.`,
      ]);

      const professionalOpeners = shuffle([
        `${name} च्या टीमकडून मिळालेली व्यावसायिक आणि कार्यक्षम सेवा खरोखरच कौतुकास्पद आहे.`,
        `${city} मध्ये ${cat} च्या क्षेत्रात ${name} उच्च दर्जाचे मापदंड प्रस्थापित करत आहे.`,
        `व्यावसायिक दृष्टिकोन, वेळेची पाबंदी आणि पारदर्शकता ही ${name} ची खरी ताकद आहे.`,
      ]);

      const professionalMiddles = shuffle([
        `कामाचे नियोजन आणि अंमलबजावणी अत्यंत अचूक आहे. ${kw1} व ${kw2} चे व्यवस्थापन उत्तम प्रकारे केले गेले.`,
        `ग्राहकांच्या वेळेचा पूर्ण आदर राखला जातो. सेवेची गती आणि गुणवत्ता दोन्हीमध्ये उत्तम ताळमेळ आहे.`,
        `सुरुवातीपासून शेवटपर्यंत सर्व प्रक्रिया पारदर्शक आणि सुलभ होती. कर्मचाऱ्यांचे व्यावसायिक कौशल्य जाणवते.`,
      ]);

      const closers = shuffle([
        `मी माझ्या सर्व मित्र आणि नातेवाईकांना ${name} ची मनापासून ५ स्टार शिफारस करतो!`,
        `नक्कीच पुन्हा पुन्हा भेट देणार. उत्तम सेवेबद्दल मनापासून धन्यवाद! ५/५ स्टार्स!`,
        `माझ्याकडून ५ पैकी ५ स्टार रेटिंग! तुम्हीही नक्की एकदा तरी भेट देऊन अनुभव घ्या.`,
        `१००% पैसा वसूल आणि विश्वासार्ह ठिकाण. Highly Recommended!`,
        `खरोखरच दर्जेदार अनुभव! अशाच उत्कृष्ट सेवेसाठी संपूर्ण टीमचे मनःपूर्वक अभिनंदन.`,
        `अतिशय समाधानकारक भेट! Keep up the brilliant work!`,
      ]);

      const conciseOptions = shuffle([
        `उत्कृष्ट काम, तत्पर सेवा आणि दर्जेदार अनुभव! ${name} कडून नेहमीच वेळेत सर्व्हिस मिळते. ५ स्टार नक्कीच पात्र!`,
        `${city} मधील सर्वोत्तम ठिकाण! ${kw1} आणि स्टाफची नम्र वागणूक मनाला खूप भावली. Highly Recommended!`,
        `खूपच छान अनुभव! वाजवी दर आणि उत्तम स्वच्छता. ${name} ला ५ पैकी ५ स्टार!`,
        `दर्जेदार काम आणि १००% समाधान! वेळेची बचत आणि उत्तम सहकार्य. नक्की भेट द्या!`,
        `अप्रतिम सेवा आणि कौतुकास्पद काम! ${name} कडे पुन्हा नक्की येणार. ५ स्टार!`,
      ]);

      return [
        {
          id: 1,
          title: "अतिशय छान व उत्साही",
          tone: "Enthusiastic",
          text: `${enthusiasticOpeners[0]} ${enthusiasticMiddles[0]} ${closers[0]}`,
        },
        {
          id: 2,
          title: "सविस्तर व परिपूर्ण",
          tone: "Detailed",
          text: `${detailedOpeners[0]} ${detailedMiddles[0]} ${closers[1]}`,
        },
        {
          id: 3,
          title: "थोडक्यात व प्रभावी",
          tone: "Concise",
          text: conciseOptions[0],
        },
        {
          id: 4,
          title: "वैयक्तिक प्रामाणिक अनुभव",
          tone: "Authentic",
          text: `${authenticOpeners[0]} ${authenticMiddles[0]} ${closers[2]}`,
        },
        {
          id: 5,
          title: "व्यावसायिक व विश्वासू",
          tone: "Professional",
          text: `${professionalOpeners[0]} ${professionalMiddles[0]} ${closers[3]}`,
        },
      ];
    } else if (rating === 4) {
      const fourStarEnthusiastic = shuffle([
        `${name} येथील अनुभव खूपच चांगला आणि सुखद राहिला. ${kw1} छान होते आणि कर्मचाऱ्यांचे पूर्ण सहकार्य लाभले. नक्कीच ४ स्टार!`,
        `आमचा ${name} येथील अनुभव खूप छान राहिला. दर्जेदार काम आणि नम्र स्टाफ! गर्दीच्या वेळी थोडासा वेळ वाचवता आला तर परिपूर्ण होईल. ४/५ स्टार!`,
        `${city} मधील ${name} ला भेट दिली. एकंदरीत सेवा आणि स्वच्छता खूप चांगली वाटली. कामाचा दर्जा उत्तम आहे. ४ स्टार!`,
      ]);
      const fourStarDetailed = shuffle([
        `${city} मधील ${name} चा परिसर आणि स्वच्छता चांगली आहे. ${kw1} चे काम व्यवस्थित झाले आणि कर्मचाऱ्यांचे वर्तन आदरयुक्त होते. थोडीशी गती वाढवली तर उत्तम होईल. ४ स्टार अनुभव.`,
        `${name} कडून मिळालेली सेवा समाधानकारक आहे. वाजवी दर आणि पारदर्शक व्यवहार आवडले. ${kw2} ची गुणवत्ता छान होती. नक्कीच पुन्हा विचार करू. ४/५ स्टार.`,
      ]);
      const fourStarConcise = shuffle([
        `चांगली सर्व्हिस, वाजवी दर आणि नम्र कर्मचारी. ${name} नक्कीच भेट देण्यासारखे आहे. ४ स्टार!`,
        `छान अनुभव! कामाची गुणवत्ता आणि स्टाफचे सहकार्य उत्तम राहिले. ४ स्टार रेटिंग.`,
        `समाधानकारक भेट! काम वेळेत पूर्ण झाले आणि स्वच्छताही चांगली होती. ४/५ स्टार.`,
      ]);
      const fourStarAuthentic = shuffle([
        `आमचा येथील अनुभव चांगला राहिला. ${kw1} ची क्वालिटी उत्तम होती आणि सर्वांनी मदत केली. मित्रांना शिफारस करेन. ४ स्टार.`,
        `पहिल्यांदाच ${name} ला आलो होतो आणि समाधानकारक काम झाले. भविष्यात पुन्हा नक्की भेट देईन. ४ स्टार.`,
      ]);
      const fourStarProfessional = shuffle([
        `कामाचा दर्जा चांगला आहे आणि कर्मचाऱ्यांची वागणूक व्यावसायिक होती. व्यवस्थापनाचे नियोजन योग्य वाटले. ४ स्टार.`,
        `${name} ची टीम वेळेवर आणि पद्धतशीर काम करते. दर्जेदार सेवेसाठी माझ्याकडून ४ स्टार.`,
      ]);

      return [
        { id: 1, title: "खूप चांगला अनुभव", tone: "Enthusiastic", text: fourStarEnthusiastic[0] },
        { id: 2, title: "सविस्तर आणि सकारात्मक", tone: "Detailed", text: fourStarDetailed[0] },
        { id: 3, title: "थोडक्यात व छान", tone: "Concise", text: fourStarConcise[0] },
        { id: 4, title: "प्रामाणिक मत", tone: "Authentic", text: fourStarAuthentic[0] },
        { id: 5, title: "व्यावसायिक सेवा", tone: "Professional", text: fourStarProfessional[0] },
      ];
    } else if (rating === 3) {
      const threeStarList = shuffle([
        `${name} येथे भेट दिली. काही गोष्टी चांगल्या होत्या, पण ${kw1} च्या बाबतीत थोडी सुधारणा अपेक्षित आहे. एकंदरीत सरासरी ३ स्टार अनुभव.`,
        `${city} मधील ${name} चा परिसर बरा आहे, परंतु सेवेचा वेग आणि ग्राहकांकडे लक्ष वाढवण्याची गरज वाटते. व्यवस्थापनाने सुधारणा केल्यास नक्कीच उत्तम होईल.`,
        `अनुभव ठीक होता, वाईट नव्हता पण खूप खासही वाटला नाही. कामामध्ये अजून थोडी अचूकता हवी. ३ स्टार रेटिंग.`,
        `${name} ची सर्व्हिस सरासरी आहे. दर आणि कामाचा दर्जा यामध्ये अजून चांगला ताळमेळ बसवणे गरजेचे वाटते.`,
        `काही बाबी चांगल्या होत्या तर काही ठिकाणी वाट पाहावी लागली. ग्राहक सेवेमध्ये अधिक लक्ष घातल्यास नक्की फायदा होईल. ३ स्टार.`,
      ]);
      return [
        { id: 1, title: "मध्यम / ठीकठाक अनुभव", tone: "Authentic", text: threeStarList[0] },
        { id: 2, title: "सविस्तर सुधारणा सूचना", tone: "Detailed", text: threeStarList[1] },
        { id: 3, title: "थोडक्यात अभिप्राय", tone: "Concise", text: threeStarList[2] },
        { id: 4, title: "तटस्थ मत", tone: "Professional", text: threeStarList[3] },
        { id: 5, title: "समतोल आढावा", tone: "Authentic", text: threeStarList[4] },
      ];
    } else if (rating === 2) {
      const twoStarList = shuffle([
        `${name} कडून बऱ्याच अपेक्षा होत्या, परंतु अपेक्षेप्रमाणे अनुभव मिळाला नाही. ${kw1} ची गुणवत्ता सुधारायला हवी. २ स्टार.`,
        `आम्ही नुकतीच ${name} ला भेट दिली. बराच वेळ वाट पाहावी लागली आणि कर्मचाऱ्यांचे व्यवस्थापन योग्य नव्हते. कृपया सेवेकडे लक्ष द्यावे.`,
        `सर्व्हिस खूपच स्लो होती आणि दर्जा समाधानकारक नव्हता. व्यवस्थापनाने तत्काळ सुधारणा करणे गरजेचे आहे. २ स्टार.`,
        `${city} मध्ये असूनही ${name} ची सेवा सरासरीपेक्षा कमी वाटली. पैसे वसूल झाल्यासारखे वाटले नाही.`,
        `ग्राहक सेवेमध्ये आणि वेळेच्या नियोजनात मोठी सुधारणा आवश्यक आहे. २ स्टार रेटिंग.`,
      ]);
      return [
        { id: 1, title: "निराशाजनक अनुभव", tone: "Authentic", text: twoStarList[0] },
        { id: 2, title: "सविस्तर तक्रार / सूचना", tone: "Detailed", text: twoStarList[1] },
        { id: 3, title: "थोडक्यात नाराजी", tone: "Concise", text: twoStarList[2] },
        { id: 4, title: "असमाधानकारक भेट", tone: "Professional", text: twoStarList[3] },
        { id: 5, title: "सुधारणेची गरज", tone: "Authentic", text: twoStarList[4] },
      ];
    } else {
      // 1 Star
      const oneStarList = shuffle([
        `${name} येथील अनुभव अत्यंत निराशाजनक ठरला. सेवेचा दर्जा अतिशय सुमार होता आणि कोणाचेही लक्ष नव्हते. १ स्टार.`,
        `${city} मधील ${name} येथे जाऊन वेळेचा आणि पैशांचा अपव्यय झाला. ग्राहकांना मिळणारी वागणूक अजिबात योग्य नव्हती. व्यवस्थापनाने दखल घ्यावी.`,
        `खूपच वाईट सर्व्हिस आणि निकृष्ट दर्जा. १ स्टार देणेही कठीण वाटते. सुधारणा आवश्यक आहे.`,
        `${name} कडे व्यवस्थापनाचा पूर्ण अभाव दिसला. ग्राहकांच्या तक्रारींकडे दुर्लक्ष केले जाते. १ स्टार.`,
        `इथे जाऊन पूर्ण निराशा झाली. कर्मचाऱ्यांची वागणूक आणि सेवा दोन्हींमध्ये सुधारणा व्हावी.`,
      ]);
      return [
        { id: 1, title: "अतिशय वाईट अनुभव", tone: "Authentic", text: oneStarList[0] },
        { id: 2, title: "गंभीर नाराजी", tone: "Detailed", text: oneStarList[1] },
        { id: 3, title: "अत्यंत असमाधानी", tone: "Concise", text: oneStarList[2] },
        { id: 4, title: "खराब व्यवस्थापन", tone: "Professional", text: oneStarList[3] },
        { id: 5, title: "तक्रार नोंद", tone: "Authentic", text: oneStarList[4] },
      ];
    }
  }

  // -------------------------------------------------------------
  // HINDI (हिंदी) REVIEW GENERATION
  // -------------------------------------------------------------
  if (lang === "hi") {
    const shuffledKw = shuffle(kwHi);
    const kw1 = shuffledKw[0] || "उत्कृष्ट सेवा";
    const kw2 = shuffledKw[1] || "शानदार काम";

    if (rating >= 5) {
      const enthusiasticOpeners = shuffle([
        `हाल ही में ${city} स्थित ${name} पर जाने का अवसर मिला और अनुभव सचमुच दिल खुश कर देने वाला था!`,
        `अगर आप ${city} में बेहतरीन ${cat} की तलाश में हैं, तो ${name} सबसे सही और अव्वल जगह है!`,
        `दोस्तों के कहने पर ${name} ट्राई किया और सच कहूँ तो यह उम्मीदों से कहीं बढ़कर निकला!`,
        `पहली ही मुलाकात में ${name} की टीम ने अपने शानदार काम और विनम्रता से दिल जीत लिया!`,
        `परिवार के साथ ${name} का दौरा किया और हम सभी को यहाँ की सर्विस बेहद पसंद आई!`,
        `${name} की ऊर्जा, साफ-सफाई और काम की क्वालिटी देखकर मन प्रसन्न हो गया!`,
      ]);

      const enthusiasticMiddles = shuffle([
        `यहाँ की ${kw1} वाकई तारीफ के काबिल है और स्टाफ का दोस्ताना व्यवहार बहुत अच्छा लगा। स्वच्छता का विशेष ध्यान रखा गया है।`,
        `विशेष रूप से ${kw1} और ${kw2} दोनों ही मामलों में इनकी फिनिशिंग लाजवाब है। हर ग्राहक पर पूरा ध्यान दिया जाता है।`,
        `समय की पाबंदी, साफ-सफाई और काम में पूरी ईमानदारी दिखती है। उचित मूल्य में इतनी बढ़िया सेवा मिलना आसान नहीं।`,
        `सर्विस बेहद त्वरित है और किसी भी काम में कोई परेशानी नहीं हुई। पूरी टीम बहुत ही सहयोगी और दक्ष है।`,
        `${kw1} का अनुभव अद्भुत रहा! यहाँ ग्राहक के समय और पैसे दोनों की पूरी कद्र की जाती है।`,
      ]);

      const detailedOpeners = shuffle([
        `${city} में ${name} पर हालिया विजिट का अनुभव काफी व्यवस्थित और संतुष्टिदायक रहा।`,
        `${name} में काम करने का तरीका, अनुशासन और स्वच्छता देखकर मैं बहुत प्रभावित हुआ।`,
        `काफी समय से मैं ${name} की सेवाओं का उपयोग कर रहा हूँ और हर बार वही बेहतरीन स्तर मिलता है।`,
        `विश्वसनीय काम और अच्छे मार्गदर्शन के लिए ${name} एक बहुत ही उम्दा विकल्प है।`,
      ]);

      const detailedMiddles = shuffle([
        `स्टाफ का बात करने का तरीका बहुत आदरपूर्ण है। ${kw1} के बारे में सारी जानकारी विस्तार से दी और काम समय से पहले पूरा किया।`,
        `परिसर पूरी तरह स्वच्छ, सुरक्षित और सुखद है। छोटी-छोटी बातों का भी पूरा ध्यान रखा जाता है।`,
        `${kw1} की क्वालिटी बहुत उम्दा है। दाम एकदम उचित हैं और पारदर्शिता पूरी तरह बनी रहती है।`,
        `शुरुआत से अंत तक स्टाफ ने हर कदम पर मदद की। काम की फिनिशिंग में कोई कमी नहीं थी।`,
      ]);

      const authenticOpeners = shuffle([
        `प्रत्येक बार ${name} आने पर एक अलग ही सुकून और अपनापन महसूस होता है।`,
        `मैंने कई जगहों पर ${cat} देखा है, लेकिन ${name} का स्तर सचमुच अलग और खास है।`,
        `${city} में अच्छी जगह तलाशते हुए ${name} पहुंचा था और मेरा फैसला 100% सही साबित हुआ।`,
        `मेरा व्यक्तिगत अनुभव बहुत ही शानदार और पूरी तरह तनावमुक्त रहा।`,
      ]);

      const authenticMiddles = shuffle([
        `यहाँ का शांत माहौल और मददगार टीम बहुत अच्छी लगी। ${kw1} बिल्कुल मनमुताबिक संपन्न हुआ।`,
        `स्टाफ का अपनापन और काम के प्रति लगन वाकई सराहनीय है। ${kw2} का काम उम्मीद से भी सुंदर हुआ।`,
        `बिना किसी जल्दबाजी के बहुत ही ध्यानपूर्वक काम किया गया। पूरा परिवार बहुत खुश हुआ।`,
      ]);

      const professionalOpeners = shuffle([
        `${name} की टीम का पेशेवर रवैया और कार्यकुशलता वाकई प्रशंसा के योग्य है।`,
        `${city} में ${cat} के क्षेत्र में ${name} बेहतरीन मानक स्थापित कर रहा है।`,
        `समय की पाबंदी, पारदर्शिता और उच्च गुणवत्ता ही ${name} की वास्तविक पहचान है।`,
      ]);

      const professionalMiddles = shuffle([
        `काम का प्रबंधन और डिलीवरी बहुत ही सटीक रही। ${kw1} का संचालन बेहद सुचारू था।`,
        `ग्राहकों के समय का पूरा सम्मान किया जाता है। गति और गुणवत्ता का संतुलन बेहतरीन है।`,
        `सारे काम पारदर्शी और सुगम तरीके से पूरे किए गए। टीम की विशेषज्ञता साफ झलकती है।`,
      ]);

      const closers = shuffle([
        `मेरी तरफ से पूरी तरह से 5 में से 5 स्टार रेटिंग और सभी को खुली सलाह!`,
        `पूरी टीम को इस शानदार अनुभव के लिए धन्यवाद। हम दोबारा जरूर आएंगे! 5/5 Stars!`,
        `बिना किसी झिझक के यहाँ आ सकते हैं, पूरा पैसा वसूल अनुभव! Highly Recommended!`,
        `100% संतुष्ट ग्राहक! ऐसे ही बेहतरीन काम को हमेशा जारी रखें।`,
        `शानदार काम और बेमिसाल सेवा! 5 स्टार रेटिंग!`,
      ]);

      const conciseOptions = shuffle([
        `बहुत ही बढ़िया अनुभव! ${name} की सर्विस तेज, दाम उचित और स्टाफ बहुत सहयोगी है। पूरे 5 स्टार!`,
        `${city} में सबसे बेहतरीन विकल्प! ${kw1} और सफाई देखकर दिल खुश हो गया। Highly Recommended!`,
        `शानदार काम और पूरा पैसा वसूल! ${name} पर दोबारा जरूर आएंगे। 5/5 Stars!`,
        `उत्कृष्ट सेवा और बेहतरीन व्यवहार! बिना सोचे यहाँ आ सकते हैं। 5 स्टार!`,
      ]);

      return [
        {
          id: 1,
          title: "शानदार व दिलखुश अनुभव",
          tone: "Enthusiastic",
          text: `${enthusiasticOpeners[0]} ${enthusiasticMiddles[0]} ${closers[0]}`,
        },
        {
          id: 2,
          title: "विस्तृत व भरोसेमंद समीक्षा",
          tone: "Detailed",
          text: `${detailedOpeners[0]} ${detailedMiddles[0]} ${closers[1]}`,
        },
        {
          id: 3,
          title: "कम शब्दों में उत्तम",
          tone: "Concise",
          text: conciseOptions[0],
        },
        {
          id: 4,
          title: "सच्चा और व्यक्तिगत अनुभव",
          tone: "Authentic",
          text: `${authenticOpeners[0]} ${authenticMiddles[0]} ${closers[2]}`,
        },
        {
          id: 5,
          title: "प्रोफेशनल व समय के पाबंद",
          tone: "Professional",
          text: `${professionalOpeners[0]} ${professionalMiddles[0]} ${closers[3]}`,
        },
      ];
    } else if (rating === 4) {
      const fourStarEnthusiastic = shuffle([
        `${name} पर अनुभव काफी अच्छा और सुखद रहा। ${kw1} और स्टाफ का काम सराहनीय है। 4 स्टार!`,
        `हमारी विजिट बहुत अच्छी रही। काम की क्वालिटी बढ़िया थी, बस भीड़ के समय थोड़ा सा इंतजार कम हो तो शानदार होगा। 4/5 स्टार।`,
        `${city} में ${name} एक बहुत ही बढ़िया विकल्प है। काम और सर्विस दोनों अच्छी लगीं। 4 स्टार!`,
      ]);
      const fourStarDetailed = shuffle([
        `${city} स्थित ${name} का माहौल और काम दोनों अच्छे हैं। ${kw1} व्यवस्थित तरीके से हुआ और स्टाफ मददगार था। 4 स्टार अनुभव।`,
        `${name} की सेवाएँ संतोषजनक हैं। दाम उचित हैं और काम समय पर पूरा मिला। मेरी तरफ से 4 स्टार रेटिंग।`,
      ]);
      const fourStarConcise = shuffle([
        `अच्छी क्वालिटी और उचित दाम। ${name} पर दोबारा आने की पूरी उम्मीद है। 4 स्टार!`,
        `बढ़िया सर्विस और मददगार स्टाफ। कुल मिलाकर सुखद अनुभव रहा। 4 स्टार।`,
      ]);
      const fourStarAuthentic = shuffle([
        `कुल मिलाकर अच्छा अनुभव मिला। ${kw1} ने प्रभावित किया और स्टाफ का रवैया भी दोस्ताना था। 4 स्टार।`,
        `पहली बार आए थे और काम संतोषजनक रहा। फिर जरूर आएंगे। 4/5 स्टार।`,
      ]);
      const fourStarProfessional = shuffle([
        `काम पेशेवर तरीके से किया गया। समय और व्यवस्था दोनों ठीक थे। मेरी तरफ से ${name} को 4 स्टार।`,
        `विश्वसनीय टीम और अच्छा कार्य। 4 स्टार रेटिंग।`,
      ]);

      return [
        { id: 1, title: "बहुत अच्छा अनुभव", tone: "Enthusiastic", text: fourStarEnthusiastic[0] },
        { id: 2, title: "सकारात्मक समीक्षा", tone: "Detailed", text: fourStarDetailed[0] },
        { id: 3, title: "संक्षिप्त व बढ़िया", tone: "Concise", text: fourStarConcise[0] },
        { id: 4, title: "ईमानदार राय", tone: "Authentic", text: fourStarAuthentic[0] },
        { id: 5, title: "विश्वसनीय सेवा", tone: "Professional", text: fourStarProfessional[0] },
      ];
    } else if (rating === 3) {
      const threeStarList = shuffle([
        `${name} पर अनुभव सामान्य रहा। कुछ चीजें अच्छी थीं लेकिन ${kw1} में थोड़ा सुधार होना चाहिए। औसत 3 स्टार।`,
        `${city} स्थित ${name} का सेटअप ठीक है, लेकिन सर्विस की गति और कस्टमर अटेंशन पर थोड़ा काम करने की आवश्यकता है। 3 स्टार।`,
        `अनुभव न बहुत बुरा था और न बहुत खास। काम ठीक-ठाक हुआ पर थोड़ा और बेहतर हो सकता था। 3 स्टार रेटिंग।`,
        `${name} की सेवाएं सामान्य हैं। कीमतों के अनुसार गुणवत्ता थोड़ी और सुधारी जा सकती है। 3 स्टार।`,
        `कुछ बातें अच्छी रहीं पर इंतजार ज्यादा करना पड़ा। मैनेजमेंट को सर्विस थोड़ी तेज करनी चाहिए। 3 स्टार।`,
      ]);
      return [
        { id: 1, title: "औसत अनुभव", tone: "Authentic", text: threeStarList[0] },
        { id: 2, title: "विस्तृत सुझाव", tone: "Detailed", text: threeStarList[1] },
        { id: 3, title: "कम शब्दों में निष्पक्ष", tone: "Concise", text: threeStarList[2] },
        { id: 4, title: "तटस्थ समीक्षा", tone: "Professional", text: threeStarList[3] },
        { id: 5, title: "सुधार की जरूरत", tone: "Authentic", text: threeStarList[4] },
      ];
    } else if (rating === 2) {
      const twoStarList = shuffle([
        `${name} से काफी उम्मीदें थीं, लेकिन अनुभव उम्मीद के बिल्कुल विपरीत रहा। ${kw1} की क्वालिटी बहुत कमजोर लगी। 2 स्टार।`,
        `${city} में ${name} पर काफी लंबा इंतजार करना पड़ा और स्टाफ का रवैया भी गैर-पेशेवर लगा। सुधार की सख्त जरूरत है। 2 स्टार।`,
        `सर्विस बहुत सुस्त थी और काम में फिनिशिंग नहीं दिखी। 2 स्टार से ज्यादा नहीं दे सकते।`,
        `${name} की सेवा उम्मीद के मुताबिक नहीं थी। ग्राहकों की सुविधा पर बिल्कुल ध्यान नहीं दिया गया। 2 स्टार।`,
        `ग्राहक सेवा और समय की पाबंदी में काफी सुधार की आवश्यकता है। 2 स्टार रेटिंग।`,
      ]);
      return [
        { id: 1, title: "निराशाजनक अनुभव", tone: "Authentic", text: twoStarList[0] },
        { id: 2, title: "विस्तृत असंतोष", tone: "Detailed", text: twoStarList[1] },
        { id: 3, title: "धीमी व खराब सर्विस", tone: "Concise", text: twoStarList[2] },
        { id: 4, title: "पैसा वसूल नहीं", tone: "Professional", text: twoStarList[3] },
        { id: 5, title: "गंभीर सुधार अपेक्षित", tone: "Authentic", text: twoStarList[4] },
      ];
    } else {
      // 1 Star
      const oneStarList = shuffle([
        `${name} पर अनुभव पूरी तरह से निराशाजनक रहा। सर्विस का स्तर बहुत घटिया था और कोई सुनने वाला नहीं था। 1 स्टार।`,
        `${city} में ${name} जाकर समय और पैसे दोनों बर्बाद हुए। मैनेजमेंट को तुरंत अपने स्टाफ और सर्विस में सुधार करना चाहिए। 1 स्टार।`,
        `बहुत ही घटिया अनुभव। 1 स्टार भी ज्यादा लगता है। बिल्कुल संतुष्ट नहीं हुए।`,
        `${name} में मैनेजमेंट नाम की कोई चीज नहीं है। ग्राहकों की शिकायतों पर कोई ध्यान नहीं दिया जाता। 1 स्टार।`,
        `यहाँ आकर घोर निराशा हुई। सेवा और व्यवहार दोनों में भारी गिरावट है। 1 स्टार रेटिंग।`,
      ]);
      return [
        { id: 1, title: "बेहद खराब अनुभव", tone: "Authentic", text: oneStarList[0] },
        { id: 2, title: "समय व पैसे की बर्बादी", tone: "Detailed", text: oneStarList[1] },
        { id: 3, title: "अत्यधिक असंतुष्ट", tone: "Concise", text: oneStarList[2] },
        { id: 4, title: "खराब मैनेजमेंट", tone: "Professional", text: oneStarList[3] },
        { id: 5, title: "शिकायत", tone: "Authentic", text: oneStarList[4] },
      ];
    }
  }

  // -------------------------------------------------------------
  // ENGLISH REVIEW GENERATION
  // -------------------------------------------------------------
  const shuffledKw = shuffle(kwEn);
  const kw1 = shuffledKw[0] || "prompt service";
  const kw2 = shuffledKw[1] || "high quality standards";

  if (rating >= 5) {
    const enthusiasticOpeners = shuffle([
      `Had an absolute five-star experience with ${name} in ${city}!`,
      `If you are searching for the gold standard of ${cat} in ${city}, look no further than ${name}!`,
      `Visited ${name} based on glowing recommendations, and they totally exceeded my highest expectations!`,
      `From the very moment I arrived at ${name}, I was blown away by the genuine warmth and dedication.`,
      `Consistently top-tier quality every single time I visit ${name} in ${city}!`,
      `Had a wonderful visit with family yesterday at ${name}—everyone was thoroughly delighted!`,
      `The hospitality, attention to detail, and energy at ${name} make it stand out miles ahead in ${city}.`,
    ]);

    const enthusiasticMiddles = shuffle([
      `Their ${kw1} is genuinely world-class, paired with polite, attentive, and highly knowledgeable staff.`,
      `The turnaround time and execution regarding ${kw1} were swift, seamless, and completely stress-free.`,
      `Both ${kw1} and ${kw2} were handled with extraordinary finesse and precision. 100% value for money!`,
      `Spotlessly clean, well-organized space with a pleasant, welcoming atmosphere throughout.`,
      `No unnecessary delays or friction—just honest, dependable, and high-standard craftsmanship from start to finish.`,
      `Reasonable pricing, prompt turnaround, and sincere customer care that makes you feel genuinely valued.`,
    ]);

    const detailedOpeners = shuffle([
      `Visited ${name} in ${city} recently and was thoroughly impressed with their systematic operations.`,
      `The attention to hygiene, professionalism, and structured workflow at ${name} is truly exemplary.`,
      `Having tried multiple ${cat} providers across ${city}, ${name} easily ranks at the very top.`,
      `An exceptionally well-managed establishment where customer satisfaction is clearly the #1 priority.`,
    ]);

    const detailedMiddles = shuffle([
      `Staff was exceptionally courteous and walked me through everything with clear transparency. ${kw1} was completed right on schedule.`,
      `The facility is spotless, well-maintained, and operates like clockwork. ${kw1} exceeded what I was promised.`,
      `Fair, upfront pricing with zero hidden surprises. The team's expertise and ${kw2} reflect true mastery.`,
      `Every single detail was attended to with care. It's rare to find such high consistency and integrity in ${city}.`,
    ]);

    const authenticOpeners = shuffle([
      `Every visit to ${name} leaves me feeling relaxed, happy, and confident in their work.`,
      `I rarely write reviews, but the exceptional treatment I received at ${name} compelled me to share my story.`,
      `Was looking for reliable ${cat} in ${city} and choosing ${name} was the best decision I made.`,
      `My personal experience here was simply outstanding and completely hassle-free from start to finish.`,
    ]);

    const authenticMiddles = shuffle([
      `The team treated me with such warmth and respect. ${kw1} was taken care of exactly how I envisioned.`,
      `Calm, inviting vibe and staff that truly listens to what you need. ${kw2} was beautifully delivered.`,
      `No rush, no stress—just genuine human hospitality paired with top-shelf expertise.`,
    ]);

    const professionalOpeners = shuffle([
      `The team at ${name} exemplifies peak professionalism and operational excellence.`,
      `${name} sets a remarkable benchmark for ${cat} in ${city}.`,
      `Punctuality, transparency, and top-tier execution are the hallmarks of ${name}.`,
    ]);

    const professionalMiddles = shuffle([
      `Workflow execution was flawless. ${kw1} and ${kw2} were delivered strictly within agreed parameters.`,
      `Customer time is genuinely respected here. The balance between speed and quality is second to none.`,
      `Clear communication, transparent dealings, and highly skilled staff throughout the entire process.`,
    ]);

    const closers = shuffle([
      `A flawless 5 out of 5 stars! Will enthusiastically recommend ${name} to friends and colleagues.`,
      `Huge compliments to the entire team! Looking forward to my next visit soon. 5/5 stars!`,
      `A genuine 5-star gem in ${city}. Do not hesitate to visit! Highly Recommended!`,
      `Completely satisfied in every single aspect. Keep up the phenomenal work!`,
      `High-end quality without inflated prices. An easy 5-star endorsement!`,
      `100% satisfied customer. You will not find better service in ${city}!`,
    ]);

    const conciseOptions = shuffle([
      `Superb experience at ${name}! Fast, welcoming, and top quality. Solid 5 stars!`,
      `The best ${cat} in ${city}! Outstanding ${kw1} and wonderful staff. Highly recommended!`,
      `Flawless service, great prices, and spot-on cleanliness. 5 out of 5 stars for ${name}!`,
      `Top-notch quality and 100% satisfaction! Everything was smooth and prompt. 5 stars!`,
      `Delightful visit! Professional team, great ambiance, and excellent ${kw1}. Definitely 5 stars!`,
    ]);

    return [
      {
        id: 1,
        title: "Warm & Enthusiastic",
        tone: "Enthusiastic",
        text: `${enthusiasticOpeners[0]} ${enthusiasticMiddles[0]} ${closers[0]}`,
      },
      {
        id: 2,
        title: "Detailed & Impressed",
        tone: "Detailed",
        text: `${detailedOpeners[0]} ${detailedMiddles[0]} ${closers[1]}`,
      },
      {
        id: 3,
        title: "Short & Punchy",
        tone: "Concise",
        text: conciseOptions[0],
      },
      {
        id: 4,
        title: "Authentic Customer Story",
        tone: "Authentic",
        text: `${authenticOpeners[0]} ${authenticMiddles[0]} ${closers[2]}`,
      },
      {
        id: 5,
        title: "Professional & Reliable",
        tone: "Professional",
        text: `${professionalOpeners[0]} ${professionalMiddles[0]} ${closers[3]}`,
      },
    ];
  } else if (rating === 4) {
    const fourStarEnthusiastic = shuffle([
      `Had a pleasant visit to ${name}. The ${kw1} was impressive and the staff was courteous throughout. A well-deserved 4 stars!`,
      `Great experience overall at ${name}. Quality work and polite team! Just a tiny improvement in peak-hour wait times would make it 5 stars. 4/5 stars!`,
      `Visited ${name} in ${city}. Really liked the clean ambiance and courteous behavior of the team. 4 stars!`,
    ]);
    const fourStarDetailed = shuffle([
      `Visited ${name} in ${city}. Overall great service and neat ambiance. ${kw1} was handled properly and staff was helpful. Solid 4 stars.`,
      `Good quality, fair pricing, and polite assistance. Our experience with ${kw1} was smooth and enjoyable. Rated 4 stars!`,
    ]);
    const fourStarConcise = shuffle([
      `Crisp, positive, and dependable! Definitely recommend ${name}. Solid 4 stars.`,
      `Good quality and hospitable team. Glad we visited ${name}. 4 stars!`,
      `Pleasant experience with quick turnaround. Well worth 4 stars.`,
    ]);
    const fourStarAuthentic = shuffle([
      `Positive experience overall. ${kw1} was handled very nicely and we left satisfied. Will certainly visit again. 4 stars!`,
      `First time visiting ${name} and came away happy with the work. Good, trustworthy place. 4/5 stars.`,
    ]);
    const fourStarProfessional = shuffle([
      `Prompt service and professional approach from the team at ${name}. Rated 4 stars.`,
      `Dependable and structured execution. Well-deserved 4-star rating.`,
    ]);

    return [
      { id: 1, title: "Very Good Experience", tone: "Enthusiastic", text: fourStarEnthusiastic[0] },
      { id: 2, title: "Detailed & Positive", tone: "Detailed", text: fourStarDetailed[0] },
      { id: 3, title: "Crisp & Positive", tone: "Concise", text: fourStarConcise[0] },
      { id: 4, title: "Honest Reflection", tone: "Authentic", text: fourStarAuthentic[0] },
      { id: 5, title: "Professional & Smooth", tone: "Professional", text: fourStarProfessional[0] },
    ];
  } else if (rating === 3) {
    const threeStarList = shuffle([
      `An okay visit to ${name}. While some parts were fine, the ${kw1} could have been much better. A fair 3-star rating.`,
      `Visited ${name} in ${city}. The place is decent, but wait times were long and attention from staff was lacking. Good potential if management addresses these issues. 3 stars.`,
      `Neither too great nor too bad. Just an average experience with room for better consistency. 3 stars.`,
      `Standard service at ${name}. Value for money could be improved to match expectations. 3-star rating.`,
      `Had mixed feelings about our visit. Some aspects were okay, but service speed needs improvement. 3 stars.`,
    ]);
    return [
      { id: 1, title: "Average / Mixed", tone: "Authentic", text: threeStarList[0] },
      { id: 2, title: "Constructive Feedback", tone: "Detailed", text: threeStarList[1] },
      { id: 3, title: "Moderate Experience", tone: "Concise", text: threeStarList[2] },
      { id: 4, title: "Neutral Review", tone: "Professional", text: threeStarList[3] },
      { id: 5, title: "Room for Improvement", tone: "Authentic", text: threeStarList[4] },
    ];
  } else if (rating === 2) {
    const twoStarList = shuffle([
      `Had high hopes for ${name}, but the visit fell well below expectations. ${kw1} was subpar and service was delayed. 2 stars.`,
      `Disappointed with our experience at ${name} in ${city}. Long waiting periods and staff seemed disorganized. Management urgently needs to step in. 2 stars.`,
      `Slow service and lacking quality. Definitely not the experience we anticipated. 2 stars.`,
      `The customer handling at ${name} was lacking. Not worth the price paid under current management. 2 stars.`,
      `Expected much better standards. Disappointed with the quality and responsiveness. 2-star rating.`,
    ]);
    return [
      { id: 1, title: "Below Expectations", tone: "Authentic", text: twoStarList[0] },
      { id: 2, title: "Detailed Critique", tone: "Detailed", text: twoStarList[1] },
      { id: 3, title: "Disappointed", tone: "Concise", text: twoStarList[2] },
      { id: 4, title: "Needs Overhaul", tone: "Professional", text: twoStarList[3] },
      { id: 5, title: "Unsatisfied", tone: "Authentic", text: twoStarList[4] },
    ];
  } else {
    // 1 Star
    const oneStarList = shuffle([
      `A truly regrettable experience at ${name}. Poor service, unresponsive staff, and zero customer courtesy. 1 star.`,
      `Waste of time and money at ${name} in ${city}. The management seems completely indifferent to customer complaints. Serious changes are needed. 1 star.`,
      `Horrible experience from start to finish. Subpar standards throughout. Cannot recommend. 1 star.`,
      `Total mismanagement and disregard for customers at ${name}. Deeply dissatisfied. 1 star.`,
      `Extremely frustrated with the poor experience here. Definitely won't be returning. 1-star rating.`,
    ]);
    return [
      { id: 1, title: "Extremely Disappointed", tone: "Authentic", text: oneStarList[0] },
      { id: 2, title: "Urgent Action Required", tone: "Detailed", text: oneStarList[1] },
      { id: 3, title: "Very Poor Service", tone: "Concise", text: oneStarList[2] },
      { id: 4, title: "Complete Lack of Management", tone: "Professional", text: oneStarList[3] },
      { id: 5, title: "Unacceptable Quality", tone: "Authentic", text: oneStarList[4] },
    ];
  }
};

/**
 * Generates AI reviews using Google Gemini with dynamic persona injection, high entropy,
 * and seamless fallback chain.
 */
export async function generateReviewsWithGemini(params: {
  business: Business;
  rating: number;
  language: SupportedLanguage;
  aspects?: string[];
  seed?: string | number;
}): Promise<ReviewOption[]> {
  const { business, rating, language, aspects, seed } = params;

  // Prioritize business-specific Gemini API key; fall back to system env key
  const apiKey = business.geminiApiKey?.trim() || process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    console.warn(
      `No Gemini API key available for business "${business.name}". Using dynamic high-entropy review synthesizer.`
    );
    return generateDynamicFallback(business, rating, language, aspects);
  }

  const langName =
    language === "mr" ? "Marathi (मराठी)" : language === "hi" ? "Hindi (हिंदी)" : "English";

  const randomSeed = seed || `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const aspectsText =
    aspects && aspects.length > 0
      ? `Customer selected highlights/aspects to emphasize: ${aspects.join(", ")}`
      : "";

  // Dynamic customer persona variations to guarantee fresh reviews every generation
  const personaAngles = [
    "Customer visited yesterday with family and shared their authentic, delighted reaction",
    "Customer came during rush hour and was impressed by the queue management, hospitality, and speed",
    "Customer who values consistency, hygiene, and genuine hospitality over everything else",
    "First-time customer who came based on strong local word-of-mouth recommendations",
    "Regular loyal visitor who has been coming here for months and noticed ongoing excellence",
    "Local neighborhood resident leaving a sincere, highly practical review for fellow citizens",
    "Busy professional who needed quick, courteous, and hassle-free assistance",
    "Customer celebrating a pleasant milestone who appreciated the warm, celebratory hospitality",
    "Detail-oriented customer who evaluated the quality, value-for-money, and finish meticulously",
    "Visitor traveling from out of town who considers this place a hidden gem of the city",
  ];
  const angle = pickOne(personaAngles);

  const ratingGuideline =
    rating === 5
      ? "• 5 Stars: Highest praise, 100% recommended, highlighting best qualities, flawless experience, warmth and excellence."
      : rating === 4
      ? "• 4 Stars: Very positive and pleasant visit, strong satisfaction, genuine appreciation with realistic praise, solid 4/5 star endorsement."
      : rating === 3
      ? "• 3 Stars: Balanced/average experience, polite and constructive feedback noting decent points alongside fair areas needing improvement."
      : rating === 2
      ? "• 2 Stars: Subpar/disappointing visit, respectful critique pointing out unmet expectations, slow service, or quality lapses."
      : "• 1 Star: Poor/unsatisfactory visit, honest constructive critique expressing frustration politely, calling on management to resolve major issues.";

  const prompt = `
You are an expert Google Local Guide assistant writing authentic, high-quality Google Place reviews.
Generate 5 COMPLETELY FRESH, DIVERSE, and REALISTIC Google reviews for the business below.

Business Name: ${business.name}
Google Place ID: ${business.placeId}
Category: ${business.category}
City / Location: ${business.city}
Keywords / Highlights: ${business.keywords.join(", ")}
${business.customPrompt ? `Admin Special Instructions: ${business.customPrompt}` : ""}
${aspectsText}
Current Visit Context / Persona Angle: ${angle}
Generation Seed: ${randomSeed}

CUSTOMER STAR RATING: ${rating} out of 5 Stars
Output Language: ${langName}

CRITICAL RATING-SPECIFIC SENTIMENT & TONE INSTRUCTION:
The customer has chosen EXACTLY ${rating} OUT OF 5 STARS.
The reviews MUST STRICTLY reflect this exact ${rating}-star sentiment:
${ratingGuideline}
NEVER generate 5-star glowing praise if the rating is ${rating} stars!

CRITICAL RULES FOR MAXIMUM DIVERSITY & AUTHENTICITY:
1. Each of the 5 reviews MUST sound like an authentic human customer who actually visited the place.
2. DO NOT use generic AI repetitive clichés or robotic marketing templates.
3. Every single review MUST have a different sentence opener, different flow, and a different personal perspective.
4. If Language is Marathi (मराठी): write in natural, fluent Marathi as spoken in Maharashtra.
5. If Language is Hindi (हिंदी): write in natural conversational Hindi.
6. If Language is English: write in engaging, genuine English.
7. Return exactly 5 options with these tones:
   - Option 1: Enthusiastic (उत्साही / स्पष्ट)
   - Option 2: Detailed (सविस्तर माहितीपूर्ण)
   - Option 3: Concise (थोडक्यात आणि प्रभावी - 1 to 2 punchy lines)
   - Option 4: Authentic (वैयक्तिक प्रामाणिक अनुभव)
   - Option 5: Professional (व्यावसायिक व विश्लेषणात्मक)

Format: Return a JSON array of 5 objects with keys:
- "id": number (1 to 5)
- "title": short 2-4 word label in ${langName}
- "tone": one of 'Enthusiastic', 'Detailed', 'Concise', 'Authentic', 'Professional'
- "text": the complete review text ready for Google Maps
`;

  const genAI = new GoogleGenerativeAI(apiKey);

  // Try candidate models in order: gemini-3.5-flash -> gemini-3.1-flash-lite -> gemini-3.8-flash -> gemini-flash-latest
  for (const modelName of CANDIDATE_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 1.0, // High entropy for maximum variety between generations
          topP: 0.95,
          responseMimeType: "application/json",
        },
      });

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      const cleanedJson = responseText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```$/i, "")
        .trim();

      const parsed = JSON.parse(cleanedJson);
      if (Array.isArray(parsed) && parsed.length >= 1) {
        return parsed.slice(0, 5).map((opt, index) => ({
          id: index + 1,
          title: opt.title || `Review Option ${index + 1}`,
          tone: opt.tone || "Authentic",
          text: opt.text || "",
        }));
      }
    } catch (modelError: unknown) {
      const errMsg = modelError instanceof Error ? modelError.message : String(modelError);
      console.warn(`Gemini model ${modelName} failed or busy (${errMsg.slice(0, 100)}). Trying next candidate model...`);
    }
  }

  // If all live models failed or were temporarily rate-limited, provide dynamic non-repeating fallback
  console.warn("All candidate Gemini models temporarily unavailable. Using dynamic high-entropy fallback synthesizer.");
  return generateDynamicFallback(business, rating, language, aspects);
}
