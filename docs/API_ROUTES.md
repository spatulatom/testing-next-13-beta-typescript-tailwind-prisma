# API Routes Documentation

This document outlines all API routes and their usage.

## Authentication Routes

### GET `/api/auth/signin`
- **Purpose:** NextAuth.js authentication signin endpoint
- **Provider:** Google OAuth
- **Returns:** Redirect to Google login

### GET/POST `/api/auth/callback/google`
- **Purpose:** Google OAuth callback handler
- **Returns:** Session token or redirect to home

## Post Routes

### GET `/api/(home-page)/addpost`
- **Purpose:** Fetch all posts
- **Returns:** JSON array of posts with user, comments, likes data
- **Cache:** Tagged with `all-posts`

### POST `/api/(home-page)/addpost`
- **Purpose:** Create a new post
- **Auth Required:** Yes (NextAuth session)
- **Body:** `{ "title": string (max 50 chars) }`
- **Validation:** 
  - User must be authenticated
  - Post title sanitized (HTML tags removed)
  - Post length 1-50 characters
- **Cache Invalidation:** Revalidates `/` and `all-posts` tag

## Comment Routes

### POST `/api/(post-page)/addcomment`
- **Purpose:** Add a comment to a post
- **Auth Required:** Yes (NextAuth session)
- **Body:** `{ "id": postId, "title": comment text (max 30 chars) }`
- **Validation:**
  - User must be authenticated
  - Comment length 1-30 characters
  - HTML sanitization applied
- **Cache Invalidation:** Revalidates post-specific pages and tags

## Delete Routes

### DELETE `/api/(userposts-page)/deletepost/[id]`
- **Purpose:** Delete a post and all associated comments
- **Auth Required:** Yes (NextAuth session)
- **Params:** `id` - Post ID to delete
- **Authorization:** User must be post owner
- **Cache Invalidation:** Revalidates `/`, `/userposts`, and all related tags

## Error Handling

All endpoints follow standard HTTP status codes:
- `200/201` - Success
- `400` - Bad request (invalid input)
- `403` - Forbidden (auth failed, not authorized)
- `404` - Not found
- `500` - Server error

## Rate Limiting

Currently no rate limiting implemented. Consider adding for production.

## Security

- All user inputs are HTML-sanitized
- Authentication required for mutations
- SQL injection prevented through Prisma ORM
- CSRF protection handled by NextAuth.js
