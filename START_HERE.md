# 🎯 GETTING STARTED - Start Here!

## 👋 Welcome to SIK-GO!

Proyek fullstack Anda untuk peminjaman ruangan dan review proposal dengan AI sudah **100% SELESAI**.

Baca file ini terlebih dahulu sebelum mulai! ⬇️

---

## ⚡ 15 Menit Setup (Copy-Paste Ready)

### STEP 1: Setup Backend (5 menit)

**Terminal 1:**
```bash
cd BE
npm install
cp .env.example .env
```

**Edit `.env` (ganti 3 baris ini):**
```env
MONGODB_URI=mongodb://localhost:27017/sik-go
JWT_SECRET=your_random_secret_key_here
GEMINI_API_KEY=your_api_key_from_ai.google.dev
```

**Lalu jalankan:**
```bash
npm start
```

✅ Harusnya muncul: `Server running on port 3000`

---

### STEP 2: Setup Frontend (5 menit)

**Terminal 2:**
```bash
cd FE
npm install
npm run dev
```

✅ Harusnya muncul: `VITE ready in xxx ms` dan `➜ Local: http://127.0.0.1:5173`

---

### STEP 3: Buka Browser

1. Frontend: http://localhost:5173
2. Backend: http://localhost:3000
3. Backend status: http://localhost:3000 (harus muncul "SIK-GO API is running")

---

### STEP 4: Get Gemini API Key (2 menit)

1. Buka https://ai.google.dev/
2. Klik "Get API Key"
3. Copy key ke `.env` → `GEMINI_API_KEY`

---

## 📚 Read These Files (In Order)

1. **Mulai dari sini** (current file)
2. **QUICK_START.md** - Troubleshooting & commands
3. **PROJECT_OVERVIEW.md** - Lengkap project overview
4. **SETUP.md** - Detailed setup & API reference
5. **GEMINI_AI_GUIDE.md** - AI integration details
6. **IMPLEMENTATION_SUMMARY.md** - What was built

---

## 🎯 What You Can Do RIGHT NOW

### 1️⃣ Test Booking
1. Go to http://localhost:5173/bookings
2. Click "Buat Booking"
3. Fill form → Click "Dapatkan Rekomendasi AI" → See AI tips!
4. Click "Buat Booking"
5. View in "Daftar Booking Saya"

### 2️⃣ Test Proposal with AI
1. Go to http://localhost:5173/proposals
2. Click "Buat Proposal"
3. Fill form → Click "Buat Proposal"
4. Go to "Daftar Proposal"
5. Click "Submit"
6. Click "💡 Generate AI Review" → See AI Score & Feedback!

### 3️⃣ Test Full Flow
```
Register → Login → Create Booking (see AI tips) → 
Create Proposal → Submit → Get AI Review → See score
```

---

## 🔑 Key Endpoints

```bash
# Register
POST http://localhost:3000/api/auth/register

# Login
POST http://localhost:3000/api/auth/login

# Create Booking
POST http://localhost:3000/api/bookings

# Create Proposal
POST http://localhost:3000/api/proposals

# Get AI Recommendations
POST http://localhost:3000/api/bookings/recommendations

# Generate AI Review
POST http://localhost:3000/api/proposals/:id/ai-review
```

Lihat SETUP.md untuk lengkap API reference.

---

## 📂 Struktur File Penting

```
BE/
  src/
    controller/
      bookingController.js    ← Booking logic
      proposalController.js   ← Proposal logic
    util/
      geminiService.js        ← Gemini AI integration ⭐
    route/
      bookingRoutes.js        ← Booking endpoints
      proposalRoutes.js       ← Proposal endpoints
    database/
      models/
        Booking.js            ← Booking model
        Proposal.js           ← Proposal model
  .env                        ← Setup here!

FE/
  src/
    components/
      BookingForm.jsx
      BookingList.jsx
      ProposalForm.jsx
      ProposalList.jsx
    pages/
      Bookings.jsx            ← /bookings page
      Proposals.jsx           ← /proposals page
    services/
      api.js                  ← API calls
  .env                        ← Already configured
```

---

## ✅ Checklist Sebelum Start

