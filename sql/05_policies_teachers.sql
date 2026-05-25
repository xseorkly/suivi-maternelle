-- ============================================
-- 05_POLICIES_TEACHERS.SQL
-- Politiques de sécurité pour les enseignants
-- Exécuter APRÈS 04_policies_admin.sql
-- ============================================

-- ========== SETTINGS ==========
-- Les enseignants peuvent lire les paramètres généraux
CREATE POLICY "Teachers can read settings"
ON settings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'enseignant'
  )
);

-- ========== PROFILES ==========
-- Les enseignants peuvent lire leur propre profil
CREATE POLICY "Teachers can read own profile"
ON profiles FOR SELECT
USING (
  id = auth.uid()
  OR (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'enseignant'
    )
    AND role IN ('enseignant')
  )
);

-- Les enseignants peuvent modifier leur propre profil
CREATE POLICY "Teachers can update own profile"
ON profiles FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- ========== CLASSES ==========
-- Les enseignants peuvent lire UNIQUEMENT les classes qui leur sont associées
CREATE POLICY "Teachers can read own classes"
ON classes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM enseignants_classes ec
    JOIN enseignants e ON ec.enseignant_id = e.id
    WHERE ec.classe_id = classes.id
    AND e.profile_id = auth.uid()
  )
);

-- ========== ENSEIGNANTS ==========
-- Les enseignants peuvent lire leur propre profil enseignant
CREATE POLICY "Teachers can read own enseignant"
ON enseignants FOR SELECT
USING (profile_id = auth.uid());

-- ========== ENSEIGNANTS_CLASSES ==========
-- Les enseignants peuvent lire les associations de leurs classes
CREATE POLICY "Teachers can read own enseignants_classes"
ON enseignants_classes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM enseignants e
    WHERE e.id = enseignant_id
    AND e.profile_id = auth.uid()
  )
);

-- ========== ELEVES ==========
-- Les enseignants peuvent lire UNIQUEMENT les élèves de leurs classes
CREATE POLICY "Teachers can read own students"
ON eleves FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM enseignants_classes ec
    JOIN enseignants e ON ec.enseignant_id = e.id
    WHERE ec.classe_id = eleves.classe_id
    AND e.profile_id = auth.uid()
  )
);

-- ========== PARENTS_ELEVES ==========
-- Les enseignants peuvent lire les associations parent-élève de leurs élèves
CREATE POLICY "Teachers can read own parents_eleves"
ON parents_eleves FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM eleves e
    JOIN enseignants_classes ec ON e.classe_id = ec.classe_id
    JOIN enseignants ens ON ec.enseignant_id = ens.id
    WHERE e.id = parents_eleves.eleve_id
    AND ens.profile_id = auth.uid()
  )
);

-- ========== COMMENTAIRES ==========
-- Les enseignants peuvent lire les commentaires de leurs élèves
CREATE POLICY "Teachers can read own commentaires"
ON commentaires FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM enseignants e
    WHERE e.profile_id = auth.uid()
    AND (
      -- Le commentaire appartient à ses élèves
      EXISTS (
        SELECT 1 FROM eleves el
        JOIN enseignants_classes ec ON el.classe_id = ec.classe_id
        WHERE el.id = commentaires.eleve_id
        AND ec.enseignant_id = e.id
      )
      -- OU c'est un commentaire qu'il a lui-même créé
      OR commentaires.enseignant_id = e.id
    )
  )
);

-- Les enseignants peuvent créer des commentaires UNIQUEMENT pour leurs élèves
CREATE POLICY "Teachers can create commentaires"
ON commentaires FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM enseignants e
    WHERE e.profile_id = auth.uid()
    AND enseignant_id = e.id
    AND EXISTS (
      SELECT 1 FROM eleves el
      JOIN enseignants_classes ec ON el.classe_id = ec.classe_id
      WHERE el.id = eleve_id
      AND ec.enseignant_id = e.id
    )
  )
);

-- Les enseignants peuvent modifier UNIQUEMENT leurs propres commentaires
CREATE POLICY "Teachers can update own commentaires"
ON commentaires FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM enseignants e
    WHERE e.profile_id = auth.uid()
    AND commentaires.enseignant_id = e.id
  )
);

-- Les enseignants peuvent supprimer UNIQUEMENT leurs propres commentaires
CREATE POLICY "Teachers can delete own commentaires"
ON commentaires FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM enseignants e
    WHERE e.profile_id = auth.uid()
    AND commentaires.enseignant_id = e.id
  )
);

-- ============================================
-- FIN: 05_policies_teachers.sql
-- ============================================
