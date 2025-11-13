# Fix: Domain Showing "Home Page" Instead of Your App

If you're seeing just "Home Page" text on `https://www.harakapayment.com/`, it means your domain is pointing to Vercel, but it's **not connected to your HarakaPay project**. Here's how to fix it:

## The Problem

The domain is working (DNS is correct), but Vercel is showing a default/placeholder page because:
- The domain isn't added to your Vercel project, OR
- The domain is connected to a different/empty Vercel project, OR
- There's a deployment issue

---

## Solution: Connect Domain to Your Vercel Project

### Step 1: Log into Vercel

1. Go to [vercel.com](https://vercel.com) and log in
2. Make sure you're in the correct account/team

### Step 2: Find Your HarakaPay Project

1. Look for your project in the dashboard
   - It should be named something like `harakapay-web` or `HarakaPay-web`
   - If you don't see it, check if you're in the right team/account
   - If the project doesn't exist, you'll need to deploy it first

### Step 3: Add Domain to Your Project

1. **Click on your HarakaPay project** to open it

2. **Go to Settings**
   - Click on the **Settings** tab at the top
   - Click on **Domains** in the left sidebar

3. **Add Your Domain**
   - Click the **Add Domain** button
   - Enter: `harakapayment.com`
   - Click **Add**
   - Vercel will verify the domain

4. **Add www Subdomain**
   - Click **Add Domain** again
   - Enter: `www.harakapayment.com`
   - Click **Add**

### Step 4: Verify Domain Status

After adding the domain, Vercel will show its status:

- ✅ **Valid** - Domain is correctly configured and connected
- ⏳ **Pending** - DNS is still propagating (wait a few minutes)
- ❌ **Invalid Configuration** - DNS records don't match (check DNS settings)
- ⚠️ **Configuration Error** - Something is wrong with the setup

### Step 5: Check DNS Records

Vercel will show you what DNS records it expects. Make sure these match what you have in Squarespace:

**For Root Domain (`harakapayment.com`):**
- **A Record**: `@` → `76.76.21.21`

**For www Subdomain (`www.harakapayment.com`):**
- **CNAME Record**: `www` → `cname.vercel-dns.com.`

If the records don't match, update them in Squarespace DNS settings.

---

## If Your Project Doesn't Exist in Vercel

If you don't see your HarakaPay project in Vercel, you need to deploy it first:

### Option A: Deploy via Git (Recommended)

1. **Connect Your Repository**
   - In Vercel, click **Add New Project**
   - Connect your Git repository (GitHub, GitLab, Bitbucket)
   - Select your `HarakaPay-web` repository

2. **Configure Project**
   - Framework Preset: **Next.js** (should auto-detect)
   - Root Directory: Leave as default (or set to root if needed)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

3. **Add Environment Variables**
   - Add any environment variables your app needs:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - Any other required variables

4. **Deploy**
   - Click **Deploy**
   - Wait for the deployment to complete

5. **Add Domain**
   - After deployment, go to **Settings** → **Domains**
   - Add `harakapayment.com` and `www.harakapayment.com`

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Navigate to your project**:
   ```bash
   cd /Users/marcim/HarakaPay-web
   ```

4. **Deploy**:
   ```bash
   vercel
   ```
   - Follow the prompts
   - Choose your team/account
   - Confirm project settings

5. **Add Domain**:
   ```bash
   vercel domains add harakapayment.com
   vercel domains add www.harakapayment.com
   ```

---

## Verify Everything is Working

### 1. Check Domain Status in Vercel

- Go to **Settings** → **Domains** in your Vercel project
- Both domains should show as **Valid** ✅
- SSL certificates should be issued (usually automatic)

### 2. Check Your Latest Deployment

- Go to the **Deployments** tab in Vercel
- Make sure there's a successful deployment
- The domain should be assigned to the latest deployment

### 3. Test the Domain

- Visit `https://harakapayment.com` (without www)
- Visit `https://www.harakapayment.com` (with www)
- Both should show your HarakaPay landing page (not "Home Page")

### 4. Clear Browser Cache

- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Or use incognito/private browsing mode

---

## Troubleshooting

### Domain Shows "Invalid Configuration"

1. **Check DNS Records in Squarespace**
   - Make sure A record points to `76.76.21.21`
   - Make sure CNAME record points to `cname.vercel-dns.com.`

2. **Wait for DNS Propagation**
   - DNS changes can take time to propagate
   - Use [whatsmydns.net](https://www.whatsmydns.net) to check propagation

3. **Verify in Vercel**
   - Vercel will show exactly what DNS records it expects
   - Make sure they match exactly

### Domain Shows "Pending"

- This is normal - wait a few minutes
- DNS propagation can take 15 minutes to 48 hours
- Usually works within 1-2 hours

### Still Seeing "Home Page"

1. **Verify Domain is Connected**
   - Check that the domain is listed in your project's **Settings** → **Domains**
   - Make sure it shows as **Valid** or **Pending** (not Invalid)

2. **Check Deployment**
   - Make sure your project has a successful deployment
   - The domain should be assigned to a deployment

3. **Try Production URL**
   - Vercel gives you a production URL like `your-project.vercel.app`
   - Visit that URL to make sure your app is deployed correctly
   - If that works, the issue is just domain configuration

4. **Check for Multiple Projects**
   - Make sure you're adding the domain to the correct project
   - You might have multiple projects in Vercel

### Domain Works but Shows Wrong Content

- Make sure the domain is assigned to the **Production** deployment
- In Vercel, go to **Settings** → **Domains**
- Click on the domain and make sure it's pointing to **Production**

---

## Quick Checklist

- [ ] Logged into Vercel
- [ ] Found/created HarakaPay project
- [ ] Added `harakapayment.com` to project domains
- [ ] Added `www.harakapayment.com` to project domains
- [ ] Verified DNS records match Vercel's requirements
- [ ] Domain shows as "Valid" or "Pending" in Vercel
- [ ] Project has a successful deployment
- [ ] Cleared browser cache
- [ ] Tested both `harakapayment.com` and `www.harakapayment.com`

---

## Summary

The "Home Page" text means your domain is pointing to Vercel, but it's not connected to your HarakaPay project. To fix:

1. ✅ **Log into Vercel**
2. ✅ **Find or create your HarakaPay project**
3. ✅ **Add the domain** in Settings → Domains
4. ✅ **Verify DNS** records are correct
5. ✅ **Wait for propagation** and test

Once the domain is properly connected to your project, you should see your full HarakaPay landing page instead of just "Home Page"!

---

## Need Help?

- **Vercel Documentation**: [vercel.com/docs/concepts/projects/domains](https://vercel.com/docs/concepts/projects/domains)
- **Vercel Support**: Check your Vercel dashboard for support options
- **Check Deployment Logs**: Go to Deployments tab to see if there are any build errors

