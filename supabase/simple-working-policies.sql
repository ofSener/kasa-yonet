-- BASİT VE ÇALIŞAN RLS POLİCY'LERİ
-- Bu dosyayı Supabase SQL Editor'de çalıştır

-- Önce mevcut tüm policy'leri temizle
DROP POLICY IF EXISTS "companies_select" ON companies;
DROP POLICY IF EXISTS "companies_insert" ON companies;  
DROP POLICY IF EXISTS "companies_update" ON companies;
DROP POLICY IF EXISTS "companies_delete" ON companies;

DROP POLICY IF EXISTS "members_select" ON company_members;
DROP POLICY IF EXISTS "members_insert" ON company_members;
DROP POLICY IF EXISTS "members_update" ON company_members;
DROP POLICY IF EXISTS "members_delete" ON company_members;

DROP POLICY IF EXISTS "categories_select" ON categories;
DROP POLICY IF EXISTS "categories_insert" ON categories;
DROP POLICY IF EXISTS "categories_update" ON categories;  
DROP POLICY IF EXISTS "categories_delete" ON categories;

DROP POLICY IF EXISTS "transactions_select" ON transactions;
DROP POLICY IF EXISTS "transactions_insert" ON transactions;
DROP POLICY IF EXISTS "transactions_update" ON transactions;
DROP POLICY IF EXISTS "transactions_delete" ON transactions;

-- RLS'i etkinleştir
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- COMPANY_MEMBERS - EN ÖNEMLİSİ, BU ÇALIŞMALI!
-- Kullanıcı sadece kendi üyeliklerini görebilir
CREATE POLICY "members_select" ON company_members
  FOR SELECT USING (user_id = auth.uid());

-- Kullanıcı kendini şirkete ekleyebilir (davet kodu ile)
CREATE POLICY "members_insert" ON company_members  
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Sadece owner üyeleri yönetebilir
CREATE POLICY "members_update" ON company_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM companies 
      WHERE id = company_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "members_delete" ON company_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM companies 
      WHERE id = company_id AND owner_id = auth.uid()
    )
  );

-- COMPANIES - Basit yaklaşım
-- Herkesten görülebilir (davet kodu için gerekli)
CREATE POLICY "companies_select" ON companies
  FOR SELECT USING (true);

-- Sadece authenticated user şirket oluşturabilir
CREATE POLICY "companies_insert" ON companies
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Sadece owner güncelleyebilir
CREATE POLICY "companies_update" ON companies
  FOR UPDATE USING (owner_id = auth.uid());

-- Sadece owner silebilir  
CREATE POLICY "companies_delete" ON companies
  FOR DELETE USING (owner_id = auth.uid());

-- CATEGORIES - Şirket üyesi olanlar erişebilir
CREATE POLICY "categories_select" ON categories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM company_members cm 
      WHERE cm.company_id = categories.company_id 
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "categories_insert" ON categories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM company_members cm 
      WHERE cm.company_id = categories.company_id 
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "categories_update" ON categories
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM company_members cm 
      WHERE cm.company_id = categories.company_id 
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "categories_delete" ON categories
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM company_members cm 
      WHERE cm.company_id = categories.company_id 
      AND cm.user_id = auth.uid()
    )
  );

-- TRANSACTIONS - Şirket üyesi olanlar erişebilir
CREATE POLICY "transactions_select" ON transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM company_members cm 
      WHERE cm.company_id = transactions.company_id 
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "transactions_insert" ON transactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM company_members cm 
      WHERE cm.company_id = transactions.company_id 
      AND cm.user_id = auth.uid()
    )
    AND created_by = auth.uid()
  );

CREATE POLICY "transactions_update" ON transactions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM company_members cm 
      WHERE cm.company_id = transactions.company_id 
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "transactions_delete" ON transactions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM company_members cm 
      WHERE cm.company_id = transactions.company_id 
      AND cm.user_id = auth.uid()
    )
  );