# SIK-GO - Sistem Peminjaman Ruangan & Review Proposal

## 📋 Daftar Isi
1. [Pengenalan](#pengenalan)
2. [Fitur Utama](#fitur-utama)
3. [Setup Backend](#setup-backend)
4. [Setup Frontend](#setup-frontend)
5. [API Documentation](#api-documentation)
6. [Konfigurasi Gemini AI](#konfigurasi-gemini-ai)

---

## 🎯 Pengenalan

SIK-GO adalah aplikasi web fullstack untuk mengelola:
- **Peminjaman Ruangan**: Booking ruangan dengan rekomendasi AI
- **Review Proposal**: Submit dan review proposal dengan AI Gemini
- **Manajemen User**: Authentication dan role-based access control

---

## ✨ Fitur Utama

### Backend (Node.js + Express + MongoDB)
✅ **Gemini AI Integration** - AI-powered proposal review dan booking recommendations  
✅ **Proposal Management** - Create, submit, dan review proposals  
✅ **Booking System** - Book ruangan dengan availability checking  
✅ **User Authentication** - JWT-based auth dengan role management  
✅ **File Upload** - Upload proposal documents  
✅ **RESTful API** - Clean and documented API endpoints  

### Frontend (React + Vite)
✅ **Proposal Management UI** - Create, list, dan review proposals  
✅ **Booking UI** - Book rooms dengan AI recommendations  
✅ **Authentication** - Login/Register pages  
✅ **Status Tracking** - Real-time status updates  
✅ **AI Integration** - Direct AI review generation from UI  

---

## 🔧 Setup Backend

### Prerequisites
- Node.js 16+ 
- MongoDB (local atau Atlas)
- Gemini API Key

### Instalasi

1. **Navigate ke folder BE:**
```bash
cd BE
```

2. **Install dependencies:**
```bash
npm install
```

3. **Setup Environment Variables:**
Rename `.env.example` ke `.env` dan isi:

```env
# Server
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/sik-go
# Atau MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sik-go

# JWT
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d

# Client
CLIENT_ORIGIN=http://localhost:5173

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here
```

4. **Dapatkan Gemini API Key:**
   - Buka https://ai.google.dev/
   - Klik "Get API Key"
   - Create project baru atau gunakan existing
   - Copy API key ke `.env`

5. **Jalankan Server:**
```bash
npm start
```
Server akan berjalan di `http://localhost:3000`

---

## 🚀 Setup Frontend

### Instalasi

1. **Navigate ke folder FE:**
```bash
cd FE
```

2. **Install dependencies:**
```bash
npm install
```

3. **Setup Environment Variables:**
Buat file `.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

4. **Jalankan Development Server:**
```bash
npm run dev
```
Frontend akan berjalan di `http://localhost:5173`

---

## 📚 API Documentation

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Bookings

#### Create Booking
```http
POST /api/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "roomId": "room_id_here",
  "startDate": "2025-01-15",
  "endDate": "2025-01-15",
  "startTime": "09:00",
  "endTime": "11:00",
  "purpose": "Rapat Tim",
  "participantCount": 10,
  "description": "Rapat diskusi quarterly review"
}
```

#### Get AI Recommendations
```http
POST /api/bookings/recommendations
Authorization: Bearer <token>
Content-Type: application/json

{
  "roomId": "room_id",
  "startDate": "2025-01-15",
  "startTime": "09:00",
  "purpose": "Rapat",
  "personCount": 10
}
```

#### Check Room Availability
```http
POST /api/bookings/check-availability
Authorization: Bearer <token>
Content-Type: application/json

{
  "roomId": "room_id",
  "startDate": "2025-01-15",
  "endDate": "2025-01-15"
}
```

#### Approve/Reject Booking (Admin)
```http
PUT /api/bookings/:id/approve
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "notes": "Approved for quarterly meeting"
}

PUT /api/bookings/:id/reject
{
  "notes": "Room not available for that time"
}
```

### Proposals

#### Create Proposal
```http
POST /api/proposals
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "title": "Project X Proposal",
  "category": "academic",
  "description": "Penawaran untuk proyek research",
  "content": "Detailed proposal content here...",
  "file": <file_optional>
}
```

#### Submit Proposal
```http
PUT /api/proposals/:id/submit
Authorization: Bearer <token>
```

#### Generate AI Review
```http
POST /api/proposals/:id/ai-review
Authorization: Bearer <token>
```

Response AI Review:
```json
{
  "score": 85,
  "strengths": ["Well structured", "Clear objectives", "Feasible timeline"],
  "weaknesses": ["Limited budget analysis", "Missing risk assessment"],
  "suggestions": ["Add more budget detail", "Include risk mitigation plan"],
  "summary": "Good proposal with potential. Needs budget refinement."
}
```

#### Submit Manual Review (Admin)
```http
POST /api/proposals/:id/manual-review
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "comments": "Excellent work! A few minor adjustments needed.",
  "status": "approved"
}
```

### Rooms

#### Get All Rooms
```http
GET /api/rooms
Authorization: Bearer <token>
```

---

## 🤖 Konfigurasi Gemini AI

### Fitur AI yang Tersedia

#### 1. Proposal Review
Menganalisis proposal dengan menggunakan Gemini AI untuk:
- Memberikan skor (0-100)
- Mengidentifikasi kekuatan
- Menemukan kelemahan
- Memberikan saran perbaikan

**Flow:**
```
User membuat Proposal 
  ↓
User submit proposal
  ↓
Admin/System trigger AI Review
  ↓
Gemini menganalisis content
  ↓
Score & feedback diberikan
```

#### 2. Booking Recommendations
AI memberikan rekomendasi untuk booking ruangan berdasarkan:
- Nama ruangan
- Tanggal dan waktu
- Jumlah peserta
- Tujuan penggunaan

**Flow:**
```
User input booking details
  ↓
User klik "Get AI Recommendations"
  ↓
Gemini analyze details
  ↓
Return tips & recommendations
```

### Menggunakan AI di Frontend

```javascript
import { bookingAPI, proposalAPI } from './services/api';

// Dapatkan rekomendasi booking
const recommendations = await bookingAPI.getAIRecommendations({
  roomId: roomId,
  startDate: "2025-01-15",
  startTime: "09:00",
  endTime: "11:00",
  purpose: "Meeting",
  personCount: 10
});

// Generate AI review untuk proposal
await proposalAPI.generateAIReview(proposalId);
```

---

## 📁 Project Structure

```
SIK-GO/
├── BE/                          # Backend
│   ├── src/
│   │   ├── controller/          # Request handlers
│   │   │   ├── authController.js
│   │   │   ├── bookingController.js
│   │   │   └── proposalController.js
│   │   ├── database/
│   │   │   ├── connection.js
│   │   │   └── models/
│   │   │       ├── User.js
│   │   │       ├── Room.js
│   │   │       ├── Booking.js
│   │   │       └── Proposal.js
│   │   ├── middleware/
│   │   │   └── auth.js          # JWT authentication
│   │   ├── repository/          # Database queries
│   │   │   ├── bookingRepository.js
│   │   │   └── proposalRepository.js
│   │   ├── route/               # API routes
│   │   │   ├── bookingRoutes.js
│   │   │   └── proposalRoutes.js
│   │   └── util/
│   │       ├── geminiService.js # AI integration
│   │       └── response.js
│   ├── uploads/                 # File storage
│   ├── .env.example
│   ├── index.js                 # Entry point
│   └── package.json
│
└── FE/                          # Frontend
    ├── src/
    │   ├── components/          # React components
    │   │   ├── BookingForm.jsx
    │   │   ├── BookingList.jsx
    │   │   ├── ProposalForm.jsx
    │   │   └── ProposalList.jsx
    │   ├── pages/              # Page components
    │   │   ├── Bookings.jsx
    │   │   └── Proposals.jsx
    │   ├── services/           # API calls
    │   │   └── api.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env
    └── package.json
```

---

## 🔐 User Roles

1. **Student** (default)
   - Create bookings
   - Create & submit proposals
   - View own bookings & proposals
   - Get AI recommendations

2. **Admin**
   - View all bookings & proposals
   - Approve/reject bookings
   - Submit manual reviews for proposals
   - Manage rooms

3. **AI Checker**
   - Automatically generate AI reviews
   - View all proposals needing review

---

## ⚙️ Database Schema

### Booking
```javascript
{
  user: ObjectId,              // User yang booking
  room: ObjectId,              // Room yang di-book
  proposal: ObjectId,          // Proposal terkait (optional)
  startDate: Date,
  endDate: Date,
  startTime: String,           // HH:mm format
  endTime: String,
  purpose: String,             // Alasan booking
  participantCount: Number,
  status: "pending|approved|rejected|completed|cancelled",
  approvedBy: ObjectId,        // Admin yang approve
  approvalNotes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Proposal
```javascript
{
  user: ObjectId,              // Author
  title: String,
  category: "academic|event|research|other",
  description: String,
  content: String,             // Full proposal content
  filePath: String,            // Upload file path (optional)
  aiReview: {
    score: Number,             // 0-100
    strengths: [String],
    weaknesses: [String],
    suggestions: [String],
    summary: String,
    reviewedAt: Date
  },
  manualReview: {
    reviewer: ObjectId,        // Admin reviewer
    comments: String,
    status: "approved|rejected",
    reviewedAt: Date
  },
  status: "draft|submitted|reviewing|approved|rejected",
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎓 Contoh Usage

### Scenario 1: User membuat booking ruangan

```javascript
// 1. User login
const loginData = await authAPI.login('user@example.com', 'password');
localStorage.setItem('token', loginData.data.token);

// 2. Get available rooms
const rooms = await roomAPI.getAllRooms();

// 3. Check availability
const availability = await bookingAPI.checkAvailability(
  roomId, 
  '2025-01-15', 
  '2025-01-15'
);

// 4. Get AI recommendations
const recommendations = await bookingAPI.getAIRecommendations({
  roomId,
  startDate: '2025-01-15',
  startTime: '09:00',
  endTime: '11:00',
  purpose: 'Rapat',
  personCount: 10
});

// 5. Create booking
const booking = await bookingAPI.createBooking({
  roomId,
  startDate: '2025-01-15',
  endDate: '2025-01-15',
  startTime: '09:00',
  endTime: '11:00',
  purpose: 'Rapat',
  participantCount: 10
});
```

### Scenario 2: User submit proposal dengan AI review

```javascript
// 1. Create proposal draft
const proposal = await proposalAPI.createProposal({
  title: 'Research Proposal',
  category: 'research',
  description: 'Description here',
  content: 'Full content here...'
}, proposalFile);

// 2. Submit for review
await proposalAPI.submitProposal(proposal.data._id);

// 3. Generate AI Review
const reviewed = await proposalAPI.generateAIReview(proposal.data._id);
console.log('AI Score:', reviewed.data.aiReview.score);

// 4. Admin submit manual review
await proposalAPI.submitManualReview(
  proposal.data._id,
  'Great proposal! Approved!',
  'approved'
);
```

---

## 🛠️ Troubleshooting

### "Cannot connect to MongoDB"
- Pastikan MongoDB sudah running
- Check MONGODB_URI di .env
- Untuk MongoDB Atlas, pastikan IP sudah di-whitelist

### "Gemini API Error"
- Verify GEMINI_API_KEY di .env
- Check API key adalah valid dan belum expired
- Pastikan rate limits tidak terlampaui

### "File upload fails"
- Buat folder `uploads/proposals/` di BE root
- Check file size < 10MB
- File format harus: PDF, DOC, DOCX, TXT

### "CORS Error"
- Check CLIENT_ORIGIN di .env
- Frontend URL harus di allowedOrigins list di index.js

---

## 📞 Support

Untuk bantuan lebih lanjut:
1. Check API response messages
2. Review console logs di browser dan terminal
3. Verify semua environment variables sudah set dengan benar
4. Check database connection dengan MongoDB Compass

---

## 📝 License
MIT License

---

**Version: 1.0.0**  
**Last Updated: December 2024**
