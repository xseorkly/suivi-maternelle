-- ============================================
-- 03_ENABLE_RLS.SQL
-- Activation du Row Level Security (RLS)
-- Exécuter APRÈS 02_create_relations.sql
-- ============================================

-- Activer RLS sur settings
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Activer RLS sur profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Activer RLS sur classes
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- Activer RLS sur enseignants
ALTER TABLE enseignants ENABLE ROW LEVEL SECURITY;

-- Activer RLS sur enseignants_classes
ALTER TABLE enseignants_classes ENABLE ROW LEVEL SECURITY;

-- Activer RLS sur parents
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;

-- Activer RLS sur eleves
ALTER TABLE eleves ENABLE ROW LEVEL SECURITY;

-- Activer RLS sur parents_eleves
ALTER TABLE parents_eleves ENABLE ROW LEVEL SECURITY;

-- Activer RLS sur commentaires
ALTER TABLE commentaires ENABLE ROW LEVEL SECURITY;

-- ============================================
-- FIN: 03_enable_rls.sql
-- ============================================
