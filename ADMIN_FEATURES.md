# Admin Features Documentation

## Overview
SecureScan now includes comprehensive admin functionality with special privileges for managing user-generated content.

## Admin User
**Admin Email:** `shresthmantry72003@gmail.com`

This email is automatically granted admin privileges when registered. The admin status is set automatically in the database.

## Admin Capabilities

### 1. Delete Any Post
- Admin can delete posts created by any user
- Delete button (trash icon) appears on all posts for the admin
- Confirmation dialog prevents accidental deletions
- Available in:
  - Community feed
  - Post detail page
  - My Posts page

### 2. Delete Any Comment
- Admin can delete comments made by any user on any post
- Delete button appears next to all comments for the admin
- Confirmation dialog for safety
- Available in:
  - Post detail page (when viewing individual posts)

### 3. User Permissions
Regular users have these permissions:
- Delete their own posts
- Delete their own comments
- Cannot delete other users' content

## Implementation Details

### Backend Changes

#### User Model (`backend/models/User.js`)
```javascript
{
  isAdmin: {
    type: Boolean,
    default: false
  }
}
```
- Added `isAdmin` field to user schema
- Pre-save hook automatically sets `isAdmin: true` for `shresthmantry72003@gmail.com`

#### Auth Routes (`backend/routes/auth.js`)
- Updated `/register`, `/login`, and `/me` endpoints to return `isAdmin` status
- Frontend can check admin status from user object

#### Posts Routes (`backend/routes/posts.js`)
- **DELETE /api/posts/:id** - Delete post (Owner or Admin)
- **DELETE /api/posts/:id/comment/:commentId** - Delete comment (Owner or Admin)
- Both endpoints check if user is owner OR admin before allowing deletion

### Frontend Changes

#### Auth Service (`frontend/utils/authService.ts`)
```typescript
export interface User {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;  // Added
  createdAt: string;
}
```

#### Post Service (`frontend/utils/postService.ts`)
- Added `deleteComment(postId, commentId)` method
- Existing `deletePost(postId)` method already present

#### UI Components

##### PostCard Component (`frontend/components/PostCard.tsx`)
- Shows delete button (trash icon) in header for:
  - Post owner
  - Admin users
- Confirmation dialog before deletion
- Error handling with user feedback

##### Post Detail Page (`frontend/app/post/[id].tsx`)
- Delete button appears next to each comment for:
  - Comment owner
  - Admin users
- Confirmation dialog before deletion
- Automatically refreshes post data after deletion

##### Community Page (`frontend/app/(tabs)/community.tsx`)
- Integrated delete functionality
- Removes deleted posts from list immediately
- Success/error alerts

##### My Posts Page (`frontend/app/my-posts.tsx`)
- Delete functionality for user's own posts
- Already had delete handler, now passes to PostCard

## User Experience

### For Admin
1. **Visual Indicator**: Delete buttons (trash icon) appear on all posts and comments
2. **Confirmation**: Alert dialog asks for confirmation before deletion
3. **Feedback**: Success or error messages after action
4. **Icon Color**: Delete icon appears in red (error color)

### For Regular Users
1. **Own Content**: Delete buttons appear only on their own posts/comments
2. **Same Flow**: Same confirmation and feedback as admin
3. **No Access**: Cannot see delete buttons on other users' content

## Security

### Authorization Checks
- Backend validates user permissions before deletion
- Checks both ownership and admin status
- Returns 403 Forbidden if unauthorized

### Frontend Safety
- Confirmation dialogs prevent accidental deletions
- Optimistic UI updates (immediate feedback)
- Error handling with retry capability

## Testing the Feature

### As Admin
1. Register/Login with `shresthmantry72003@gmail.com`
2. Navigate to Community page
3. You should see delete buttons on all posts
4. Click any post to view comments
5. Delete buttons should appear on all comments

### As Regular User
1. Register/Login with any other email
2. Create a post or comment
3. You should only see delete buttons on your own content
4. Other users' content should not have delete buttons visible to you

## API Endpoints

### Delete Post
```
DELETE /api/posts/:id
Authorization: Bearer <token>
```
**Response:**
```json
{
  "message": "Post deleted successfully"
}
```

### Delete Comment
```
DELETE /api/posts/:postId/comment/:commentId
Authorization: Bearer <token>
```
**Response:**
```json
{
  "message": "Comment deleted successfully",
  "post": { /* updated post object */ }
}
```

## Database Schema Updates

The User collection now includes:
```json
{
  "_id": "...",
  "username": "string",
  "email": "string",
  "password": "hashed_string",
  "isAdmin": false,
  "createdAt": "date"
}
```

For `shresthmantry72003@gmail.com`, `isAdmin` is automatically set to `true`.

## Notes

- Admin status is permanent once set
- Only one admin email is configured
- To add more admins, modify the pre-save hook in `User.js`
- Deleted content is permanently removed (no soft delete)
- Consider adding an audit log in production for tracking deletions

## Future Enhancements

Potential improvements:
- Multiple admin users
- Role-based permissions (moderator, admin, super admin)
- Soft delete with restore functionality
- Admin dashboard with statistics
- Audit log for admin actions
- Ban/suspend user functionality
- Content moderation queue
