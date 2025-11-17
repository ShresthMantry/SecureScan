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
import re
from urllib.parse import urlparse

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

def check_url_heuristics(url):
    """
    Check URL using heuristic rules for common fraud patterns
    Returns: (is_suspicious, risk_score, reasons)
    """
    risk_score = 0
    reasons = []
    
    try:
        parsed = urlparse(url.lower())
        domain = parsed.netloc
        path = parsed.path
        
        # Suspicious keywords in domain or path (English and common international variants)
        suspicious_keywords = [
            'login', 'signin', 'account', 'verify', 'secure', 'update', 'confirm',
            'banking', 'paypal', 'amazon', 'apple', 'microsoft', 'google',
            'password', 'suspended', 'locked', 'unusual', 'activity',
            'click', 'urgent', 'action', 'required', 'wallet', 'crypto',
            'prize', 'winner', 'claim', 'free', 'gift', 'congratulations',
            # Portuguese/Spanish variants common in phishing
            'atualizacao', 'atualizar', 'dados', 'conta', 'verificar', 'seguro',
            'urgente', 'bloqueado', 'suspenso', 'confirmar', 'senha',
            # Other international variants
            'validar', 'restablecer', 'recuperar', 'notification'
        ]
        
        url_lower = url.lower()
        for keyword in suspicious_keywords:
            if keyword in url_lower:
                risk_score += 15
                reasons.append(f"Contains suspicious keyword: '{keyword}'")
        
        # IP address instead of domain name
        ip_pattern = r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}'
        if re.search(ip_pattern, domain):
            risk_score += 30
            reasons.append("Uses IP address instead of domain name")
        
        # Excessive subdomains (e.g., paypal.secure.login.verify.com)
        subdomain_count = domain.count('.')
        if subdomain_count > 3:
            risk_score += 25
            reasons.append(f"Excessive subdomains ({subdomain_count})")
        
        # Very long domain names (often used in phishing)
        if len(domain) > 40:
            risk_score += 20
            reasons.append(f"Unusually long domain ({len(domain)} characters)")
        
        # Suspicious TLDs (free/cheap domains commonly used in phishing)
        suspicious_tlds = [
            '.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.club', 
            '.work', '.bid', '.online', '.site', '.website', '.space', 
            '.info', '.pw', '.cc'
        ]
        for tld in suspicious_tlds:
            if domain.endswith(tld):
                risk_score += 25
                reasons.append(f"Suspicious TLD: {tld}")
        
        # URL shorteners (can hide malicious links)
        url_shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd', 'buff.ly']
        if any(shortener in domain for shortener in url_shorteners):
            risk_score += 20
            reasons.append("URL shortener detected")
        
        # Excessive hyphens in domain
        if domain.count('-') > 3:
            risk_score += 15
            reasons.append(f"Excessive hyphens in domain ({domain.count('-')})")
        
        # Non-HTTPS (less secure)
        if parsed.scheme != 'https':
            risk_score += 10
            reasons.append("Not using HTTPS")
        
        # @ symbol in URL (can be used to trick users)
        if '@' in url:
            risk_score += 30
            reasons.append("Contains @ symbol (potential redirect trick)")
        
        # Homograph/lookalike characters
        suspicious_chars = ['а', 'е', 'о', 'р', 'с', 'у', 'х']  # Cyrillic lookalikes
        for char in suspicious_chars:
            if char in domain:
                risk_score += 35
                reasons.append("Contains lookalike characters (possible homograph attack)")
                break
        
        # Port numbers (unusual for legitimate sites)
        if ':' in domain and not domain.endswith(':443') and not domain.endswith(':80'):
            risk_score += 20
            reasons.append("Uses non-standard port")
        
        # Determine if suspicious based on risk score
        is_suspicious = risk_score >= 30
        
        return is_suspicious, risk_score, reasons
        
    except Exception as e:
        return False, 0, [f"Error analyzing URL: {str(e)}"]

