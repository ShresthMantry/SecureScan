# Testing Admin Features - Quick Guide

## Prerequisites
1. Backend server running on port 3000
2. ML service running on port 5001
3. MongoDB connected
4. Frontend app running (Expo)

## Test Scenarios

### Scenario 1: Test Admin User Setup
**Objective:** Verify admin status is set correctly

1. Register new user with admin email:
   ```
   Email: shresthmantry72003@gmail.com
   Username: admin
   Password: admin123
   ```

2. Expected Result:
   - Registration successful
   - User object contains `isAdmin: true`
   - Login returns user with `isAdmin: true`

### Scenario 2: Test Admin Delete Post
**Objective:** Admin can delete any user's post

**Setup:**
1. Login as regular user (user1@test.com)
2. Create a post: "Test post from user1"
3. Logout

**Test:**
1. Login as admin (shresthmantry72003@gmail.com)
2. Navigate to Community page
3. Find the post created by user1
4. Verify delete button (trash icon) appears in post header
5. Click delete button
6. Confirm deletion in alert dialog
7. Expected: Post is deleted, removed from feed
8. Success message appears

### Scenario 3: Test User Delete Own Post
**Objective:** Regular user can delete their own post

1. Login as regular user (user1@test.com)
2. Navigate to Community page or My Posts
3. Find your own post
4. Verify delete button appears
5. Click delete and confirm
6. Expected: Post deleted successfully

### Scenario 4: Test User Cannot Delete Other's Post
**Objective:** Regular user cannot delete other users' posts

1. Login as user1 (user1@test.com)
2. Navigate to Community page
3. Find posts by other users (not user1)
4. Expected: NO delete button visible on other users' posts
5. Only see delete buttons on own posts

### Scenario 5: Test Admin Delete Comment
**Objective:** Admin can delete any comment

**Setup:**
1. Login as user2 (user2@test.com)
2. Find any post and add comment: "Test comment from user2"
3. Logout

**Test:**
1. Login as admin (shresthmantry72003@gmail.com)
2. Navigate to the same post (click to view details)
3. Find the comment by user2
4. Verify delete button (trash icon) appears next to comment
5. Click delete button
6. Confirm deletion
7. Expected: Comment deleted, post refreshed without that comment
8. Success message appears

### Scenario 6: Test User Delete Own Comment
**Objective:** Regular user can delete their own comment

1. Login as user1 (user1@test.com)
2. Navigate to any post
3. Add a comment: "My test comment"
4. Verify delete button appears next to your comment
5. Click delete and confirm
6. Expected: Comment deleted successfully

### Scenario 7: Test User Cannot Delete Other's Comment
**Objective:** Regular user cannot delete other users' comments

1. Login as user1 (user1@test.com)
2. Navigate to a post with comments from other users
3. Expected: NO delete button visible on other users' comments
4. Only see delete button on own comments

### Scenario 8: Test Confirmation Dialogs
**Objective:** Confirm all deletions show safety dialogs

1. Login as admin or regular user
2. Try to delete a post
3. Expected: Alert appears with:
   - Title: "Delete Post"
   - Message: "Are you sure you want to delete this post?"
   - Buttons: "Cancel" and "Delete"
4. Click Cancel - nothing happens
5. Try again and click Delete - post is deleted

6. Try to delete a comment
7. Expected: Alert appears with:
   - Title: "Delete Comment"
   - Message: "Are you sure you want to delete this comment?"
   - Buttons: "Cancel" and "Delete"

### Scenario 9: Test Backend Authorization
**Objective:** Verify backend blocks unauthorized deletions

**Using API Client (Postman/Insomnia):**

1. Register and login as user1, save token
2. Create a post by user1, note the post ID
3. Register and login as user2, save token
4. Try to delete user1's post using user2's token:
   ```
   DELETE /api/posts/{post_id}
   Authorization: Bearer {user2_token}
   ```
5. Expected: 403 Forbidden error
6. Message: "Not authorized to delete this post"

