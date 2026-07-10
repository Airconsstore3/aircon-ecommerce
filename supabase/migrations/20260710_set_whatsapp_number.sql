-- Set business WhatsApp number to +27767100588
INSERT INTO settings (whatsapp_number) VALUES ('+27767100588')
ON CONFLICT (id) DO UPDATE SET whatsapp_number = '+27767100588';
