# Steps 3 & 4 Completion Guide

## ✅ Step 3: Mobile App Configuration - COMPLETED

I've updated all the necessary files in your mobile app to use the new domain `harakapayment.com`:

### Files Updated:
1. ✅ `/Users/marcim/HarakaPay-mobile/harakapay-mobile/app.json`
   - Updated `WEB_API_URL` from `http://192.168.1.120:3000` to `https://harakapayment.com`

2. ✅ `/Users/marcim/HarakaPay-mobile/harakapay-mobile/src/config/env.ts`
   - Updated fallback URL to `https://harakapayment.com`

3. ✅ `/Users/marcim/HarakaPay-mobile/harakapay-mobile/src/api/notificationApi.ts`
   - Updated API URL fallback to `https://harakapayment.com`

4. ✅ `/Users/marcim/HarakaPay-mobile/harakapay-mobile/src/api/index.ts`
   - Updated `API_BASE_URL` fallback to `https://harakapayment.com`

### Next Steps for Mobile App:
1. **Rebuild your mobile app** to apply the changes:
   ```bash
   cd /Users/marcim/HarakaPay-mobile/harakapay-mobile
   npx expo start --clear
   ```

2. **For production builds**:
   ```bash
   # iOS
   eas build --platform ios
   
   # Android
   eas build --platform android
   ```

---

## 📋 Step 4: Supabase Configuration - ACTION REQUIRED

You need to update your Supabase configuration to allow authentication from your new domain.

### Instructions:

1. **Log into Supabase Dashboard**
   - Go to [https://app.supabase.com](https://app.supabase.com)
   - Select your project (the one with URL: `apdeuckmufukrnuffetv.supabase.co`)

2. **Navigate to Authentication Settings**
   - In the left sidebar, click **Authentication**
   - Click **URL Configuration** (or **Settings** → **URL Configuration`)

3. **Update Site URL**
   - Find the **Site URL** field
   - Change it to: `https://harakapayment.com`
   - Click **Save**

4. **Update Redirect URLs**
   - Scroll down to **Redirect URLs** section
   - Add the following URLs (one per line):
     ```
     https://harakapayment.com/**
     https://www.harakapayment.com/**
     https://harakapayment.com/auth/callback
     https://www.harakapayment.com/auth/callback
     ```
   - If you have any existing localhost URLs, you can keep them for local development, or remove them
   - Click **Save**

5. **Verify Configuration**
   - Make sure both the Site URL and Redirect URLs are saved
   - The changes take effect immediately

### What This Does:
- Allows users to authenticate from your production domain
- Enables password reset emails to redirect to your domain
- Allows OAuth callbacks (if you use social login) to work correctly
- Ensures all authentication flows work with your new domain

---

## 🧪 Testing Checklist

After completing Step 4, test the following:

### Web App Testing:
- [ ] Visit `https://harakapayment.com` - site loads correctly
- [ ] SSL certificate is valid (padlock icon in browser)
- [ ] Try logging in - authentication works
- [ ] Try password reset - email link redirects correctly
- [ ] Test all major features (dashboard, payments, etc.)

### Mobile App Testing:
- [ ] Rebuild mobile app with new configuration
- [ ] Test login functionality
- [ ] Test API calls (notifications, payments, student data)
- [ ] Test password reset flow (if applicable)
- [ ] Verify all features work correctly

### API Testing:
You can test your API endpoints directly:
```bash
# Test a public endpoint (if you have one)
curl https://harakapayment.com/api/test

# Test with authentication (replace TOKEN with actual token)
curl -H "Authorization: Bearer TOKEN" \
  https://harakapayment.com/api/notifications/user
```

---

## 🔍 Additional Services to Update

### Payment Gateway (M-Pesa)
If you're using M-Pesa or other payment gateways:

1. **Update Webhook URLs**:
   - Log into your payment provider dashboard
   - Update webhook URL to: `https://harakapayment.com/api/payments/webhook`
   - Save changes

2. **Update Callback URLs**:
   - Update any callback URLs to use `https://harakapayment.com`

### Email Services
If you're sending emails (password reset, notifications):

1. **Check Email Templates**:
   - Look for any hardcoded `localhost` or IP addresses
   - Update to use `https://harakapayment.com`
   - This is usually in your email service provider (SendGrid, Resend, etc.)

---

## 🚨 Troubleshooting

### If Authentication Fails:
- Double-check Supabase redirect URLs are saved correctly
- Make sure you added both `https://harakapayment.com/**` and `https://www.harakapayment.com/**`
- Clear browser cache and try again
- Check browser console for any CORS errors

### If Mobile App Can't Connect:
- Verify `app.json` has the correct URL: `https://harakapayment.com`
- Make sure you've rebuilt the app after changes
- Check that your web app is accessible at `https://harakapayment.com`
- Test API endpoints directly in a browser or Postman

### If API Calls Fail:
- Check CORS settings in your Next.js API routes
- Verify the domain is accessible and SSL is working
- Check server logs for any errors

---

## 📝 Summary

**Domain**: `harakapayment.com`

**Web App URL**: `https://harakapayment.com`

**API Base URL**: `https://harakapayment.com/api`

**Mobile App Config**: ✅ Updated to use `https://harakapayment.com`

**Supabase Config**: ⚠️ **ACTION REQUIRED** - Update Site URL and Redirect URLs in Supabase Dashboard

---

## Next Steps

1. ✅ Complete Step 4: Update Supabase configuration (see instructions above)
2. ✅ Rebuild mobile app
3. ✅ Test everything thoroughly
4. ✅ Update payment gateway webhooks (if applicable)
5. ✅ Update email templates (if applicable)

Once you've completed Step 4 and tested everything, your domain setup will be complete! 🎉

