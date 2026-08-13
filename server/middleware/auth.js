import { getAuth } from '@clerk/express';

/**
 * Clerk Authentication Middleware
 * Resolves the authenticated user session and attaches `req.authUserId`.
 */
export function requireClerkAuth(req, res, next) {
  try {
    // If authUserId already populated (e.g. testing), proceed
    if (req.authUserId) {
      return next();
    }

    // Check if Clerk Secret Key is configured
    const hasClerkSecret = Boolean(process.env.CLERK_SECRET_KEY);

    if (hasClerkSecret) {
      const auth = getAuth(req);
      if (!auth || !auth.userId) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'A valid Clerk authentication session token is required.'
        });
      }
      req.authUserId = auth.userId;
      return next();
    }

    // Development / Demo fallback if Clerk secret key is not provided in .env
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // In demo mode without clerk secret key, identify session
      req.authUserId = 'authenticated_user';
    } else {
      req.authUserId = req.headers['x-user-id'] || 'demo-user';
    }

    next();
  } catch (err) {
    console.error('[Auth Middleware] Verification error:', err.message);
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Failed to verify authentication token.'
    });
  }
}

export default requireClerkAuth;
