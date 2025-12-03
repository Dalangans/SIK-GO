# 🔧 Setup Guide: Admin Role & PDF Upload to Database

## 📋 Ringkasan Perubahan

### 1. **Fitur Admin Role (FIXED)**
- ✅ Sekarang `register` endpoint menerima parameter `role` (student, admin, ai_checker)
- ✅ Validasi role saat register
- ✅ Role disimpan dengan benar di database

### 2. **Upload PDF ke Database (FIXED)**
- ✅ File PDF disimpan sebagai **Binary Data** langsung ke MongoDB (bukan hanya path)
- ✅ Menggunakan `memoryStorage()` multer untuk stream ke database
- ✅ Endpoint download file dari database
- ✅ Admin bisa melihat semua dokumen
- ✅ User bisa melihat dokumen mereka sendiri

---

## 🧪 Testing dengan Postman

### **1. REGISTER ADMIN USER**

**Endpoint:**
```
POST http://localhost:3000/api/auth/register
```

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body (Raw JSON):**
```json
{
  "name": "Admin User",
  "email": "admin@sik.com",
  "password": "password123",
  "role": "admin"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "67a1b2c3d4e5f6g7h8i9j0k1",
    "name": "Admin User",
    "email": "admin@sik.com",
    "role": "admin"
  }
}
```

**⚠️ Simpan token untuk testing endpoint selanjutnya!**

---

### **2. REGISTER STUDENT USER**

**Endpoint:**
```
POST http://localhost:3000/api/auth/register
```

**Body (Raw JSON):**
```json
{
  "name": "Student User",
  "email": "student@sik.com",
  "password": "password123",
  "role": "student"
}
```

**Expected Response (201):** Token untuk student

---

### **3. UPLOAD PDF ke DATABASE**

**Endpoint:**
```
POST http://localhost:3000/api/sik-document/
```

**Headers:**
```
Authorization: Bearer <STUDENT_TOKEN>
Content-Type: multipart/form-data
```

**Body (form-data):**
- Key: `file` (type: File)
- Value: Pilih file PDF dari komputer Anda

**Expected Response (201):**
```json
{
  "success": true,
  "message": "File berhasil diupload ke database",
  "data": {
    "id": "67a1b2c3d4e5f6g7h8i9j0k1",
    "fileName": "dokumen.pdf",
    "fileSize": 102400,
    "mimeType": "application/pdf",
    "status": "pending",
    "createdAt": "2024-12-03T10:30:00.000Z"
  }
}
```

**⚠️ Simpan `id` dokumen untuk download!**

---

### **4. DOWNLOAD PDF dari DATABASE**

**Endpoint:**
```
GET http://localhost:3000/api/sik-document/{docId}/download
```

**Headers:**
```
Authorization: Bearer <STUDENT_TOKEN>
```

**Expected Response:** File PDF langsung di-download

---

### **5. ADMIN: LIHAT SEMUA DOKUMEN**

**Endpoint:**
```
GET http://localhost:3000/api/sik-document/admin/all
```

**Headers:**
```
Authorization: Bearer <ADMIN_TOKEN>
```

**Expected Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "67a1b2c3d4e5f6g7h8i9j0k1",
      "fileName": "dokumen.pdf",
      "fileSize": 102400,
      "mimeType": "application/pdf",
      "status": "pending",
      "user": {
        "_id": "67a1b2c3d4e5f6g7h8i9j0k2",
        "name": "Student User",
        "email": "student@sik.com"
      },
      "createdAt": "2024-12-03T10:30:00.000Z"
    }
  ]
}
```

---

### **6. USER: LIHAT DOKUMEN MILIK MEREKA**

**Endpoint:**
```
GET http://localhost:3000/api/sik-document/user/my-documents
```

**Headers:**
```
Authorization: Bearer <STUDENT_TOKEN>
```

**Expected Response (200):** List dokumen user

---

### **7. ADMIN: UPDATE STATUS DOKUMEN**

**Endpoint:**
```
PUT http://localhost:3000/api/sik-document/{docId}/status
```

**Headers:**
```
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json
```

**Body (Raw JSON):**
```json
{
  "status": "approved"
}
```

**Valid status values:** `pending`, `approved`, `rejected`

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Status dokumen berhasil diupdate",
  "data": {
    "_id": "67a1b2c3d4e5f6g7h8i9j0k1",
    "fileName": "dokumen.pdf",
    "status": "approved",
    "createdAt": "2024-12-03T10:30:00.000Z"
  }
}
```

---

## 🎯 File yang Diubah

| File | Perubahan |
|------|-----------|
| `src/database/models/SIK_Document.js` | Ganti `filePath` → `fileData` (Buffer), tambah `fileSize` |
| `src/controller/sikDocumentController.js` | Upload ke database, download file, validasi, list docs |
| `src/route/sikDocumentRoutes.js` | Ganti diskStorage → memoryStorage, tambah routes baru |
| `src/controller/authController.js` | Validasi role parameter saat register |

---

## 📱 Testing dari Frontend (React)

### **Upload PDF:**
```javascript
const uploadDocument = async (file, token) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('http://localhost:3000/api/sik-document/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  return await response.json();
};
```

### **Download PDF:**
```javascript
const downloadDocument = async (docId, token) => {
  const response = await fetch(
    `http://localhost:3000/api/sik-document/${docId}/download`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'dokumen.pdf';
  a.click();
};
```

---

## ✅ Checklist

- [ ] Register admin user dengan role `admin`
- [ ] Login dengan admin user
- [ ] Register student user dengan role `student`
- [ ] Upload PDF sebagai student
- [ ] Download PDF dari database
- [ ] View semua dokumen sebagai admin
- [ ] Update status dokumen sebagai admin
- [ ] Cek bahwa file PDF tersimpan di MongoDB (gunakan MongoDB Compass)

---

## 🚀 Deployment Notes

### Database Size Warning
Jika menyimpan file PDF langsung di MongoDB, perhatikan:
- **Max document size MongoDB: 16MB**
- **Backup strategy: Semakin besar database, semakin lama backup**

**Alternatif untuk production:**
- Gunakan **AWS S3** atau **Google Cloud Storage** untuk file
- Simpan hanya **URL** atau **file ID** di MongoDB
- Ini lebih scalable dan cost-effective

### Environment Variables (sudah ada di .env)
```
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760  # 10MB
```

---

## 🔐 Security Notes

- ✅ Admin-only endpoints dilindungi `authorize('admin')`
- ✅ Student-only endpoints dilindungi `authorize('student')`
- ✅ File validation: hanya PDF yang diterima
- ✅ File size validation: max 10MB
- ✅ User tidak bisa download dokumen orang lain (kecuali admin)

---

## 📞 Troubleshooting

### Error: "Hanya file PDF yang diperbolehkan"
→ Pastikan upload file type `application/pdf`

### Error: "User role 'student' is not authorized"
→ Gunakan admin token untuk endpoint admin

### Error: "Ukuran file tidak boleh lebih dari 10MB"
→ Ubah `MAX_FILE_SIZE` di .env

### File tidak muncul di MongoDB
→ Cek apakah MongoDB connection string di .env benar

