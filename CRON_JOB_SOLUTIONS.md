# Cron Job Solutions for Vercel Hobby Plan

## The Problem

Your cron job was configured to run every 10 minutes (`*/10 * * * *`), but Vercel's Hobby plan only allows cron jobs to run **once per day**. This caused your deployment to fail.

## Solution Applied

I've updated your `vercel.json` to run the cron job **once per day at 1 AM** (`0 1 * * *`), which is compatible with the Hobby plan.

## Alternative Solutions

If you need more frequent notification processing, here are your options:

### Option 1: Keep Once Per Day (Current Solution) ✅

**Pros:**
- Works with Hobby plan (free)
- No additional costs
- Simple and reliable

**Cons:**
- Notifications are processed only once per day
- Less timely notifications

**Best for:** Non-urgent notifications, daily summaries, scheduled announcements

---

### Option 2: Upgrade to Vercel Pro Plan

**Cost:** $20/month per user

**Benefits:**
- Unlimited cron job invocations
- Can run every 10 minutes or more frequently
- More reliable timing
- Better for production applications

**To upgrade:**
1. Go to Vercel dashboard
2. Click on your account settings
3. Upgrade to Pro plan

**Then update `vercel.json`:**
```json
{
  "crons": [
    {
      "path": "/api/cron/process-scheduled-notifications",
      "schedule": "*/10 * * * *"
    }
  ]
}
```

---

### Option 3: Use External Cron Service (Free)

Use a free external service to call your API endpoint:

**Services:**
- **cron-job.org** (free, reliable)
- **EasyCron** (free tier available)
- **UptimeRobot** (free monitoring + cron)

**Setup:**
1. Sign up for a free cron service
2. Create a cron job that calls: `https://harakapayment.com/api/cron/process-scheduled-notifications`
3. Set it to run every 10 minutes
4. Add authentication header: `Authorization: Bearer YOUR_CRON_SECRET`
5. Remove the cron from `vercel.json` (or keep it as backup)

**Example with cron-job.org:**
- URL: `https://harakapayment.com/api/cron/process-scheduled-notifications`
- Schedule: Every 10 minutes
- HTTP Header: `Authorization: Bearer YOUR_CRON_SECRET`
- Method: GET

**Pros:**
- Free
- Can run as frequently as needed
- Works with Hobby plan

**Cons:**
- External dependency
- Need to manage another service
- Less integrated with Vercel

---

### Option 4: Remove Cron Job Temporarily

If notifications aren't critical right now:

1. **Remove from `vercel.json`:**
```json
{
  "crons": []
}
```

2. **Or delete the cron configuration entirely** (empty object)

3. **Process notifications manually** when needed by calling the API endpoint directly

**Pros:**
- Fixes deployment immediately
- No costs
- Can add back later

**Cons:**
- Notifications won't be processed automatically
- Manual intervention required

---

## Recommended Approach

### For Development/Testing:
- Use **Option 1** (once per day) - it's free and works

### For Production:
- **Option 2** (Upgrade to Pro) - if you have budget and need reliability
- **Option 3** (External cron) - if you want to stay on Hobby plan but need frequent processing

---

## Current Configuration

Your `vercel.json` is now set to:
```json
{
  "crons": [
    {
      "path": "/api/cron/process-scheduled-notifications",
      "schedule": "0 1 * * *"
    }
  ]
}
```

This will:
- Run once per day at 1:00 AM (UTC)
- Process all scheduled notifications that are due
- Work with Vercel Hobby plan

---

## Next Steps

1. ✅ **Commit and push the updated `vercel.json`**
   ```bash
   git add vercel.json
   git commit -m "Fix: Update cron schedule for Hobby plan compatibility"
   git push
   ```

2. ✅ **Wait for Vercel to redeploy**
   - The deployment should now succeed
   - Check GitHub Actions/Vercel dashboard

3. ✅ **Test the cron job**
   - Wait until 1 AM UTC (or manually trigger it)
   - Check logs in Vercel dashboard
   - Verify notifications are processed

4. **Decide on long-term solution:**
   - If once per day is enough → Keep current setup
   - If you need more frequent → Choose Option 2 or 3

---

## Testing the Cron Job Manually

You can test the endpoint manually:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://harakapayment.com/api/cron/process-scheduled-notifications
```

Replace `YOUR_CRON_SECRET` with the value from your Vercel environment variables.

---

## Notes

- The cron job will run at 1:00 AM UTC (not your local time)
- On Hobby plan, timing is approximate (could be 1:00-1:59 AM)
- Make sure `CRON_SECRET` is set in Vercel environment variables
- Check Vercel function logs to see if cron jobs are executing

