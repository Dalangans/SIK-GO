const SIK_Document = require('../database/models/SIK_Document');
// Kita bypass repository dulu untuk upload agar lebih simpel & langsung jalan
// Nanti bisa dipindah ke repository kalau sudah sukses.

exports.createSIKDocument = async (req, res) => {
  try {
    // 1. Cek apakah ada file yang diupload
    if (!req.file) {
        return res.status(400).json({
            success: false,
            error: 'Silakan upload file dokumen'
        });
    }

    // 2. Siapkan data untuk disimpan ke Database
    const documentData = {
        user: req.user.id,           // Ambil ID user dari token (middleware protect)
        fileName: req.file.originalname, // Nama asli file
        filePath: req.file.path,     // Lokasi file tersimpan
        mimeType: req.file.mimetype, // Tipe file
        status: 'pending'
    };

    // 3. Simpan ke Database
    const document = await SIK_Document.create(documentData);

    res.status(201).json({
      success: true,
      data: document
    });

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

    const document = await SIK_Document.findByIdAndUpdate(docId, { status: status }, {
        new: true,
        runValidators: true
    });

    if(!document) {
        return res.status(404).json({ success: false, error: 'Dokumen tidak ditemukan' });
    }

    res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Generate document dihapus dulu karena belum ada logic-nya