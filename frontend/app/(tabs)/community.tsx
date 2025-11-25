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
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import { useAuth } from '../../contexts/AuthContext';
import { PostCard } from '../../components/PostCard';
import { Button } from '../../components/Button';
import { postService, Post } from '../../utils/postService';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows, animation } from '../../constants/theme';

const { width } = Dimensions.get('window');

export default function CommunityScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Animation values
  const fabScale = useSharedValue(0);
  const pulseAnim = useSharedValue(0);

  useEffect(() => {
    fabScale.value = withSpring(1, animation.spring);
    pulseAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000 }),
        withTiming(0, { duration: 2000 })
      ),
      -1,
      false
    );
  }, []);

  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.6 + pulseAnim.value * 0.4,
  }));

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

  const handleDelete = async (postId: string) => {
    try {
      await postService.deletePost(postId);
      setPosts((prev) => prev.filter((post) => post._id !== postId));
      Alert.alert('Success', 'Post deleted successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete post');
    }
  };

  const handleCreatePost = () => {
    router.push('/create-post');
  };

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.emptyContainer}>
            <LinearGradient
              colors={colors.gradientSecondary}
              style={styles.emptyIconContainer}
            >
              <Ionicons name="people-outline" size={56} color={colors.white} />
            </LinearGradient>
            <Text style={styles.emptyTitle}>Join the Community</Text>
            <Text style={styles.emptyText}>
              Login or register to view and share posts with other users
            </Text>
            <Button
              title="Login to Continue"
              onPress={() => router.push('/login')}
              style={styles.emptyButton}
            />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        {/* Modern Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <LinearGradient
                colors={colors.gradientSecondary}
                style={styles.headerIcon}
              >
                <Ionicons name="people" size={24} color={colors.white} />
              </LinearGradient>
              <View>
                <Text style={styles.title}>Community</Text>
                <Text style={styles.subtitle}>
                  {posts.length} {posts.length === 1 ? 'post' : 'posts'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Content */}
        {loading && posts.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading posts...</Text>
          </View>
        ) : posts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Animated.View entering={FadeIn.duration(500)}>
              <LinearGradient
                colors={colors.gradientPrimary}
                style={styles.emptyIconContainer}
              >
                <Ionicons name="chatbubbles-outline" size={56} color={colors.white} />
              </LinearGradient>
              <Text style={styles.emptyTitle}>No Posts Yet</Text>
              <Text style={styles.emptyText}>
                Be the first to share something with the community!
              </Text>
              <Animated.View style={pulseStyle}>
                <Button
                  title="Create First Post"
                  onPress={handleCreatePost}
                  style={styles.emptyButton}
                />
              </Animated.View>
            </Animated.View>
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
                onDelete={() => handleDelete(item._id)}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loading && posts.length > 0 ? (
                <View style={styles.footerLoader}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.footerText}>Loading more...</Text>
                </View>
              ) : null
            }
          />
        )}

        {/* Floating Action Button */}
        {user && (
          <Animated.View style={[styles.fab, fabStyle]}>
            <TouchableOpacity
              style={styles.fabButton}
              onPress={handleCreatePost}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={colors.gradientPrimary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.fabGradient}
              >
                <Ionicons name="add" size={32} color={colors.white} />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  headerContent: {
    gap: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs / 2,
  },
  listContent: {
    padding: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.xxxl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...shadows.xl,
  },
  emptyTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
    paddingHorizontal: spacing.lg,
  },
  emptyButton: {
    minWidth: 200,
    marginTop: spacing.md,
  },
  footerLoader: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  footerText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
  },
  fabButton: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    ...shadows.xxl,
  },
  fabGradient: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
