-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- CRÉATION STORAGE BUCKET - COACH IA
-- Description: Bucket pour images et fichiers du Coach IA
-- Date: 9 octobre 2025
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================================================
-- ÉTAPE 1 : CRÉER BUCKET
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ai-chat-attachments',
  'ai-chat-attachments',
  false, -- Private (pas d'accès public direct)
  5242880, -- 5 MB en bytes
  ARRAY[
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png', 
    'image/gif',
    'image/webp'
  ]::text[];

DO $$ BEGIN
  RAISE NOTICE '✅ Bucket ai-chat-attachments créé';
END $$;

-- ============================================================================
-- ÉTAPE 2 : POLICIES D'ACCÈS
-- ============================================================================

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- POLICY 1: UPLOAD - Les utilisateurs peuvent uploader dans leur dossier
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DROP POLICY IF EXISTS "Users can upload to own folder" ON storage.objects;

CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'ai-chat-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- POLICY 2: SELECT - Les utilisateurs peuvent voir leurs fichiers
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DROP POLICY IF EXISTS "Users can view own files" ON storage.objects;

CREATE POLICY "Users can view own files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'ai-chat-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- POLICY 3: DELETE - Les utilisateurs peuvent supprimer leurs fichiers
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;

CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'ai-chat-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- POLICY 4: UPDATE - Les utilisateurs peuvent mettre à jour leurs fichiers
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;

CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'ai-chat-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'ai-chat-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DO $$ BEGIN
  RAISE NOTICE '✅ 4 Storage policies créées';
END $$;

-- ============================================================================
-- VÉRIFICATION
-- ============================================================================

DO $$
DECLARE
  v_bucket_exists BOOLEAN;
  v_policies_count INT;
BEGIN
  -- Vérifier bucket existe
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'ai-chat-attachments'
  ) INTO v_bucket_exists;
  
  -- Compter policies
  SELECT COUNT(*) INTO v_policies_count
  FROM pg_policies
  WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%own%';
  
  RAISE NOTICE '';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ STORAGE BUCKET CONFIGURÉ !';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE '📦 Bucket: ai-chat-attachments';
  RAISE NOTICE '   - Privé (non public)';
  RAISE NOTICE '   - Limite: 5 MB par fichier';
  RAISE NOTICE '   - Types: JPEG, PNG, GIF, WebP';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 Sécurité:';
  RAISE NOTICE '   - % Storage policies actives', v_policies_count;
  RAISE NOTICE '   - Isolation par user_id';
  RAISE NOTICE '   - Accès lecture/écriture/suppression';
  RAISE NOTICE '';
  RAISE NOTICE '📂 Structure dossiers:';
  RAISE NOTICE '   {user_id}/{conversation_id}/{filename}';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Prêt pour upload d''images !';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- EXEMPLES D'UTILISATION
-- ============================================================================

/*
-- Exemple 1: Uploader une image depuis JavaScript
const { data, error } = await supabase.storage
  .from('ai-chat-attachments')
  .upload(`${userId}/${conversationId}/image.jpg`, file);

-- Exemple 2: Récupérer URL signée (valide 1h)
const { data } = await supabase.storage
  .from('ai-chat-attachments')
  .createSignedUrl(`${userId}/${conversationId}/image.jpg`, 3600);

-- Exemple 3: Lister fichiers utilisateur
const { data } = await supabase.storage
  .from('ai-chat-attachments')
  .list(userId);

-- Exemple 4: Supprimer une image
const { error } = await supabase.storage
  .from('ai-chat-attachments')
  .remove([`${userId}/${conversationId}/image.jpg`]);
*/
