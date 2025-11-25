import api from './api';

export interface OtpResponse {
  message: string;
}

export const otpService = {
  // Send OTP to email
  sendOtp: async (email: string, skipUserCheck: boolean = false): Promise<OtpResponse> => {
    try {
      const response = await api.post('/otp/send', { email, skipUserCheck });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send OTP');
    }
  },

  // Verify OTP
  verifyOtp: async (email: string, otp: string): Promise<OtpResponse> => {
    try {
      const response = await api.post('/otp/verify', { email, otp });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to verify OTP');
    }
  },

  // Resend OTP
  resendOtp: async (email: string): Promise<OtpResponse> => {
    try {
      const response = await api.post('/otp/resend', { email });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to resend OTP');
    }
  },
};
