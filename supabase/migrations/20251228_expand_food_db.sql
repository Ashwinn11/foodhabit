-- Expand food database with 150+ more items for better recognition
-- Phase 2: Better Database Matching

-- Indian Cuisine (Popular items)
INSERT INTO food_database (name, category, fiber_score, trigger_risk, is_plant, common_triggers) VALUES
('Dosa', 'meal', 5, 1, true, '{}'),
('Idli', 'meal', 4, 0, true, '{}'),
('Sambar', 'meal', 7, 2, true, '{"spicy"}'),
('Paneer', 'protein', 0, 2, false, '{"dairy"}'),
('Paneer Tikka', 'protein', 0, 3, false, '{"dairy", "spicy"}'),
('Butter Chicken', 'meal', 2, 4, false, '{"dairy", "spicy"}'),
('Dal', 'meal', 8, 1, true, '{}'),
('Roti', 'grain', 4, 2, true, '{"gluten"}'),
('Naan', 'grain', 3, 3, true, '{"gluten", "dairy"}'),
('Paratha', 'grain', 4, 3, true, '{"gluten"}'),
('Chole', 'meal', 9, 2, true, '{"fodmap"}'),
('Rajma', 'meal', 9, 2, true, '{"fodmap"}'),
('Palak Paneer', 'meal', 6, 3, false, '{"dairy", "histamine"}'),
('Tandoori Chicken', 'protein', 0, 2, false, '{"spicy"}'),
('Masala Dosa', 'meal', 6, 2, true, '{"spicy"}')
ON CONFLICT (name) DO NOTHING;

-- More Vegetables
INSERT INTO food_database (name, category, fiber_score, trigger_risk, is_plant, common_triggers) VALUES
('Bell Pepper', 'vegetable', 5, 1, true, '{"nightshade"}'),
('Onion', 'vegetable', 4, 3, true, '{"fodmap"}'),
('Garlic', 'vegetable', 2, 3, true, '{"fodmap"}'),
('Cauliflower', 'vegetable', 7, 3, true, '{"fodmap"}'),
('Cabbage', 'vegetable', 6, 3, true, '{"fodmap"}'),
('Zucchini', 'vegetable', 5, 1, true, '{}'),
('Eggplant', 'vegetable', 6, 2, true, '{"nightshade"}'),
('Mushroom', 'vegetable', 4, 2, true, '{"fodmap"}'),
('Asparagus', 'vegetable', 6, 2, true, '{"fodmap"}'),
('Kale', 'vegetable', 9, 2, true, '{}'),
('Sweet Potato', 'vegetable', 7, 1, true, '{}'),
('Potato', 'vegetable', 4, 1, true, '{"nightshade"}'),
('Corn', 'vegetable', 5, 2, true, '{"corn"}'),
('Peas', 'vegetable', 7, 2, true, '{"fodmap"}'),
('Green Beans', 'vegetable', 6, 1, true, '{}')
ON CONFLICT (name) DO NOTHING;

-- Specific Salads
INSERT INTO food_database (name, category, fiber_score, trigger_risk, is_plant, common_triggers) VALUES
('Caesar Salad', 'meal', 5, 3, false, '{"dairy", "gluten"}'),
('Greek Salad', 'meal', 7, 2, true, '{"dairy"}'),
('Cobb Salad', 'meal', 6, 3, false, '{"egg", "dairy"}'),
('Garden Salad', 'meal', 8, 1, true, '{}'),
('Caprese Salad', 'meal', 4, 2, false, '{"dairy", "histamine"}'),
('Fruit Salad', 'meal', 6, 1, true, '{}')
ON CONFLICT (name) DO NOTHING;

