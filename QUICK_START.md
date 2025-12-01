# ⚡ Quick Reference Guide

## 🚀 Quick Start (Copy & Paste)

### Terminal 1 - Backend
```bash
cd BE
npm install
# Edit .env dengan MONGODB_URI dan GEMINI_API_KEY
npm start
# Output: Server running on port 3000
```

### Terminal 2 - Frontend
```bash
cd FE
npm install
npm run dev
# Output: VITE v7.x.x ready in xxx ms
```

### Open Browser
- Frontend: http://localhost:5173
- API: http://localhost:3000
- API Status: http://localhost:3000 (should show "SIK-GO API is running")

---

## 📋 Essential Commands

### Backend Commands
```bash
cd BE
npm install              # Install dependencies
npm start               # Start server (port 3000)
npm run dev             # Dev mode with nodemon
```

### Frontend Commands
```bash
cd FE
npm install             # Install dependencies
npm run dev             # Dev server (port 5173)
npm run build           # Build for production
npm run preview         # Preview production build
```

---

## 🔧 Environment Setup

### Backend - Create .env
```bash
cd BE
cp .env.example .env
```

Edit `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/sik-go
JWT_SECRET=my_super_secret_key_12345
GEMINI_API_KEY=your_api_key_from_ai_google_dev
CLIENT_ORIGIN=http://localhost:5173
```

### Frontend - Create .env
```bash
cd FE
cp .env.example .env
# File already has correct content, no need to edit
```

---

## 💾 MongoDB Setup

### Local MongoDB
```bash
# Install MongoDB Community Edition (if not installed)
# Windows: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/

# Start MongoDB
mongod

# Or if installed as service, it auto-starts

# Test connection
mongo mongodb://localhost:27017
```

### MongoDB Atlas (Cloud)
```
1. Go to https://www.mongodb.com/cloud/atlas
2. Create account/login
3. Create cluster
4. Get connection string
5. Add to MONGODB_URI in .env

MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sik-go
```

---

## 🔑 Get Gemini API Key

```
1. Go to https://ai.google.dev/
2. Click "Get API Key"
3. Create project or select existing
4. Click "Create API Key"
5. Copy key
6. Paste to .env as GEMINI_API_KEY
```

---

## 🎯 File Structure Recap

```
BE/
  ├── src/
  │   ├── controller/
  │   │   ├── bookingController.js     (NEW)
  │   │   └── proposalController.js    (NEW)
  │   ├── database/models/
  │   │   ├── Booking.js              (NEW)
  │   │   └── Proposal.js             (NEW)
  │   ├── repository/
  │   │   ├── bookingRepository.js    (NEW)
  │   │   └── proposalRepository.js   (NEW)
  │   ├── route/
  │   │   ├── bookingRoutes.js        (NEW)
  │   │   └── proposalRoutes.js       (NEW)
  │   └── util/
  │       └── geminiService.js        (NEW)
  └── .env

FE/
  ├── src/
  │   ├── components/
  │   │   ├── BookingForm.jsx         (NEW)
  │   │   ├── BookingList.jsx         (NEW)
  │   │   ├── ProposalForm.jsx        (NEW)
  │   │   └── ProposalList.jsx        (NEW)
  │   ├── pages/
  │   │   ├── Bookings.jsx            (NEW)
  │   │   └── Proposals.jsx           (NEW)
  │   ├── services/
  │   │   └── api.js                  (NEW)
  │   └── App.jsx                     (UPDATED)
  ├── vite.config.js                  (NEW)
  └── .env
```

---

## 📱 User Interface Navigation

### Student User Flow
```
Login → Home → 
  ├── /bookings
  │   ├── Buat Booking
  │   │   └── Lihat rekomendasi AI
  │   └── Daftar Booking Saya
  └── /proposals
      ├── Buat Proposal
      └── Daftar Proposal
          ├── Submit proposal
          └── Lihat AI review
```

### Admin Flow
```
Login (as admin) → Home →
  ├── /bookings
  │   ├── Lihat semua booking
  │   ├── Approve/Reject
  │   └── Add notes
  └── /proposals
      ├── Lihat semua proposal
      ├── Generate AI review
      └── Submit manual review
```

---

## 🔌 API Quick Reference

### Authentication
```
POST   /api/auth/register   {email, password, name}
POST   /api/auth/login      {email, password}
GET    /api/auth/me         (Protected)
```

### Bookings
```
POST   /api/bookings        Create booking
GET    /api/bookings/my-bookings
POST   /api/bookings/check-availability
POST   /api/bookings/recommendations  (AI)
PUT    /api/bookings/:id/approve      (Admin)
PUT    /api/bookings/:id/reject       (Admin)
```

