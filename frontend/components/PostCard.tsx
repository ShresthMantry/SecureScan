import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Post } from '../utils/postService';
import { colors, borderRadius, spacing, fontSize, fontWeight } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { Badge } from './Badge';

interface PostCardProps {
  post: Post;
  onLike: () => void;
  onComment: () => void;
  onShare?: () => void;
  onPress?: () => void;
  onDelete?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onComment,
  onShare,
  onPress,
  onDelete,
}) => {
  const { user } = useAuth();
  const isLiked = user ? post.likes.includes(user.id) : false;
  const canDelete = user && (user.id === post.userId._id || user.isAdmin);

  const handleDelete = () => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete?.(),
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {post.userId.username.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.headerText}>
          <View style={styles.usernameRow}>
            <Text style={styles.username}>{post.userId.username}</Text>
            {post.userId.isAdmin && (
              <Badge
                label="Admin"
                variant="primary"
                size="sm"
                icon="shield-checkmark"
              />
            )}
          </View>
          <Text style={styles.timestamp}>{formatDate(post.createdAt)}</Text>
        </View>
        {canDelete && (
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.content}>{post.content}</Text>

      {post.image && (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>Image: {post.image}</Text>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={onLike}>
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={22}
            color={isLiked ? colors.primary : colors.text}
          />
          <Text style={styles.actionText}>{post.likes.length}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onComment}>
          <Ionicons name="chatbubble-outline" size={22} color={colors.text} />
          <Text style={styles.actionText}>{post.comments.length}</Text>
        </TouchableOpacity>

        {onShare && (
          <TouchableOpacity style={styles.actionButton} onPress={onShare}>
            <Ionicons name="share-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  deleteButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  avatarText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  headerText: {
    flex: 1,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  username: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  timestamp: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  content: {
    color: colors.text,
    fontSize: fontSize.md,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  imagePlaceholder: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  imagePlaceholderText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  actionText: {
    color: colors.text,
    fontSize: fontSize.sm,
    marginLeft: spacing.xs,
  },
});
