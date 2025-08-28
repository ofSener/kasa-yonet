-- TAM ÇÖZÜM - Tüm policy sorunlarını düzelt

-- Önce tüm eski policy'leri temizle
DROP POLICY IF EXISTS "Users can view own categories" ON categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON categories; 
DROP POLICY IF EXISTS "Users can update own categories" ON categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON categories;
DROP POLICY IF EXISTS "Users can view company categories" ON categories;
DROP POLICY IF EXISTS "Members can manage categories" ON categories;

DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can view company transactions" ON transactions;
DROP POLICY IF EXISTS "Members can insert transactions" ON transactions;
DROP POLICY IF EXISTS "Members can update own transactions" ON transactions;
DROP POLICY IF EXISTS "Members can delete transactions" ON transactions;

DROP POLICY IF EXISTS "Members can view company members" ON company_members;
DROP POLICY IF EXISTS "Admins can manage company members" ON company_members;
DROP POLICY IF EXISTS "members_select" ON company_members;
DROP POLICY IF EXISTS "members_insert" ON company_members;
DROP POLICY IF EXISTS "members_update" ON company_members;
DROP POLICY IF EXISTS "members_delete" ON company_members;

-- RLS'i etkinleştir
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_members ENABLE ROW LEVEL SECURITY;

-- CATEGORIES POLİCY'LERİ (Şirket bazlı)
CREATE POLICY "categories_select" ON categories
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM company_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "categories_insert" ON categories
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT company_id FROM company_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "categories_update" ON categories
  FOR UPDATE USING (
    company_id IN (
      SELECT company_id FROM company_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "categories_delete" ON categories
  FOR DELETE USING (
    company_id IN (
      SELECT company_id FROM company_members 
      WHERE user_id = auth.uid()
    )
  );

-- TRANSACTIONS POLİCY'LERİ (Şirket bazlı)
CREATE POLICY "transactions_select" ON transactions
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM company_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "transactions_insert" ON transactions
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT company_id FROM company_members 
      WHERE user_id = auth.uid()
    ) AND (created_by = auth.uid() OR created_by IS NULL)
  );

CREATE POLICY "transactions_update" ON transactions
  FOR UPDATE USING (
    company_id IN (
      SELECT company_id FROM company_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "transactions_delete" ON transactions
  FOR DELETE USING (
    company_id IN (
      SELECT company_id FROM company_members 
      WHERE user_id = auth.uid()
    )
  );

-- COMPANY_MEMBERS POLİCY'LERİ (Düzeltilmiş)
CREATE POLICY "members_select" ON company_members
  FOR SELECT USING (
    -- Kullanıcı kendi üyeliklerini görebilir
    auth.uid() = user_id OR 
    -- Şirket sahibi tüm üyeleri görebilir
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
    ) OR
    -- Aynı şirketteki üyeler birbirlerini görebilir
    company_id IN (
      SELECT company_id FROM company_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "members_insert" ON company_members
  FOR INSERT WITH CHECK (
    -- Kendini ekleyebilir (davet koduna katılırken)
    auth.uid() = user_id OR
    -- Şirket sahibi başkalarını ekleyebilir
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "members_update" ON company_members
  FOR UPDATE USING (
    -- Sadece şirket sahibi üyelikleri güncelleyebilir
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "members_delete" ON company_members
  FOR DELETE USING (
    -- Kendi üyeliğini silebilir veya şirket sahibi silebilir
    auth.uid() = user_id OR
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
    )
  );

-- COMPANIES POLİCY'LERİ (Mevcut düzgün çalışıyor, sadece referans için)
-- Bu policy'ler zaten working-policies.sql'de doğru tanımlanmış