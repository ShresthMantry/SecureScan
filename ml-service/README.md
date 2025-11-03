# ML Service - Fraud Detection Backend

Flask-based ML microservice for detecting malicious URLs using Hugging Face models and QR code extraction with OpenCV.

## Features

- **Link Detection**: Classifies URLs as malicious or safe using the Hugging Face model `r3ddkahili/final-complete-malicious-url-model`
- **QR Code Detection**: Extracts URLs from QR code images and classifies them
- **RESTful API**: Simple endpoints for integration with Node.js backend

## Setup Instructions

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. Navigate to the ml-service directory:
```bash
cd ml-service
```

2. Create a virtual environment (recommended):
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file from the example:
```bash
cp .env.example .env
```

### Running the Service

```bash
python app.py
```

The service will start on `http://localhost:5000`

## API Endpoints

### 1. Health Check
```
GET /api/health
```

Response:
```json
{
  "status": "running",
  "model_status": "loaded",
  "service": "ML Fraud Detection Service"
}
```

### 2. Detect Link
```
POST /api/detect_link
Content-Type: application/json

{
  "url": "https://example.com"
}
```

Response:
```json
{
  "url": "https://example.com",
  "prediction": "safe",
  "confidence": 0.95,
  "is_fraudulent": false
}
```

### 3. Detect QR Code
```
POST /api/detect_qr
Content-Type: multipart/form-data

image: [file]
```

Response:
```json
{
  "url": "https://example.com",
  "prediction": "malicious",
  "confidence": 0.87,
  "is_fraudulent": true,
  "extracted_from_qr": true
}
```

## Model Information

This service uses the Hugging Face model: `r3ddkahili/final-complete-malicious-url-model`

The model is automatically downloaded on first run and cached locally.

## Development

- Model predictions use PyTorch for inference
- QR code extraction uses OpenCV and pyzbar
- CORS is enabled for frontend integration

## Notes

- Maximum file upload size: 16MB
- Supported image formats: PNG, JPG, JPEG, GIF
- The first request may be slower as the model loads into memory
