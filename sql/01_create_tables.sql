-- ============================================
-- 01_CREATE_TABLES.SQL
-- Création des tables principales
-- Exécuter EN PREMIER
-- ============================================

-- Table: settings (paramètres généraux du site)
CREATE TABLE IF NOT EXISTS settings (
  id BIGSERIAL PRIMARY KEY,
  school_name VARCHAR(255),
  school_logo_url TEXT,
  site_title VARCHAR(255) DEFAULT 'Suivi du comportement de votre enfant en maternelle',
  school_year VARCHAR(50),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  address TEXT,
  primary_color VARCHAR(7) DEFAULT '#0066CC',
  secondary_color VARCHAR(7) DEFAULT '#FFFFFF',
  tertiary_color VARCHAR(7) DEFAULT '#FF0000',
  welcome_text_parent TEXT DEFAULT 'Bienvenue dans l''espace de suivi du comportement de votre enfant. Vous y retrouverez les observations et commentaires de nos enseignants.',
  welcome_text_teacher TEXT DEFAULT 'Bienvenue dans votre espace enseignant. Vous pouvez consigner vos observations sur le comportement et le développement de vos élèves.',
  legal_notice TEXT,
  rgpd_notice TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table: profiles (compléte les utilisateurs Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nom VARCHAR(255),
  prenom VARCHAR(255),
  role VARCHAR(50) CHECK (role IN ('admin', 'enseignant', 'parent')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table: classes
CREATE TABLE IF NOT EXISTS classes (
  id BIGSERIAL PRIMARY KEY,
  nom_classe VARCHAR(255) NOT NULL,
  niveau VARCHAR(50) NOT NULL,
  annee_scolaire VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table: enseignants
CREATE TABLE IF NOT EXISTS enseignants (
  id BIGSERIAL PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  nom VARCHAR(255) NOT NULL,
  prenom VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table: enseignants_classes (liaison many-to-many)
CREATE TABLE IF NOT EXISTS enseignants_classes (
  id BIGSERIAL PRIMARY KEY,
  enseignant_id BIGINT REFERENCES enseignants(id) ON DELETE CASCADE,
  classe_id BIGINT REFERENCES classes(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(enseignant_id, classe_id)
);

-- Table: parents
CREATE TABLE IF NOT EXISTS parents (
  id BIGSERIAL PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  nom VARCHAR(255) NOT NULL,
  prenom VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table: eleves
CREATE TABLE IF NOT EXISTS eleves (
  id BIGSERIAL PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  prenom VARCHAR(255) NOT NULL,
  classe_id BIGINT REFERENCES classes(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table: parents_eleves (liaison many-to-many)
CREATE TABLE IF NOT EXISTS parents_eleves (
  id BIGSERIAL PRIMARY KEY,
  parent_id BIGINT REFERENCES parents(id) ON DELETE CASCADE,
  eleve_id BIGINT REFERENCES eleves(id) ON DELETE CASCADE,
  lien_parental VARCHAR(100) DEFAULT 'parent',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(parent_id, eleve_id)
);

-- Table: commentaires
CREATE TABLE IF NOT EXISTS commentaires (
  id BIGSERIAL PRIMARY KEY,
  eleve_id BIGINT REFERENCES eleves(id) ON DELETE CASCADE,
  enseignant_id BIGINT REFERENCES enseignants(id) ON DELETE CASCADE,
  classe_id BIGINT REFERENCES classes(id) ON DELETE SET NULL,
  date_commentaire DATE,
  texte_commentaire TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_commentaires_eleve ON commentaires(eleve_id);
CREATE INDEX IF NOT EXISTS idx_commentaires_enseignant ON commentaires(enseignant_id);
CREATE INDEX IF NOT EXISTS idx_commentaires_classe ON commentaires(classe_id);
CREATE INDEX IF NOT EXISTS idx_commentaires_date ON commentaires(date_commentaire);
CREATE INDEX IF NOT EXISTS idx_enseignants_classes_enseignant ON enseignants_classes(enseignant_id);
CREATE INDEX IF NOT EXISTS idx_enseignants_classes_classe ON enseignants_classes(classe_id);
CREATE INDEX IF NOT EXISTS idx_parents_eleves_parent ON parents_eleves(parent_id);
CREATE INDEX IF NOT EXISTS idx_parents_eleves_eleve ON parents_eleves(eleve_id);
CREATE INDEX IF NOT EXISTS idx_eleves_classe ON eleves(classe_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- ============================================
-- FIN: 01_create_tables.sql
-- ============================================
