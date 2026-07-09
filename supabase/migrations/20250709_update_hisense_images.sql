-- Update Hisense products with new webp images
UPDATE products
SET images = '["/Hero Images/Product category pictures/Hisense LCAC Cassette Inverter.webp","/Hero Images/Product category pictures/Hisense LCAC Cassette Inverter front.webp"]'::jsonb
WHERE brand = 'Hisense' AND (name ILIKE '%cassette%' AND name ILIKE '%inverter%');

UPDATE products
SET images = '["/Hero Images/Product category pictures/Hisense LCAC Cassette Non-Inverter.webp","/Hero Images/Product category pictures/Hisense LCAC Cassette Non-Inverter  front.webp"]'::jsonb
WHERE brand = 'Hisense' AND (name ILIKE '%cassette%' AND (name ILIKE '%non-inverter%' OR name ILIKE '%non inverter%'));

UPDATE products
SET images = '["/Hero Images/Product category pictures/Hisense LCAC Duct Type Inverter.webp"]'::jsonb
WHERE brand = 'Hisense' AND (name ILIKE '%duct%' AND name ILIKE '%inverter%');

UPDATE products
SET images = '["/Hero Images/Product category pictures/Hisense LCAC Duct Type Non-Inverter.webp"]'::jsonb
WHERE brand = 'Hisense' AND (name ILIKE '%duct%' AND (name ILIKE '%non-inverter%' OR name ILIKE '%non inverter%'));

UPDATE products
SET images = '["/Hero Images/Product category pictures/Hisense LCAC Floor Ceiling Inverter.webp"]'::jsonb
WHERE brand = 'Hisense' AND (name ILIKE '%floor%' AND name ILIKE '%ceiling%' AND name ILIKE '%inverter%');

UPDATE products
SET images = '["/Hero Images/Product category pictures/Hisense LCAC Floor Ceiling Non-Inverter.webp"]'::jsonb
WHERE brand = 'Hisense' AND (name ILIKE '%floor%' AND name ILIKE '%ceiling%' AND (name ILIKE '%non-inverter%' OR name ILIKE '%non inverter%'));

UPDATE products
SET images = '["/Hero Images/Product category pictures/Hisense RAC Inverter.webp"]'::jsonb
WHERE brand = 'Hisense' AND (name ILIKE '%rac%' AND name ILIKE '%inverter%');

UPDATE products
SET images = '["/Hero Images/Product category pictures/Hisense RAC Non-Inverter.webp"]'::jsonb
WHERE brand = 'Hisense' AND (name ILIKE '%rac%' AND (name ILIKE '%non-inverter%' OR name ILIKE '%non inverter%'));

-- Update Hisense deals with new webp images
UPDATE deals
SET images = '["/Hero Images/Product category pictures/Hisense LCAC Cassette Inverter.webp"]'::jsonb
WHERE name ILIKE '%Hisense%' AND name ILIKE '%cassette%';

UPDATE deals
SET images = '["/Hero Images/Product category pictures/Hisense LCAC Duct Type Inverter.webp"]'::jsonb
WHERE name ILIKE '%Hisense%' AND name ILIKE '%duct%';

UPDATE deals
SET images = '["/Hero Images/Product category pictures/Hisense RAC Inverter.webp"]'::jsonb
WHERE name ILIKE '%Hisense%' AND (name ILIKE '%rac%' OR name ILIKE '%wall%');
