-- ============================================
-- 08_SEED_DEMO_DATA.SQL
-- Données de démonstration
-- Exécuter APRÈS 07_storage_logo.sql
-- ============================================

-- IMPORTANT: Ce fichier contient des données de test.
-- Les données seront créées après que l'admin et les enseignants
-- aient été créés dans Supabase Auth.

-- Pour cette démo, on suppose que:
-- 1. L'admin a été créé dans Supabase Auth
-- 2. On utilise les IDs des utilisateurs créés

-- ============================================
-- STEP 1: Insérer les paramètres initiaux
-- ============================================

INSERT INTO settings (
  school_name,
  site_title,
  school_year,
  contact_email,
  contact_phone,
  address,
  primary_color,
  secondary_color,
  tertiary_color,
  welcome_text_parent,
  welcome_text_teacher,
  legal_notice,
  rgpd_notice
) VALUES (
  'Maternelle École Test',
  'Suivi du comportement de votre enfant en maternelle',
  '2025-2026',
  'contact@maternelle-test.fr',
  '01 23 45 67 89',
  '123 rue de l''Écurie, 75000 Paris',
  '#0066CC',
  '#FFFFFF',
  '#FF0000',
  'Bienvenue dans l''espace de suivi du comportement de votre enfant. Vous y retrouverez les observations et commentaires de nos enseignants sur le développement et les progrès de votre enfant. N''hésitez pas à nous contacter si vous avez des questions.',
  'Bienvenue dans votre espace enseignant. Vous pouvez consigner ici vos observations sur le comportement, le développement et les progrès de vos élèves. Ces commentaires seront partagés avec les parents de l''enfant.',
  'Tous droits réservés © 2025 Maternelle École Test',
  'Conformément au RGPD, vos données personnelles sont protégées et utilisées uniquement pour le suivi éducatif de votre enfant. Vous pouvez à tout moment consulter ou modifier vos données en contactant l''établissement.'
);

-- ============================================
-- STEP 2: Créer les classes
-- ============================================

INSERT INTO classes (nom_classe, niveau, annee_scolaire) VALUES
('Petite Section A', 'PS', '2025-2026'),
('Petite Section B', 'PS', '2025-2026'),
('Moyenne Section A', 'MS', '2025-2026'),
('Moyenne Section B', 'MS', '2025-2026'),
('Grande Section', 'GS', '2025-2026');

-- ============================================
-- STEP 3: Créer les profils des enseignants
-- ============================================

-- NOTE: Les IDs doivent correspondre à ceux créés dans Supabase Auth
-- Exemples (à adapter avec vos vrais IDs):

-- Créer 3 enseignants de test
-- Pour que ça fonctionne, vous devez d'abord créer les utilisateurs
-- dans Supabase Auth, puis récupérer leurs IDs UUID

-- EXEMPLE DE STRUCTURE (à remplir avec vos IDs réels):
-- INSERT INTO profiles (id, nom, prenom, role) VALUES
-- ('uuid-teacher-1', 'Dupont', 'Marie', 'enseignant'),
-- ('uuid-teacher-2', 'Martin', 'Jean', 'enseignant'),
-- ('uuid-teacher-3', 'Bernard', 'Sophie', 'enseignant');

-- ============================================
-- STEP 4: Créer les enregistrements enseignants
-- ============================================

-- INSERT INTO enseignants (profile_id, nom, prenom) VALUES
-- ('uuid-teacher-1', 'Dupont', 'Marie'),
-- ('uuid-teacher-2', 'Martin', 'Jean'),
-- ('uuid-teacher-3', 'Bernard', 'Sophie');

-- ============================================
-- STEP 5: Associer les enseignants aux classes
-- ============================================

-- INSERT INTO enseignants_classes (enseignant_id, classe_id) VALUES
-- (1, 1), -- Dupont → PS A
-- (2, 2), -- Martin → PS B
-- (2, 3), -- Martin → MS A
-- (3, 4), -- Bernard → MS B
-- (3, 5); -- Bernard → GS

