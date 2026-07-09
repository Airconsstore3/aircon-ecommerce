-- Update LG products with new webp images
UPDATE products
SET images = '["/Hero Images/Product category pictures/LG Art Cool - Inverter.webp","/Hero Images/Product category pictures/LG Art Cool - Inverter front.webp","/Hero Images/Product category pictures/LG Art Cool - Inverter side.webp","/Hero Images/Product category pictures/LG Art Cool - Inverter 3.webp","/Hero Images/Product category pictures/LG Art Cool - Inverter4.webp"]'::jsonb
WHERE brand = 'LG' AND name ILIKE '%art cool%';

UPDATE products
SET images = '["/Hero Images/Product category pictures/LG Ceiling Cassette - Inverter.webp"]'::jsonb
WHERE brand = 'LG' AND name ILIKE '%ceiling cassette%';

UPDATE products
SET images = '["/Hero Images/Product category pictures/LG Round Flow Cassette - Inverter.webp"]'::jsonb
WHERE brand = 'LG' AND name ILIKE '%round flow cassette%';

UPDATE products
SET images = '["/Hero Images/Product category pictures/LG Commercial RAC - Inverter.webp","/Hero Images/Product category pictures/LG Commercial RAC - Inverter  fromt.webp","/Hero Images/Product category pictures/LG Commercial RAC - Inverter condenser.webp"]'::jsonb
WHERE brand = 'LG' AND name ILIKE '%commercial rac%';

UPDATE products
SET images = '["/Hero Images/Product category pictures/LG Dual Cool - Inverter front.webp","/Hero Images/Product category pictures/LG Dual Cool - Inverter 2.webp","/Hero Images/Product category pictures/LG Dual Cool - Inverter 3.webp","/Hero Images/Product category pictures/LG Dual Cool - Inverter 4.webp"]'::jsonb
WHERE brand = 'LG' AND name ILIKE '%dual cool%';

UPDATE products
SET images = '["/Hero Images/Product category pictures/LG Ducted Hide Away - Inverter.webp"]'::jsonb
WHERE brand = 'LG' AND name ILIKE '%ducted hide away%';

UPDATE products
SET images = '["/Hero Images/Product category pictures/LG Large Capacity Hide Away - Inverter.webp"]'::jsonb
WHERE brand = 'LG' AND name ILIKE '%large capacity hide away%';

UPDATE products
SET images = '["/Hero Images/Product category pictures/LG Non-Inverter R410A - Non-Inverter 1.webp","/Hero Images/Product category pictures/LG Non-Inverter R410A - Non-Inverter 2.webp","/Hero Images/Product category pictures/LG Non-Inverter R410A - Non-Inverter 3.webp","/Hero Images/Product category pictures/LG Non-Inverter R410A - Non-Inverter 4.webp","/Hero Images/Product category pictures/LG Non-Inverter R410A - Non-Inverter back.webp","/Hero Images/Product category pictures/LG Non-Inverter R410A - Non-Inverter side front.webp"]'::jsonb
WHERE brand = 'LG' AND name ILIKE '%r410a%';

UPDATE products
SET images = '["/Hero Images/Product category pictures/LG Rooftop Package - Inverter.webp"]'::jsonb
WHERE brand = 'LG' AND name ILIKE '%rooftop package%';

UPDATE products
SET images = '["/Hero Images/Product category pictures/LG Under Ceiling - Inverter.webp"]'::jsonb
WHERE brand = 'LG' AND name ILIKE '%under ceiling%';

-- Update LG deals with new webp images
UPDATE deals
SET images = '["/Hero Images/Product category pictures/LG Art Cool - Inverter.webp"]'::jsonb
WHERE name ILIKE '%LG%' AND name ILIKE '%art cool%';

UPDATE deals
SET images = '["/Hero Images/Product category pictures/LG Dual Cool - Inverter front.webp"]'::jsonb
WHERE name ILIKE '%LG%' AND name ILIKE '%dual cool%';

UPDATE deals
SET images = '["/Hero Images/Product category pictures/LG Non-Inverter R410A - Non-Inverter 1.webp"]'::jsonb
WHERE name ILIKE '%LG%' AND name ILIKE '%r410a%';
