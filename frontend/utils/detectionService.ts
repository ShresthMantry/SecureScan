import api from './api';

export interface DetectionResult {
  url: string;
  prediction: 'safe' | 'malicious';
  confidence: number;
  is_fraudulent: boolean;
  extracted_from_qr?: boolean;
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
