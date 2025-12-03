const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { generateSummary, evaluateProposal } = require('../util/proposalEvaluator');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    cb(null, `${timestamp}-${random}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'text/plain',
    'text/markdown',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];
  
  const allowedExts = ['.pdf', '.txt', '.md', '.doc', '.docx', '.xls', '.xlsx'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExts.includes(ext) || allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

/**
 * Generate summary of uploaded document
 */
exports.generateSummaryHandler = async (req, res) => {
  let filePath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    filePath = req.file.path;
    const result = await generateSummary(filePath, req.file.originalname);
    
    // Clean up file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Summary generation error:', error);
    
    // Clean up file on error
    if (filePath && fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch {}
    }
    
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Evaluate proposal according to FTUI standards
 */
exports.evaluateProposalHandler = async (req, res) => {
  let filePath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    filePath = req.file.path;
    const result = await evaluateProposal(filePath, req.file.originalname);
    
    // Clean up file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Proposal evaluation error:', error);
    
    // Clean up file on error
    if (filePath && fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch {}
    }
    
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Generate summary from existing file path (for proposals)
 */
exports.generateSummaryByPathHandler = async (req, res) => {
  try {
    const { filePath } = req.body;
    
    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: 'File path is required',
      });
    }

    // Resolve the full path
    const fullPath = path.join(__dirname, '../../', filePath);
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({
        success: false,
        error: 'File not found',
      });
    }

    const fileName = path.basename(fullPath);
    const result = await generateSummary(fullPath, fileName);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Summary generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Evaluate proposal from existing file path
 */
exports.evaluateProposalByPathHandler = async (req, res) => {
  try {
    const { filePath } = req.body;
    
    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: 'File path is required',
      });
    }

    // Resolve the full path
    const fullPath = path.join(__dirname, '../../', filePath);
    
    console.log('Evaluating proposal:');
    console.log('  Received filePath:', filePath);
    console.log('  Resolved fullPath:', fullPath);
    console.log('  File exists:', fs.existsSync(fullPath));
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({
        success: false,
        error: `File not found at: ${fullPath}`,
      });
    }

    const fileName = path.basename(fullPath);
    const result = await evaluateProposal(fullPath, fileName);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Proposal evaluation error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports.upload = upload;
