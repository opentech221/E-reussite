-- ============================================
-- SOLUTION SÉCURISÉE: RPC POUR INCREMENT LOGIN
-- ============================================
-- Date: 21 Octobre 2025
-- Cette approche est plus sûre qu'un trigger sur auth.sessions

-- Créer une fonction RPC que le frontend peut appeler
CREATE OR REPLACE FUNCTION increment_user_login_count(user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Incrémenter login_count pour l'utilisateur
  UPDATE profiles 
  SET login_count = COALESCE(login_count, 0) + 1,
      updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Donner les permissions d'exécution
GRANT EXECUTE ON FUNCTION increment_user_login_count(UUID) TO authenticated;

-- ============================================
-- VÉRIFICATION
-- ============================================
-- Tester la fonction :
-- SELECT increment_user_login_count('ton-user-id-ici');
-- SELECT login_count FROM profiles WHERE id = 'ton-user-id-ici';
