-- Önce mevcut trigger'ı kaldır
DROP TRIGGER IF EXISTS create_user_default_categories ON auth.users;
DROP FUNCTION IF EXISTS create_default_categories();

-- Daha basit bir trigger fonksiyonu oluştur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Kullanıcı için varsayılan kategoriler oluştur
  INSERT INTO public.categories (name, type, color, icon, user_id) VALUES
  ('Maaş', 'income', '#10b981', 'wallet', NEW.id),
  ('Satış', 'income', '#3b82f6', 'shopping-cart', NEW.id),
  ('Diğer Gelir', 'income', '#8b5cf6', 'plus-circle', NEW.id),
  ('Market', 'expense', '#ef4444', 'shopping-bag', NEW.id),
  ('Faturalar', 'expense', '#f59e0b', 'receipt', NEW.id),
  ('Kira', 'expense', '#ec4899', 'home', NEW.id),
  ('Ulaşım', 'expense', '#06b6d4', 'car', NEW.id),
  ('Yemek', 'expense', '#84cc16', 'utensils', NEW.id),
  ('Diğer Gider', 'expense', '#6b7280', 'minus-circle', NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Yeni trigger'ı ekle
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS politikalarını kontrol et
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;