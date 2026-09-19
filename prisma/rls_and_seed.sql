-- ========================================================
-- RLS POLICIES & SEED DATA FOR CUTEODS ORDER MANAGEMENT SYSTEM
-- ========================================================

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Lead" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Inventory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."OrderItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Attachment" ENABLE ROW LEVEL SECURITY;

-- Helper function to fetch the current authenticated user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS "Role" AS $$
  SELECT role FROM public."User" WHERE id = auth.uid()::text LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- --------------------------------------------------------
-- 1. USER POLICIES
-- --------------------------------------------------------
DROP POLICY IF EXISTS "User_read_own_or_admin" ON public."User";
CREATE POLICY "User_read_own_or_admin" ON public."User"
  FOR SELECT USING (
    id = auth.uid()::text OR public.get_user_role() = 'ADMIN'
  );

DROP POLICY IF EXISTS "User_insert_auth" ON public."User";
CREATE POLICY "User_insert_auth" ON public."User"
  FOR INSERT WITH CHECK (
    id = auth.uid()::text OR public.get_user_role() = 'ADMIN'
  );

-- --------------------------------------------------------
-- 2. LEAD POLICIES (Sales & Admin)
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Lead_sales_admin_select" ON public."Lead";
CREATE POLICY "Lead_sales_admin_select" ON public."Lead"
  FOR SELECT USING (
    public.get_user_role() IN ('SALES', 'ADMIN')
  );

DROP POLICY IF EXISTS "Lead_sales_admin_insert" ON public."Lead";
CREATE POLICY "Lead_sales_admin_insert" ON public."Lead"
  FOR INSERT WITH CHECK (
    public.get_user_role() IN ('SALES', 'ADMIN')
  );

DROP POLICY IF EXISTS "Lead_sales_admin_update" ON public."Lead";
CREATE POLICY "Lead_sales_admin_update" ON public."Lead"
  FOR UPDATE USING (
    public.get_user_role() IN ('SALES', 'ADMIN')
  );

-- --------------------------------------------------------
-- 3. PRODUCT & INVENTORY MATERIAL POLICIES
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Product_read_authenticated" ON public."Product";
CREATE POLICY "Product_read_authenticated" ON public."Product"
  FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'anon' OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Inventory_read_authenticated" ON public."Inventory";
CREATE POLICY "Inventory_read_authenticated" ON public."Inventory"
  FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'anon' OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Inventory_update_sales_admin" ON public."Inventory";
CREATE POLICY "Inventory_update_sales_admin" ON public."Inventory"
  FOR UPDATE USING (
    public.get_user_role() IN ('SALES', 'ADMIN')
  );

-- --------------------------------------------------------
-- 4. ORDER POLICIES
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Order_sales_admin_all" ON public."Order";
CREATE POLICY "Order_sales_admin_all" ON public."Order"
  FOR ALL USING (
    public.get_user_role() IN ('SALES', 'ADMIN')
  );

DROP POLICY IF EXISTS "Order_design_prod_select" ON public."Order";
CREATE POLICY "Order_design_prod_select" ON public."Order"
  FOR SELECT USING (
    public.get_user_role() IN ('DESIGN', 'PRODUCTION')
  );

-- --------------------------------------------------------
-- 5. ORDER ITEM POLICIES (Enforces Role Queue Isolation)
-- --------------------------------------------------------
DROP POLICY IF EXISTS "OrderItem_sales_admin_all" ON public."OrderItem";
CREATE POLICY "OrderItem_sales_admin_all" ON public."OrderItem"
  FOR ALL USING (
    public.get_user_role() IN ('SALES', 'ADMIN')
  );

DROP POLICY IF EXISTS "OrderItem_design_policy" ON public."OrderItem";
CREATE POLICY "OrderItem_design_policy" ON public."OrderItem"
  FOR SELECT USING (
    public.get_user_role() = 'DESIGN' AND status IN ('PENDING_DESIGN', 'DESIGN_COMPLETE')
  );

DROP POLICY IF EXISTS "OrderItem_design_update" ON public."OrderItem";
CREATE POLICY "OrderItem_design_update" ON public."OrderItem"
  FOR UPDATE USING (
    public.get_user_role() = 'DESIGN' AND status = 'PENDING_DESIGN'
  );

DROP POLICY IF EXISTS "OrderItem_production_policy" ON public."OrderItem";
CREATE POLICY "OrderItem_production_policy" ON public."OrderItem"
  FOR SELECT USING (
    public.get_user_role() = 'PRODUCTION' AND status IN ('DESIGN_COMPLETE', 'COMPLETED')
  );

DROP POLICY IF EXISTS "OrderItem_production_update" ON public."OrderItem";
CREATE POLICY "OrderItem_production_update" ON public."OrderItem"
  FOR UPDATE USING (
    public.get_user_role() = 'PRODUCTION' AND status = 'DESIGN_COMPLETE'
  );

-- --------------------------------------------------------
-- 6. ATTACHMENT POLICIES
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Attachment_authenticated_all" ON public."Attachment";
CREATE POLICY "Attachment_authenticated_all" ON public."Attachment"
  FOR ALL USING (
    auth.role() = 'authenticated' OR auth.role() = 'service_role'
  );

-- --------------------------------------------------------
-- 7. SUPABASE STORAGE BUCKET CREATION (orders)
-- --------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('orders', 'orders', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Storage orders policy" ON storage.objects;
CREATE POLICY "Storage orders policy" ON storage.objects
  FOR ALL USING (bucket_id = 'orders');

-- --------------------------------------------------------
-- 8. SEED DATA FOR TESTING & DEMO
-- --------------------------------------------------------
-- Demo Users
INSERT INTO public."User" (id, name, role, "createdAt") VALUES
  ('usr_sales_1', 'Sarah Salesperson', 'SALES', NOW()),
  ('usr_design_1', 'Dan Designer', 'DESIGN', NOW()),
  ('usr_prod_1', 'Pete Production', 'PRODUCTION', NOW()),
  ('usr_admin_1', 'Alice Admin', 'ADMIN', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role;

-- Demo Made-to-Order Products
INSERT INTO public."Product" (id, name) VALUES
  ('prod_1', 'Kids Half Set'),
  ('prod_2', 'Romper Suit'),
  ('prod_3', 'Party Frock')
ON CONFLICT (id) DO NOTHING;

-- Demo Inventory Materials (Bows, Ribbons, Patches with stockQty)
INSERT INTO public."Inventory" (id, name, color, size, "stockQty", "createdAt") VALUES
  ('inv_bow_pink_large', 'Bow', 'Pink', 'Large', 25, NOW()),
  ('inv_bow_red_small', 'Bow', 'Red', 'Small', 12, NOW()),
  ('inv_bow_gold_med', 'Bow', 'Gold', 'Medium', 0, NOW()), -- Out of stock example
  ('inv_ribbon_white', 'Silk Ribbon', 'White', '2m', 30, NOW()),
  ('inv_patch_bear', 'Embroidered Bear Patch', 'Brown', 'One-Size', 15, NOW()),
  ('inv_flower_gold', 'Satin Flower Accent', 'Gold', 'Medium', 8, NOW())
ON CONFLICT (id) DO NOTHING;
