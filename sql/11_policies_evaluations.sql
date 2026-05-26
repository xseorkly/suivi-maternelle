-- ============================================
-- VERSION ULTRA SIMPLE DES POLICIES
-- ============================================

-- Supprimer toutes les anciennes policies
DROP POLICY IF EXISTS "enseignants_insert_evaluations" ON evaluations;
DROP POLICY IF EXISTS "enseignants_select_evaluations" ON evaluations;
DROP POLICY IF EXISTS "enseignants_update_evaluations" ON evaluations;
DROP POLICY IF EXISTS "parents_select_evaluations" ON evaluations;
DROP POLICY IF EXISTS "admin_all_evaluations" ON evaluations;

-- ============================================
-- SIMPLE : Tout le monde peut voir (DEBUG)
-- ============================================
CREATE POLICY "allow_all_select" ON evaluations
  FOR SELECT USING (true);

CREATE POLICY "enseignants_can_insert" ON evaluations
  FOR INSERT WITH CHECK (true);

-- ============================================
-- FIN
-- ============================================