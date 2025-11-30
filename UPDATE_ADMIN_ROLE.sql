-- =============================================
-- VÉRIFICATION ET MISE À JOUR DU RÔLE ADMIN
-- =============================================

-- 1. Vérifier les utilisateurs existants et leurs rôles
-- (JOIN avec auth.users pour obtenir l'email)
SELECT 
    p.id,
    u.email,
    p.full_name,
    p.role,
    p.created_at
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC;

-- 2. Mettre à jour votre compte pour être admin
-- ⚠️ DÉCOMMENTEZ LA REQUÊTE CORRESPONDANT À VOTRE COMPTE

-- Option A: opentech221@outlook.com (Rokhaya)
-- UPDATE public.profiles 
-- SET role = 'admin' 
-- WHERE id = '45c7f96f-34ca-4b9d-b199-6eef98b0182f';

-- ✅ Option B: cheikhtidianesamba99@gmail.com (opentech) - VOTRE COMPTE
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = 'b8fe56ad-e6e8-44f8-940f-a9e1d1115097';

-- Option C: cheikhtidianesamba.ba@ucad.edu.sn (Cheikh Tidiane Samba BA)
-- UPDATE public.profiles 
-- SET role = 'admin' 
-- WHERE id = '10ab8c35-a67b-4c6d-a931-e7a80dca2058';

-- Option D: ba.samba1@supdeco.edu.sn (supdeco)
-- UPDATE public.profiles 
-- SET role = 'admin' 
-- WHERE id = '4ceefe97-b5bd-440a-98a6-f5e0bee5cbf5';

-- Option E: user1@outlook.com (user1)
-- UPDATE public.profiles 
-- SET role = 'admin' 
-- WHERE id = '1bd189f5-f57c-46d4-b3c6-0cedfcf4655a';

-- Option F: Mettre à jour TOUS les comptes en admin (⚠️ DÉCONSEILLÉ en production)
-- UPDATE public.profiles SET role = 'admin';

-- 3. Vérifier que la mise à jour a fonctionné
SELECT 
    p.id,
    u.email,
    p.full_name,
    p.role
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE p.role = 'admin';

-- 4. Si vous n'avez pas de profil dans la table profiles, créer un
-- ⚠️ Remplacez les valeurs par vos vraies informations
-- Note: La colonne email n'existe PAS dans profiles, elle est dans auth.users
-- INSERT INTO public.profiles (id, full_name, role)
-- VALUES (
--     'VOTRE_USER_ID_FROM_AUTH_USERS',
--     'Votre Nom',
--     'admin'
-- );

-- 5. (OPTIONNEL) Voir tous les utilisateurs de auth.users
-- SELECT id, email, created_at 
-- FROM auth.users 
-- ORDER BY created_at DESC;

-- =============================================
-- NOTES IMPORTANTES
-- =============================================
-- 
-- Le rôle 'admin' vous donnera accès à :
-- - /admin (panneau d'administration)
-- - /admin/users (gestion utilisateurs)
-- - /admin/courses (gestion cours)
-- - /admin/quiz (gestion quiz)
-- - /admin/orientation (gestion orientation)
-- - /admin/gamification (gestion gamification)
-- - /admin/analytics (analytics & rapports)
-- - /admin/settings (paramètres & sécurité)
--
-- Le lien "Administration" apparaîtra dans le sidebar
-- uniquement si votre role = 'admin'