def predict_url(url):
    """
    Predict if a URL is malicious or safe using the Hugging Face model + heuristics
    """
    if not model or not tokenizer:
        return {"error": "Model not loaded"}, 500
    
    try:
        # First, check heuristics
        is_suspicious_heuristic, risk_score, heuristic_reasons = check_url_heuristics(url)
        
        # Tokenize the URL for ML model
        inputs = tokenizer(url, return_tensors="pt", truncation=True, padding=True, max_length=128)
        
        # Get ML model prediction
        with torch.no_grad():
            outputs = model(**inputs)
            logits = outputs.logits
            probabilities = torch.softmax(logits, dim=1)
            prediction = torch.argmax(probabilities, dim=1).item()
            ml_confidence = probabilities[0][prediction].item()
        
        # Mapping prediction to labels
        # 0: Benign, 1: Defacement, 2: Phishing, 3: Malware
        label_map = {0: "Benign", 1: "Defacement", 2: "Phishing", 3: "Malware"}
        ml_prediction_label = label_map.get(prediction, "Unknown")
        
        # Determine if malicious (anything other than Benign is considered malicious)
        ml_is_malicious = prediction != 0
        
        # Combine ML prediction with heuristics
        # If either heuristics OR ML model says it's malicious, mark as malicious
        is_fraudulent = ml_is_malicious or is_suspicious_heuristic
        
        # Calculate combined confidence
        if is_fraudulent:
            # If both agree it's malicious, high confidence
            if ml_is_malicious and is_suspicious_heuristic:
                combined_confidence = max(ml_confidence, risk_score / 100)
            # If only heuristics say malicious
            elif is_suspicious_heuristic:
                combined_confidence = risk_score / 100
            # If only ML says malicious
            else:
                combined_confidence = ml_confidence
        else:
            # Both say safe
            combined_confidence = ml_confidence
        
        # Overall label
        if is_fraudulent:
            if ml_is_malicious:
                label = "malicious"
                threat_type = ml_prediction_label
            else:
                label = "malicious"
                threat_type = "Suspicious"
        else:
            label = "safe"
            threat_type = "Benign"
        
        result = {
            "url": url,
            "prediction": label,
            "confidence": float(combined_confidence),
            "is_fraudulent": is_fraudulent,
            "threat_type": threat_type,
            "risk_score": risk_score,
            "ml_prediction": ml_prediction_label,
            "ml_confidence": float(ml_confidence),
            "heuristic_check": "suspicious" if is_suspicious_heuristic else "clean",
            "warning_flags": heuristic_reasons if heuristic_reasons else []
        }
        
        return result, 200
    except Exception as e:
        return {"error": f"Prediction failed: {str(e)}"}, 500

def is_payment_qr(qr_data):
    """
    Check if QR code contains payment information
    """
    qr_lower = qr_data.lower()
    
    # Common UPI/payment patterns
    payment_patterns = [
        'upi://', 'paytm', 'phonepe', 'googlepay', 'gpay',
        'bhim', 'amazonpay', 'mobikwik', 'freecharge',
        'pa=', 'pn=', 'mc=', 'tid=', 'tr=', 'tn=', 'am=', 'cu='
    ]
    
    for pattern in payment_patterns:
        if pattern in qr_lower:
            return True
    
    return False