7. Try same with admin token:
   ```
   DELETE /api/posts/{post_id}
   Authorization: Bearer {admin_token}
   ```
8. Expected: 200 Success, post deleted

### Scenario 10: Test Multiple Users
**Objective:** Verify isolation between users

1. Create 3 users:
   - Admin: shresthmantry72003@gmail.com
   - User1: user1@test.com
   - User2: user2@test.com

2. Each user creates 2 posts with comments

3. Login as User1:
   - Can delete: User1's 2 posts, User1's comments
   - Cannot delete: User2's posts/comments, Admin's posts/comments
   - Delete buttons only visible on User1's content

4. Login as Admin:
   - Can delete: All posts and all comments
   - Delete buttons visible on all content

## Expected Behaviors Summary

### Delete Button Visibility
| User Type | Own Posts | Others' Posts | Own Comments | Others' Comments |
|-----------|-----------|---------------|--------------|------------------|
| Regular   | ✓ Visible | ✗ Hidden      | ✓ Visible    | ✗ Hidden         |
| Admin     | ✓ Visible | ✓ Visible     | ✓ Visible    | ✓ Visible        |

### API Authorization
| User Type | Delete Own | Delete Others |
|-----------|------------|---------------|
| Regular   | ✓ Allow    | ✗ 403 Error   |
| Admin     | ✓ Allow    | ✓ Allow       |

## Troubleshooting

### Issue: Admin user not showing isAdmin: true
**Solution:** 
- Check User.js pre-save hook is in place
- Delete existing admin user from database
- Re-register with admin email
- Verify email is exactly: shresthmantry72003@gmail.com

### Issue: Delete buttons not showing
**Solution:**
- Check user object in frontend has isAdmin field
- Verify AuthContext is updated
- Check console for user object: `console.log(user)`
- Ensure frontend is connected to updated backend

### Issue: 403 error when admin tries to delete
**Solution:**
- Check auth middleware passes req.user with all fields
- Verify backend routes check req.user.isAdmin
- Check token is valid and not expired

### Issue: Post/comment not deleted
**Solution:**
- Check browser console for errors
- Verify API endpoint is correct
- Check post/comment IDs are correct
- Ensure deletePost/deleteComment methods are called

## Test Checklist

- [ ] Admin user registration sets isAdmin: true
- [ ] Admin can see delete buttons on all posts
- [ ] Admin can delete any post successfully
- [ ] Admin can see delete buttons on all comments
- [ ] Admin can delete any comment successfully
- [ ] Regular user sees delete button only on own posts
- [ ] Regular user can delete own posts
- [ ] Regular user cannot see delete button on others' posts
- [ ] Regular user sees delete button only on own comments
- [ ] Regular user can delete own comments
- [ ] Regular user cannot see delete button on others' comments
- [ ] Confirmation dialogs appear for all deletions
- [ ] Backend returns 403 when unauthorized user tries to delete
- [ ] Backend allows admin to delete any content
- [ ] Deleted posts removed from feed immediately
- [ ] Deleted comments removed from post immediately
- [ ] Success/error messages display correctly

## API Testing Commands (cURL)

### Register Admin
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "shresthmantry72003@gmail.com",
    "password": "admin123"
  }'
```

### Login as Admin
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "shresthmantry72003@gmail.com",
    "password": "admin123"
  }'
```

### Delete Post (with admin token)
```bash
curl -X DELETE http://localhost:3000/api/posts/{POST_ID} \
  -H "Authorization: Bearer {ADMIN_TOKEN}"
```

### Delete Comment (with admin token)
```bash
curl -X DELETE http://localhost:3000/api/posts/{POST_ID}/comment/{COMMENT_ID} \
  -H "Authorization: Bearer {ADMIN_TOKEN}"
```

## Next Steps After Testing

1. If all tests pass, admin features are ready for use
2. Consider adding admin badge/indicator in UI
3. Monitor for any edge cases in production
4. Plan for additional admin features if needed
