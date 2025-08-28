-- EN BASİT HALİ - Sadece auth kontrolü

-- Temizlik
DROP POLICY IF EXISTS "members_select" ON company_members;
DROP POLICY IF EXISTS "members_insert" ON company_members;
DROP POLICY IF EXISTS "members_update" ON company_members;
DROP POLICY IF EXISTS "members_delete" ON company_members;

DROP POLICY IF EXISTS "companies_select" ON companies;
DROP POLICY IF EXISTS "companies_insert" ON companies;
DROP POLICY IF EXISTS "companies_update" ON companies;
DROP POLICY IF EXISTS "companies_delete" ON companies;

-- RLS aç
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_members ENABLE ROW LEVEL SECURITY;

-- Sadece giriş yapmış kullanıcılar için
CREATE POLICY "auth_companies_all" ON companies
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "auth_members_all" ON company_members
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Categories ve transactions için de basitleştir
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_categories_all" ON categories
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "auth_transactions_all" ON transactions
  FOR ALL USING (auth.uid() IS NOT NULL);