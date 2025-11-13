# Fix: Domain Showing Squarespace "Under Construction" Page

If you're seeing a Squarespace "under construction" page when visiting `harakapayment.com`, it means your domain is still connected to Squarespace hosting. Here's how to fix it:

## The Problem

When you buy a domain on Squarespace, it's automatically connected to Squarespace hosting. To use it with Vercel (or any other hosting), you need to:
1. **Disconnect the domain from Squarespace hosting** (but keep the domain registered with Squarespace)
2. **Configure DNS records** to point to Vercel instead

---

## Solution: Disconnect Domain from Squarespace Hosting

### Step 1: Access Domain Settings in Squarespace

1. **Log into Squarespace**
   - Go to [squarespace.com](https://www.squarespace.com) and log in
   - Click on **Settings** (gear icon) in the left sidebar
   - Click on **Domains**

2. **Find Your Domain**
   - You should see `harakapayment.com` in your list of domains
   - Click on it to open domain settings

### Step 2: Disconnect from Squarespace Website

1. **Look for "Connected Site" or "Website" section**
   - You should see that the domain is connected to a Squarespace website
   - Look for an option like:
     - "Connected to [Website Name]"
     - "Disconnect from website"
     - "Remove connection"
     - Or a button to "Unlink" or "Disconnect"

2. **Disconnect the Domain**
   - Click the disconnect/unlink button
   - Confirm the action
   - This will disconnect the domain from Squarespace hosting but keep it registered with Squarespace

### Step 3: Access DNS Settings

After disconnecting, you should now be able to access DNS settings:

1. **Navigate to DNS Settings**
   - In the domain settings page, look for:
     - **DNS Settings**
     - **Advanced DNS Settings**
     - **DNS Records**
     - Or a tab labeled "DNS"

2. **Remove Existing Squarespace DNS Records** (if any)
   - Look for any A records or CNAME records pointing to Squarespace
   - Delete or remove them (you'll add Vercel records next)

---

## Step 4: Add Vercel DNS Records

Now add the correct DNS records to point to Vercel:

### For Root Domain (harakapayment.com):

1. **Add A Record**
   - **Type**: A
   - **Name**: `@` (or leave blank, or enter `harakapayment.com`)
   - **Value/Points to**: `76.76.21.21`
   - **TTL**: 3600 (or default)

2. **Add CNAME Record for www**
   - **Type**: CNAME
   - **Name**: `www`
   - **Value/Points to**: `cname.vercel-dns.com.` (note the trailing dot)
   - **TTL**: 3600 (or default)

### Alternative: Use Vercel's Nameservers (Easier Option)

If Squarespace allows you to change nameservers, you can use Vercel's nameservers instead:

1. **In Squarespace Domain Settings**
   - Look for "Nameservers" or "DNS Nameservers"
   - Change from Squarespace nameservers to custom nameservers

2. **Use Vercel's Nameservers** (get these from Vercel dashboard):
   - When you add a domain in Vercel, it will show you the nameservers to use
   - Typically something like:
     - `ns1.vercel-dns.com`
     - `ns2.vercel-dns.com`

3. **Update in Squarespace**
   - Replace Squarespace nameservers with Vercel's nameservers
   - Save changes

---

## Step 5: Verify Domain in Vercel

1. **Log into Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Select your HarakaPay project

2. **Add Domain** (if not already added)
   - Go to **Settings** → **Domains**
   - Click **Add Domain**
   - Enter: `harakapayment.com`
   - Click **Add**

3. **Add www Subdomain**
   - Click **Add Domain** again
   - Enter: `www.harakapayment.com`
   - Click **Add**

4. **Check DNS Status**
   - Vercel will show the status of your DNS configuration
   - It may show "Pending" or "Invalid Configuration" until DNS propagates
   - Vercel will show you exactly what DNS records it expects

---

## Step 6: Verify DNS Configuration

After adding DNS records, verify they're correct:

### Check DNS Records

You can check if your DNS is configured correctly using these tools:

1. **Using Command Line**:
   ```bash
   # Check A record
   dig harakapayment.com +short
   # Should return: 76.76.21.21
   
   # Check www CNAME
   dig www.harakapayment.com +short
   # Should return: cname.vercel-dns.com
   ```

2. **Using Online Tools**:
   - Visit [whatsmydns.net](https://www.whatsmydns.net)
   - Enter `harakapayment.com`
   - Check if it shows the Vercel IP address

3. **Check in Vercel Dashboard**:
   - Vercel will show you if DNS is configured correctly
   - Look for a green checkmark or "Valid" status

---

## Step 7: Wait for DNS Propagation

- DNS changes can take **15 minutes to 48 hours** to propagate
- Usually works within **1-2 hours**
- You can check propagation status using [whatsmydns.net](https://www.whatsmydns.net)

---

## Troubleshooting

### Still Seeing Squarespace Page?

1. **Clear Browser Cache**
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Or clear browser cache completely

2. **Check DNS Propagation**
   - Use [whatsmydns.net](https://www.whatsmydns.net) to see if DNS has propagated globally
   - Different locations may see different results

3. **Verify DNS Records in Squarespace**
   - Go back to Squarespace DNS settings
   - Make sure the A record points to `76.76.21.21`
   - Make sure the CNAME record points to `cname.vercel-dns.com.`

4. **Check Vercel Domain Status**
   - In Vercel dashboard, check if the domain shows as "Valid" or "Invalid"
   - If invalid, Vercel will tell you what's wrong

5. **Try Incognito/Private Browsing**
   - Open an incognito/private window
   - Visit `https://harakapayment.com`
   - This bypasses browser cache

### DNS Not Propagating?

- Wait longer (up to 48 hours)
- Check if you saved the DNS records correctly in Squarespace
- Verify the IP address and CNAME values are correct
- Try using a different DNS checker tool

### Vercel Shows "Invalid Configuration"?

- Double-check the DNS records match exactly what Vercel expects
- Make sure there are no typos in the IP address or CNAME value
- Remove any conflicting DNS records
- Wait a few minutes and check again

---

## Quick Checklist

- [ ] Disconnected domain from Squarespace website/hosting
- [ ] Added A record: `@` → `76.76.21.21`
- [ ] Added CNAME record: `www` → `cname.vercel-dns.com.`
- [ ] Added domain in Vercel dashboard
- [ ] Added www subdomain in Vercel dashboard
- [ ] Verified DNS records are correct
- [ ] Waited for DNS propagation (check with whatsmydns.net)
- [ ] Cleared browser cache
- [ ] Tested in incognito/private window

---

## Alternative: Transfer Domain Management

If you're having trouble with Squarespace DNS settings, you can:

1. **Transfer the domain** to a different registrar (like Namecheap, Google Domains, etc.)
2. **Use Cloudflare** for DNS management (free and fast)
3. **Keep domain at Squarespace** but use external DNS provider

However, the easiest solution is usually to just disconnect from Squarespace hosting and configure DNS records as described above.

---

## Need More Help?

- **Squarespace Support**: [support.squarespace.com](https://support.squarespace.com)
- **Vercel Documentation**: [vercel.com/docs/concepts/projects/domains](https://vercel.com/docs/concepts/projects/domains)
- **Vercel Support**: Check your Vercel dashboard for support options

---

## Summary

The key issue is that your domain is **connected to Squarespace hosting**. You need to:

1. ✅ **Disconnect** the domain from Squarespace website/hosting
2. ✅ **Configure DNS** to point to Vercel (A record and CNAME)
3. ✅ **Add domain** in Vercel dashboard
4. ✅ **Wait** for DNS propagation
5. ✅ **Test** the domain

Once DNS propagates (usually 1-2 hours), your domain should show your Vercel-hosted application instead of the Squarespace page!

