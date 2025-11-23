import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

export interface User {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

export const authService = {
  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    const response = await api.post('/auth/register', { username, email, password });
    const { token, user } = response.data;
    
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data;
    
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  },

  async getCurrentUser(): Promise<User | null> {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem('token');
    return !!token;
  },

  async getMe(): Promise<User> {
    const response = await api.get('/auth/me');
    const { user } = response.data;
    await AsyncStorage.setItem('user', JSON.stringify(user));
    return user;
  },
};
