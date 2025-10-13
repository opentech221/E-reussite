import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/customSupabaseClient';

const TestProgressionDebug = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const addLog = (message, type = 'info') => {
    console.log(message);
    setLogs(prev => [...prev, { message, type, time: new Date().toLocaleTimeString() }]);
  };

  useEffect(() => {
    const runTests = async () => {
      addLog('🚀 DÉBUT DES TESTS DE PROGRESSION', 'title');
      
      const userId = 'b8fe56ad-e6e8-44f8-940f-a9e1d1115097';
      
      // ========================================
      // TEST 1 : Récupérer user_progress
      // ========================================
      addLog('\n📊 TEST 1 : Récupération de user_progress', 'title');
      
      try {
        const { data: progressData, error: progressError } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', userId);
        
        if (progressError) {
          addLog(`❌ ERREUR user_progress: ${progressError.message}`, 'error');
        } else {
          addLog(`✅ user_progress trouvées: ${progressData?.length || 0} entrées`, 'success');
          
          const completed = progressData?.filter(p => p.completed) || [];
          addLog(`   ✅ Complétées: ${completed.length}`, 'success');
          addLog(`   ⏳ Non complétées: ${progressData?.length - completed.length}`, 'info');
          
          // Afficher les 3 premiers chapitres complétés
          if (completed.length > 0) {
            addLog(`\n   📖 Chapitres complétés (IDs):`, 'info');
            completed.slice(0, 5).forEach(p => {
              addLog(`      - chapitre_id: ${p.chapitre_id}, completed_at: ${p.completed_at}`, 'info');
            });
          }
        }
      } catch (error) {
        addLog(`❌ EXCEPTION user_progress: ${error.message}`, 'error');
      }
      
      // ========================================
      // TEST 2 : Récupérer les matières
      // ========================================
      addLog('\n📚 TEST 2 : Récupération des matières BFEM', 'title');
      
      try {
        const { data: matieres, error: matieresError } = await supabase
          .from('matieres')
          .select('*')
          .eq('level', 'bfem');
        
        if (matieresError) {
          addLog(`❌ ERREUR matieres: ${matieresError.message}`, 'error');
        } else {
          addLog(`✅ Matières trouvées: ${matieres?.length || 0}`, 'success');
          
          if (matieres && matieres.length > 0) {
            addLog(`\n   📚 Liste des matières:`, 'info');
            matieres.forEach(m => {
              addLog(`      - ${m.name} (ID: ${m.id})`, 'info');
            });
          }
        }
      } catch (error) {
        addLog(`❌ EXCEPTION matieres: ${error.message}`, 'error');
      }
      
      // ========================================
      // TEST 3 : Récupérer les chapitres
      // ========================================
      addLog('\n📖 TEST 3 : Récupération des chapitres', 'title');
      
      try {
        const { data: chapitres, error: chapitresError } = await supabase
          .from('chapitres')
          .select('id, title, matiere_id')
          .limit(10);
        
        if (chapitresError) {
          addLog(`❌ ERREUR chapitres: ${chapitresError.message}`, 'error');
        } else {
          addLog(`✅ Chapitres trouvés (premiers 10): ${chapitres?.length || 0}`, 'success');
          
          if (chapitres && chapitres.length > 0) {
            addLog(`\n   📖 Exemples de chapitres:`, 'info');
            chapitres.slice(0, 5).forEach(c => {
              addLog(`      - "${c.title}" (ID: ${c.id}, matiere_id: ${c.matiere_id})`, 'info');
            });
          }
        }
      } catch (error) {
        addLog(`❌ EXCEPTION chapitres: ${error.message}`, 'error');
      }
      
      // ========================================
      // TEST 4 : Joindre chapitres + user_progress
      // ========================================
      addLog('\n🔗 TEST 4 : Jointure user_progress + chapitres', 'title');
      
      try {
        const { data: progressWithChapitres, error: joinError } = await supabase
          .from('user_progress')
          .select(`
            id,
            chapitre_id,
            completed,
            completed_at,
            chapitres (
              id,
              title,
              matiere_id
            )
          `)
          .eq('user_id', userId)
          .eq('completed', true);
        
        if (joinError) {
          addLog(`❌ ERREUR jointure: ${joinError.message}`, 'error');
        } else {
          addLog(`✅ Jointure réussie: ${progressWithChapitres?.length || 0} entrées`, 'success');
          
          if (progressWithChapitres && progressWithChapitres.length > 0) {
            addLog(`\n   🔗 Chapitres avec détails:`, 'info');
            progressWithChapitres.slice(0, 5).forEach(p => {
              addLog(`      - "${p.chapitres?.title || 'TITRE MANQUANT'}" (matiere_id: ${p.chapitres?.matiere_id})`, 'info');
            });
          }
        }
      } catch (error) {
        addLog(`❌ EXCEPTION jointure: ${error.message}`, 'error');
      }
      
      // ========================================
      // TEST 5 : Jointure complète avec matières
      // ========================================
      addLog('\n🌟 TEST 5 : Jointure user_progress + chapitres + matieres', 'title');
      
      try {
        const { data: fullData, error: fullError } = await supabase
          .from('user_progress')
          .select(`
            id,
            chapitre_id,
            completed,
            completed_at,
            chapitres (
              id,
              title,
              matiere_id,
              matieres (
                id,
                name
              )
            )
          `)
          .eq('user_id', userId)
          .eq('completed', true)
          .order('completed_at', { ascending: false });
        
        if (fullError) {
          addLog(`❌ ERREUR jointure complète: ${fullError.message}`, 'error');
        } else {
          addLog(`✅ Jointure complète réussie: ${fullData?.length || 0} entrées`, 'success');
          
          if (fullData && fullData.length > 0) {
            addLog(`\n   🌟 Données complètes:`, 'info');
            fullData.slice(0, 5).forEach(p => {
              const matiere = p.chapitres?.matieres?.name || 'MATIÈRE MANQUANTE';
              const chapitre = p.chapitres?.title || 'TITRE MANQUANT';
              addLog(`      - [${matiere}] ${chapitre}`, 'info');
            });
          }
        }
      } catch (error) {
        addLog(`❌ EXCEPTION jointure complète: ${error.message}`, 'error');
      }
      
      // ========================================
      // TEST 6 : Calcul progression par matière
      // ========================================
      addLog('\n🧮 TEST 6 : Calcul progression par matière', 'title');
      
      try {
        // Récupérer toutes les matières BFEM
        const { data: matieres } = await supabase
          .from('matieres')
          .select('id, name')
          .eq('level', 'bfem');
        
        if (!matieres || matieres.length === 0) {
          addLog(`❌ Aucune matière BFEM trouvée`, 'error');
        } else {
          addLog(`✅ Analyse de ${matieres.length} matières`, 'success');
          
          for (const matiere of matieres) {
            // Compter total chapitres
            const { data: allChapitres } = await supabase
              .from('chapitres')
              .select('id')
              .eq('matiere_id', matiere.id);
            
            // Compter chapitres complétés
            const { data: completedChapitres } = await supabase
              .from('user_progress')
              .select('chapitre_id')
              .eq('user_id', userId)
              .eq('completed', true)
              .in('chapitre_id', allChapitres?.map(c => c.id) || []);
            
            const total = allChapitres?.length || 0;
            const completed = completedChapitres?.length || 0;
            const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
            
            const status = percentage > 0 ? '✅' : '⚪';
            addLog(`   ${status} ${matiere.name}: ${completed}/${total} = ${percentage}%`, percentage > 0 ? 'success' : 'info');
          }
        }
      } catch (error) {
        addLog(`❌ EXCEPTION calcul progression: ${error.message}`, 'error');
      }
      
      addLog('\n🏁 FIN DES TESTS', 'title');
      setLoading(false);
    };

    runTests();
  }, []);

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'monospace', 
      backgroundColor: '#1e1e1e', 
      color: '#d4d4d4',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#4ec9b0', marginBottom: '20px' }}>
        🔧 Test Progression Dashboard - Mode Debug
      </h1>
      
      {loading && (
        <div style={{ color: '#ce9178', marginBottom: '20px' }}>
          ⏳ Tests en cours...
        </div>
      )}
      
      <div style={{ 
        backgroundColor: '#252526', 
        padding: '15px', 
        borderRadius: '5px',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        {logs.map((log, index) => {
          let color = '#d4d4d4';
          if (log.type === 'error') color = '#f48771';
          if (log.type === 'success') color = '#4ec9b0';
          if (log.type === 'title') color = '#dcdcaa';
          
          return (
            <div 
              key={index} 
              style={{ 
                color, 
                marginBottom: '5px',
                fontSize: log.type === 'title' ? '16px' : '14px',
                fontWeight: log.type === 'title' ? 'bold' : 'normal'
              }}
            >
              <span style={{ color: '#858585', marginRight: '10px' }}>{log.time}</span>
              {log.message}
            </div>
          );
        })}
      </div>
      
      {!loading && (
        <div style={{ marginTop: '20px', color: '#4ec9b0' }}>
          ✅ Tests terminés ! Vérifiez les résultats ci-dessus.
        </div>
      )}
    </div>
  );
};

export default TestProgressionDebug;