def check_payment_qr_heuristics(qr_data):
    """
    Analyze payment QR code for fraudulent patterns
    Returns: (is_fraudulent, risk_score, reasons, payment_info)
    """
    risk_score = 0
    reasons = []
    payment_info = {}
    
    try:
        qr_lower = qr_data.lower()
        
        # Extract UPI parameters if present
        if 'pa=' in qr_data:
            pa_match = re.search(r'pa=([^&\s]+)', qr_data, re.IGNORECASE)
            if pa_match:
                payment_info['payee_address'] = pa_match.group(1)
        
        if 'pn=' in qr_data:
            pn_match = re.search(r'pn=([^&\s]+)', qr_data, re.IGNORECASE)
            if pn_match:
                payment_info['payee_name'] = pn_match.group(1).replace('+', ' ')
        
        if 'am=' in qr_data:
            am_match = re.search(r'am=([^&\s]+)', qr_data, re.IGNORECASE)
            if am_match:
                payment_info['amount'] = am_match.group(1)
        
        # Check for suspicious patterns in payment QR
        
        # 1. Suspicious keywords in payee name
        suspicious_keywords = [
            'police', 'officer', 'cyber', 'crime', 'investigation',
            'arrest', 'warrant', 'court', 'legal', 'fine',
            'penalty', 'seized', 'frozen', 'blocked',
            'prize', 'lottery', 'winner', 'claim', 'reward',
            'refund', 'cashback', 'bonus', 'voucher',
            'verify', 'update', 'confirm', 'security'
        ]
        
        payee_name = payment_info.get('payee_name', '').lower()
        for keyword in suspicious_keywords:
            if keyword in payee_name or keyword in qr_lower:
                risk_score += 25
                reasons.append(f"Suspicious keyword in payment: '{keyword}'")
        
        # 2. Generic/suspicious UPI IDs
        payee_address = payment_info.get('payee_address', '').lower()
        if payee_address:
            # Personal account instead of merchant
            if '@' in payee_address:
                provider = payee_address.split('@')[-1]
                # Check if it's a personal account provider (not merchant)
                personal_providers = ['okaxis', 'okicici', 'okhdfcbank', 'oksbi', 'paytm']
                if any(p in provider for p in personal_providers):
                    risk_score += 15
                    reasons.append("Payment to personal account instead of merchant")
            
            # Random-looking UPI ID
            if re.search(r'\d{10}@', payee_address):
                risk_score += 10
                reasons.append("Payment to phone number-based UPI ID")
        
        # 3. Unusually high amount
        amount = payment_info.get('amount', '')
        if amount:
            try:
                amount_float = float(amount)
                if amount_float > 10000:
                    risk_score += 20
                    reasons.append(f"High payment amount: ₹{amount_float}")
                elif amount_float > 50000:
                    risk_score += 35
                    reasons.append(f"Very high payment amount: ₹{amount_float}")
            except ValueError:
                pass
        
        # 4. Urgent/threatening transaction notes
        if 'tn=' in qr_data:
            tn_match = re.search(r'tn=([^&\s]+)', qr_data, re.IGNORECASE)
            if tn_match:
                transaction_note = tn_match.group(1).lower()
                urgent_words = ['urgent', 'immediately', 'asap', 'now', 'quickly', 'hurry']
                for word in urgent_words:
                    if word in transaction_note:
                        risk_score += 15
                        reasons.append("Urgent/pressure language in transaction note")
                        break
        
        # 5. Missing merchant code (legitimate merchants usually have it)
        if 'mc=' not in qr_data and 'am=' in qr_data:
            risk_score += 10
            reasons.append("Missing merchant category code (unusual for businesses)")
        
        # 6. Multiple payment apps in same QR (unusual)
        payment_app_count = sum([1 for app in ['paytm', 'phonepe', 'gpay', 'amazonpay'] if app in qr_lower])
        if payment_app_count > 1:
            risk_score += 20
            reasons.append("Multiple payment apps in single QR (unusual)")
        
        is_fraudulent = risk_score >= 30
        
        return is_fraudulent, risk_score, reasons, payment_info
        
    except Exception as e:
        return False, 0, [f"Error analyzing payment QR: {str(e)}"], {}

