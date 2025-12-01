# 🚀 SIK-GO - Sistem Peminjaman Ruangan & Review Proposal

## 📌 Ringkasan Proyek

**SIK-GO** adalah aplikasi web fullstack yang dirancang untuk mengelola:

✅ **Peminjaman Ruangan** - Booking ruangan dengan AI-powered recommendations  
✅ **Review Proposal** - Submit & review proposal dengan analisis Gemini AI  
✅ **Manajemen User** - Authentication, authorization, dan role-based access  

Dibangun dengan:
- **Backend**: Node.js + Express + MongoDB
- **Frontend**: React + Vite
- **AI**: Google Gemini API

---

## 📂 Struktur File

Setelah semua setup, struktur folder akan seperti ini:

```
SIK-GO/
├── BE/                              # Backend API
│   ├── src/
│   │   ├── controller/
│   │   │   ├── authController.js         # Auth logic
│   │   │   ├── bookingController.js      # Booking management
│   │   │   ├── proposalController.js     # Proposal management
│   │   │   ├── roomController.js
│   │   │   ├── userController.js
│   │   │   └── sikDocumentController.js
│   │   ├── database/
│   │   │   ├── connection.js
│   │   │   └── models/
│   │   │       ├── User.js
│   │   │       ├── Room.js
│   │   │       ├── Booking.js           # ✨ NEW
│   │   │       ├── Proposal.js          # ✨ NEW
│   │   │       ├── SIK_Document.js
│   │   │       └── AIChecker.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── repository/
│   │   │   ├── bookingRepository.js      # ✨ NEW
│   │   │   ├── proposalRepository.js     # ✨ NEW
│   │   │   ├── roomRepository.js
│   │   │   ├── userRepository.js
│   │   │   └── sikDocumentRepository.js
│   │   ├── route/
│   │   │   ├── authRoutes.js
│   │   │   ├── bookingRoutes.js          # ✨ NEW
│   │   │   ├── proposalRoutes.js         # ✨ NEW
│   │   │   ├── roomRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   └── sikDocumentRoutes.js
│   │   └── util/
│   │       ├── geminiService.js          # ✨ NEW - Gemini AI integration
│   │       ├── response.js
│   ├── uploads/                      # File storage
│   │   └── proposals/
│   ├── .env                          # Environment variables
│   ├── .env.example
│   ├── .gitignore
│   ├── index.js                      # Main entry point
│   ├── package.json
│   └── README.md
│
├── FE/                               # Frontend React
│   ├── src/
│   │   ├── components/               # React components
│   │   │   ├── BookingForm.jsx           # ✨ NEW
│   │   │   ├── BookingList.jsx           # ✨ NEW
│   │   │   ├── ProposalForm.jsx          # ✨ NEW
│   │   │   └── ProposalList.jsx          # ✨ NEW
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Bookings.jsx              # ✨ NEW
│   │   │   └── Proposals.jsx             # ✨ NEW
│   │   ├── services/                 # API calls
│   │   │   └── api.js                    # ✨ NEW - API service layer
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── .env                          # Environment variables
│   ├── .env.example
│   ├── .gitignore
│   ├── vite.config.js                # ✨ NEW - Vite config
│   ├── package.json
│   └── index.html
│
├── SETUP.md                          # ✨ NEW - Setup guide
├── GEMINI_AI_GUIDE.md                # ✨ NEW - AI integration guide
└── README.md                         # This file
```

---

## 🚀 Quick Start

### 1. Prerequisites

