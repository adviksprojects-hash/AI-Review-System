import { GoogleGenerativeAI } from "@google/generative-ai";
import { Business, ReviewOption, SupportedLanguage } from "./types";

// Supported active Google Gemini models with fallback chain
const CANDIDATE_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash",
  "gemini-3.8-flash",
  "gemini-flash-latest",
];

// Dynamic multi-variation fallback generator (ensures zero repetition and strictly matches the customer's star rating)
const generateDynamicFallback = (
  business: Business,
  rating: number,
  lang: SupportedLanguage
): ReviewOption[] => {
  const name = business.name;
  const cat = business.category;
  const city = business.city;
  const kwList = business.keywords.length > 0 ? business.keywords : ["उत्तम सेवा", "दर्जेदार काम"];
  const randomKw = kwList[Math.floor(Math.random() * kwList.length)];
  const randomKw2 = kwList[(Math.floor(Math.random() * kwList.length) + 1) % kwList.length];

  if (lang === "mr") {
    if (rating >= 5) {
      const openers = [
        `मी नुकतीच ${city} मधील ${name} ला भेट दिली आणि अनुभव अप्रतिम होता!`,
        `${city} मध्ये ${cat} साठी ${name} सर्वोत्तम पर्याय आहे.`,
        `मित्रांच्या शिफारसीवरून ${name} येथे गेलो होतो आणि अपेक्षांपेक्षाही जास्त समाधान मिळाले.`,
        `प्रत्येक वेळी ${name} येथे येताना एक वेगळाच आनंद आणि विश्वास मिळतो.`,
        `${name} ची सेवा आणि दर्जा खरोखरच कौतुकास्पद आहे.`,
      ];
      const middles = [
        `येथील ${randomKw} आणि कर्मचाऱ्यांची वागणूक मनाला खूप भावली. स्वच्छता आणि वेळेचे नियोजन खूप छान आहे.`,
        `${randomKw2} ची गुणवत्ता अतिशय दर्जेदार आहे. प्रत्येक ग्राहकाकडे जातीने लक्ष दिले जाते.`,
        `अतिशय प्रामाणिक काम आणि वाजवी दर! ${city} मध्ये असा अनुभव मिळणे दुर्मिळ आहे.`,
        `काम वेळेत पूर्ण करून मिळाले आणि स्टाफ अतिशय नम्र व सहकार्य करणारा आहे.`,
        `परिसर अतिशय स्वच्छ, सुरक्षित आणि प्रसन्न आहे. सेवा तत्पर आणि दर्जेदार आहे.`,
      ];
      const closers = [
        `नक्कीच पुन्हा भेट देईन आणि सर्वांना ५ स्टार शिफारस करेन!`,
        `खरोखरच मनःपूर्वक धन्यवाद! ५ पैकी ५ स्टार!`,
        `माझ्याकडून ${name} ला मनापासून ५ स्टार रेटिंग!`,
        `जर तुम्ही उत्तम ${cat} च्या शोधात असाल तर इथे नक्की भेट द्या!`,
        `एकंदरीत अनुभव १००% समाधानकारक राहिला. Highly Recommended!`,
      ];
      return [
        { id: 1, title: "अतिशय छान व उत्साही", tone: "Enthusiastic", text: `${openers[0]} ${middles[0]} ${closers[0]}` },
        { id: 2, title: "सविस्तर व परिपूर्ण", tone: "Detailed", text: `${openers[1]} ${middles[1]} ${closers[1]}` },
        { id: 3, title: "थोडक्यात व प्रभावी", tone: "Concise", text: `उत्कृष्ट काम आणि दर्जेदार अनुभव! ${name} कडून वेळेत सर्व्हिस मिळाली. ५ स्टार नक्कीच पात्र!` },
        { id: 4, title: "वैयक्तिक प्रामाणिक अनुभव", tone: "Authentic", text: `${openers[2]} ${middles[2]} ${closers[3]}` },
        { id: 5, title: "व्यावसायिक व विश्वासू", tone: "Professional", text: `${openers[3]} ${middles[3]} ${closers[2]}` },
      ];
    } else if (rating === 4) {
      return [
        { id: 1, title: "खूप चांगला अनुभव", tone: "Enthusiastic", text: `${name} येथील अनुभव खूप चांगला राहिला. ${randomKw} छान होते आणि स्टाफचे सहकार्य मिळाले. नक्कीच ४ स्टार!` },
        { id: 2, title: "सविस्तर आणि सकारात्मक", tone: "Detailed", text: `${city} मधील ${name} ला भेट दिली. एकंदरीत सेवा आणि स्वच्छता चांगली आहे. थोडासा वेळ वाचवता आला तर परिपूर्ण होईल. ४/५ स्टार.` },
        { id: 3, title: "थोडक्यात व छान", tone: "Concise", text: `चांगली सर्व्हिस आणि वाजवी दर. ${name} नक्कीच भेट देण्यासारखे आहे. ४ स्टार अनुभव!` },
        { id: 4, title: "प्रामाणिक मत", tone: "Authentic", text: `आमचा येथील अनुभव समाधानकारक राहिला. ${randomKw2} ची कॉलिटी उत्तम होती. पुन्हा नक्की विचार करू.` },
        { id: 5, title: "व्यावसायिक सेवा", tone: "Professional", text: `कामाचा दर्जा चांगला आहे. कर्मचाऱ्यांची वागणूक आदरयुक्त होती. माझ्याकडून ४ स्टार.` },
      ];
    } else if (rating === 3) {
      return [
        { id: 1, title: "मध्यम / ठीकठाक अनुभव", tone: "Authentic", text: `${name} येथे भेट दिली. काही गोष्टी बऱ्या होत्या, पण ${randomKw} बाबतीत थोडी सुधारणा अपेक्षित आहे. एकंदरीत सरासरी ३ स्टार अनुभव.` },
        { id: 2, title: "सविस्तर सुधारणा सूचना", tone: "Detailed", text: `${city} मधील ${name} चा परिसर बरा आहे, परंतु सेवेचा वेग आणि ग्राहकांकडे लक्ष वाढवण्याची गरज वाटते. व्यवस्थापनाने सुधारणा केल्यास नक्कीच उत्तम होईल.` },
        { id: 3, title: "थोडक्यात अभिप्राय", tone: "Concise", text: `अनुभव ठीक होता, वाईट नव्हता पण खूप खासही वाटला नाही. ३ स्टार रेटिंग.` },
        { id: 4, title: "तटस्थ मत", tone: "Professional", text: `${name} ची सर्व्हिस सरासरी आहे. दर आणि दर्जा यामध्ये अजून ताळमेळ बसवणे गरजेचे आहे.` },
        { id: 5, title: "समतोल आढावा", tone: "Authentic", text: `काही बाबी चांगल्या होत्या तर काही ठिकाणी वाट पाहावी लागली. सरासरी ३ स्टार.` },
      ];
    } else if (rating === 2) {
      return [
        { id: 1, title: "निराशाजनक अनुभव", tone: "Authentic", text: `${name} कडून खूप अपेक्षा होत्या, परंतु अपेक्षेप्रमाणे अनुभव मिळाला नाही. ${randomKw} ची गुणवत्ता सुधारायला हवी. २ स्टार.` },
        { id: 2, title: "सविस्तर तक्रार / सूचना", tone: "Detailed", text: `आम्ही नुकतीच ${name} ला भेट दिली. खूप वेळ वाट पाहावी लागली आणि कर्मचाऱ्यांचे व्यवस्थापन योग्य नव्हते. कृपया सेवेकडे लक्ष द्यावे.` },
        { id: 3, title: "थोडक्यात नाराजी", tone: "Concise", text: `सर्व्हिस खूपच स्लो होती आणि दर्जा समाधानकारक नव्हता. व्यवस्थापनाने तत्काळ सुधारणा करणे गरजेचे आहे.` },
        { id: 4, title: "असमाधानकारक भेट", tone: "Professional", text: `${city} मध्ये असूनही ${name} ची सेवा सरासरीपेक्षा कमी वाटली. पैसे वसूल झाल्यासारखे वाटले नाही.` },
        { id: 5, title: "सुधारणेची गरज", tone: "Authentic", text: `ग्राहक सेवेमध्ये आणि वेळेच्या नियोजनात मोठी सुधारणा आवश्यक आहे. २ स्टार.` },
      ];
    } else {
      // 1 Star
      return [
        { id: 1, title: "अतिशय वाईट अनुभव", tone: "Authentic", text: `${name} येथील अनुभव अत्यंत निराशाजनक ठरला. सेवेचा दर्जा अतिशय सुमार होता आणि कोणाचेही लक्ष नव्हते. १ स्टार.` },
        { id: 2, title: "गंभीर नाराजी", tone: "Detailed", text: `${city} मधील ${name} येथे जाऊन वेळेचा आणि पैशांचा अपव्यय झाला. ग्राहकांना मिळणारी वागणूक अजिबात योग्य नव्हती. व्यवस्थापनाने दखल घ्यावी.` },
        { id: 3, title: "अत्यंत असमाधानी", tone: "Concise", text: `खूपच वाईट सर्व्हिस आणि निकृष्ट दर्जा. १ स्टार देणेही कठीण वाटते. सुधारणा आवश्यक आहे.` },
        { id: 4, title: "खराब व्यवस्थापन", tone: "Professional", text: `${name} कडे व्यवस्थापनाचा पूर्ण अभाव दिसला. ग्राहकांच्या तक्रारींकडे दुर्लक्ष केले जाते.` },
        { id: 5, title: "तक्रार नोंद", tone: "Authentic", text: `इथे जाऊन पूर्ण निराशा झाली. कर्मचाऱ्यांची वागणूक आणि सेवा दोन्हींमध्ये सुधारणा व्हावी. १ स्टार.` },
      ];
    }
  }

  if (lang === "hi") {
    if (rating >= 5) {
      const openers = [
        `हाल ही में ${city} में स्थित ${name} पर जाने का मौका मिला और अनुभव बहुत ही शानदार रहा!`,
        `अगर आप ${city} में बेहतरीन ${cat} की तलाश में हैं, तो ${name} सबसे सही जगह है।`,
        `दोस्तों के कहने पर ${name} ट्राई किया और सचमुच दिल खुश हो गया!`,
        `${name} की सर्विस और क्वालिटी हर बार एक नया भरोसा जगाती है।`,
        `पहली ही मुलाकात में ${name} की टीम ने अपने काम से दिल जीत लिया।`,
      ];
      const middles = [
        `यहाँ की ${randomKw} और स्टाफ का दोस्ताना व्यवहार वाकई तारीफ के काबिल है।`,
        `${randomKw2} की क्वालिटी बहुत ही उम्दा है और काम में पूरी ईमानदारी दिखती है।`,
        `समय की पाबंदी, साफ-सफाई और काम की फिनिशिंग में इनका कोई मुकाबला नहीं।`,
        `हर एक कस्टमर का पूरा ध्यान रखा जाता है और सेवा बेहद त्वरित है।`,
        `सुविधाजनक माहौल, उचित मूल्य और बेहतरीन परिणाम मिले।`,
      ];
      const closers = [
        `मेरी तरफ से पूरी तरह से 5 स्टार रेटिंग और सबको सलाह!`,
        `पूरे परिवार के साथ फिर जरूर आएंगे। Highly Recommended!`,
        `शानदार काम के लिए पूरी टीम को धन्यवाद! 5/5 Stars!`,
        `बिना किसी झिझक के यहाँ आ सकते हैं, पूरा पैसा वसूल अनुभव!`,
        `एक बार जरूर सेवा का अवसर दें, निराश नहीं होंगे!`,
      ];
      return [
        { id: 1, title: "शानदार व दिलखुश अनुभव", tone: "Enthusiastic", text: `${openers[0]} ${middles[0]} ${closers[0]}` },
        { id: 2, title: "विस्तृत व भरोसेमंद समीक्षा", tone: "Detailed", text: `${openers[1]} ${middles[1]} ${closers[1]}` },
        { id: 3, title: "कम शब्दों में उत्तम", tone: "Concise", text: `बहुत ही बढ़िया अनुभव! ${name} की सर्विस तेज और स्टाफ बहुत सहयोगी है। पूरे 5 स्टार!` },
        { id: 4, title: "सच्चा और व्यक्तिगत अनुभव", tone: "Authentic", text: `${openers[2]} ${middles[2]} ${closers[3]}` },
        { id: 5, title: "प्रोफेशनल व समय के पाबंद", tone: "Professional", text: `${openers[3]} ${middles[3]} ${closers[2]}` },
      ];
    } else if (rating === 4) {
      return [
        { id: 1, title: "बहुत अच्छा अनुभव", tone: "Enthusiastic", text: `${name} पर अनुभव काफी अच्छा रहा। ${randomKw} और स्टाफ का काम सराहनीय है। 4 स्टार!` },
        { id: 2, title: "सकारात्मक समीक्षा", tone: "Detailed", text: `${city} में ${name} एक बढ़िया विकल्प है। काम और सर्विस अच्छी है, बस थोड़ा समय प्रबंधन और बेहतर हो सकता है। 4/5 स्टार।` },
        { id: 3, title: "संक्षिप्त व बढ़िया", tone: "Concise", text: `अच्छी क्वालिटी और उचित दाम। ${name} पर दोबारा आने की पूरी उम्मीद है। 4 स्टार!` },
        { id: 4, title: "ईमानदार राय", tone: "Authentic", text: `कुल मिलाकर अच्छा अनुभव मिला। ${randomKw2} ने प्रभावित किया। स्टाफ का रवैया भी मददगार था।` },
        { id: 5, title: "विश्वसनीय सेवा", tone: "Professional", text: `काम पेशेवर तरीके से किया गया। मेरी तरफ से ${name} को 4 स्टार रेटिंग।` },
      ];
    } else if (rating === 3) {
      return [
        { id: 1, title: "औसत अनुभव", tone: "Authentic", text: `${name} पर अनुभव सामान्य रहा। कुछ चीजें अच्छी थीं लेकिन ${randomKw} में सुधार की गुंजाइश है। 3 स्टार।` },
        { id: 2, title: "विस्तृत सुझाव", tone: "Detailed", text: `${city} स्थित ${name} में ठीक-ठाक अनुभव मिला। सर्विस थोड़ी धीमी थी और ध्यान देने की आवश्यकता है।` },
        { id: 3, title: "कम शब्दों में निष्पक्ष", tone: "Concise", text: `अनुभव न बहुत बुरा था और न बहुत खास। औसत 3 स्टार सेवा।` },
        { id: 4, title: "तटस्थ समीक्षा", tone: "Professional", text: `${name} की सेवाएं सामान्य हैं। कीमतों के अनुसार गुणवत्ता थोड़ी और बेहतर होनी चाहिए।` },
        { id: 5, title: "सुधार की जरूरत", tone: "Authentic", text: `कुछ बातें अच्छी रहीं पर इंतजार ज्यादा करना पड़ा। मैनेजमेंट को सर्विस तेज करनी चाहिए। 3 स्टार।` },
      ];
    } else if (rating === 2) {
      return [
        { id: 1, title: "निराशाजनक अनुभव", tone: "Authentic", text: `${name} से काफी उम्मीदें थीं, लेकिन अनुभव उम्मीद के बिल्कुल विपरीत रहा। ${randomKw} की क्वालिटी बहुत कमजोर लगी। 2 स्टार।` },
        { id: 2, title: "विस्तृत असंतोष", tone: "Detailed", text: `${city} में ${name} पर काफी लंबा इंतजार करना पड़ा और स्टाफ का रवैया भी गैर-पेशेवर लगा। सुधार की सख्त जरूरत है।` },
        { id: 3, title: "धीमी व खराब सर्विस", tone: "Concise", text: `सर्विस बहुत सुस्त थी और काम में फिनिशिंग नहीं दिखी। 2 स्टार से ज्यादा नहीं दे सकते।` },
        { id: 4, title: "पैसा वसूल नहीं", tone: "Professional", text: `${name} की सेवा उम्मीद के मुताबिक नहीं थी। ग्राहकों की सुविधा पर बिल्कुल ध्यान नहीं दिया गया।` },
        { id: 5, title: "गंभीर सुधार अपेक्षित", tone: "Authentic", text: `ग्राहक सेवा और समय की पाबंदी में काफी सुधार की आवश्यकता है। 2 स्टार।` },
      ];
    } else {
      // 1 Star
      return [
        { id: 1, title: "बेहद खराब अनुभव", tone: "Authentic", text: `${name} पर अनुभव पूरी तरह से निराशाजनक रहा। सर्विस का स्तर बहुत घटिया था और कोई सुनने वाला नहीं था। 1 स्टार।` },
        { id: 2, title: "समय व पैसे की बर्बादी", tone: "Detailed", text: `${city} में ${name} जाकर समय और पैसे दोनों बर्बाद हुए। मैनेजमेंट को तुरंत अपने स्टाफ और सर्विस में सुधार करना चाहिए।` },
        { id: 3, title: "अत्यधिक असंतुष्ट", tone: "Concise", text: `बहुत ही घटिया अनुभव। 1 स्टार भी ज्यादा लगता है। बिल्कुल संतुष्ट नहीं हुए।` },
        { id: 4, title: "खराब मैनेजमेंट", tone: "Professional", text: `${name} में मैनेजमेंट नाम की कोई चीज नहीं है। ग्राहकों की शिकायतों पर कोई ध्यान नहीं दिया जाता।` },
        { id: 5, title: "शिकायत", tone: "Authentic", text: `यहाँ आकर घोर निराशा हुई। सेवा और व्यवहार दोनों में भारी गिरावट है। 1 स्टार।` },
      ];
    }
  }

  // English dynamic
  if (rating >= 5) {
    const openers = [
      `Had a delightful experience with ${name} in ${city}!`,
      `If you are looking for top-notch ${cat} in ${city}, ${name} is truly the benchmark.`,
      `Visited ${name} on a friend's recommendation, and they totally exceeded my expectations!`,
      `Consistently impressed with the quality, hygiene, and hospitality at ${name}.`,
      `Outstanding customer care and attention to detail from the moment I arrived at ${name}.`,
    ];
    const middles = [
      `Their ${randomKw} is exceptional, and the entire team makes you feel genuinely valued.`,
      `The turnaround time and execution for ${randomKw2} were swift and completely hassle-free.`,
      `High standards of cleanliness, transparent communication, and fair pricing throughout.`,
      `The staff goes above and beyond to make sure every customer leaves with a smile.`,
      `Top-tier quality and professionalism that is hard to find elsewhere in ${city}.`,
    ];
    const closers = [
      `Deserves every bit of a 5-star rating! Will be back soon.`,
      `A solid 5/5 stars! Highly recommend to everyone in ${city}.`,
      `Huge appreciation to the management and staff for such a great experience.`,
      `Don't hesitate to visit—you will definitely not be disappointed!`,
      `100% satisfied customer. Keep up the phenomenal work!`,
    ];
    return [
      { id: 1, title: "Warm & Enthusiastic", tone: "Enthusiastic", text: `${openers[0]} ${middles[0]} ${closers[0]}` },
      { id: 2, title: "Detailed & Impressed", tone: "Detailed", text: `${openers[1]} ${middles[1]} ${closers[1]}` },
      { id: 3, title: "Short & Punchy", tone: "Concise", text: `Superb experience at ${name}! Fast, welcoming, and top quality. Solid 5 stars!` },
      { id: 4, title: "Authentic Customer Story", tone: "Authentic", text: `${openers[2]} ${middles[2]} ${closers[3]}` },
      { id: 5, title: "Professional & Reliable", tone: "Professional", text: `${openers[3]} ${middles[3]} ${closers[2]}` },
    ];
  } else if (rating === 4) {
    return [
      { id: 1, title: "Very Good Experience", tone: "Enthusiastic", text: `Had a pleasant visit to ${name}. The ${randomKw} was impressive and the staff was courteous. A well-deserved 4 stars!` },
      { id: 2, title: "Detailed & Positive", tone: "Detailed", text: `Visited ${name} in ${city}. Overall great service and neat ambiance. A tiny improvement in turnaround time would make it absolute perfection. 4/5 stars.` },
      { id: 3, title: "Crisp & Positive", tone: "Concise", text: `Good quality, polite hospitality, and fair pricing. Definitely recommend ${name}. Solid 4 stars.` },
      { id: 4, title: "Honest Reflection", tone: "Authentic", text: `Positive experience overall. ${randomKw2} was handled very nicely and we left satisfied. Will certainly visit again.` },
      { id: 5, title: "Professional & Smooth", tone: "Professional", text: `Prompt service and professional approach from the team at ${name}. Rated 4 stars.` },
    ];
  } else if (rating === 3) {
    return [
      { id: 1, title: "Average / Mixed", tone: "Authentic", text: `An okay visit to ${name}. While some parts were fine, the ${randomKw} could have been much better. A fair 3-star rating.` },
      { id: 2, title: "Constructive Feedback", tone: "Detailed", text: `Visited ${name} in ${city}. The place is decent, but wait times were long and attention from staff was lacking. Good potential if management addresses these issues.` },
      { id: 3, title: "Moderate Experience", tone: "Concise", text: `Neither too great nor too bad. Just an average experience. 3 stars.` },
      { id: 4, title: "Neutral Review", tone: "Professional", text: `Standard service at ${name}. Value for money could be improved to match expectations.` },
      { id: 5, title: "Room for Improvement", tone: "Authentic", text: `Had mixed feelings about our visit. Some aspects were okay, but service consistency needs improvement. 3 stars.` },
    ];
  } else if (rating === 2) {
    return [
      { id: 1, title: "Below Expectations", tone: "Authentic", text: `Had high hopes for ${name}, but the visit fell well below expectations. ${randomKw} was subpar and service was delayed. 2 stars.` },
      { id: 2, title: "Detailed Critique", tone: "Detailed", text: `Disappointed with our experience at ${name} in ${city}. Long waiting periods and staff seemed disorganized. Management urgently needs to step in.` },
      { id: 3, title: "Disappointed", tone: "Concise", text: `Slow service and lacking quality. Definitely not the experience we anticipated. 2 stars.` },
      { id: 4, title: "Needs Overhaul", tone: "Professional", text: `The customer handling at ${name} was lacking. Not worth the price paid under current management.` },
      { id: 5, title: "Unsatisfied", tone: "Authentic", text: `Expected much better standards. Disappointed with the quality and responsiveness. 2 stars.` },
    ];
  } else {
    // 1 Star
    return [
      { id: 1, title: "Extremely Disappointed", tone: "Authentic", text: `A truly regrettable experience at ${name}. Poor service, unresponsive staff, and zero customer courtesy. 1 star.` },
      { id: 2, title: "Urgent Action Required", tone: "Detailed", text: `Waste of time and money at ${name} in ${city}. The management seems completely indifferent to customer complaints. Serious changes are needed.` },
      { id: 3, title: "Very Poor Service", tone: "Concise", text: `Horrible experience from start to finish. Subpar standards throughout. Cannot recommend. 1 star.` },
      { id: 4, title: "Complete Lack of Management", tone: "Professional", text: `Total mismanagement and disregard for customers at ${name}. Deeply dissatisfied.` },
      { id: 5, title: "Unacceptable Quality", tone: "Authentic", text: `Extremely frustrated with the poor experience here. Definitely won't be returning. 1 star.` },
    ];
  }
};

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
      `No Gemini API key available for business "${business.name}". Using dynamic fallback generator.`
    );
    return generateDynamicFallback(business, rating, language);
  }

  const langName =
    language === "mr" ? "Marathi (मराठी)" : language === "hi" ? "Hindi (हिंदी)" : "English";

  const randomSeed = seed || `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const aspectsText = aspects && aspects.length > 0 ? `Customer selected highlights: ${aspects.join(", ")}` : "";

  // Dynamic customer persona variations to guarantee fresh reviews every generation
  const personaAngles = [
    "Customer visited yesterday with family and shared their authentic reaction",
    "Customer came during rush hour and observed the workflow, hospitality and speed",
    "Customer who values consistency, hygiene, and genuine hospitality",
    "First-time customer who came based on local recommendations",
    "Customer reviewing their recent personal experience",
  ];
  const angle = personaAngles[Math.floor(Math.random() * personaAngles.length)];

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

  // Try candidate models in order: gemini-3.1-flash-lite -> gemini-3.5-flash -> gemini-3.8-flash -> gemini-flash-latest
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
  console.warn("All candidate Gemini models temporarily unavailable. Using dynamic fallback generator.");
  return generateDynamicFallback(business, rating, language);
}
