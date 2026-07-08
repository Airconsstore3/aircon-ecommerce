-- Update Samsung products with new webp images
UPDATE products
SET images = '["/Hero Images/Product category pictures/Samsung AR80 WindFree front.webp","/Hero Images/Product category pictures/Samsung AR80 WindFree open.webp","/Hero Images/Product category pictures/Samsung AR80 WindFree condenser front.webp"]'::jsonb
WHERE brand = 'Samsung' AND name LIKE '%9000BTU%' AND type = 'aircon';

UPDATE products
SET images = '["/Hero Images/Product category pictures/Samsung AR80 WindFree front.webp","/Hero Images/Product category pictures/Samsung AR80 WindFree open.webp"]'::jsonb
WHERE brand = 'Samsung' AND name LIKE '%9000BTU%' AND type = 'kit';

-- Update Samsung deals with new webp images
UPDATE deals
SET images = '["/Hero Images/Product category pictures/Samsung AR80 WindFree front.webp","/Hero Images/Product category pictures/Samsung AR80 WindFree open.webp"]'::jsonb
WHERE name LIKE '%Samsung%' AND slug LIKE '%winter-special%';

UPDATE deals
SET images = '["/Hero Images/Product category pictures/Samsung AR80 WindFree front.webp"]'::jsonb
WHERE name LIKE '%Unit + Annual Maintenance%';
