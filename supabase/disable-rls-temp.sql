-- GEÇİCİ ÇÖZÜM: RLS'i kapat
-- Not: Bu güvenlik açığı yaratır, sadece test için kullan!

ALTER TABLE company_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;

-- Daha sonra düzgün policy'lerle tekrar açılmalı