-- More Proteins
INSERT INTO food_database (name, category, fiber_score, trigger_risk, is_plant, common_triggers) VALUES
('Shrimp', 'protein', 0, 1, false, '{"shellfish"}'),
('Tuna', 'protein', 0, 1, false, '{}'),
('Turkey', 'protein', 0, 0, false, '{}'),
('Lamb', 'protein', 0, 2, false, '{}'),
('Duck', 'protein', 0, 2, false, '{}'),
('Bacon', 'processed', 0, 5, false, '{"processed"}'),
('Sausage', 'processed', 0, 4, false, '{"processed"}'),
('Tempeh', 'protein', 5, 2, true, '{"soy"}'),
('Lentils', 'protein', 9, 2, true, '{"fodmap"}'),
('Chickpeas', 'protein', 9, 2, true, '{"fodmap"}'),
('Black Beans', 'protein', 9, 2, true, '{"fodmap"}')
ON CONFLICT (name) DO NOTHING;

-- More Grains & Carbs
INSERT INTO food_database (name, category, fiber_score, trigger_risk, is_plant, common_triggers) VALUES
('White Rice', 'grain', 2, 0, true, '{}'),
('Basmati Rice', 'grain', 3, 0, true, '{}'),
('Couscous', 'grain', 4, 2, true, '{"gluten"}'),
('Bulgur', 'grain', 7, 1, true, '{"gluten"}'),
('Barley', 'grain', 8, 2, true, '{"gluten"}'),
('Millet', 'grain', 6, 1, true, '{}'),
('Buckwheat', 'grain', 7, 1, true, '{}')
ON CONFLICT (name) DO NOTHING;

-- More Fruits
INSERT INTO food_database (name, category, fiber_score, trigger_risk, is_plant, common_triggers) VALUES
('Strawberry', 'fruit', 5, 1, true, '{"histamine"}'),
('Blueberry', 'fruit', 6, 0, true, '{}'),
('Raspberry', 'fruit', 7, 1, true, '{}'),
('Mango', 'fruit', 5, 1, true, '{}'),
('Pineapple', 'fruit', 5, 2, true, '{"histamine"}'),
('Watermelon', 'fruit', 3, 1, true, '{}'),
('Grapes', 'fruit', 3, 1, true, '{"fodmap"}'),
('Kiwi', 'fruit', 6, 1, true, '{}'),
('Peach', 'fruit', 5, 2, true, '{"fodmap"}'),
('Pear', 'fruit', 6, 2, true, '{"fodmap"}')
ON CONFLICT (name) DO NOTHING;

-- Common Dishes & Meals
INSERT INTO food_database (name, category, fiber_score, trigger_risk, is_plant, common_triggers) VALUES
('Fried Rice', 'meal', 3, 3, false, '{"soy"}'),
('Noodles', 'meal', 3, 3, false, '{"gluten"}'),
('Ramen', 'meal', 3, 4, false, '{"gluten", "soy"}'),
('Pho', 'meal', 4, 2, false, '{}'),
('Pad Thai', 'meal', 4, 3, false, '{"peanuts", "soy"}'),
('Spring Roll', 'meal', 5, 2, true, '{}'),
('Dumpling', 'meal', 3, 3, false, '{"gluten", "soy"}'),
('Quesadilla', 'meal', 3, 4, false, '{"dairy", "gluten"}'),
('Nachos', 'meal', 3, 4, false, '{"dairy", "corn"}'),
('Falafel', 'meal', 7, 2, true, '{"fodmap"}'),
('Hummus', 'meal', 7, 2, true, '{"fodmap"}'),
('Guacamole', 'meal', 6, 1, true, '{}'),
('Omelette', 'meal', 0, 2, false, '{"egg", "dairy"}'),
('Scrambled Eggs', 'meal', 0, 2, false, '{"egg"}'),
('Pancakes', 'meal', 2, 4, false, '{"gluten", "dairy", "egg"}'),
('Waffles', 'meal', 2, 4, false, '{"gluten", "dairy", "egg"}'),
('French Toast', 'meal', 2, 4, false, '{"gluten", "dairy", "egg"}'),
('Smoothie Bowl', 'meal', 7, 1, true, '{}'),
('Poke Bowl', 'meal', 6, 1, false, '{"soy"}'),
('Buddha Bowl', 'meal', 8, 1, true, '{}'),
('Grain Bowl', 'meal', 7, 1, true, '{}'),
('Burrito Bowl', 'meal', 6, 2, false, '{}')
ON CONFLICT (name) DO NOTHING;

