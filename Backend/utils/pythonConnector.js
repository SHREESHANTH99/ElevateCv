const axios = require('axios');

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://127.0.0.1:8000';

/**
 * Check if the Python microservice is online and healthy.
 */
async function checkHealth() {
  try {
    const res = await axios.get(`${PYTHON_SERVICE_URL}/health`, { timeout: 3000 });
    return res.data?.status === 'ok';
  } catch (err) {
    return false;
  }
}

/**
 * Send PDF buffer to Python microservice for layout extraction & deterministic section segmentation.
 * Degrades gracefully if Python service is offline or fails.
 */
async function extractLayout(fileBuffer, filename = 'resume.pdf') {
  try {
    const blob = new Blob([fileBuffer], { type: 'application/pdf' });
    const formData = new FormData();
    formData.append('file', blob, filename);

    const res = await axios.post(`${PYTHON_SERVICE_URL}/extract-layout`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 15000,
    });

    if (res.data && res.data.success) {
      return {
        layoutAnalysisUsed: true,
        fallbackUsed: false,
        summary: res.data.summary,
        blocks: res.data.blocks,
        sections: res.data.sections,
      };
    }

    throw new Error('Python service returned unsuccessful response.');
  } catch (err) {
    console.warn(`[pythonConnector] Layout extraction failed: ${err.message}. Falling back.`);
    return {
      layoutAnalysisUsed: false,
      fallbackUsed: true,
      error: err.message,
      blocks: [],
      sections: {},
    };
  }
}

/**
 * Send text to Python microservice for spaCy soft NER entity extraction.
 */
async function extractEntities(text) {
  try {
    const res = await axios.post(`${PYTHON_SERVICE_URL}/extract-entities`, { text }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000,
    });

    if (res.data && res.data.success) {
      return {
        success: true,
        entities: res.data.entities,
      };
    }
    return { success: false, entities: { dates: [], organizations: [], locations: [] } };
  } catch (err) {
    console.warn(`[pythonConnector] Entity extraction failed: ${err.message}.`);
    return { success: false, entities: { dates: [], organizations: [], locations: [] } };
  }
}

module.exports = {
  checkHealth,
  extractLayout,
  extractEntities,
};