### Proposals
```
POST   /api/proposals       Create proposal
GET    /api/proposals/my-proposals
PUT    /api/proposals/:id/submit
POST   /api/proposals/:id/ai-review         (AI)
POST   /api/proposals/:id/manual-review     (Admin)
```

---

## 🧪 Quick Test

### Test 1: Create Booking
```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Copy token from response

# 2. Create booking (replace token and roomId)
curl -X POST http://localhost:3000/api/bookings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roomId":"ROOM_ID",
    "startDate":"2025-01-15",
    "endDate":"2025-01-15",
    "startTime":"09:00",
    "endTime":"11:00",
    "purpose":"Meeting",
    "participantCount":10
  }'
```

### Test 2: Create Proposal & AI Review
```bash
# 1. Create proposal
curl -X POST http://localhost:3000/api/proposals \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Test Proposal",
    "category":"academic",
    "description":"A test",
    "content":"Full content of the proposal..."
  }'

# Copy proposal ID from response

# 2. Submit proposal
curl -X PUT http://localhost:3000/api/proposals/PROPOSAL_ID/submit \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Generate AI review
curl -X POST http://localhost:3000/api/proposals/PROPOSAL_ID/ai-review \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎨 Features by Page

### /bookings
✅ Create booking dengan form  
✅ AI recommendations sebelum submit  
✅ Lihat list booking saya  
✅ Delete booking  
✅ Status tracking (pending/approved/rejected)  

### /proposals
✅ Create proposal dengan optional file upload  
✅ Category selection (academic/event/research/other)  
✅ Submit untuk review  
✅ Auto AI review generation  
✅ Admin manual review  
✅ Filter by status  

---

## 🔍 Debug Tips

### Check Backend Running
```bash
curl http://localhost:3000
# Should return: "SIK-GO API is running"
```

### Check MongoDB Connection
```bash
# In BE console, should see:
# MongoDB Connected: localhost
```

### Check Frontend Building
```bash
# In FE console, should see:
# VITE v7.x.x ready in XXX ms
# ➜  Local:   http://127.0.0.1:5173/
```

### Check Network Requests
```
1. Open browser DevTools (F12)
2. Go to Network tab
3. Make request
4. Check Status (should be 200, not 404/500)
5. Check Response (should have valid JSON)
```

### Check Browser Console Errors
```
1. F12 → Console tab
2. Should not have red errors
3. Yellow warnings are okay
```

---

## 🚨 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Port 3000 already in use | Kill process: `taskkill /PID xxx /F` or change PORT in .env |
| MongoDB connection fails | Start MongoDB: `mongod` or check Atlas whitelist |
| Gemini API error | Verify API key in .env, check quota |
| CORS error | Check CLIENT_ORIGIN in .env matches frontend URL |
| File upload fails | Create `uploads/proposals/` folder in BE |
| Token invalid | Login again, copy new token |

---

## 📚 Documentation Files

- **PROJECT_OVERVIEW.md** - Complete project overview
- **SETUP.md** - Detailed setup instructions
- **GEMINI_AI_GUIDE.md** - AI integration details
- **This file** - Quick reference

---

## ⏱️ Expected Setup Time

- Backend setup: ~5 minutes
- Frontend setup: ~5 minutes
- First test: ~5 minutes
- **Total: ~15 minutes** ⚡

---

## ✅ Checklist Before Starting

- [ ] Node.js installed (check: `node --version`)
- [ ] MongoDB installed/running (check: `mongod` or Atlas)
- [ ] Gemini API key obtained (from https://ai.google.dev/)
- [ ] Folders cloned/created
- [ ] Ports 3000 & 5173 available

---

## 🎯 Next Steps After Setup

1. Create account → /register
2. Login → /login
3. Go to /bookings → Create booking → Check AI recommendations
4. Go to /proposals → Create proposal → Submit → Generate AI review
5. (As admin) Approve bookings & proposals

---

## 💡 Pro Tips

✨ **Tip 1**: Keep browser DevTools open (F12) while testing  
✨ **Tip 2**: Use MongoDB Compass for database inspection  
✨ **Tip 3**: Test API endpoints with Postman before frontend  
✨ **Tip 4**: Check console logs when something breaks  
✨ **Tip 5**: Create test accounts for different roles  

---

## 📞 Quick Contacts

- Gemini API Issues: https://ai.google.dev/support
- MongoDB Issues: https://www.mongodb.com/support
- Node.js Issues: https://nodejs.org/en/docs/
- React Issues: https://react.dev/

---

**Ready to build? Start with the Backend first! 🚀**
