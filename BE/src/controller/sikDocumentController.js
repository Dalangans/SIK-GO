const SIK_Document = require('../database/models/SIK_Document');

exports.createSIKDocument = async (req, res) => {
  try {
    // 1. Cek apakah ada file yang diupload
    if (!req.file) {
        return res.status(400).json({
            success: false,
            error: 'Silakan upload file dokumen'
        });
    }

    // 2. Validasi tipe file (hanya PDF)
    if (req.file.mimetype !== 'application/pdf') {
        return res.status(400).json({
            success: false,
            error: 'Hanya file PDF yang diperbolehkan'
        });
    }

    // 3. Validasi ukuran file (max 10MB sesuai .env)
    const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 10485760;
    if (req.file.size > MAX_FILE_SIZE) {
        return res.status(400).json({
            success: false,
            error: `Ukuran file tidak boleh lebih dari ${MAX_FILE_SIZE / 1024 / 1024}MB`
        });
    }

    // 4. Siapkan data untuk disimpan ke Database (file binary disimpan dalam DB)
    const documentData = {
        user: req.user.id,              // Ambil ID user dari token (middleware protect)
        fileName: req.file.originalname, // Nama asli file
        fileData: req.file.buffer,      // File binary disimpan langsung (dari memoryStorage)
        mimeType: req.file.mimetype,    // Tipe file
        fileSize: req.file.size,        // Ukuran file
        status: 'pending'
    };

    // 5. Simpan ke Database
    const document = await SIK_Document.create(documentData);

    res.status(201).json({
      success: true,
      message: 'File berhasil diupload ke database',
      data: {
        id: document._id,
        fileName: document.fileName,
        fileSize: document.fileSize,
        mimeType: document.mimeType,
        status: document.status,
        createdAt: document.createdAt
      }
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Download dokumen dari database
exports.downloadDocument = async (req, res) => {
  try {
    const { docId } = req.params;

    const document = await SIK_Document.findById(docId);

    if (!document) {
        return res.status(404).json({ 
            success: false, 
            error: 'Dokumen tidak ditemukan' 
        });
    }

    // Cek apakah user adalah pemilik dokumen atau admin
    if (document.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ 
            success: false, 
            error: 'Anda tidak memiliki akses ke dokumen ini' 
        });
    }

    // Set headers untuk download
    res.setHeader('Content-Type', document.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${document.fileName}"`);
    res.setHeader('Content-Length', document.fileData.length);

    // Kirim file binary
    res.send(document.fileData);

  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

exports.updateDocumentStatus = async (req, res) => {
  try {
    const { docId } = req.params;
    const { status } = req.body;

    // Validasi status
    if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ 
            success: false, 
            error: 'Status tidak valid. Gunakan: pending, approved, atau rejected' 
        });
    }

    const document = await SIK_Document.findByIdAndUpdate(
        docId, 
        { status: status }, 
        {
            new: true,
            runValidators: true
        }
    );

    if(!document) {
        return res.status(404).json({ success: false, error: 'Dokumen tidak ditemukan' });
    }

    res.status(200).json({
      success: true,
      message: 'Status dokumen berhasil diupdate',
      data: document
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// List semua dokumen (untuk admin)
exports.getAllDocuments = async (req, res) => {
  try {
    const documents = await SIK_Document.find()
        .populate('user', 'name email')
        .select('-fileData'); // Jangan include binary data dalam list

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// List dokumen milik user
exports.getUserDocuments = async (req, res) => {
  try {
    const documents = await SIK_Document.find({ user: req.user.id })
        .select('-fileData'); // Jangan include binary data dalam list

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};