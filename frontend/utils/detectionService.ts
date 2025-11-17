import api from './api';

export interface DetectionResult {
  url?: string;
  qr_data?: string;
  qr_type?: 'url' | 'payment' | 'other';
  prediction: 'safe' | 'malicious' | 'unknown';
  confidence: number;
  is_fraudulent: boolean;
  extracted_from_qr?: boolean;
  risk_score?: number;
  threat_type?: string;
  ml_prediction?: string;
  ml_confidence?: number;
  heuristic_check?: string;
  warning_flags?: string[];
  payment_info?: {
    payee_address?: string;
    payee_name?: string;
    amount?: string;
  };
}

export const detectionService = {
  async detectLink(url: string): Promise<DetectionResult> {
    const response = await api.post('/detect/link', { url });
    return response.data;
  },

  async detectQR(imageUri: string): Promise<DetectionResult> {
    const formData = new FormData();
    
    // Extract filename from URI
    const filename = imageUri.split('/').pop() || 'qr-code.jpg';
    
    // @ts-ignore
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: filename,
    });

    const response = await api.post('/detect/qr', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
};
