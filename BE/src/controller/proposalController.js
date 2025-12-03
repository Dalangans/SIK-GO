const ProposalRepository = require('../repository/proposalRepository');
const { generateProposalReview, chatWithAI } = require('../util/geminiService');
const {
  analyzeProposalFile,
  checkPlagiarism,
  generateImprovementSuggestions,
  performCompleteAudit
} = require('../util/geminiProposalService');
const { successResponse, errorResponse } = require('../util/response');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const proposalRepo = new ProposalRepository();

// Multer configuration for file uploads
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
  limits: { fileSize: 10 * 1024 * 1024 }
});

// ==================== ORIGINAL PROPOSAL FUNCTIONS ====================

exports.createProposal = async (req, res) => {
  try {
    const { title, category, description, content } = req.body;
    const userId = req.user.id;

    if (!title || !category || !description || !content) {
      return errorResponse(res, 'Please provide all required fields', 400);
    }

    let proposalData = {
      title,
      category,
      description,
      content,
      status: 'draft'
    };

    if (req.file) {
      proposalData.filePath = req.file.path;
      proposalData.mimeType = req.file.mimetype;
    }

    const proposal = await proposalRepo.createProposal(userId, proposalData);
    successResponse(res, proposal, 'Proposal created successfully', 201);
  } catch (error) {
    console.error('Error creating proposal:', error);
    errorResponse(res, error.message, 500);
  }
};

exports.getAllProposals = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const proposals = await proposalRepo.getAllProposals(filter);
    successResponse(res, proposals, 'Proposals retrieved successfully');
  } catch (error) {
    console.error('Error getting proposals:', error);
    errorResponse(res, error.message, 500);
  }
};

exports.getMyProposals = async (req, res) => {
  try {
    const userId = req.user.id;
    const proposals = await proposalRepo.getProposalsByUser(userId);
    successResponse(res, proposals, 'Your proposals retrieved successfully');
  } catch (error) {
    console.error('Error getting proposals:', error);
    errorResponse(res, error.message, 500);
  }
};

exports.getProposalById = async (req, res) => {
  try {
    const proposal = await proposalRepo.getProposalById(req.params.id);
    
    if (!proposal) {
      return errorResponse(res, 'Proposal not found', 404);
    }

    if (proposal.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'Not authorized to view this proposal', 403);
    }

    successResponse(res, proposal, 'Proposal retrieved successfully');
  } catch (error) {
    console.error('Error getting proposal:', error);
    errorResponse(res, error.message, 500);
  }
};

exports.updateProposal = async (req, res) => {
  try {
    let proposal = await proposalRepo.getProposalById(req.params.id);

    if (!proposal) {
      return errorResponse(res, 'Proposal not found', 404);
    }

    if (proposal.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'Not authorized to update this proposal', 403);
    }

    if (proposal.status === 'approved' || proposal.status === 'rejected') {
      return errorResponse(res, 'Cannot update already reviewed proposal', 400);
    }

    const updateData = {
      title: req.body.title || proposal.title,
      category: req.body.category || proposal.category,
      description: req.body.description || proposal.description,
      content: req.body.content || proposal.content
    };

    if (req.file) {
      if (proposal.filePath) {
        fs.unlink(proposal.filePath, (err) => {
          if (err) console.error('Error deleting old file:', err);
        });
      }
      updateData.filePath = req.file.path;
      updateData.mimeType = req.file.mimetype;
    }

    proposal = await proposalRepo.updateProposal(req.params.id, updateData);
    successResponse(res, proposal, 'Proposal updated successfully');
  } catch (error) {
    console.error('Error updating proposal:', error);
    errorResponse(res, error.message, 500);
  }
};

exports.submitProposal = async (req, res) => {
  try {
    let proposal = await proposalRepo.getProposalById(req.params.id);

    if (!proposal) {
      return errorResponse(res, 'Proposal not found', 404);
    }

    if (proposal.user._id.toString() !== req.user.id) {
      return errorResponse(res, 'Not authorized', 403);
    }

    if (proposal.status !== 'draft') {
      return errorResponse(res, 'Only draft proposals can be submitted', 400);
    }

    proposal = await proposalRepo.updateProposal(req.params.id, {
      status: 'submitted'
    });

    successResponse(res, proposal, 'Proposal submitted successfully');
  } catch (error) {
    console.error('Error submitting proposal:', error);
    errorResponse(res, error.message, 500);
  }
};

exports.generateAIReview = async (req, res) => {
  try {
    let proposal = await proposalRepo.getProposalById(req.params.id);

    if (!proposal) {
      return errorResponse(res, 'Proposal not found', 404);
    }

    if (proposal.status === 'draft') {
      return errorResponse(res, 'Cannot review draft proposal. Submit it first.', 400);
    }

    const aiReview = await generateProposalReview(proposal.content, proposal.category);

    proposal = await proposalRepo.updateAIReview(req.params.id, aiReview);

    successResponse(res, proposal, 'AI review generated successfully');
  } catch (error) {
    console.error('Error generating AI review:', error);
    errorResponse(res, error.message, 500);
  }
};

