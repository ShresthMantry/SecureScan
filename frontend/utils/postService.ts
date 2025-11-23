import api from './api';

export interface Comment {
  userId: {
    _id: string;
    username: string;
    isAdmin?: boolean;
  };
  text: string;
  createdAt: string;
  _id: string;
}

export interface Post {
  _id: string;
  userId: {
    _id: string;
    username: string;
    email: string;
    isAdmin?: boolean;
  };
  content: string;
  image?: string;
  likes: string[];
  comments: Comment[];
  createdAt: string;
}

export interface PostsResponse {
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const postService = {
  async getPosts(page: number = 1, limit: number = 20): Promise<PostsResponse> {
    const response = await api.get(`/posts?page=${page}&limit=${limit}`);
    return response.data;
  },

  async getPost(id: string): Promise<Post> {
    const response = await api.get(`/posts/${id}`);
    return response.data.post;
  },

  async createPost(content: string, image?: string): Promise<Post> {
    const response = await api.post('/posts', { content, image });
    return response.data.post;
  },

  async updatePost(id: string, content: string, image?: string): Promise<Post> {
    const response = await api.put(`/posts/${id}`, { content, image });
    return response.data.post;
  },

  async deletePost(id: string): Promise<void> {
    await api.delete(`/posts/${id}`);
  },

  async likePost(id: string): Promise<{ post: Post; liked: boolean }> {
    const response = await api.post(`/posts/${id}/like`);
    return response.data;
  },

  async addComment(id: string, text: string): Promise<Post> {
    const response = await api.post(`/posts/${id}/comment`, { text });
    return response.data.post;
  },

  async deleteComment(postId: string, commentId: string): Promise<Post> {
    const response = await api.delete(`/posts/${postId}/comment/${commentId}`);
    return response.data.post;
  },

  async getUserPosts(userId: string): Promise<Post[]> {
    const response = await api.get(`/posts/user/${userId}`);
    return response.data.posts;
  },
};
