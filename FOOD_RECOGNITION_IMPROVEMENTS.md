# Food Recognition Output Improvements

## Current Pipeline Analysis

**Flow:** Image → Google Vision API → Label Filtering → Database Matching → Scoring → UI

### Current Strengths ✅
- Good hierarchy-based deduplication (e.g., "Biryani" removes "Rice")
- Database matching with fuzzy search
- Confidence-based filtering (>60%)
- Non-food label exclusion

### Current Weaknesses ❌
1. **Too many generic labels** - "Salad", "Vegetable" both appear
2. **No context awareness** - Can't distinguish main dish from side
3. **Limited food database** - Only ~50 items
4. **No portion/quantity detection** - Can't tell if it's a full meal or garnish
5. **Confidence threshold too low** - 60% lets in uncertain matches

---

## Recommended Improvements

### 🎯 Priority 1: Smarter Label Selection

#### A. Increase Confidence Threshold
```typescript
// Current: 60%
return label.confidence > 0.60;

// Recommended: 75% for better accuracy
return label.confidence > 0.75;
```

#### B. Prefer Specific Over Generic
Add a specificity scoring system:
```typescript
const SPECIFICITY_SCORES = {
  // High specificity (prefer these)
  'biryani': 10,
  'chicken biryani': 12,
  'hyderabadi biryani': 15,
  
  // Medium specificity
  'grilled chicken': 8,
  'chicken': 6,
  'salad': 5,
  
  // Low specificity (avoid)
  'vegetable': 2,
  'food': 1,
  'dish': 1
};
```

#### C. Limit to Top 3 Most Specific Foods
```typescript
// Instead of top 5, get top 3 most confident + specific
const topFoods = uniqueFoods
  .map(f => ({
    ...f,
    specificity: getSpecificityScore(f.name)
  }))
  .sort((a, b) => {
    // Sort by: specificity first, then confidence
    const specDiff = b.specificity - a.specificity;
    return specDiff !== 0 ? specDiff : b.confidence - a.confidence;
  })
  .slice(0, 3);
```

---

### 🎯 Priority 2: Better Database Matching

#### A. Expand Food Database
Current: ~50 items → Target: 200+ items

**Categories to add:**
- Indian foods (dosa, idli, sambar, paneer dishes)
- Common vegetables (bell pepper, onion, cauliflower)
- Specific salads (caesar, greek, cobb)
- Desserts (brownie, cookie, pudding)
- Beverages (juice, smoothie, tea)

#### B. Add Synonyms/Aliases
```sql
ALTER TABLE food_database ADD COLUMN aliases TEXT[];

UPDATE food_database 
SET aliases = ARRAY['veggie salad', 'garden salad', 'green salad']
WHERE name = 'Salad';
```

#### C. Improve Fuzzy Matching
```typescript
// Current: Simple ILIKE
.ilike('name', `%${food.name}%`)

// Better: Check aliases too
.or(`name.ilike.%${food.name}%,aliases.cs.{${food.name}}`)
```

---

### 🎯 Priority 3: Context-Aware Detection

#### A. Detect Main Dish vs Components
```typescript
const MAIN_DISH_INDICATORS = [
  'biryani', 'curry', 'pasta', 'burger', 'pizza', 
  'sandwich', 'soup', 'salad', 'bowl'
];

// If main dish detected, filter out components
if (hasMainDish) {
  foods = foods.filter(f => 
    isMainDish(f.name) || f.confidence > 0.85
  );
}
```

#### B. Use Web Entities for Better Context
```typescript
// Google Vision provides webEntities with better food names
// Example: Instead of "Leaf vegetable", might give "Caesar Salad"
const webEntities = annotations.webDetection?.webEntities || [];

// Prioritize web entities over generic labels
const prioritizedLabels = [
  ...webEntities.filter(e => e.score > 0.7),
  ...labels.filter(l => l.score > 0.75)
];
```

---

### 🎯 Priority 4: Multi-Food Detection

#### A. Detect Multiple Items
```typescript
// If confidence spread is wide, likely multiple foods
const confidenceSpread = Math.max(...confidences) - Math.min(...confidences);

if (confidenceSpread > 0.3 && uniqueFoods.length > 3) {
  // Multiple distinct items detected
  return uniqueFoods.slice(0, 4); // Show up to 4
} else {
  // Single dish with components
  return uniqueFoods.slice(0, 2); // Show main + 1 component
}
```

---

### 🎯 Priority 5: User Feedback Loop

#### A. Add "Was this correct?" UI
```typescript
interface FoodScan {
  // ... existing fields
  user_corrections?: {
    removed: string[];  // Foods user said weren't there
    added: string[];    // Foods user said were missing
  };
}
```

#### B. Learn from Corrections
```typescript
// If user removes "Vegetable" when "Salad" is present
// → Strengthen hierarchy rule
// → Lower confidence threshold for specific items
```

---

## Implementation Priority

### Phase 1 (Quick Wins - 1 hour)
1. ✅ Filter out non-food labels (DONE)
2. Increase confidence threshold to 75%
3. Limit to top 3 foods instead of 5
4. Prioritize web entities

### Phase 2 (Database - 2 hours)
1. Expand food database to 200+ items
2. Add aliases column
3. Improve fuzzy matching

### Phase 3 (Smart Detection - 3 hours)
1. Add specificity scoring
2. Implement main dish detection
3. Better component filtering

### Phase 4 (Learning - 4 hours)
1. Add user correction UI
2. Store corrections in database
3. Use corrections to improve future scans

---

## Testing Strategy

### Test Cases
1. **Single dish**: Biryani → Should show "Biryani" only
2. **Salad bowl**: Should show "Salad" + 1-2 main ingredients
3. **Complex plate**: Curry + Rice → Should show both
4. **Ambiguous**: Should prefer specific over generic
5. **Multiple items**: Burger + Fries → Should show both

### Success Metrics
- **Accuracy**: >85% of scans show correct foods
- **Relevance**: 0 non-food items in results
- **Specificity**: Prefer "Chicken Biryani" over "Rice"
- **User satisfaction**: <10% correction rate

---

## Quick Implementation Guide

### Step 1: Update Edge Function
```bash
# Edit: supabase/functions/recognize-food/index.ts
# Changes:
# - Confidence: 0.60 → 0.75
# - Top foods: 5 → 3
# - Prioritize webEntities
```

### Step 2: Expand Database
```bash
# Create: supabase/migrations/20251228_expand_food_db.sql
# Add 150+ more food items
```

### Step 3: Deploy
```bash
npx supabase functions deploy recognize-food
npx supabase db push
```

### Step 4: Test
```bash
# Test with various food images
# Monitor debug logs for improvements
```