exports.manualReview = async (req, res) => {
  try {
    const { comments, status } = req.body;
    const reviewerId = req.user.id;

    if (!comments || !status) {
      return errorResponse(res, 'Please provide comments and status', 400);
    }

    if (!['approved', 'rejected'].includes(status)) {
      return errorResponse(res, 'Status must be approved or rejected', 400);
    }

    let proposal = await proposalRepo.getProposalById(req.params.id);

    if (!proposal) {
      return errorResponse(res, 'Proposal not found', 404);
    }

    proposal = await proposalRepo.updateManualReview(req.params.id, reviewerId, {
      comments,
      status
    });

    successResponse(res, proposal, 'Manual review submitted successfully');
  } catch (error) {
    console.error('Error submitting manual review:', error);
    errorResponse(res, error.message, 500);
  }
};

exports.deleteProposal = async (req, res) => {
  try {
    const proposal = await proposalRepo.getProposalById(req.params.id);

    if (!proposal) {
      return errorResponse(res, 'Proposal not found', 404);
    }

    if (proposal.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'Not authorized', 403);
    }

    if (proposal.filePath) {
      fs.unlink(proposal.filePath, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }

    await proposalRepo.deleteProposal(req.params.id);
    successResponse(res, null, 'Proposal deleted successfully');
  } catch (error) {
    console.error('Error deleting proposal:', error);
    errorResponse(res, error.message, 500);
  }
};

exports.getProposalsNeedingReview = async (req, res) => {
  try {
    const proposals = await proposalRepo.getProposalsNeedingReview();
    successResponse(res, proposals, 'Pending proposals retrieved successfully');
  } catch (error) {
    console.error('Error getting pending proposals:', error);
    errorResponse(res, error.message, 500);
  }
};

exports.generateSummaryHandler = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No file uploaded', 400);
    }

    const { title = '' } = req.body;
    const filePath = req.file.path;

    console.log('[Proposal Summary] Analyzing file:', req.file.originalname);

    const result = await analyzeProposalFile(filePath, title);

    successResponse(res, result, 'Proposal summary generated successfully');

  } catch (error) {
    console.error('[Proposal Summary] Error:', error.message);
    
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    errorResponse(res, error.message, 500);
  }
};

exports.evaluateProposalHandler = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No file uploaded', 400);
    }

    const { title = '', type = 'general', author = '' } = req.body;
    const filePath = req.file.path;

    console.log('[Proposal Evaluation] Starting evaluation for:', req.file.originalname);

    const metadata = {
      title,
      type,
      author,
      fileName: req.file.originalname,
      fileSize: req.file.size
    };

    const result = await performCompleteAudit(filePath, metadata);

    successResponse(res, result, 'Proposal evaluation completed successfully');

  } catch (error) {
    console.error('[Proposal Evaluation] Error:', error.message);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    errorResponse(res, error.message, 500);
  }
};

exports.analyzeProposal = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No file uploaded', 400);
    }

    const { title = '', type = 'general' } = req.body;
    const filePath = req.file.path;

    console.log('[Proposal Analysis] Analyzing file:', req.file.originalname);

    const result = await analyzeProposalFile(filePath, title);

    successResponse(res, result, 'Proposal analyzed successfully');

  } catch (error) {
    console.error('[Proposal Analysis] Error:', error.message);
    
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    errorResponse(res, error.message, 500);
  }
};

exports.checkProposalPlagiarism = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No file uploaded', 400);
    }

    const filePath = req.file.path;

    console.log('[Plagiarism Check] Checking file:', req.file.originalname);

    const result = await checkPlagiarism(filePath);

    successResponse(res, result, 'Plagiarism check completed');

  } catch (error) {
    console.error('[Plagiarism Check] Error:', error.message);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    errorResponse(res, error.message, 500);
  }
};

exports.getImprovementSuggestions = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No file uploaded', 400);
    }

    const { type = 'general' } = req.body;
    const filePath = req.file.path;

    console.log('[Suggestions] Generating suggestions for:', req.file.originalname);

    const result = await generateImprovementSuggestions(filePath, type);

    successResponse(res, result, 'Improvement suggestions generated');

  } catch (error) {
    console.error('[Suggestions] Error:', error.message);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    errorResponse(res, error.message, 500);
  }
};

exports.auditProposal = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No file uploaded', 400);
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

    successResponse(res, result, 'Proposal audit completed');

  } catch (error) {
    console.error('[Audit] Error:', error.message);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    errorResponse(res, error.message, 500);
  }
};

// Export upload middleware
module.exports.upload = upload;