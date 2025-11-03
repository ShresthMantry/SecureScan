from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
from pyzbar import pyzbar
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import os
from werkzeug.utils import secure_filename
import tempfile

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = tempfile.gettempdir()
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Load the Hugging Face model
MODEL_NAME = "r3ddkahili/final-complete-malicious-url-model"
print("Loading Hugging Face model...")
try:
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)
    model.eval()
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
    tokenizer = None
    model = None

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def predict_url(url):
    """
    Predict if a URL is malicious or safe using the Hugging Face model
    """
    if not model or not tokenizer:
        return {"error": "Model not loaded"}, 500
    
    try:
        # Tokenize the URL
        inputs = tokenizer(url, return_tensors="pt", truncation=True, max_length=512, padding=True)
        
        # Get prediction
        with torch.no_grad():
            outputs = model(**inputs)
            logits = outputs.logits
            probabilities = torch.softmax(logits, dim=1)
            prediction = torch.argmax(probabilities, dim=1).item()
            confidence = probabilities[0][prediction].item()
        
        # Map prediction to label (0 = safe, 1 = malicious)
        label = "malicious" if prediction == 1 else "safe"
        
        return {
            "url": url,
            "prediction": label,
            "confidence": float(confidence),
            "is_fraudulent": prediction == 1
        }, 200
    except Exception as e:
        return {"error": f"Prediction failed: {str(e)}"}, 500

def extract_url_from_qr(image_path):
    """
    Extract URL from QR code using OpenCV and pyzbar
    """
    try:
        # Read the image
        image = cv2.imread(image_path)
        if image is None:
            return None, "Failed to read image"
        
        # Decode QR codes
        decoded_objects = pyzbar.decode(image)
        
        if not decoded_objects:
            return None, "No QR code found in image"
        
        # Extract the first URL found
        for obj in decoded_objects:
            qr_data = obj.data.decode('utf-8')
            # Check if it's a URL
            if qr_data.startswith('http://') or qr_data.startswith('https://'):
                return qr_data, None
            # Return any data found
            return qr_data, None
        
        return None, "No URL found in QR code"
    except Exception as e:
        return None, f"QR extraction failed: {str(e)}"

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    model_status = "loaded" if model and tokenizer else "not loaded"
    return jsonify({
        "status": "running",
        "model_status": model_status,
        "service": "ML Fraud Detection Service"
    }), 200

@app.route('/api/detect_link', methods=['POST'])
def detect_link():
    """
    Endpoint to detect if a link is malicious
    Expected input: { "url": "https://example.com" }
    """
    try:
        data = request.get_json()
        
        if not data or 'url' not in data:
            return jsonify({"error": "URL is required"}), 400
        
        url = data['url']
        
        if not url:
            return jsonify({"error": "URL cannot be empty"}), 400
        
        # Predict if URL is malicious
        result, status_code = predict_url(url)
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/api/detect_qr', methods=['POST'])
def detect_qr():
    """
    Endpoint to extract URL from QR code and detect if it's malicious
    Expected input: multipart/form-data with 'image' file
    """
    try:
        # Check if image is in request
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400
        
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        if not allowed_file(file.filename):
            return jsonify({"error": "Invalid file type. Allowed: png, jpg, jpeg, gif"}), 400
        
        # Save the file temporarily
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        try:
            # Extract URL from QR code
            extracted_url, error = extract_url_from_qr(filepath)
            
            if error:
                return jsonify({"error": error}), 400
            
            # Predict if the extracted URL is malicious
            result, status_code = predict_url(extracted_url)
            
            # Add extraction info
            result['extracted_from_qr'] = True
            
            return jsonify(result), status_code
            
        finally:
            # Clean up the temporary file
            if os.path.exists(filepath):
                os.remove(filepath)
        
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/api/test', methods=['GET'])
def test():
    """Test endpoint"""
    return jsonify({
        "message": "Flask ML Service is running!",
        "endpoints": {
            "/api/health": "GET - Health check",
            "/api/detect_link": "POST - Detect malicious link",
            "/api/detect_qr": "POST - Extract and detect QR code"
        }
    }), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)
