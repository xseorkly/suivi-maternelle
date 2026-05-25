-- ============================================
-- 06_POLICIES_PARENTS.SQL
-- Politiques de sécurité pour les parents
-- Exécuter APRÈS 05_policies_teachers.sql
-- ============================================

-- ========== SETTINGS ==========
-- Les parents peuvent lire les paramètres généraux
CREATE POLICY "Parents can read settings"
ON settings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'parent'
  )
);

-- ========== PROFILES ==========
-- Les parents peuvent lire uniquement leur propre profil
CREATE POLICY "Parents can read own profile"
ON profiles FOR SELECT
USING (
  id = auth.uid()
  AND (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'parent'
    )
  )
);

-- Les parents peuvent modifier uniquement leur propre profil
CREATE POLICY "Parents can update own profile"
ON profiles FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- ========== CLASSES ==========
-- Les parents peuvent lire les classes de leurs enfants UNIQUEMENT
CREATE POLICY "Parents can read child classes"
ON classes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM parents p
    JOIN parents_eleves pe ON p.id = pe.parent_id
    JOIN eleves e ON pe.eleve_id = e.id
    WHERE p.profile_id = auth.uid()
    AND e.classe_id = classes.id
  )
);

-- ========== PARENTS ==========
-- Les parents peuvent lire uniquement leur propre profil parent
CREATE POLICY "Parents can read own parent profile"
ON parents FOR SELECT
USING (profile_id = auth.uid());

-- ========== ELEVES ==========
-- Les parents peuvent lire UNIQUEMENT leurs propres enfants
CREATE POLICY "Parents can read own children"
ON eleves FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM parents p
    JOIN parents_eleves pe ON p.id = pe.parent_id
    WHERE p.profile_id = auth.uid()
    AND pe.eleve_id = eleves.id
  )
);

-- ========== PARENTS_ELEVES ==========
-- Les parents peuvent lire UNIQUEMENT les associations concernant leurs enfants
CREATE POLICY "Parents can read own parents_eleves"
ON parents_eleves FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM parents p
    WHERE p.profile_id = auth.uid()
    AND p.id = parent_id
  )
);

-- ========== COMMENTAIRES ==========
-- Les parents peuvent lire UNIQUEMENT les commentaires de leurs enfants
CREATE POLICY "Parents can read own children commentaires"
ON commentaires FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM parents p
    JOIN parents_eleves pe ON p.id = pe.parent_id
    WHERE p.profile_id = auth.uid()
    AND pe.eleve_id = commentaires.eleve_id
  )
);

-- Les parents NE PEUVENT PAS créer de commentaires
-- Pas de politiques INSERT/UPDATE/DELETE pour les parents

-- ============================================
-- FIN: 06_policies_parents.sql
-- ============================================
