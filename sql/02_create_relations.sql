-- ============================================
-- 02_CREATE_RELATIONS.SQL
-- Création des clés étrangères et relations
-- Exécuter APRÈS 01_create_tables.sql
-- ============================================

-- Les clés étrangères sont déjà définies dans les tables
-- Ce fichier contient les configurations supplémentaires

-- Activer les triggers pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour settings
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour profiles
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour classes
CREATE TRIGGER update_classes_updated_at
    BEFORE UPDATE ON classes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour enseignants
CREATE TRIGGER update_enseignants_updated_at
    BEFORE UPDATE ON enseignants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour parents
CREATE TRIGGER update_parents_updated_at
    BEFORE UPDATE ON parents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour eleves
CREATE TRIGGER update_eleves_updated_at
    BEFORE UPDATE ON eleves
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour commentaires
CREATE TRIGGER update_commentaires_updated_at
    BEFORE UPDATE ON commentaires
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FIN: 02_create_relations.sql
-- ============================================
