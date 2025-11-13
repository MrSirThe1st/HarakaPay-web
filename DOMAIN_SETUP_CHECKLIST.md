# Domain Setup Checklist

Use this checklist to track your progress connecting your Squarespace domain.

## Pre-Setup
- [ ] Domain purchased on Squarespace
- [ ] Access to Squarespace account
- [ ] Access to hosting platform (Vercel/Netlify/etc.)
- [ ] Know your hosting platform's DNS requirements

## Step 1: DNS Configuration (Squarespace)
- [ ] Logged into Squarespace
- [ ] Navigated to Settings → Domains
- [ ] Selected your domain
- [ ] Added A Record (for root domain)
- [ ] Added CNAME Record (for www subdomain)
- [ ] Saved DNS changes
- [ ] Waited for DNS propagation (check with `nslookup yourdomain.com`)

## Step 2: Hosting Platform Setup
- [ ] Logged into hosting platform (Vercel/Netlify/etc.)
- [ ] Added custom domain to project
- [ ] Added www subdomain (if applicable)
- [ ] Verified DNS records match
- [ ] SSL certificate issued and active
- [ ] Tested website loads at `https://yourdomain.com`

## Step 3: Web App Updates
- [ ] Updated Supabase Site URL
- [ ] Updated Supabase Redirect URLs
- [ ] Checked for hardcoded URLs in codebase
- [ ] Updated environment variables (if needed)
- [ ] Tested all web app features

## Step 4: Mobile App Updates
- [ ] Updated `app.json` - `WEB_API_URL` to new domain
- [ ] Updated `src/config/env.ts` - fallback URL (optional)
- [ ] Rebuilt mobile app
- [ ] Tested mobile app connectivity
- [ ] Tested login functionality
- [ ] Tested API calls (notifications, payments, etc.)

## Step 5: Third-Party Services
- [ ] Updated payment gateway webhooks
- [ ] Updated payment gateway callback URLs
- [ ] Updated email service templates
- [ ] Updated any other external service URLs

## Step 6: Testing
- [ ] Web app loads correctly
- [ ] SSL certificate is valid
- [ ] All web app features work
- [ ] Mobile app connects to API
- [ ] Mobile app features work
- [ ] API endpoints respond correctly
- [ ] Authentication works
- [ ] Payments work (if applicable)

## Step 7: Security & Final Checks
- [ ] HTTPS is enforced
- [ ] HTTP redirects to HTTPS
- [ ] Environment variables are secure
- [ ] No sensitive data in code
- [ ] CORS configured correctly
- [ ] Analytics set up (optional)

## Files to Update

### Mobile App
- [ ] `/Users/marcim/HarakaPay-mobile/harakapay-mobile/app.json`
  - Update: `WEB_API_URL` in `extra` section

- [ ] `/Users/marcim/HarakaPay-mobile/harakapay-mobile/src/config/env.ts`
  - Update: Fallback URL (line 16)

### Web App
- [ ] Check for any hardcoded URLs in source code
- [ ] Update environment variables if needed
- [ ] Update Supabase configuration

---

## Your Domain Information

**Domain**: _________________________

**Web App URL**: https://_________________________

**API Base URL**: https://_________________________/api

**Date Completed**: _________________________

---

## Notes

_Use this space to jot down any issues or important information during setup:_