Pastikan sudah installed:
- Node.js 16+ ([Download](https://nodejs.org/))
- MongoDB ([Local](https://www.mongodb.com/try/download/community) atau [Atlas](https://www.mongodb.com/cloud/atlas))
- Git

### 2. Backend Setup (5 menit)

```bash
# Navigate to BE folder
cd BE

# Install dependencies
npm install

# Setup environment variables
# Copy .env.example ke .env
cp .env.example .env

# Edit .env dan isi:
# - MONGODB_URI
# - JWT_SECRET (generate random string)
# - GEMINI_API_KEY (dari https://ai.google.dev/)
# - CLIENT_ORIGIN=http://localhost:5173

# Run backend
npm start
# Berjalan di http://localhost:3000
```

### 3. Frontend Setup (5 menit)

```bash
# Navigate to FE folder
cd FE

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# File .env sudah benar, tidak perlu di-edit lagi

# Run frontend
npm run dev
# Berjalan di http://localhost:5173
```

### 4. Buka di Browser
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

---

## 🔑 Environment Variables

### Backend (.env)

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/sik-go
# Atau MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sik-go

# JWT Authentication
JWT_SECRET=your_very_long_secret_key_here_change_this_in_production
JWT_EXPIRE=7d

# Frontend CORS
CLIENT_ORIGIN=http://localhost:5173

# Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key_from_ai_google_dev
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000/api
```

---

## ✨ Fitur Utama

### 1. 🎫 Booking Ruangan

**User dapat:**
- Memilih ruangan yang tersedia
- Booking untuk tanggal dan waktu tertentu
- Mendapatkan rekomendasi AI sebelum booking
- Check ketersediaan ruangan
- View history booking mereka

**Admin dapat:**
- View semua booking
- Approve atau reject booking requests
- Add notes untuk approval/rejection
- Manage ruangan

**Flow:**
```
User → Pilih ruangan → Check ketersediaan → Dapatkan AI tips → Buat booking → Admin approve → Done
```

**Contoh AI Recommendation:**
```
"Ruangan ini cocok untuk meeting dengan kapasitas 20 orang. 
Tips: Datang 10 menit lebih awal untuk setup. Pastikan ada projector."
```

### 2. 📝 Proposal Management

**User dapat:**
- Create proposal dalam berbagai kategori (academic, event, research, other)
- Upload file proposal (PDF, DOC, DOCX)
- Submit proposal untuk di-review
- View AI analysis hasil review
- Edit proposal yang masih draft

**System:**
- Auto-generate AI review menggunakan Gemini
- AI memberikan score (0-100) dan feedback detail
- Admin bisa submit manual review
- Track history perubahan status

**Flow:**
```
User create (DRAFT) → Submit (SUBMITTED) → AI Review (REVIEWING) → 
Admin review (APPROVED/REJECTED)
```

**Contoh AI Review:**
```json
{
  "score": 82,
  "strengths": [
    "Clear objectives and timeline",
    "Well-researched background",
    "Feasible implementation plan"
  ],
  "weaknesses": [
    "Limited budget justification",
    "Risk analysis incomplete"
  ],
  "suggestions": [
    "Provide detailed budget breakdown",
    "Add risk mitigation strategies",
    "Include contingency plans"
  ],
  "summary": "Strong proposal with good foundation. 
             Needs financial detail and risk assessment."
}
```

### 3. 👤 User Management

**Fitur:**
- Register & Login
- Role-based access (Student, Admin, AI Checker)
- JWT-based authentication
- Token expiration & refresh

---

## 📡 API Endpoints

Lengkap di `SETUP.md`. Quick reference:

```
BOOKINGS
  POST   /api/bookings                   - Create booking
  GET    /api/bookings/my-bookings       - Get user's bookings
  GET    /api/bookings/:id               - Get single booking
  PUT    /api/bookings/:id               - Update booking
  DELETE /api/bookings/:id               - Delete booking
  POST   /api/bookings/check-availability - Check room availability
  POST   /api/bookings/recommendations   - Get AI recommendations
  PUT    /api/bookings/:id/approve       - Admin approve
  PUT    /api/bookings/:id/reject        - Admin reject

PROPOSALS
  POST   /api/proposals                  - Create proposal
  GET    /api/proposals/my-proposals     - Get user's proposals
  GET    /api/proposals/:id              - Get single proposal
  PUT    /api/proposals/:id              - Update proposal
  DELETE /api/proposals/:id              - Delete proposal
  PUT    /api/proposals/:id/submit       - Submit for review
  POST   /api/proposals/:id/ai-review    - Generate AI review
  POST   /api/proposals/:id/manual-review - Admin review

ROOMS
  GET    /api/rooms                      - Get all rooms
  GET    /api/rooms/:id                  - Get single room
  POST   /api/rooms                      - Create room (admin)
  PUT    /api/rooms/:id                  - Update room (admin)
  DELETE /api/rooms/:id                  - Delete room (admin)

AUTH
  POST   /api/auth/register              - Register user
  POST   /api/auth/login                 - Login user
  GET    /api/auth/me                    - Get current user
```

---

## 🤖 Gemini AI Integration

### Fitur AI

1. **Proposal Review**
   - Auto-analyze proposal content
   - Generate score & feedback
   - Identifikasi strengths/weaknesses
   - Provide suggestions

2. **Booking Recommendations**
   - Tips untuk booking ruangan
   - Alternative room suggestions
   - Availability analysis

### Setup

1. Dapatkan API key dari https://ai.google.dev/
2. Set `GEMINI_API_KEY` di `.env`
3. System akan auto-use Gemini untuk reviews

Lihat `GEMINI_AI_GUIDE.md` untuk detail lengkap.

---

## 🗄️ Database Schema

### Collections

**Booking**
```javascript
{
  user: ObjectId,          // User yang booking
  room: ObjectId,          // Room yg di-book
  startDate: Date,
  endDate: Date,
  startTime: String,
  endTime: String,
  purpose: String,
  participantCount: Number,
  status: "pending|approved|rejected|completed|cancelled",
  createdAt: Date
}
```

**Proposal**
```javascript
{
  user: ObjectId,          // Author
  title: String,
  category: String,
  content: String,
  aiReview: {
    score: Number,
    strengths: [String],
    weaknesses: [String],
    suggestions: [String],
    summary: String
  },
  status: "draft|submitted|reviewing|approved|rejected",
  createdAt: Date
}
```

Lihat lebih lengkap di `SETUP.md`.

---

## 📝 Contoh Penggunaan

### Register & Login

```javascript
// Register
const registerResult = await fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    name: 'John Doe'
  })
});

