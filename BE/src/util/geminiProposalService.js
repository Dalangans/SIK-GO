const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Analyze proposal file content using Gemini AI
 * @param {string} filePath - Path to the proposal file
 * @param {string} proposalTitle - Title of the proposal
 * @returns {Promise<Object>} Analysis result with score and feedback
 */
const analyzeProposalFile = async (filePath, proposalTitle = '') => {
  try {
    console.log('[Gemini] Analyzing proposal file:', filePath);

    // Read file content
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    if (!fileContent.trim()) {
      throw new Error('File is empty');
    }

    const model = client.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Analyze this proposal document and provide detailed feedback:

PROPOSAL TITLE: ${proposalTitle || 'N/A'}

DOCUMENT CONTENT:
${fileContent}

Please analyze the proposal and provide:
1. Overall Quality Score (0-100)
2. Structure Assessment (is it well-organized?)
3. Clarity Assessment (is it clear and understandable?)
4. Completeness Check (does it cover all necessary points?)
5. Key Strengths (list 3-5 main strengths)
6. Areas for Improvement (list 3-5 areas that need work)
7. Recommendations for Enhancement
8. Final Verdict (Approved/Needs Revision/Rejected)

Format the response as JSON with keys: score, structure, clarity, completeness, strengths, improvements, recommendations, verdict`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse JSON response
    let analysisResult;
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        analysisResult = {
          score: 0,
          structure: responseText,
          clarity: 'Unable to parse response',
          completeness: 'Unable to parse response',
          strengths: [],
          improvements: [],
          recommendations: responseText,
          verdict: 'Needs Revision'
        };
      }
    } catch (parseError) {
      console.warn('[Gemini] Could not parse JSON, returning raw response');
      analysisResult = {
        score: 0,
        rawResponse: responseText,
        verdict: 'Manual Review Required'
      };
    }

    return {
      success: true,
      analysis: analysisResult,
      fileName: path.basename(filePath),
      analyzedAt: new Date()
    };
  } catch (error) {
    console.error('[Gemini] Error analyzing proposal:', error.message);
    throw error;
  }
};

/**
 * Check proposal file for plagiarism and content validity
 * @param {string} filePath - Path to the proposal file
 * @returns {Promise<Object>} Plagiarism check result
 */
const checkPlagiarism = async (filePath) => {
  try {
    console.log('[Gemini] Checking plagiarism for:', filePath);

    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');

    const model = client.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Analyze this document for potential plagiarism indicators and content authenticity:

DOCUMENT CONTENT:
${fileContent}

Please provide:
1. Plagiarism Risk Level (Low/Medium/High)
2. Suspicious Sections (if any)
3. Content Authenticity Assessment
4. Language Consistency Check
5. Original Content Percentage (estimate)
6. Recommendations

Format as JSON with keys: riskLevel, suspiciousSections, authenticity, consistency, originalPercentage, recommendations`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let plagiarismResult;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        plagiarismResult = JSON.parse(jsonMatch[0]);
      } else {
        plagiarismResult = {
          riskLevel: 'Unknown',
          rawResponse: responseText
        };
      }
    } catch (parseError) {
      plagiarismResult = {
        riskLevel: 'Manual Review Required',
        rawResponse: responseText
      };
    }

    return {
      success: true,
      plagiarismCheck: plagiarismResult,
      fileName: path.basename(filePath),
      checkedAt: new Date()
    };
  } catch (error) {
    console.error('[Gemini] Error checking plagiarism:', error.message);
    throw error;
  }
};

/**
 * Generate improvement suggestions for proposal
 * @param {string} filePath - Path to the proposal file
 * @param {string} proposalType - Type of proposal (academic/business/research)
 * @returns {Promise<Object>} Improvement suggestions
 */
const generateImprovementSuggestions = async (filePath, proposalType = 'general') => {
  try {
    console.log('[Gemini] Generating improvement suggestions for:', filePath);

    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');

    const model = client.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Provide detailed improvement suggestions for this ${proposalType} proposal:

DOCUMENT CONTENT:
${fileContent}

Please provide:
1. Executive Summary Improvements
2. Technical Improvements
3. Formatting Suggestions
4. Content Enhancement Ideas
5. Restructuring Recommendations
6. Grammar and Language Improvements
7. Added Value Suggestions
8. Priority Actions (Top 5 things to improve first)

Format as JSON with keys: executiveSummary, technical, formatting, contentEnhancement, restructuring, grammar, addedValue, priorityActions (array)`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let suggestions;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        suggestions = {
          rawResponse: responseText,
          priorityActions: []
        };
      }
    } catch (parseError) {
      suggestions = {
        rawResponse: responseText,
        priorityActions: []
      };
    }

    return {
      success: true,
      suggestions,
      fileName: path.basename(filePath),
      proposalType,
      generatedAt: new Date()
    };
  } catch (error) {
    console.error('[Gemini] Error generating suggestions:', error.message);
    throw error;
  }
};

/**
 * Perform complete proposal audit
 * @param {string} filePath - Path to the proposal file
 * @param {Object} metadata - Additional metadata (title, type, author)
 * @returns {Promise<Object>} Complete audit report
 */
const performCompleteAudit = async (filePath, metadata = {}) => {
  try {
    console.log('[Gemini] Performing complete audit for:', filePath);

    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Run all checks in parallel
    const [analysis, plagiarism, suggestions] = await Promise.all([
      analyzeProposalFile(filePath, metadata.title),
      checkPlagiarism(filePath),
      generateImprovementSuggestions(filePath, metadata.type)
    ]);

    return {
      success: true,
      auditReport: {
        metadata,
        analysis: analysis.analysis,
        plagiarismCheck: plagiarism.plagiarismCheck,
        suggestions: suggestions.suggestions,
        overallRecommendation: generateOverallRecommendation(
          analysis.analysis.score,
          plagiarism.plagiarismCheck.riskLevel
        )
      },
      fileName: path.basename(filePath),
      completedAt: new Date()
    };
  } catch (error) {
    console.error('[Gemini] Error performing audit:', error.message);
    throw error;
  }
};

/**
 * Generate overall recommendation based on audit results
 */
const generateOverallRecommendation = (score, plagiarismRisk) => {
  if (plagiarismRisk === 'High') {
    return {
      status: 'REJECTED',
      reason: 'High plagiarism risk detected',
      action: 'Please rewrite and ensure original content'
    };
  }

  if (score >= 80) {
    return {
      status: 'APPROVED',
      reason: 'Excellent proposal quality',
      action: 'Ready for submission'
    };
  }

  if (score >= 60) {
    return {
      status: 'APPROVED_WITH_REVISIONS',
      reason: 'Good proposal with minor improvements needed',
      action: 'Review suggestions and make revisions'
    };
  }

  return {
    status: 'NEEDS_SIGNIFICANT_REVISION',
    reason: 'Proposal quality below acceptable threshold',
    action: 'Major revisions required before resubmission'
  };
};

module.exports = {
  analyzeProposalFile,
  checkPlagiarism,
  generateImprovementSuggestions,
  performCompleteAudit
};
