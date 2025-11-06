const proposalRepository = require('../repository/proposalRepository');
const AIChecker = require('../database/models/AIChecker');

exports.createProposal = async (req, res) => {
  try {
    const proposal = await proposalRepository.createProposal(req.body);
    
    // Validate with AI Checker
    const aiChecker = new AIChecker();
    const isValid = await aiChecker.validateProposal(proposal);
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Proposal validation failed'
      });
    }
    
    res.status(201).json({
      success: true,
      data: proposal
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

exports.getProposal = async (req, res) => {
  try {
    const proposal = await proposalRepository.getProposalById(req.params.proposalId);
    if (!proposal) {
      return res.status(404).json({
        success: false,
        error: 'Proposal not found'
      });
    }
    res.status(200).json({
      success: true,
      data: proposal
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

exports.updateProposal = async (req, res) => {
  try {
    const proposal = await proposalRepository.updateProposal(req.params.proposalId, req.body);
    res.status(200).json({
      success: true,
      data: proposal
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};