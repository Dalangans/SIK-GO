const ProposalRepository = require('../repository/proposalRepository');
const { generateProposalReview, chatWithAI } = require('../util/geminiService');
const { successResponse, errorResponse } = require('../util/response');
const fs = require('fs');
const path = require('path');

const proposalRepo = new ProposalRepository();

// @desc    Create new proposal
// @route   POST /api/proposals
// @access  Private
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

    // If file uploaded
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

// @desc    Get all proposals (admin only)
// @route   GET /api/proposals
// @access  Private/Admin
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

// @desc    Get my proposals
// @route   GET /api/proposals/my-proposals
// @access  Private
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

// @desc    Get single proposal
// @route   GET /api/proposals/:id
// @access  Private
exports.getProposalById = async (req, res) => {
  try {
    const proposal = await proposalRepo.getProposalById(req.params.id);
    
    if (!proposal) {
      return errorResponse(res, 'Proposal not found', 404);
    }

    // Check authorization
    if (proposal.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'Not authorized to view this proposal', 403);
    }

    successResponse(res, proposal, 'Proposal retrieved successfully');
  } catch (error) {
    console.error('Error getting proposal:', error);
    errorResponse(res, error.message, 500);
  }
};

// @desc    Update proposal
// @route   PUT /api/proposals/:id
// @access  Private
exports.updateProposal = async (req, res) => {
  try {
    let proposal = await proposalRepo.getProposalById(req.params.id);

    if (!proposal) {
      return errorResponse(res, 'Proposal not found', 404);
    }

    // Check authorization
    if (proposal.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'Not authorized to update this proposal', 403);
    }

    // Don't allow update if already approved/rejected
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
      // Delete old file jika ada
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

// @desc    Submit proposal for review
// @route   PUT /api/proposals/:id/submit
// @access  Private
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

// @desc    Generate AI Review
// @route   POST /api/proposals/:id/ai-review
// @access  Private/Admin
exports.generateAIReview = async (req, res) => {
  try {
    let proposal = await proposalRepo.getProposalById(req.params.id);

    if (!proposal) {
      return errorResponse(res, 'Proposal not found', 404);
    }

    if (proposal.status === 'draft') {
      return errorResponse(res, 'Cannot review draft proposal. Submit it first.', 400);
    }

    // Generate AI review
    const aiReview = await generateProposalReview(proposal.content, proposal.category);

    // Update proposal with AI review
    proposal = await proposalRepo.updateAIReview(req.params.id, aiReview);

    successResponse(res, proposal, 'AI review generated successfully');
  } catch (error) {
    console.error('Error generating AI review:', error);
    errorResponse(res, error.message, 500);
  }
};

// @desc    Manual review by admin
// @route   POST /api/proposals/:id/manual-review
// @access  Private/Admin
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

// @desc    Delete proposal
// @route   DELETE /api/proposals/:id
// @access  Private
exports.deleteProposal = async (req, res) => {
  try {
    const proposal = await proposalRepo.getProposalById(req.params.id);

    if (!proposal) {
      return errorResponse(res, 'Proposal not found', 404);
    }

    if (proposal.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'Not authorized', 403);
    }

    // Delete file if exists
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

// @desc    Get proposals needing review
// @route   GET /api/proposals/review/pending
// @access  Private/Admin
exports.getProposalsNeedingReview = async (req, res) => {
  try {
    const proposals = await proposalRepo.getProposalsNeedingReview();
    successResponse(res, proposals, 'Pending proposals retrieved successfully');
  } catch (error) {
    console.error('Error getting pending proposals:', error);
    errorResponse(res, error.message, 500);
  }
};
