-- ============================================
-- 11_POLICIES_EVALUATIONS.SQL
-- Policies RLS pour la table evaluations
-- ============================================

-- Activer RLS sur la table evaluations
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ENSEIGNANTS : Peuvent insérer et voir leurs évaluations
-- ============================================

-- Politique INSERT : l'enseignant peut insérer une évaluation
CREATE POLICY "enseignants_insert_evaluations" ON evaluations
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT profile_id FROM enseignants WHERE id = enseignant_id
    )
  );

-- Politique SELECT : l'enseignant voit ses propres évaluations
CREATE POLICY "enseignants_select_evaluations" ON evaluations
  FOR SELECT USING (
    auth.uid() IN (
      SELECT profile_id FROM enseignants WHERE id = enseignant_id
    )
  );

-- Politique UPDATE : l'enseignant peut modifier ses évaluations
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

-- Politique SELECT : les parents voient les évaluations de leurs enfants
CREATE POLICY "parents_select_evaluations" ON evaluations
  FOR SELECT USING (
    auth.uid() IN (
      SELECT p.profile_id
      FROM parents p
      INNER JOIN parents_eleves pe ON p.id = pe.parent_id
      WHERE pe.eleve_id = evaluations.eleve_id
    )
  );

-- ============================================
-- ADMIN : Accès complet
-- ============================================

-- Politique SELECT : les admins voient tout
CREATE POLICY "admin_select_evaluations" ON evaluations
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- Politique INSERT : les admins peuvent insérer
CREATE POLICY "admin_insert_evaluations" ON evaluations
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- Politique UPDATE : les admins peuvent modifier
CREATE POLICY "admin_update_evaluations" ON evaluations
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  ) WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- Politique DELETE : les admins peuvent supprimer
CREATE POLICY "admin_delete_evaluations" ON evaluations
  FOR DELETE USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- ============================================
-- FIN: 11_policies_evaluations.sql
-- ============================================