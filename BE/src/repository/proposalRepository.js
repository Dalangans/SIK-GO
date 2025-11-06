const Proposal = require('../database/models/Proposal');

exports.createProposal = async (proposalData) => {
  return await Proposal.create(proposalData);
};

exports.getProposalById = async (proposalId) => {
  return await Proposal.findOne({ proposalId })
    .populate('roomReq');
};

exports.validateProposal = async (proposalId) => {
  const proposal = await Proposal.findOne({ proposalId });
  return proposal ? proposal.validate() : false;
};

exports.updateProposal = async (proposalId, updateData) => {
  return await Proposal.findOneAndUpdate(
    { proposalId },
    updateData,
    {
      new: true,
      runValidators: true
    }
  );
};