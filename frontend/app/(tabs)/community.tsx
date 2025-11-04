import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { PostCard } from '../../components/PostCard';
import { Button } from '../../components/Button';
import { postService, Post } from '../../utils/postService';
import { colors, spacing, fontSize, fontWeight } from '../../constants/theme';

export default function CommunityScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadPosts = async (pageNum: number = 1, refresh: boolean = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else if (pageNum === 1) {
        setLoading(true);
      }

      const response = await postService.getPosts(pageNum, 20);
      
      if (refresh || pageNum === 1) {
        setPosts(response.posts);
      } else {
        setPosts((prev) => [...prev, ...response.posts]);
      }

      setHasMore(response.pagination.page < response.pagination.pages);
    } catch (error) {
      Alert.alert('Error', 'Failed to load posts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadPosts();
    }
  }, [user]);

  // Refresh posts when screen comes into focus (e.g., after creating a post)
  useFocusEffect(
    useCallback(() => {
      if (user) {
        setPage(1);
        loadPosts(1, true);
      }
    }, [user])
  );

  const handleRefresh = useCallback(() => {
    setPage(1);
    loadPosts(1, true);
  }, []);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadPosts(nextPage);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const response = await postService.likePost(postId);
      setPosts((prev) =>
        prev.map((post) => (post._id === postId ? response.post : post))
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to like post');
    }
  };

  const handleComment = (postId: string) => {
    router.push(`/post/${postId}`);
  };

  const handleCreatePost = () => {
    router.push('/create-post');
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>Join the Community</Text>
          <Text style={styles.emptyText}>
            Login or register to view and share posts
          </Text>
          <Button
            title="Login"
            onPress={() => router.push('/login')}
            style={styles.emptyButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Community</Text>
        <Button
          title="Create Post"
          onPress={handleCreatePost}
          style={styles.createButton}
        />
      </View>

      {loading && posts.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : posts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>No Posts Yet</Text>
          <Text style={styles.emptyText}>
            Be the first to share something with the community!
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
              onPress={() => handleComment(item._id)}
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
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading && posts.length > 0 ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : null
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  createButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  listContent: {
    padding: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: spacing.xl,
  },
  emptyButton: {
    minWidth: 150,
  },
  footerLoader: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});
