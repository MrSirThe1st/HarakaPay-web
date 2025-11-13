# Domain Setup Guide for HarakaPay

This guide will walk you through connecting your Squarespace domain to your HarakaPay web application and updating your mobile app to use the new domain.

## Prerequisites

- Domain purchased on Squarespace
- Web application deployed (likely on Vercel based on your `vercel.json`)
- Access to your hosting platform (Vercel, Netlify, etc.)
- Access to Squarespace domain settings

---

## Step 1: Configure DNS in Squarespace

### Option A: Using Squarespace DNS (Recommended)

1. **Log into Squarespace**
   - Go to [squarespace.com](https://www.squarespace.com) and log in
   - Navigate to **Settings** → **Domains**

2. **Select Your Domain**
   - Click on the domain you want to use
   - Go to **DNS Settings** or **Advanced DNS Settings**

3. **Add DNS Records**
   You'll need to add the following records based on your hosting platform:

   **For Vercel:**
   - **A Record**: 
     - Name: `@` (or leave blank for root domain)
     - Value: `76.76.21.21`
     - TTL: 3600 (or default)
   
   - **CNAME Record** (for www subdomain):
     - Name: `www`
     - Value: `cname.vercel-dns.com.`
     - TTL: 3600

   **For Other Platforms:**
   - Check your hosting provider's documentation for their DNS records
   - Common patterns:
     - A Record pointing to an IP address
     - CNAME Record pointing to a hostname

4. **Save Changes**
   - DNS changes can take 24-48 hours to propagate, but usually work within a few hours

### Option B: Using External DNS (Advanced)

If you prefer to use external DNS providers (like Cloudflare, Google DNS, etc.):

1. In Squarespace, change your domain's nameservers to your DNS provider
2. Configure DNS records in your DNS provider's dashboard
3. Follow the same record types as above

---

## Step 2: Add Domain to Your Hosting Platform

### If Using Vercel:

1. **Log into Vercel**
   - Go to [vercel.com](https://vercel.com) and log in
   - Select your HarakaPay project

2. **Add Domain**
   - Go to **Settings** → **Domains**
   - Click **Add Domain**
   - Enter your domain (e.g., `yourdomain.com`)
   - Click **Add**

3. **Add www Subdomain** (Optional but recommended)
   - Click **Add Domain** again
   - Enter `www.yourdomain.com`
   - Vercel will automatically configure redirects

4. **Verify DNS Configuration**
   - Vercel will show you the DNS records needed
   - Make sure they match what you configured in Squarespace
   - Wait for DNS propagation (check status in Vercel dashboard)

5. **SSL Certificate**
   - Vercel automatically provisions SSL certificates
   - Wait for the certificate to be issued (usually a few minutes)

### If Using Other Platforms:

- **Netlify**: Settings → Domain management → Add custom domain
- **AWS/Azure/GCP**: Follow platform-specific domain configuration guides
- **Self-hosted**: Configure your web server (Nginx/Apache) with the domain

---

## Step 3: Update Web Application Configuration

### Update Next.js Configuration (if needed)

Your `next.config.ts` should automatically work with the new domain. However, if you have any hardcoded URLs, update them:

1. **Check for hardcoded URLs** in your codebase:
   ```bash
   grep -r "localhost:3000" src/
   grep -r "192.168" src/
   grep -r "http://" src/
   ```

2. **Update environment variables** (if using `.env.local`):
   ```env
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   ```

3. **Update Supabase Redirect URLs** (if using Supabase Auth):
   - Go to your Supabase dashboard
   - Navigate to **Authentication** → **URL Configuration**
   - Add your new domain to:
     - **Site URL**: `https://yourdomain.com`
     - **Redirect URLs**: 
       - `https://yourdomain.com/auth/callback`
       - `https://www.yourdomain.com/auth/callback`

---

## Step 4: Update Mobile App Configuration

Your mobile app needs to point to the new domain instead of the local IP address.

### Update app.json

1. **Edit** `/Users/marcim/HarakaPay-mobile/harakapay-mobile/app.json`

2. **Update the `WEB_API_URL`** in the `extra` section:
   ```json
   "extra": {
     "SUPABASE_URL": "https://apdeuckmufukrnuffetv.supabase.co",
     "SUPABASE_ANON_KEY": "your-key-here",
     "SUPABASE_SERVICE_ROLE_KEY": "your-key-here",
     "PAYMENT_API_URL": "",
     "WEB_API_URL": "https://yourdomain.com"  // ← Update this
   }
   ```

### Update Environment Configuration

1. **Edit** `/Users/marcim/HarakaPay-mobile/harakapay-mobile/src/config/env.ts`

2. The default fallback URL should be updated (optional, since app.json takes precedence):
   ```typescript
   export const WEB_API_URL = extra.WEB_API_URL || 'https://yourdomain.com';
   ```

### Rebuild Mobile App

After updating the configuration:

```bash
cd /Users/marcim/HarakaPay-mobile/harakapay-mobile
# Clear cache and rebuild
npx expo start --clear
# Or for production build
eas build --platform ios
eas build --platform android
```

---

## Step 5: Test Your Setup

### Test Web Application

1. **Check DNS Propagation**
   ```bash
   # Check if DNS is resolving
   nslookup yourdomain.com
   dig yourdomain.com
   ```

2. **Test Website**
   - Visit `https://yourdomain.com` in your browser
   - Check that SSL certificate is valid (padlock icon)
   - Test all major features (login, API calls, etc.)

3. **Test API Endpoints**
   ```bash
   curl https://yourdomain.com/api/test
   ```

### Test Mobile App

1. **Update and Rebuild**
   - Make sure you've updated `app.json` with the new domain
   - Rebuild the app with the new configuration

2. **Test API Connectivity**
   - Open the mobile app
   - Try logging in
   - Test API calls (notifications, payments, etc.)
   - Check that all features work correctly

---

## Step 6: Update Any Additional Services

### Update Supabase Configuration

If you're using Supabase:

1. **Update Site URL** in Supabase Dashboard:
   - Authentication → URL Configuration
   - Set Site URL to: `https://yourdomain.com`

2. **Update Redirect URLs**:
   - Add: `https://yourdomain.com/**`
   - Add: `https://www.yourdomain.com/**`

### Update Payment Gateway (if applicable)

If you're using payment gateways (M-Pesa, Stripe, etc.):

1. **Update Webhook URLs**:
   - Point webhooks to: `https://yourdomain.com/api/payments/webhook`
   - Update in your payment provider's dashboard

2. **Update Callback URLs**:
   - Update any callback URLs to use the new domain

### Update Email Services

If you're sending emails (password reset, notifications, etc.):

1. **Update Email Templates**:
   - Replace any `localhost` or IP addresses with your domain
   - Update links in email templates

---

## Troubleshooting

### DNS Not Resolving

- **Wait**: DNS changes can take up to 48 hours (usually much faster)
- **Check**: Use `nslookup` or `dig` to verify DNS records
- **Verify**: Make sure DNS records in Squarespace match your hosting provider's requirements

### SSL Certificate Issues

- **Vercel**: SSL certificates are automatic, wait a few minutes after adding domain
- **Other platforms**: Follow platform-specific SSL setup instructions
- **Check**: Ensure your domain is properly verified

### Mobile App Can't Connect

- **Verify**: Check that `WEB_API_URL` in `app.json` is correct
- **Rebuild**: Make sure you've rebuilt the app after changes
- **Test**: Use a tool like Postman to test API endpoints directly
- **Check CORS**: Ensure your web server allows requests from your mobile app

### API Calls Failing

- **CORS**: Check CORS settings in your Next.js API routes
- **Environment Variables**: Verify all environment variables are set correctly
- **Network**: Test API endpoints directly in a browser or Postman

---

## Security Checklist

- [ ] SSL certificate is active and valid
- [ ] All HTTP traffic redirects to HTTPS
- [ ] Environment variables are secure (not committed to git)
- [ ] API keys are properly secured
- [ ] CORS is configured correctly
- [ ] Supabase redirect URLs are updated
- [ ] Payment webhooks are updated
- [ ] Email templates use the new domain

---

## Next Steps

1. **Monitor**: Keep an eye on your application for the first few days
2. **Analytics**: Set up analytics (Google Analytics, Vercel Analytics, etc.)
3. **Backup**: Ensure you have backups of your configuration
4. **Documentation**: Update any internal documentation with the new domain

---

## Support Resources

- **Vercel Domains**: https://vercel.com/docs/concepts/projects/domains
- **Squarespace DNS**: https://support.squarespace.com/hc/en-us/articles/205812668
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Expo Configuration**: https://docs.expo.dev/guides/environment-variables/

---

## Quick Reference

**Your Domain**: `yourdomain.com` (replace with your actual domain)

**Web App URL**: `https://yourdomain.com`

**API Base URL**: `https://yourdomain.com/api`

**Mobile App Config**: Update `WEB_API_URL` in `app.json` to `https://yourdomain.com`

