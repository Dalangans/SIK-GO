const Proposal = require('../database/models/Proposal');

class ProposalRepository {
  // Create proposal
  async createProposal(userId, proposalData) {
    try {
      const proposal = new Proposal({
        user: userId,
        ...proposalData
      });
      await proposal.save();
      return proposal;
    } catch (error) {
      throw error;
    }
  }

  // Get all proposals
  async getAllProposals(filter = {}) {
    try {
      return await Proposal.find(filter)
        .populate('user', 'email name role')
        .populate('manualReview.reviewer', 'email name')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  // Get proposals by user
  async getProposalsByUser(userId) {
    try {
      return await Proposal.find({ user: userId })
        .populate('manualReview.reviewer', 'email name')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  // Get single proposal
  async getProposalById(proposalId) {
    try {
      return await Proposal.findById(proposalId)
        .populate('user', 'email name role')
        .populate('manualReview.reviewer', 'email name');
    } catch (error) {
      throw error;
    }
  }

  // Update proposal
  async updateProposal(proposalId, updateData) {
    try {
      return await Proposal.findByIdAndUpdate(proposalId, updateData, {
        new: true,
        runValidators: true
      });
    } catch (error) {
      throw error;
    }
  }

  // Update AI review
  async updateAIReview(proposalId, aiReview) {
    try {
      return await Proposal.findByIdAndUpdate(
        proposalId,
        {
          aiReview: {
            ...aiReview,
            reviewedAt: new Date()
          },
          status: 'reviewing'
        },
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw error;
    }
  }

  // Update manual review
  async updateManualReview(proposalId, reviewerId, reviewData) {
    try {
      return await Proposal.findByIdAndUpdate(
        proposalId,
        {
          manualReview: {
            reviewer: reviewerId,
            ...reviewData,
            reviewedAt: new Date()
          },
          status: reviewData.status
        },
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw error;
    }
  }

  // Delete proposal
  async deleteProposal(proposalId) {
    try {
      return await Proposal.findByIdAndDelete(proposalId);
    } catch (error) {
      throw error;
    }
  }

  // Get proposals by status
  async getProposalsByStatus(status) {
    try {
      return await Proposal.find({ status })
        .populate('user', 'email name')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  // Get proposals needing AI review
  async getProposalsNeedingReview() {
    try {
      return await Proposal.find({
        status: { $in: ['submitted', 'draft'] },
        'aiReview.score': { $exists: false }
      });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ProposalRepository;