def extract_and_analyze_qr(image_path):
    """
    Extract data from QR code and determine if it's URL or payment type
    Returns: (qr_data, qr_type, error)
    qr_type: 'url' or 'payment' or 'other'
    """
    try:
        # Read the image
        image = cv2.imread(image_path)
        if image is None:
            return None, None, "Failed to read image"
        
        # Decode QR codes
        decoded_objects = pyzbar.decode(image)
        
        if not decoded_objects:
            return None, None, "No QR code found in image"
        
        # Extract the first QR code data
        for obj in decoded_objects:
            qr_data = obj.data.decode('utf-8').strip()
            
            # Try to extract URL if it's embedded in other data (e.g., "316254    http://example.com")
            url_match = re.search(r'(https?://[^\s]+|www\.[^\s]+)', qr_data)
            if url_match:
                extracted_url = url_match.group(1)
                print(f"Extracted URL from QR data: {extracted_url}")
                qr_data = extracted_url
            
            # Determine QR type
            # Check for URL patterns (more flexible matching)
            if (qr_data.startswith('http://') or 
                qr_data.startswith('https://') or
                qr_data.startswith('www.') or
                re.match(r'^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}', qr_data)):
                
                # Normalize URL if it doesn't have http/https
                if not qr_data.startswith('http'):
                    if qr_data.startswith('www.'):
                        qr_data = 'http://' + qr_data
                    else:
                        # Check if it looks like a domain
                        if '.' in qr_data and not ' ' in qr_data:
                            qr_data = 'http://' + qr_data
                
                return qr_data, 'url', None
            elif is_payment_qr(qr_data):
                return qr_data, 'payment', None
            else:
                # Check if it might be a URL without protocol
                # Look for common domain patterns
                if re.search(r'\w+\.\w{2,}(/|$)', qr_data) and not is_payment_qr(qr_data):
                    # Likely a URL without protocol
                    if not qr_data.startswith('http'):
                        qr_data = 'http://' + qr_data
                    return qr_data, 'url', None
                
                return qr_data, 'other', None
        
        return None, None, "No data found in QR code"
    except Exception as e:
        return None, None, f"QR extraction failed: {str(e)}"

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
    Endpoint to extract and analyze QR code (payment or URL)
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
            # Extract and determine QR type
            qr_data, qr_type, error = extract_and_analyze_qr(filepath)
            
            if error:
                return jsonify({"error": error}), 400
            
            # Log for debugging
            print(f"QR Detection - Data: {qr_data[:100]}, Type: {qr_type}")
            
            # Handle based on QR type
            if qr_type == 'url':
                # Use URL fraud detection model
                result, status_code = predict_url(qr_data)
                result['extracted_from_qr'] = True
                result['qr_type'] = 'url'
                return jsonify(result), status_code
                
            elif qr_type == 'payment':
                # Use payment QR heuristics
                is_fraudulent, risk_score, reasons, payment_info = check_payment_qr_heuristics(qr_data)
                
                result = {
                    "qr_data": qr_data,
                    "qr_type": "payment",
                    "prediction": "malicious" if is_fraudulent else "safe",
                    "is_fraudulent": is_fraudulent,
                    "confidence": risk_score / 100,
                    "risk_score": risk_score,
                    "threat_type": "Fraudulent Payment" if is_fraudulent else "Legitimate Payment",
                    "warning_flags": reasons,
                    "payment_info": payment_info,
                    "extracted_from_qr": True
                }
                
                return jsonify(result), 200
                
            else:
                # Unknown QR type - try to analyze as URL anyway if it looks like it could be a link
                # This is a fallback for edge cases
                if len(qr_data) > 0 and not is_payment_qr(qr_data):
                    # Try treating it as a potential URL
                    try:
                        result, status_code = predict_url(qr_data)
                        result['extracted_from_qr'] = True
                        result['qr_type'] = 'url'
                        result['note'] = 'Analyzed as potential URL (format not standard)'
                        return jsonify(result), status_code
                    except:
                        pass
                
                # Truly unknown data
                return jsonify({
                    "qr_data": qr_data,
                    "qr_type": "other",
                    "prediction": "unknown",
                    "is_fraudulent": False,
                    "confidence": 0,
                    "message": "QR code contains non-URL and non-payment data. Data: " + qr_data[:100],
                    "extracted_from_qr": True
                }), 200
            
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
