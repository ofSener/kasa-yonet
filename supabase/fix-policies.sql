-- Önce mevcut politikaları kaldır
DROP POLICY IF EXISTS "Members can view company members" ON company_members;
DROP POLICY IF EXISTS "Admins can manage company members" ON company_members;

-- Yeni, daha basit politikalar
CREATE POLICY "Members can view company members" ON company_members
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM company_members cm2
      WHERE cm2.company_id = company_members.company_id
    )
  );

CREATE POLICY "Users can insert self as member" ON company_members
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
  );

CREATE POLICY "Admins can update members" ON company_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM company_members cm2
      WHERE cm2.company_id = company_members.company_id
      AND cm2.user_id = auth.uid()
      AND cm2.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Admins can delete members" ON company_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM company_members cm2
      WHERE cm2.company_id = company_members.company_id
      AND cm2.user_id = auth.uid()
      AND cm2.role IN ('owner', 'admin')
    )
  );

-- User profiles view güvenlik ayarı
GRANT SELECT ON user_profiles TO authenticated;

-- RPC fonksiyonları için güvenlik
GRANT EXECUTE ON FUNCTION refresh_invite_code TO authenticated;
GRANT EXECUTE ON FUNCTION create_company_default_categories TO authenticated;