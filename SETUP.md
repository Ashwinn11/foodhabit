# Food Habit - Setup Guide

## Quick Start Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Expo Username (CRITICAL for Google OAuth)

Google OAuth requires proper HTTPS redirect URLs. You MUST configure your Expo username:

```bash
# Check your Expo username
npx expo whoami

# If not logged in
npx expo login
```

**Copy your username**, then:

1. Open `app.json`
2. Find the line: `"owner": "YOUR_EXPO_USERNAME"`
3. Replace with: `"owner": "your-actual-username"` (from `npx expo whoami`)
4. Save the file

**Example:**
```json
{
  "expo": {
    "name": "Food Habit",
    "slug": "foodhabit",
    "owner": "johndoe",  // ← Replace YOUR_EXPO_USERNAME with your actual username
    ...
  }
}
```

### 3. Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env
```

Then edit `.env` and add your Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Get these from: https://app.supabase.com > Your Project > Settings > API

### 4. Configure Supabase Redirect URLs

In your Supabase dashboard:

1. Go to **Authentication** > **URL Configuration**
2. Under **Redirect URLs**, add BOTH:
   ```
   https://auth.expo.io/@your-expo-username/foodhabit/--/auth/callback
   foodhabit://auth/callback
   ```
   (Replace `your-expo-username` with your actual Expo username)

### 5. Start Development Server

```bash
# Clear cache and start
npx expo start --clear
```

### 6. Verify Setup

Check the console logs. You should see:

```
=== SUPABASE REDIRECT URLs ===
Current mode: Expo Go (Development)

🔑 CRITICAL: Google OAuth requires proper URLs (NOT exp://)

Add BOTH URLs to your Supabase project:
✅ Expo Go (Dev): https://auth.expo.io/@your-username/foodhabit/--/auth/callback
✅ Standalone: foodhabit://auth/callback

📍 Currently using: https://auth.expo.io/@your-username/foodhabit/--/auth/callback
```

**✅ If you see `https://auth.expo.io/@your-username/...`** → Setup is correct!
**❌ If you see `exp://192.168.1.6:...`** → Go back to step 2 and configure owner in app.json

---

## Troubleshooting

### "exp://" URLs Still Showing

**Problem:** Console shows `exp://192.168.1.6:8081/--/auth/callback`

**Solution:**
1. Verify `npx expo whoami` shows your username
2. Open `app.json` and set `"owner": "your-username"` (replace placeholder)
3. Restart: `npx expo start --clear`

### Google OAuth Not Working

**Checklist:**
- [ ] Owner configured in `app.json`
- [ ] BOTH redirect URLs added to Supabase
- [ ] .env file exists with correct credentials
- [ ] Console shows HTTPS URL (not exp://)

### Expo Username Not Found

```bash
# Login to Expo
npx expo login

# Verify login
npx expo whoami

# Should display your username
```

---

## Documentation

- **Design System**: See `DESIGN_SYSTEM.md`
- **Deep Linking**: See `DEEP_LINKING.md`
- **Supabase Setup**: See `SUPABASE_SETUP.md`
- **Development Guidelines**: See `claude.md`

---

## Need Help?

1. Check console logs for detailed error messages
2. Review the documentation files above
3. Verify all setup steps completed
4. Ensure Expo username is configured in app.json
