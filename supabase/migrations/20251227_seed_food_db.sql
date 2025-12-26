-- Seed food database with common items and their gut health properties

INSERT INTO food_database (name, category, fiber_score, trigger_risk, is_plant, common_triggers) VALUES
-- Healthy Bases
('Salad', 'vegetable', 8, 1, true, '{}'),
('Vegetable', 'vegetable', 9, 1, true, '{}'),
('Leaf vegetable', 'vegetable', 9, 1, true, '{}'),
('Mixed Salad', 'vegetable', 8, 1, true, '{}'),
('Lettuce', 'vegetable', 5, 0, true, '{}'),
('Spinach', 'vegetable', 8, 2, true, '{"histamine"}'),
('Cucumber', 'vegetable', 4, 1, true, '{}'),
('Tomato', 'vegetable', 3, 2, true, '{"nightshade", "histamine"}'),
('Carrot', 'vegetable', 6, 0, true, '{}'),
('Broccoli', 'vegetable', 9, 3, true, '{"fodmap"}'),
('Rice', 'grain', 4, 0, true, '{}'),
('Brown Rice', 'grain', 7, 1, true, '{}'),
('Quinoa', 'grain', 8, 1, true, '{}'),
('Oatmeal', 'grain', 8, 1, true, '{}'),

-- Proteins
('Chicken', 'protein', 0, 0, false, '{}'),
('Grilled Chicken', 'protein', 0, 0, false, '{}'),
('Salmon', 'protein', 0, 0, false, '{}'),
('Fish', 'protein', 0, 0, false, '{}'),
('Egg', 'protein', 0, 1, false, '{"egg"}'),
('Tofu', 'protein', 2, 2, true, '{"soy"}'),
('Beef', 'protein', 0, 2, false, '{}'),
('Pork', 'protein', 0, 2, false, '{}'),

-- Fruits
('Apple', 'fruit', 6, 2, true, '{"fodmap"}'),
('Banana', 'fruit', 4, 1, true, '{}'),
('Berries', 'fruit', 7, 0, true, '{}'),
('Orange', 'fruit', 4, 1, true, '{"citrus"}'),
('Avocado', 'fruit', 8, 2, true, '{"fodmap"}'),

-- Common Dishes
('Soup', 'meal', 4, 2, false, '{}'),
('Sandwich', 'meal', 3, 3, false, '{"gluten"}'),
('Burger', 'meal', 2, 4, false, '{"gluten", "dairy"}'),
('Pizza', 'meal', 2, 5, false, '{"gluten", "dairy"}'),
('Pasta', 'meal', 3, 4, false, '{"gluten"}'),
('Curry', 'meal', 5, 3, false, '{"spicy"}'),
('Stir fry', 'meal', 6, 2, true, '{}'),
('Sushi', 'meal', 2, 1, false, '{}'),
('Taco', 'meal', 3, 3, false, '{"corn", "gluten"}'),
('Burrito', 'meal', 5, 3, false, '{"gluten", "dairy"}'),
('Biryani', 'meal', 4, 2, false, '{"spicy"}'),
('Indian cuisine', 'meal', 5, 3, false, '{"spicy"}'),

-- Triggers / Unhealthy
('Fries', 'processed', 2, 4, true, '{"fried"}'),
('Fried Chicken', 'processed', 0, 5, false, '{"fried", "gluten"}'),
('Soda', 'processed', 0, 5, true, '{"sugar"}'),
('Cake', 'processed', 1, 5, false, '{"gluten", "dairy", "sugar"}'),
('Ice Cream', 'dairy', 0, 4, false, '{"dairy", "sugar"}'),
('Coffee', 'beverage', 0, 3, true, '{"caffeine"}'),
('Alcohol', 'beverage', 0, 5, true, '{"alcohol"}'),

-- Pantry
('Bread', 'grain', 3, 3, true, '{"gluten"}'),
('Cheese', 'dairy', 0, 3, false, '{"dairy"}'),
('Yogurt', 'dairy', 0, 1, false, '{"dairy"}'),
('Nuts', 'snack', 6, 2, true, '{"nuts"}')
ON CONFLICT (name) DO NOTHING;