-- ============================================
-- STEP 6: Créer les profils des parents
-- ============================================

-- INSERT INTO profiles (id, nom, prenom, role) VALUES
-- ('uuid-parent-1', 'Moreau', 'Isabelle', 'parent'),
-- ('uuid-parent-2', 'Durand', 'Pierre', 'parent'),
-- ('uuid-parent-3', 'Lefevre', 'Anne', 'parent'),
-- ('uuid-parent-4', 'Leclerc', 'Paul', 'parent'),
-- ('uuid-parent-5', 'Garnier', 'Véronique', 'parent');

-- ============================================
-- STEP 7: Créer les enregistrements parents
-- ============================================

-- INSERT INTO parents (profile_id, nom, prenom) VALUES
-- ('uuid-parent-1', 'Moreau', 'Isabelle'),
-- ('uuid-parent-2', 'Durand', 'Pierre'),
-- ('uuid-parent-3', 'Lefevre', 'Anne'),
-- ('uuid-parent-4', 'Leclerc', 'Paul'),
-- ('uuid-parent-5', 'Garnier', 'Véronique');

-- ============================================
-- STEP 8: Créer les élèves
-- ============================================

-- INSERT INTO eleves (nom, prenom, classe_id) VALUES
-- ('Moreau', 'Lucas', 1),
-- ('Durand', 'Emma', 1),
-- ('Lefevre', 'Thomas', 2),
-- ('Leclerc', 'Sarah', 3),
-- ('Garnier', 'Léon', 3),
-- ('Petit', 'Élise', 4),
-- ('Arnould', 'Maxime', 5),
-- ('Fontaine', 'Clara', 5);

-- ============================================
-- STEP 9: Associer les parents aux élèves
-- ============================================

-- INSERT INTO parents_eleves (parent_id, eleve_id, lien_parental) VALUES
-- (1, 1, 'mère'),
-- (2, 2, 'père'),
-- (3, 3, 'mère'),
-- (4, 4, 'père'),
-- (5, 5, 'mère');

-- ============================================
-- STEP 10: Créer des commentaires de démo
-- ============================================

-- INSERT INTO commentaires (eleve_id, enseignant_id, classe_id, date_commentaire, texte_commentaire) VALUES
-- (1, 1, 1, '2025-01-15', 'Lucas participe bien aux activités. Il est très attentif et coopératif. Bon travail !'),
-- (2, 1, 1, '2025-01-16', 'Emma a bien progressé en motricité fine. Elle commence à bien tracer les formes.'),
-- (3, 2, 2, '2025-01-14', 'Thomas est très curieux et pose beaucoup de questions. Excellent engagement !'),
-- (4, 2, 3, '2025-01-17', 'Sarah s''intègre bien au groupe. Elle joue volontiers avec ses camarades.'),
-- (5, 3, 3, '2025-01-15', 'Léon a besoin d''être encouragé mais progresse régulièrement.');

-- ============================================
-- INSTRUCTIONS D'UTILISATION
-- ============================================
-- 
-- 1. Ce fichier contient des commentaires (--) expliquant la structure
-- 2. Les parties commentées (--) doivent être exécutées APRÈS avoir créé
--    les utilisateurs dans Supabase Auth
-- 3. Pour les enseignants, parents et admin: créez-les d'abord dans
--    Supabase Auth (Settings → Authentication)
-- 4. Récupérez leurs UUIDs depuis la liste des utilisateurs
-- 5. Remplacez 'uuid-teacher-1', 'uuid-parent-1', etc. par les vrais UUIDs
-- 6. Décommentez et exécutez les INSERT
--
-- Exemple pour récupérer un UUID:
-- Dans Supabase Auth → Users, cliquez sur un utilisateur et
-- copiez son UUID depuis le haut de la fiche
--
-- ============================================

-- ============================================
-- FIN: 08_seed_demo_data.sql
-- ============================================
