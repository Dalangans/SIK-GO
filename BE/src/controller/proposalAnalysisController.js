const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  analyzeProposalFile,
  checkPlagiarism,
  generateImprovementSuggestions,
  performCompleteAudit
} = require('../util/geminiProposalService');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only text files and documents
  const allowedMimes = [
    'text/plain',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/markdown',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not supported`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

/**
 * Upload and analyze proposal file
 * POST /api/proposals/analyze
 */
const analyzeProposal = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { title = '', type = 'general' } = req.body;
    const filePath = req.file.path;

    console.log('[Proposal Analysis] Analyzing file:', req.file.originalname);

    const result = await analyzeProposalFile(filePath, title);

    res.status(200).json({
      success: true,
      message: 'Proposal analyzed successfully',
      data: result
    });

  } catch (error) {
    console.error('[Proposal Analysis] Error:', error.message);
    
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Error analyzing proposal',
      error: error.message
    });
  }
};

/**
 * Check proposal for plagiarism
 * POST /api/proposals/check-plagiarism
 */
const checkProposalPlagiarism = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const filePath = req.file.path;

    console.log('[Plagiarism Check] Checking file:', req.file.originalname);

    const result = await checkPlagiarism(filePath);

    res.status(200).json({
      success: true,
      message: 'Plagiarism check completed',
      data: result
    });

  } catch (error) {
    console.error('[Plagiarism Check] Error:', error.message);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Error checking plagiarism',
      error: error.message
    });
  }
};

/**
 * Get improvement suggestions for proposal
 * POST /api/proposals/suggestions
 */
const getImprovementSuggestions = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { type = 'general' } = req.body;
    const filePath = req.file.path;

    console.log('[Suggestions] Generating suggestions for:', req.file.originalname);

    const result = await generateImprovementSuggestions(filePath, type);

    res.status(200).json({
      success: true,
      message: 'Improvement suggestions generated',
      data: result
    });

  } catch (error) {
    console.error('[Suggestions] Error:', error.message);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Error generating suggestions',
      error: error.message
    });
  }
};

/**
 * Complete audit of proposal
 * POST /api/proposals/audit
 */
const auditProposal = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { title = '', type = 'general', author = '' } = req.body;
    const filePath = req.file.path;

    console.log('[Audit] Starting complete audit for:', req.file.originalname);

    const metadata = {
      title,
      type,
      author,
      fileName: req.file.originalname,
      fileSize: req.file.size
    };

    const result = await performCompleteAudit(filePath, metadata);

    res.status(200).json({
      success: true,
      message: 'Proposal audit completed',
      data: result
    });

  } catch (error) {
    console.error('[Audit] Error:', error.message);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Error performing audit',
      error: error.message
    });
  }
};

module.exports = {
  upload,
  analyzeProposal,
  checkProposalPlagiarism,
  getImprovementSuggestions,
  auditProposal
};
