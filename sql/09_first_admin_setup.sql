-- ============================================
-- 09_FIRST_ADMIN_SETUP.SQL
-- Préparation du premier administrateur
-- Exécuter APRÈS 08_seed_demo_data.sql
-- ============================================

-- IMPORTANT: À exécuter APRÈS avoir créé le compte admin dans Supabase Auth

-- ============================================
-- ÉTAPE 1: Récupérer l'UUID du premier admin
-- ============================================
-- 
-- 1. Allez dans Supabase → Authentication → Users
-- 2. Cherchez l'utilisateur avec l'email: klabi5181@gmail.com
-- 3. Cliquez sur l'utilisateur et copiez son UUID
-- 4. Remplacez 'YOUR_ADMIN_UUID_HERE' par cet UUID dans les requêtes ci-dessous
--
-- ============================================

-- EXEMPLE: Supposons que l'UUID du premier admin est: 
-- 550e8400-e29b-41d4-a716-446655440000

-- ============================================
-- ÉTAPE 2: Créer le profil du premier administrateur
-- ============================================

INSERT INTO profiles (id, nom, prenom, role)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Admin', 'Super', 'admin')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- VÉRIFICATION: Confirmer que l'admin est créé
-- ============================================

-- Exécutez cette requête pour vérifier:
-- SELECT * FROM profiles WHERE role = 'admin';
-- Vous devriez voir une ligne avec l'admin.

-- ============================================
-- NOTES IMPORTANTES
-- ============================================
--
-- 1. REMPLACEZ '550e8400-e29b-41d4-a716-446655440000' par le vrai UUID
-- 2. L'email klabi5181@gmail.com doit être confirmé dans Supabase Auth
-- 3. Le mot de passe 'admin' doit être changé à la première connexion
-- 4. Une fois cet INSERT exécuté, l'admin peut se connecter au site
-- 5. Via le site, l'admin accédera à la page de configuration
--
-- ============================================

-- ============================================
-- TRIGGER DE CRÉATION AUTOMATIQUE DE PROFIL
-- ============================================
--
-- Pour automatiser la création de profils lors de l'inscription,
-- créez un trigger:

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Créer automatiquement un profil avec le rôle 'parent' par défaut
  INSERT INTO public.profiles (id, nom, prenom, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nom', ''),
    COALESCE(NEW.raw_user_meta_data->>'prenom', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'parent')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FIN: 09_first_admin_setup.sql
-- ============================================
