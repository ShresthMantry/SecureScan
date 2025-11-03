const express = require('express');
const axios = require('axios');
const multer = require('multer');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 16 * 1024 * 1024 // 16MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PNG, JPG, JPEG, and GIF are allowed.'));
    }
  }
});

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';

// @route   POST /api/detect/link
// @desc    Detect if a link is malicious (proxy to Flask ML service)
// @access  Public
router.post('/link', [
  body('url').isURL().withMessage('Please provide a valid URL')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { url } = req.body;

    // Forward request to Flask ML service
    const response = await axios.post(`${ML_SERVICE_URL}/api/detect_link`, {
      url
    }, {
      timeout: 30000 // 30 second timeout
    });

    res.json(response.data);
  } catch (error) {
    console.error('Link detection error:', error.message);
    
    if (error.response) {
      // Flask service returned an error
      return res.status(error.response.status).json(error.response.data);
    }
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        error: 'ML service is unavailable. Please ensure the Flask service is running.' 
      });
    }

    res.status(500).json({ error: 'Failed to detect link' });
  }
});

// @route   POST /api/detect/qr
// @desc    Detect QR code and check if URL is malicious (proxy to Flask ML service)
// @access  Public
router.post('/qr', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Create form data for Flask service
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('image', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    // Forward request to Flask ML service
    const response = await axios.post(`${ML_SERVICE_URL}/api/detect_qr`, formData, {
      headers: {
        ...formData.getHeaders()
      },
      timeout: 30000, // 30 second timeout
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    res.json(response.data);
  } catch (error) {
    console.error('QR detection error:', error.message);
    
    if (error.response) {
      // Flask service returned an error
      return res.status(error.response.status).json(error.response.data);
    }
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        error: 'ML service is unavailable. Please ensure the Flask service is running.' 
      });
    }

    res.status(500).json({ error: 'Failed to detect QR code' });
  }
});

// @route   GET /api/detect/health
// @desc    Check ML service health
// @access  Public
router.get('/health', async (req, res) => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/api/health`, {
      timeout: 5000
    });

    res.json({
      ml_service: response.data,
      proxy_status: 'connected'
    });
  } catch (error) {
    console.error('ML service health check failed:', error.message);
    
    res.status(503).json({
      ml_service: 'unavailable',
      proxy_status: 'disconnected',
      error: error.message
    });
  }
});

module.exports = router;
