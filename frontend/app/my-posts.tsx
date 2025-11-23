import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { PostCard } from '../components/PostCard';
import { postService, Post } from '../utils/postService';
import { colors, spacing, fontSize, fontWeight } from '../constants/theme';

export default function MyPostsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMyPosts = async (refresh: boolean = false) => {
    if (!user) return;

    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await postService.getPosts(1, 100);
      
      // Filter posts to show only current user's posts
      const myPosts = response.posts.filter(post => post.userId._id === user.id);
      setPosts(myPosts);
    } catch (error) {
      Alert.alert('Error', 'Failed to load your posts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMyPosts();
  }, [user]);

  const handleRefresh = () => {
    loadMyPosts(true);
  };

  const handleLike = async (postId: string) => {
    try {
      await postService.likePost(postId);
      loadMyPosts(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to like post');
    }
  };

  const handleComment = (postId: string) => {
    router.push(`/post/${postId}`);
  };

  const handleDelete = (postId: string) => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await postService.deletePost(postId);
              Alert.alert('Success', 'Post deleted successfully');
              loadMyPosts(true);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete post');
            }
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Posts</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="lock-closed-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>Not Logged In</Text>
          <Text style={styles.emptyText}>Please login to view your posts</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Posts</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your posts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Posts</Text>
        <View style={styles.placeholder} />
      </View>

      {posts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>No Posts Yet</Text>
          <Text style={styles.emptyText}>
            Share your fraud detection results with the community
          </Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onLike={() => handleLike(item._id)}
              onComment={() => handleComment(item._id)}
              onDelete={() => handleDelete(item._id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Ionicons name="document-text" size={24} color={colors.primary} />
                <Text style={styles.statNumber}>{posts.length}</Text>
                <Text style={styles.statLabel}>Total Posts</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="heart" size={24} color={colors.accent} />
                <Text style={styles.statNumber}>
                  {posts.reduce((acc, post) => acc + post.likes.length, 0)}
                </Text>
                <Text style={styles.statLabel}>Total Likes</Text>
              </View>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  listContent: {
    padding: spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surfaceCard,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statNumber: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
