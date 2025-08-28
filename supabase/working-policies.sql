-- ÇALIŞAN POLİCY'LER - Recursion olmadan

-- Önce tüm eski policy'leri temizle
DROP POLICY IF EXISTS "Members can view company members" ON company_members;
DROP POLICY IF EXISTS "Users can insert self as member" ON company_members;
DROP POLICY IF EXISTS "Admins can update members" ON company_members;
DROP POLICY IF EXISTS "Admins can delete members" ON company_members;
DROP POLICY IF EXISTS "Anyone can view members of their companies" ON company_members;
DROP POLICY IF EXISTS "System can insert members" ON company_members;
DROP POLICY IF EXISTS "Admins can update" ON company_members;
DROP POLICY IF EXISTS "Admins can delete" ON company_members;

DROP POLICY IF EXISTS "Users can view companies they are member of" ON companies;
DROP POLICY IF EXISTS "Only owner can update company" ON companies;
DROP POLICY IF EXISTS "Users can create companies" ON companies;
DROP POLICY IF EXISTS "Users can view all companies" ON companies;
DROP POLICY IF EXISTS "Owners can update their companies" ON companies;

-- RLS'i tekrar aç
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_members ENABLE ROW LEVEL SECURITY;

-- COMPANIES POLİCY'LERİ
CREATE POLICY "companies_select" ON companies
  FOR SELECT USING (
    auth.uid() IS NOT NULL
  );

CREATE POLICY "companies_insert" ON companies
  FOR INSERT WITH CHECK (
    auth.uid() = owner_id
  );

CREATE POLICY "companies_update" ON companies
  FOR UPDATE USING (
    auth.uid() = owner_id
  );

CREATE POLICY "companies_delete" ON companies
  FOR DELETE USING (
    auth.uid() = owner_id
  );

-- COMPANY_MEMBERS POLİCY'LERİ (Basitleştirilmiş)
CREATE POLICY "members_select" ON company_members
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() IN (
      SELECT owner_id FROM companies WHERE id = company_id
    )
  );

CREATE POLICY "members_insert" ON company_members
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR
    auth.uid() IN (
      SELECT owner_id FROM companies WHERE id = company_id
    )
  );

CREATE POLICY "members_update" ON company_members
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT owner_id FROM companies WHERE id = company_id
    )
  );

CREATE POLICY "members_delete" ON company_members
  FOR DELETE USING (
    auth.uid() IN (
      SELECT owner_id FROM companies WHERE id = company_id
    )
  );