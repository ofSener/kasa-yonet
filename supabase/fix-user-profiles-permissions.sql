-- USER_PROFILES VE TRANSACTION USER BİLGİLERİ İÇİN DÜZELTMELER

-- user_profiles view'ı için RLS policy ekle
-- NOT: View'lar için policy doğrudan eklenemez, auth.users tablosuna bakmamız gerekiyor

-- Alternatif: Doğrudan auth.users'dan veri çekebilmemiz için function oluşturalım
CREATE OR REPLACE FUNCTION get_user_profile(user_uuid uuid)
RETURNS TABLE(id uuid, email text, full_name text) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    au.id,
    au.email::text,
    (au.raw_user_meta_data->>'full_name')::text as full_name
  FROM auth.users au
  WHERE au.id = user_uuid;
$$;

-- Takım üyeleri için geliştirilmiş function
CREATE OR REPLACE FUNCTION get_company_members_with_users(company_uuid uuid)
RETURNS TABLE(
  id uuid, 
  user_id uuid, 
  role text, 
  joined_at timestamptz,
  user_email text,
  user_full_name text
) 
LANGUAGE sql
SECURITY DEFINER  
AS $$
  SELECT 
    cm.id,
    cm.user_id,
    cm.role,
    cm.joined_at,
    au.email::text as user_email,
    (au.raw_user_meta_data->>'full_name')::text as user_full_name
  FROM company_members cm
  JOIN auth.users au ON cm.user_id = au.id
  WHERE cm.company_id = company_uuid
  ORDER BY cm.joined_at ASC;
$$;

-- İşlemler için created_by user bilgisiyle birlikte getiren function
CREATE OR REPLACE FUNCTION get_company_transactions_with_users(company_uuid uuid)
RETURNS TABLE(
  id uuid,
  amount numeric,
  type text,
  description text,
  category_id uuid,
  user_id uuid,
  company_id uuid,
  created_by uuid,
  transaction_date date,
  created_at timestamptz,
  updated_at timestamptz,
  created_by_email text,
  created_by_name text,
  category_name text,
  category_color text
)
LANGUAGE sql  
SECURITY DEFINER
AS $$
  SELECT 
    t.id,
    t.amount,
    t.type,
    t.description,
    t.category_id,
    t.user_id,
    t.company_id,
    t.created_by,
    t.transaction_date,
    t.created_at,
    t.updated_at,
    au.email::text as created_by_email,
    (au.raw_user_meta_data->>'full_name')::text as created_by_name,
    c.name as category_name,
    c.color as category_color
  FROM transactions t
  LEFT JOIN auth.users au ON t.created_by = au.id
  LEFT JOIN categories c ON t.category_id = c.id
  WHERE t.company_id = company_uuid
  ORDER BY t.transaction_date DESC, t.created_at DESC;
$$;