- [ ] Node.js installed (`node --version`)
- [ ] MongoDB running (`mongod` atau Atlas)
- [ ] Gemini API key ready (from https://ai.google.dev/)
- [ ] Ports 3000 & 5173 available
- [ ] .env files ready

---

## 🚨 Common Issues & Fix

| Issue | Fix |
|-------|-----|
| Can't connect MongoDB | `mongod` atau check MongoDB Atlas |
| Gemini API error | Check API key, rate limits |
| CORS error | Check CLIENT_ORIGIN in .env |
| Port 3000 in use | Change PORT or kill process |
| Module not found | Run `npm install` |

Lihat QUICK_START.md untuk lebih banyak solutions.

---

## 💡 Quick Commands

```bash
# Backend
cd BE && npm install && npm start

# Frontend
cd FE && npm install && npm run dev

# Test API
curl http://localhost:3000
# Should return: "SIK-GO API is running"
```

---

## 🎓 File Descriptions

### Must Read
- ✅ **QUICK_START.md** - Commands, troubleshooting, quick reference
- ✅ **PROJECT_OVERVIEW.md** - What the project does

### Reference
- 📖 **SETUP.md** - API documentation, database schema
- 🤖 **GEMINI_AI_GUIDE.md** - AI features explanation
- 📋 **IMPLEMENTATION_SUMMARY.md** - What was built

---

## 🤖 About Gemini AI

SIK-GO menggunakan **Google Gemini API** untuk:

1. **Proposal Review** 
   - Auto-analyze proposal content
   - Generate score (0-100)
   - List strengths/weaknesses/suggestions

2. **Booking Recommendations**
   - Tips untuk booking ruangan
   - Alternative suggestions
   - Availability analysis

Lihat GEMINI_AI_GUIDE.md untuk detail lengkap.

---

## 🎯 Your First Test (3 steps)

### Step 1: Create Account
- Go to http://localhost:5173
- Click Register
- Fill form & submit

### Step 2: Login
- Email & password dari tadi
- Copy token (lihat browser console)

### Step 3: Test Features
- Go to `/bookings` → Create booking → Get AI tips!
- Go to `/proposals` → Create proposal → Get AI review!

---

## 📊 Features Included

✅ **Booking Management**
- Create booking
- Check availability  
- AI recommendations
- Admin approval

✅ **Proposal Management**
- Create/submit proposal
- File upload
- AI review generation
- Admin manual review

✅ **Gemini AI**
- Proposal analysis
- Booking recommendations
- Error handling

✅ **Authentication**
- Register/login
- JWT tokens
- Role-based access

✅ **UI Components**
- Forms with validation
- Lists with filtering
- Status tracking
- Error handling

---

## 🔐 Default Roles

After login, you're a **Student** by default.

To become **Admin** (for testing):
```javascript
// Manually update in MongoDB:
db.users.updateOne(
  {email: "your@email.com"},
  {$set: {role: "admin"}}
)
```

---

## 📞 Need Help?

1. Check browser console (F12)
2. Check terminal output
3. Read error message
4. Search in docs
5. Check QUICK_START.md

---

## 🚀 Next Steps

1. **Now**: Complete 15-minute setup ⬆️
2. **Then**: Test each feature
3. **After**: Read detailed docs
4. **Finally**: Customize & deploy

---

## 🎉 You're Ready!

Proyek Anda sudah lengkap dengan:
- ✅ Backend API
- ✅ Frontend UI  
- ✅ Gemini AI integration
- ✅ Database models
- ✅ Authentication
- ✅ Comprehensive docs

**Everything is ready to use. Let's go! 🚀**

---

## 📝 Documentation Map

```
START HERE (Anda di sini)
        ↓
QUICK_START.md (Commands & troubleshooting)
        ↓
PROJECT_OVERVIEW.md (Complete overview)
        ↓
SETUP.md (API reference & database)
        ↓
GEMINI_AI_GUIDE.md (AI details)
        ↓
IMPLEMENTATION_SUMMARY.md (What was built)
```

---

## ⏱️ Expected Timeline

- Setup: 15 minutes ⚡
- First test: 5 minutes ✨
- Learning: 1-2 hours 📚
- Customization: Depends on you 🎨

---

**Questions? Check the docs!**  
**Ready? Let's start! 🚀**

---

**Version: 1.0.0**  
**Status: ✅ Complete**  
**Last Updated: December 2024**
