-- ============================================
-- 11_POLICIES_EVALUATIONS_FIXED.SQL
-- Policies RLS simplifiées pour evaluations
-- ============================================

-- ⚠️ D'ABORD, supprimer les anciennes policies
DROP POLICY IF EXISTS "enseignants_insert_evaluations" ON evaluations;
DROP POLICY IF EXISTS "enseignants_select_evaluations" ON evaluations;
DROP POLICY IF EXISTS "enseignants_update_evaluations" ON evaluations;
DROP POLICY IF EXISTS "parents_select_evaluations" ON evaluations;
DROP POLICY IF EXISTS "admin_select_evaluations" ON evaluations;
DROP POLICY IF EXISTS "admin_insert_evaluations" ON evaluations;
DROP POLICY IF EXISTS "admin_update_evaluations" ON evaluations;
DROP POLICY IF EXISTS "admin_delete_evaluations" ON evaluations;

-- ============================================
-- ENSEIGNANTS : Peuvent insérer et voir leurs évaluations
-- ============================================

CREATE POLICY "enseignants_insert_evaluations" ON evaluations
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT profile_id FROM enseignants WHERE id = enseignant_id
    )
  );

CREATE POLICY "enseignants_select_evaluations" ON evaluations
  FOR SELECT USING (
    auth.uid() IN (
      SELECT profile_id FROM enseignants WHERE id = enseignant_id
    )
  );

CREATE POLICY "enseignants_update_evaluations" ON evaluations
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT profile_id FROM enseignants WHERE id = enseignant_id
    )
  ) WITH CHECK (
    auth.uid() IN (
      SELECT profile_id FROM enseignants WHERE id = enseignant_id
    )
  );

-- ============================================
-- PARENTS : Peuvent voir les évaluations de leurs enfants
-- ============================================

-- Politique PERMISSIVE : les parents voient les évaluations
CREATE POLICY "parents_select_evaluations" ON evaluations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM parents p
      WHERE p.profile_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM parents_eleves pe
        WHERE pe.parent_id = p.id
        AND pe.eleve_id = evaluations.eleve_id
      )
    )
  );

-- ============================================
-- ADMIN : Accès complet
-- ============================================

CREATE POLICY "admin_all_evaluations" ON evaluations
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- ============================================
-- FIN: 11_policies_evaluations_FIXED.sql
-- ============================================