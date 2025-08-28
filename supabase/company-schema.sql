-- Şirketler tablosu
CREATE TABLE IF NOT EXISTS companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invite_code VARCHAR(6),
  invite_code_expires_at TIMESTAMP WITH TIME ZONE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Şirket üyeleri tablosu
CREATE TABLE IF NOT EXISTS company_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) CHECK (role IN ('owner', 'admin', 'user')) NOT NULL DEFAULT 'user',
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(company_id, user_id)
);

-- Mevcut transactions tablosuna yeni kolonlar ekle
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Mevcut categories tablosuna company_id ekle
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;

-- Companies için RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_members ENABLE ROW LEVEL SECURITY;

-- Companies politikaları
CREATE POLICY "Users can view companies they are member of" ON companies
  FOR SELECT USING (
    id IN (
      SELECT company_id FROM company_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Only owner can update company" ON companies
  FOR UPDATE USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can create companies" ON companies
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Company members politikaları  
CREATE POLICY "Members can view company members" ON company_members
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM company_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage company members" ON company_members
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM company_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Transactions güncelleme (company bazlı)
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;

CREATE POLICY "Users can view company transactions" ON transactions
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM company_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Members can insert transactions" ON transactions
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT company_id FROM company_members 
      WHERE user_id = auth.uid()
    ) AND created_by = auth.uid()
  );

CREATE POLICY "Members can update own transactions" ON transactions
  FOR UPDATE USING (
    created_by = auth.uid() OR
    company_id IN (
      SELECT company_id FROM company_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Members can delete transactions" ON transactions
  FOR DELETE USING (
    created_by = auth.uid() OR
    company_id IN (
      SELECT company_id FROM company_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Categories güncelleme (company bazlı)
DROP POLICY IF EXISTS "Users can view own categories" ON categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON categories;
DROP POLICY IF EXISTS "Users can update own categories" ON categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON categories;

CREATE POLICY "Users can view company categories" ON categories
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM company_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Members can manage categories" ON categories
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM company_members 
      WHERE user_id = auth.uid()
    )
  );

-- Davet kodu üretme fonksiyonu
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
BEGIN
  -- 6 haneli rastgele kod üret
  code := LPAD((FLOOR(RANDOM() * 999999)::INT)::TEXT, 6, '0');
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Davet kodu yenileme fonksiyonu
CREATE OR REPLACE FUNCTION refresh_invite_code(company_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
BEGIN
  new_code := generate_invite_code();
  
  UPDATE companies 
  SET 
    invite_code = new_code,
    invite_code_expires_at = NOW() + INTERVAL '30 minutes',
    updated_at = NOW()
  WHERE id = company_uuid;
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Updated_at otomatik güncelleme
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Kullanıcı bilgilerini getiren view
CREATE OR REPLACE VIEW user_profiles AS
SELECT 
  id,
  raw_user_meta_data->>'full_name' as full_name,
  email
FROM auth.users;

-- Varsayılan kategorileri şirket bazlı oluşturma
CREATE OR REPLACE FUNCTION create_company_default_categories(company_uuid UUID)
RETURNS VOID AS $$
BEGIN
  -- Gelir kategorileri
  INSERT INTO categories (name, type, color, icon, company_id) VALUES
  ('Maaş', 'income', '#10b981', 'wallet', company_uuid),
  ('Satış', 'income', '#3b82f6', 'shopping-cart', company_uuid),
  ('Diğer Gelir', 'income', '#8b5cf6', 'plus-circle', company_uuid);
  
  -- Gider kategorileri
  INSERT INTO categories (name, type, color, icon, company_id) VALUES
  ('Market', 'expense', '#ef4444', 'shopping-bag', company_uuid),
  ('Faturalar', 'expense', '#f59e0b', 'receipt', company_uuid),
  ('Kira', 'expense', '#ec4899', 'home', company_uuid),
  ('Ulaşım', 'expense', '#06b6d4', 'car', company_uuid),
  ('Yemek', 'expense', '#84cc16', 'utensils', company_uuid),
  ('Diğer Gider', 'expense', '#6b7280', 'minus-circle', company_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;