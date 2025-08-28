-- GEÇİCİ - RLS'i disable et debugging için
-- Bu dosyayı Supabase SQL Editor'de çalıştır

-- RLS'i geçici olarak kapat
ALTER TABLE company_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;

-- Kontrol için - hangi kullanıcının hangi şirketlerde üye olduğunu görün
SELECT 
    cm.user_id, 
    cm.company_id, 
    cm.role, 
    c.name as company_name,
    cm.joined_at
FROM company_members cm
JOIN companies c ON cm.company_id = c.id
ORDER BY cm.user_id, cm.joined_at;

-- Users tablosu kontrol
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5;