// Login
const loginResult = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const { data } = await loginResult.json();
localStorage.setItem('token', data.token);
```

### Create & AI Review Proposal

```javascript
// Create proposal
const proposal = await fetch('http://localhost:3000/api/proposals', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'My Research',
    category: 'research',
    description: 'About my research',
    content: 'Full research proposal content...'
  })
});

// Get AI review
const review = await fetch(`http://localhost:3000/api/proposals/${id}/ai-review`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});

const { data } = await review.json();
console.log('Score:', data.aiReview.score);
console.log('Feedback:', data.aiReview.suggestions);
```

### Book Room

```javascript
// Create booking
const booking = await fetch('http://localhost:3000/api/bookings', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    roomId: 'room_id_here',
    startDate: '2025-01-15',
    endDate: '2025-01-15',
    startTime: '09:00',
    endTime: '11:00',
    purpose: 'Team Meeting',
    participantCount: 15
  })
});

// Get AI recommendations sebelum booking
const recommendations = await fetch(
  'http://localhost:3000/api/bookings/recommendations',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      roomId: 'room_id',
      startDate: '2025-01-15',
      startTime: '09:00',
      endTime: '11:00',
      purpose: 'Meeting',
      personCount: 15
    })
  }
);
```

---

## 🧪 Testing

### Test Create Proposal

1. Login ke http://localhost:5173
2. Navigate ke `/proposals`
3. Tab "Buat Proposal"
4. Isi form:
   - Title: "Test Proposal"
   - Category: "academic"
   - Description: "A test proposal"
   - Content: "This is a test proposal content for testing..."
5. Click "Buat Proposal"
6. Go to "Daftar Proposal"
7. Click "Submit" pada proposal
8. Click "Generate AI Review"
9. See AI score & feedback!

### Test Booking

1. Navigate ke `/bookings`
2. Tab "Buat Booking"
3. Isi form:
   - Room: select any room
   - Dates & times
   - Purpose: "Testing"
   - Participants: 10
4. Click "Dapatkan Rekomendasi AI" untuk lihat tips
5. Click "Buat Booking"
6. Check "Daftar Booking Saya"

---

## 🐛 Troubleshooting

### Backend issues

**"Cannot connect to MongoDB"**
- Pastikan MongoDB running: `mongod`
- Check `MONGODB_URI` di `.env`
- Untuk MongoDB Atlas, whitelist IP Anda

**"Gemini API Error"**
- Verify `GEMINI_API_KEY` di `.env`
- Key harus valid dan tidak expired
- Check rate limits (60 req/min di free tier)

**"CORS Error di Frontend"**
- Check `CLIENT_ORIGIN` di `.env`
- Frontend URL harus di whitelist

### Frontend issues

**"API calls failing"**
- Verify `VITE_API_URL` di `.env`
- Ensure backend running di port 3000
- Check browser console untuk error details

**"Files not uploading"**
- Create `uploads/proposals/` folder di BE
- Check file size < 10MB
- File format: PDF, DOC, DOCX, TXT

---

## 📚 Additional Documentation

- **Setup Guide**: `SETUP.md` - Detailed setup instructions
- **AI Guide**: `GEMINI_AI_GUIDE.md` - Gemini AI integration details
- **API Reference**: `SETUP.md` - Complete API documentation

---

## 👨‍💻 Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend Framework | React 19 |
| Build Tool | Vite |
| Routing | React Router v7 |
| Backend | Node.js + Express |
| Database | MongoDB |
| Authentication | JWT |
| AI | Google Gemini API |
| File Upload | Multer |
| Password Hashing | Bcryptjs |

---

## 📋 Features Checklist

- [x] User Registration & Login
- [x] JWT Authentication
- [x] Booking Management
  - [x] Create booking
  - [x] Check availability
  - [x] AI recommendations
  - [x] Approve/Reject (admin)
- [x] Proposal Management
  - [x] Create proposal
  - [x] Submit for review
  - [x] AI review generation
  - [x] Manual review (admin)
  - [x] File upload
- [x] Gemini AI Integration
  - [x] Proposal analysis
  - [x] Booking recommendations
- [x] Frontend UI
  - [x] Booking form & list
  - [x] Proposal form & list
  - [x] Auth pages
  - [x] Responsive design

---

## 🔐 Security

- ✅ Password hashing dengan bcryptjs
- ✅ JWT authentication
- ✅ Environment variables untuk sensitive data
- ✅ CORS protection
- ✅ Input validation

---

## 📞 Support & Contact

Untuk pertanyaan atau issues:
1. Check error messages di console
2. Review documentation files
3. Check MongoDB connection
4. Verify API keys & environment variables

---

## 📄 License

MIT License - Feel free to use this project!

---

## 🙏 Acknowledgments

- Google Gemini AI untuk AI capabilities
- MongoDB untuk database
- React & Vite communities

---

**Version: 1.0.0**  
**Last Updated: December 2024**  
**Ready for Production Use** ✅
