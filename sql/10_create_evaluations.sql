-- ============================================
-- 10_CREATE_EVALUATIONS.SQL
-- Table pour les évaluations des compétences
-- ============================================

CREATE TABLE IF NOT EXISTS evaluations (
  id BIGSERIAL PRIMARY KEY,
  eleve_id BIGINT NOT NULL REFERENCES eleves(id) ON DELETE CASCADE,
  enseignant_id BIGINT NOT NULL REFERENCES enseignants(id) ON DELETE CASCADE,
  classe_id BIGINT REFERENCES classes(id) ON DELETE SET NULL,
  date_evaluation DATE DEFAULT CURRENT_DATE,
  
  -- Les 10 compétences avec niveaux 1-5
  gestion_emotions INTEGER CHECK (gestion_emotions BETWEEN 1 AND 5),
  garder_calme INTEGER CHECK (garder_calme BETWEEN 1 AND 5),
  utiliser_mots INTEGER CHECK (utiliser_mots BETWEEN 1 AND 5),
  demander_aide INTEGER CHECK (demander_aide BETWEEN 1 AND 5),
  vivre_ensemble INTEGER CHECK (vivre_ensemble BETWEEN 1 AND 5),
  cooperer INTEGER CHECK (cooperer BETWEEN 1 AND 5),
  respecter_autres INTEGER CHECK (respecter_autres BETWEEN 1 AND 5),
  faire_travail INTEGER CHECK (faire_travail BETWEEN 1 AND 5),
  ecouter_consignes INTEGER CHECK (ecouter_consignes BETWEEN 1 AND 5),
  attendre_tour INTEGER CHECK (attendre_tour BETWEEN 1 AND 5),
  
  -- Commentaires de l'enseignant
  commentaire_enseignant TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_evaluations_eleve ON evaluations(eleve_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_enseignant ON evaluations(enseignant_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_classe ON evaluations(classe_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_date ON evaluations(date_evaluation);

-- ============================================
-- FIN: 10_create_evaluations.sql
-- ============================================