-- Snacks
INSERT INTO food_database (name, category, fiber_score, trigger_risk, is_plant, common_triggers) VALUES
('Chips', 'processed', 2, 4, true, '{"fried"}'),
('Popcorn', 'snack', 6, 1, true, '{}'),
('Crackers', 'snack', 2, 3, true, '{"gluten"}'),
('Granola', 'snack', 5, 2, true, '{}'),
('Trail Mix', 'snack', 6, 2, true, '{"nuts"}'),
('Protein Bar', 'snack', 4, 2, false, '{}'),
('Energy Bar', 'snack', 4, 2, true, '{}'),
('Pretzels', 'snack', 2, 3, true, '{"gluten"}')
ON CONFLICT (name) DO NOTHING;

-- Desserts
INSERT INTO food_database (name, category, fiber_score, trigger_risk, is_plant, common_triggers) VALUES
('Brownie', 'processed', 1, 5, false, '{"gluten", "dairy", "sugar"}'),
('Cookie', 'processed', 1, 5, false, '{"gluten", "dairy", "sugar"}'),
('Muffin', 'processed', 2, 4, false, '{"gluten", "dairy", "sugar"}'),
('Donut', 'processed', 1, 5, false, '{"gluten", "dairy", "sugar", "fried"}'),
('Pie', 'processed', 2, 5, false, '{"gluten", "dairy", "sugar"}'),
('Pudding', 'processed', 0, 4, false, '{"dairy", "sugar"}'),
('Custard', 'processed', 0, 4, false, '{"dairy", "egg", "sugar"}'),
('Tiramisu', 'processed', 1, 5, false, '{"gluten", "dairy", "egg", "caffeine"}'),
('Cheesecake', 'processed', 1, 5, false, '{"gluten", "dairy", "sugar"}'),
('Chocolate', 'processed', 2, 4, true, '{"sugar", "caffeine"}')
ON CONFLICT (name) DO NOTHING;

-- Beverages
INSERT INTO food_database (name, category, fiber_score, trigger_risk, is_plant, common_triggers) VALUES
('Tea', 'beverage', 0, 1, true, '{"caffeine"}'),
('Green Tea', 'beverage', 0, 1, true, '{"caffeine"}'),
('Milk', 'beverage', 0, 3, false, '{"dairy"}'),
('Almond Milk', 'beverage', 1, 1, true, '{"nuts"}'),
('Oat Milk', 'beverage', 2, 1, true, '{}'),
('Juice', 'beverage', 1, 3, true, '{"sugar"}'),
('Orange Juice', 'beverage', 1, 2, true, '{"citrus"}'),
('Smoothie', 'beverage', 5, 1, true, '{}'),
('Protein Shake', 'beverage', 2, 2, false, '{"dairy"}'),
('Lemonade', 'beverage', 0, 3, true, '{"sugar"}'),
('Iced Tea', 'beverage', 0, 2, true, '{"caffeine", "sugar"}')
ON CONFLICT (name) DO NOTHING;

-- Condiments & Toppings
INSERT INTO food_database (name, category, fiber_score, trigger_risk, is_plant, common_triggers) VALUES
('Peanut Butter', 'snack', 4, 3, true, '{"peanuts"}'),
('Almond Butter', 'snack', 5, 2, true, '{"nuts"}'),
('Jam', 'processed', 1, 3, true, '{"sugar"}'),
('Honey', 'processed', 0, 2, true, '{"sugar"}'),
('Maple Syrup', 'processed', 0, 3, true, '{"sugar"}'),
('Ketchup', 'processed', 1, 3, true, '{"sugar", "histamine"}'),
('Mayonnaise', 'processed', 0, 3, false, '{"egg"}'),
('Mustard', 'processed', 1, 1, true, '{}'),
('Soy Sauce', 'processed', 0, 3, true, '{"soy", "gluten"}'),
('Hot Sauce', 'processed', 1, 2, true, '{"spicy"}'),
('Salsa', 'processed', 2, 2, true, '{"nightshade"}')
ON CONFLICT (name) DO NOTHING;
