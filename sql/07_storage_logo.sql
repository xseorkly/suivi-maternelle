-- ============================================
-- 07_STORAGE_LOGO.SQL
-- Configuration du stockage pour les logos
-- Exécuter APRÈS 06_policies_parents.sql
-- ============================================

-- Note: Le bucket "logod" doit être créé manuellement dans Supabase
-- depuis l'interface Storage avant d'exécuter ce fichier.
-- Il doit être PUBLIC pour permettre la lecture des logos.

-- Créer les politiques pour le bucket logod
-- (ces politiques sont appliquées via l'interface Supabase)

-- POLITIQUE: Admin peut tout faire (upload, delete, read)
-- POLITIQUE: Public peut lire les fichiers du bucket logod
-- POLITIQUE: Enseignants et parents peuvent lire les fichiers
-- POLITIQUE: Seul admin peut créer/supprimer

-- En Supabase UI, définir les permissions du bucket logod:
-- ✅ Public: SELECT (lecture publique)
-- ✅ Admin: SELECT, INSERT, UPDATE, DELETE
-- ✅ Teachers: SELECT (lecture)
-- ✅ Parents: SELECT (lecture)

-- Pour créer les politiques via SQL dans Supabase:
-- Allez dans Policies → logod bucket et ajoutez les règles suivantes:

-- 1. Lecture publique (tous les utilisateurs peuvent lire)
CREATE POLICY "Public can read logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'logod');

-- 2. Admin peut upload les logos
CREATE POLICY "Admin can upload logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'logod'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- 3. Admin peut supprimer les logos
CREATE POLICY "Admin can delete logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'logod'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- ============================================
-- INSTRUCTIONS MANUELLES POUR SUPABASE UI
-- ============================================
-- Si les politiques SQL ne s'appliquent pas:
--
-- 1. Allez dans Storage → logod
-- 2. Cliquez sur "Policies" (icône cadenas)
-- 3. Créez les politiques suivantes:
--
-- Politique 1: "Public Read"
--   - Operation: SELECT
--   - Target role: postgres (ou public)
--   - Using clause: AUCUN (lecture publique)
--
-- Politique 2: "Admin Upload"
--   - Operation: INSERT
--   - Target role: authenticated
--   - Using clause: auth.jwt() ->> 'role' = 'admin'
--
-- Politique 3: "Admin Delete"
--   - Operation: DELETE
--   - Target role: authenticated
--   - Using clause: auth.jwt() ->> 'role' = 'admin'
--
-- ============================================

-- ============================================
-- FIN: 07_storage_logo.sql
-- ============================================
