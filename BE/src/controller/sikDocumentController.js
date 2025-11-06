const sikDocumentRepository = require('../repository/sikDocumentRepository');

exports.createSIKDocument = async (req, res) => {
  try {
    const document = await sikDocumentRepository.createDocument(req.body);
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
    const document = await sikDocumentRepository.updateDocumentStatus(docId, status);
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

exports.generateDocument = async (req, res) => {
  try {
    const { docId } = req.params;
    const document = await sikDocumentRepository.generateDocument(docId);
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