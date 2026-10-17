# 🌟 AI Google Review System

An intelligent, multi-language Google Place Review Booster powered by **Google Gemini AI**, **Neon PostgreSQL**, and **Next.js**.

Designed for businesses to effortlessly collect authentic 5-star Google reviews from customers via permanent QR codes and unique short URLs.

---

## 🚀 Key Features

### 🏢 1. Admin Management Hub
- **Add Multiple Businesses**: Register businesses with:
  - Business Name
  - Google Place ID (e.g., `ChIJN1t_tDeuEmsRUsoyG83frY4`)
  - Category (Restaurant, Dental Clinic, Salon, Retail, Automobile, etc.)
  - City / Location (e.g., Pune, Mumbai, Nashik)
  - Keywords / Tags (e.g., *delicious food, fast service, polite staff, clean ambiance*)
  - Custom AI prompt instructions
  - **Dedicated Gemini API Key (Per Business)**: Option to provide a separate Gemini API key for each business so API token usage, quotas, and costs are consumed directly against that specific client/business account! If left empty, it safely uses the system default key.
- **Permanent QR Codes & URLs**: 
  - Each business receives a permanent, permanent URL (e.g., `/r/business-name-x9y2z`).
  - **Lifetime Stability**: Updating the business name, category, or keywords in the future **does NOT change or break the QR code or URL**. Cards and standees printed today will work forever!
- **1-Click Copy & Download**:
  - Copy the permanent review link in 1 click.
  - Download high-resolution QR code images (PNG).
- **Printable Table Standee / Tent Card**:
  - High-res, professionally designed printable template with Google Reviews branding, business details, 5-star graphics, and the QR code.
  - Ready for immediate printing for restaurant tables, reception desks, and billing counters.

---

### ⭐ 2. End-User / Customer Review Experience (`/r/[slug]`)
1. **Star Rating Selection**: Customer chooses 1 to 5 stars with interactive glowing stars.
2. **Multi-Language Selector**:
   - 🇬🇧 **English**
   - 🇮🇳 **हिंदी (Hindi)**
   - 🚩 **मराठी (Marathi)**
3. **5 Distinct AI Review Options**:
   - Generated dynamically based on rating, selected language, business category, city, and keywords.
   - 5 diverse tones:
     1. **Enthusiastic & Warm** (छान व उत्साही)
     2. **Detailed & Informative** (सविस्तर माहितीपूर्ण)
     3. **Short & Sweet** (थोडक्यात आणि प्रभावी)
     4. **Authentic Experience** (सच्चा अनुभव)
     5. **Professional & Polite** (व्यावसायिक व दर्जेदार)
4. **Editable Preview**: Customer can tap their favorite option and freely add any personal remarks if desired.
5. **1-Click "Copy & Submit on Google"**:
   - Copies the selected review text to clipboard.
   - Triggers celebratory confetti animation 🎉.
   - Automatically redirects directly to the Google Place ID review submission popup (`https://search.google.com/local/writereview?placeid=<PLACE_ID>`).
   - Customer simply pastes and taps **Post**!

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + Lucide Icons + Print Media Queries
- **AI Engine**: Google Gemini AI (`@google/generative-ai`)
- **Database**: Neon PostgreSQL via Prisma ORM
- **Fallback Mode**: Built-in smart template engine and local JSON storage enabled out of the box until API keys are supplied.
- **QR Code Engine**: High-correction-level QR generator (`qrcode`)

---

## ⚙️ Configuration & Environment Variables

When you are ready to connect your **Gemini API Key** and **Neon DB Connection String**, open [`.env.local`](.env.local) and provide:

```env
# Google Gemini API Key (from https://aistudio.google.com/)
GEMINI_API_KEY=your_gemini_api_key_here

# Neon PostgreSQL Database Connection URL (from https://console.neon.tech/)
DATABASE_URL=postgresql://user:password@ep-xyz.neon.tech/neondb?sslmode=require

# Base URL (for generating QR links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Syncing Database with Neon DB:
Once you have entered `DATABASE_URL` in `.env.local`, run:
```bash
npm run prisma:push
```
This automatically syncs the `Business` and `ReviewLog` tables to your Neon PostgreSQL database!

---

## 🏃 Running the Application

### Development Mode:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build:
```bash
npm run build
npm run start
```

---

## 📍 How to Find Any Google Place ID

1. Go to the official [Google Maps Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id).
2. Type your business name and location in the search bar.
3. Copy the alphanumeric `place_id` (e.g. `ChIJN1t_tDeuEmsRUsoyG83frY4`).
4. Paste it into the Admin dashboard when registering the business.
