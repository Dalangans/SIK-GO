const SIKDocument = require('../database/models/SIK_Document');

exports.createDocument = async (documentData) => {
  return await SIKDocument.create(documentData);
};

exports.getDocumentById = async (docId) => {
  return await SIKDocument.findOne({ docId });
};

exports.updateDocumentStatus = async (docId, status) => {
  return await SIKDocument.findOneAndUpdate(
    { docId },
    { status },
    {
      new: true,
      runValidators: true
    }
  );
};

exports.generateDocument = async (docId) => {
  const document = await SIKDocument.findOne({ docId });
  if (document) {
    return document.generateDoc();
  }
  throw new Error('Document not found');
};