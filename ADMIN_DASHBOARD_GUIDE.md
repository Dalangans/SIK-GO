# 🛡️ Admin Dashboard - Fitur Baru

## 📋 Ringkasan

Admin sekarang bisa:
1. ✅ Login dengan role `admin`
2. ✅ Otomatis redirect ke **Admin Dashboard** setelah login
3. ✅ Melihat **SEMUA** proposal dari semua student
4. ✅ Melihat informasi **siapa yang upload** (nama & email student)
5. ✅ **Approve/Reject** proposal langsung dari dashboard
6. ✅ Filter proposal berdasarkan status

---

## 🧪 Testing Flow

### **Step 1: Register Admin User**

**Endpoint:** `POST http://localhost:3000/api/auth/register`

**Body:**
```json
{
  "name": "Admin User",
  "email": "admin@sik.com",
  "password": "password123",
  "role": "admin"
}
```

---

### **Step 2: Login as Admin**

**Endpoint:** `POST http://localhost:3000/api/auth/login`

**Body:**
```json
{
  "email": "admin@sik.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "...",
  "user": {
    "id": "...",
    "name": "Admin User",
    "email": "admin@sik.com",
    "role": "admin"
  }
}
```

**Expected Behavior:** Browser otomatis redirect ke `/admin/dashboard`

---

### **Step 3: View Admin Dashboard**

Navigate to: `http://localhost:3173/admin/dashboard`

**Dashboard akan menampilkan:**

1. **Stats Section** - Jumlah proposal:
   - Pending
   - Approved
   - Rejected
   - Total

2. **Filter** - Pilih status untuk filter:
   - All
   - Pending
   - Approved
   - Rejected

3. **Proposal Table** dengan kolom:
   - No
   - **Title** - Judul proposal
   - **Student Name** - Nama student yang upload
   - **Student Email** - Email student yang upload
   - **Description** - Deskripsi proposal
   - **Status** - Status approval (Pending/Approved/Rejected)
   - **Upload Date** - Tanggal di-upload
   - **Action** - Button Approve (✓) / Reject (✕)

---

### **Step 4: Update Proposal Status**

**Clicking Approve/Reject button:**

**Endpoint:** `PUT http://localhost:3000/api/proposal/{proposalId}/status`

**Headers:**
```
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json
```

**Body:**
```json
{
  "status": "approved"
}
```

atau

```json
{
  "status": "rejected"
}
```

---

## 📁 File yang Berubah

### **Frontend**
- ✅ `FE/src/pages/AdminDashboard.jsx` - Page baru untuk admin
- ✅ `FE/src/App.jsx` - Route baru: `/admin/dashboard`
- ✅ `FE/src/pages/Login.jsx` - Logic redirect berdasarkan role

### **Backend**
- ✅ `BE/src/controller/proposalController.js` - 2 function baru:
  - `getAllProposalsForAdmin()` - GET semua proposal dengan user info
  - `updateProposalStatus()` - UPDATE status proposal
- ✅ `BE/src/route/proposalRoutes.js` - 2 route baru:
  - `GET /api/proposal/admin/all` - Admin only
  - `PUT /api/proposal/:id/status` - Admin only

---

## 🔐 Security

- ✅ Admin dashboard **hanya accessible untuk user dengan role=admin**
- ✅ Jika user biasa coba akses `/admin/dashboard`, akan redirect ke login
- ✅ API endpoints dilindungi middleware `authorize('admin')`
- ✅ Student tidak bisa update proposal status mereka sendiri

---

## 💡 User Flow

```
1. Admin Login
   ↓
2. Check role === 'admin'
   ↓
3. Redirect ke /admin/dashboard
   ↓
4. Load semua proposal dengan GET /api/proposal/admin/all
   ↓
5. Tampilkan proposal table dengan user info
   ↓
6. Admin bisa Approve/Reject dengan button
   ↓
7. Update status via PUT /api/proposal/:id/status
   ↓
8. Table otomatis update (real-time di UI)
```

---

## 📊 Stats Calculation

```javascript
// Automatically calculated
Pending   = proposals.filter(p => p.status === 'pending').length
Approved  = proposals.filter(p => p.status === 'approved').length
Rejected  = proposals.filter(p => p.status === 'rejected').length
Total     = proposals.length
```

---

## 🎨 UI Features

- **Color-coded Status Badges**
  - Pending: 🟠 Orange (#ff9800)
  - Approved: 🟢 Green (#4CAF50)
  - Rejected: 🔴 Red (#f44336)

- **Responsive Design**
  - Grid layout untuk stats
  - Table dengan horizontal scroll untuk mobile
  - Action buttons dengan hover effects

- **User Information**
  - Header menampilkan nama & email admin
  - Role badge (👤 ADMIN)

---

## ✅ Testing Checklist

- [ ] Register user dengan role=admin
- [ ] Login dengan admin user
- [ ] Verify redirect ke /admin/dashboard
- [ ] Check stats menampilkan angka benar
- [ ] Check table menampilkan semua proposal
- [ ] Check kolom "Student Name" & "Student Email" terisi
- [ ] Filter by status bekerja
- [ ] Click approve button
- [ ] Verify status berubah to "Approved"
- [ ] Click reject button
- [ ] Verify status berubah to "Rejected"

---

## 🚀 Next Steps (Optional)

- Tambah export to CSV/Excel
- Tambah search by student name/email
- Tambah date range filter
- Tambah bulk approve/reject
- Tambah comment field untuk admin feedback

