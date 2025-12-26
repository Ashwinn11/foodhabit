# Google Vision API Setup Instructions

## 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable **Cloud Vision API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Cloud Vision API"
   - Click "Enable"

## 2. Create API Key

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy the API key
4. (Optional) Restrict the key:
   - Click "Edit API key"
   - Under "API restrictions", select "Cloud Vision API"
   - Save

## 3. Set Up Supabase Secret

```bash
# Navigate to your project
cd /Users/ashwinn/Projects/foodhabit

# Set the Google Vision API key as a Supabase secret
npx supabase secrets set GOOGLE_VISION_API_KEY=your_api_key_here
```

## 4. Deploy Edge Function

```bash
# Deploy the recognize-food function
npx supabase functions deploy recognize-food
```

## 5. Test the Function

```bash
# Test with a sample image URL
npx supabase functions invoke recognize-food \
  --body '{"imageUrl":"https://example.com/food.jpg"}'
```

## 6. Verify in App

1. Run the app: `npm start`
2. Scan a meal
3. Check console logs for AI recognition results
4. If AI fails, it will fallback to mock data

## Pricing

**Free Tier:**
- 1,000 requests/month free
- Perfect for MVP testing

**Paid Tier:**
- $1.50 per 1,000 images
- 10,000 scans/month = $15/month

## Troubleshooting

**"API key not configured"**
- Make sure you set the secret: `npx supabase secrets set GOOGLE_VISION_API_KEY=...`

**"Vision API error"**
- Check if Cloud Vision API is enabled in Google Cloud Console
- Verify API key is correct

**"No foods identified"**
- App will fallback to mock data
- Check image quality (clear, well-lit food photos work best)
