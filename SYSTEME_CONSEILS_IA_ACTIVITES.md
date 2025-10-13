# 🤖 Système de Conseils IA pour Activités

**Date** : 8 octobre 2025  
**Fonctionnalité** : Analyse IA personnalisée avec conseils et possibilité de recommencer les activités

---

## 📋 Vue d'ensemble

Transformation complète de la page Historique des Activités avec :
- ✅ Cartes d'activités en format "tickets" élégants
- ✅ Bouton "Conseils" sur chaque activité
- ✅ Modal avec analyse IA (points forts, faibles, suggestions)
- ✅ Bouton "Recommencer" pour refaire l'activité
- ✅ Design moderne avec animations Framer Motion

---

## 🎨 Modifications Interface

### 1. **Cartes d'activités transformées** (`ActivityHistory.jsx`)

**Avant** :
- Cartes cliquables simples
- Navigation directe au clic
- Design basique avec ChevronRight

**Après** :
```jsx
// Ticket élégant avec structure claire
<motion.div className="relative p-5 rounded-xl border-2 border-gray-200">
  {/* Badge de type en haut à droite */}
  <Badge>{getActivityLabel(activity.type)}</Badge>
  
  {/* Contenu principal avec icône, titre, détails */}
  <div className="flex items-start gap-4">
    <Icon /> {/* Icône colorée */}
    <div>
      <h3>{activity.title}</h3>
      <div>
        {/* Matière, temps, score */}
      </div>
    </div>
  </div>
  
  {/* Bouton Conseils en bas à droite */}
  <Button onClick={handleAdviceClick}>
    <Lightbulb /> Conseils
  </Button>
</motion.div>
```

**Caractéristiques** :
- ✅ Non cliquable (sauf bouton Conseils)
- ✅ Badge de type visible (Quiz/Examen/Chapitre/Badge)
- ✅ Score coloré selon performance (vert ≥70%, jaune 50-69%, rouge <50%)
- ✅ Temps passé affiché avec icône Zap
- ✅ Date relative + date absolue
- ✅ Bouton "Conseils" avec icône Lightbulb

---

## 🧠 Modal Conseils IA

### Structure du Modal

```jsx
<AnimatePresence>
  {showAdviceModal && (
    <motion.div className="fixed inset-0 bg-black/50">
      <motion.div className="bg-white rounded-2xl max-w-2xl">
        {/* En-tête avec titre et infos activité */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600">
          <Brain />
          <h2>Conseils Personnalisés</h2>
          <p>{selectedActivity.title}</p>
          <button onClick={close}><X /></button>
        </div>
        
        {/* Contenu : Loading / Erreur / Conseils */}
        <div className="p-6 overflow-y-auto">
          {loadingAdvice ? <Spinner /> : (
            <>
              {/* Points Forts */}
              <div className="bg-green-50">
                <TrendingUp />
                <ul>{adviceData.strengths.map(...)}</ul>
              </div>
              
              {/* Points Faibles */}
              <div className="bg-orange-50">
                <TrendingDown />
                <ul>{adviceData.weaknesses.map(...)}</ul>
              </div>
              
              {/* Suggestions */}
              <div className="bg-blue-50">
                <Lightbulb />
                <ul>{adviceData.suggestions.map(...)}</ul>
              </div>
              
              {/* Message encourageant */}
              <div className="bg-purple-50">
                <p>{adviceData.message}</p>
              </div>
            </>
          )}
        </div>
        
        {/* Footer avec bouton Recommencer */}
        <div className="border-t p-6">
          <Button onClick={handleRestartActivity}>
            <RotateCcw /> Recommencer cette activité
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
```

### Sections du Modal

1. **Points Forts** (vert) - `TrendingUp`
   - Ce qui a bien fonctionné
   - Compétences maîtrisées
   - Icône : CheckCircle

2. **Points à Améliorer** (orange) - `TrendingDown`
   - Domaines nécessitant travail
   - Concepts mal compris
   - Icône : AlertCircle

3. **Conseils pour Réussir** (bleu) - `Lightbulb`
   - Actions concrètes
   - Méthodes de révision
   - Numérotés (1, 2, 3...)

4. **Message d'encouragement** (violet)
   - Personnalisé selon performance
   - Ton motivant et constructif

---

## 🤖 Service IA - Analyse des Activités

### Nouvelle fonction : `generateAdviceForActivity()`

**Fichier** : `src/lib/contextualAIService.js`

```javascript
async generateAdviceForActivity(activity, userProfile) {
  // 1. Construire le prompt avec contexte
  const prompt = `
    Tu es un coach pédagogique expert pour étudiants sénégalais (BFEM/BAC).
    
    Type : ${activity.type}
    Titre : ${activity.title}
    Matière : ${activity.subject}
    Score : ${activity.score}%
    Questions : ${correctAnswers}/${totalQuestions}
    Temps : ${timeSpent} minutes
    
    Profil étudiant :
    - Niveau : ${userProfile.level}
    - Points : ${userProfile.total_points}
    - Classe : ${userProfile.classe}
    
    Fournis une analyse JSON :
    {
      "strengths": [...],
      "weaknesses": [...],
      "suggestions": [...],
      "message": "..."
    }
  `;
  
  // 2. Appeler Gemini 2.0 Flash
  const result = await this.model.generateContent(prompt);
  const text = response.text().trim();
  
  // 3. Parser le JSON
  const adviceData = JSON.parse(text);
  return adviceData;
}
```

### Fonction Helper Exportée

```javascript
export const generateAdviceForActivity = async (activity, userProfile) => {
  const ai = getContextualAI();
  if (!ai || !ai.isAvailable()) {
    return { error: true, message: 'Service IA non disponible' };
  }
  return await ai.generateAdviceForActivity(activity, userProfile);
};
```

### Conseils par Défaut (Fallback)

Si l'IA échoue, retourne des conseils génériques selon le score :

**Score ≥ 70%** :
- Strengths : Excellente maîtrise, bonne gestion du temps
- Suggestions : Essaie des exercices avancés, aide tes camarades

**Score 50-69%** :
- Strengths : Bonne base de compréhension
- Weaknesses : Notions à revoir, gestion du temps
- Suggestions : Révise les concepts, plus d'exercices

**Score < 50%** :
- Weaknesses : Difficultés sur plusieurs concepts
- Suggestions : Reprends les bases, pratique avec exercices simples
- Message : Ne te décourage pas, chaque erreur est une opportunité !

---

## 🔄 Fonctionnalité "Recommencer"

### Logique de Navigation

```javascript
const handleRestartActivity = () => {
  setShowAdviceModal(false);
  
  switch (selectedActivity.type) {
    case 'quiz_completed':
      navigate(`/quiz/${selectedActivity.data.quiz_id}`);
      break;
    case 'exam_completed':
      navigate(`/exam/${selectedActivity.data.exam_id}`);
      break;
    case 'chapter_completed':
      navigate('/courses');
      break;
  }
};
```

**Navigation** :
- Quiz → `/quiz/:quizId`
- Examen → `/exam/:examId`
- Chapitre → `/courses`
- Badge → Pas de recommencement possible

---

## 📊 Structure des Données

### Objet `activity`

```javascript
{
  id: 'quiz-123',
  type: 'quiz_completed', // quiz_completed | exam_completed | chapter_completed | badge_earned
  title: 'Quiz de Mathématiques',
  subject: 'Mathématiques',
  score: 85,
  correctAnswers: 17,
  totalQuestions: 20,
  timeSpent: 420, // secondes
  timestamp: '2025-10-08T14:30:00Z',
  detailsUrl: '/activity/quiz/123',
  data: { /* données brutes de Supabase */ }
}
```

### Réponse IA (`adviceData`)

```json
{
  "strengths": [
    "Excellente compréhension des équations du second degré",
    "Rapidité d'exécution très bonne",
    "Méthodologie claire et structurée"
  ],
  "weaknesses": [
    "Quelques erreurs de calcul sur les fractions",
    "Confusion sur les propriétés des logarithmes"
  ],
  "suggestions": [
    "Révise les règles de simplification des fractions",
    "Fais plus d'exercices sur les logarithmes népériens",
    "Vérifie toujours tes calculs avant de valider",
    "Utilise des méthodes de vérification rapide"
  ],
  "message": "Bravo ! Tu as un excellent niveau en algèbre. Avec un peu plus de pratique sur les logarithmes, tu seras au top !"
}
```

---

## 🎯 États du Composant

```javascript
const [showAdviceModal, setShowAdviceModal] = useState(false);
const [selectedActivity, setSelectedActivity] = useState(null);
const [adviceData, setAdviceData] = useState(null);
const [loadingAdvice, setLoadingAdvice] = useState(false);
```

**Flow d'exécution** :
1. User clique "Conseils" → `handleAdviceClick(activity, e)`
2. `setShowAdviceModal(true)` → Modal s'ouvre
3. `setLoadingAdvice(true)` → Spinner affiché
4. Appel API Gemini → `generateAdviceForActivity()`
5. `setAdviceData(response)` → Conseils affichés
6. `setLoadingAdvice(false)` → Spinner caché
7. User clique "Recommencer" → Navigation vers activité

---

## 🎨 Design System

### Couleurs par Type d'Activité

```javascript
const getActivityColor = (type) => {
  switch (type) {
    case 'chapter_completed': return 'blue';
    case 'quiz_completed': return 'green';
    case 'exam_completed': return 'purple';
    case 'badge_earned': return 'yellow';
    default: return 'gray';
  }
};
```

### Icônes Utilisées

| Fonctionnalité | Icône | Couleur |
|----------------|-------|---------|
| Conseils | `Lightbulb` | Bleu |
| Recommencer | `RotateCcw` | Blanc (sur gradient) |
| Analyse IA | `Brain` | Blanc |
| Points forts | `TrendingUp` | Vert |
| Points faibles | `TrendingDown` | Orange |
| Suggestions | `Lightbulb` | Bleu |
| Succès | `CheckCircle` | Vert |
| Alerte | `AlertCircle` | Orange |
| Temps | `Clock` | Gris |
| Rapidité | `Zap` | Gris |

---

## 🔧 Gestion des Erreurs

### 1. Service IA indisponible

```javascript
if (!ai || !ai.isAvailable()) {
  return {
    error: true,
    message: 'Service IA non disponible'
  };
}
```

**Affichage** :
```jsx
<AlertCircle className="w-16 h-16 text-red-400" />
<p className="text-red-600">{adviceData.message}</p>
```

### 2. Erreur parsing JSON

**Fallback** : Appelle `getDefaultAdvice(activity)`

### 3. Timeout API

**Comportement** : Try/catch capture l'erreur, retourne conseils par défaut

---

## 📱 Responsive Design

**Desktop (≥768px)** :
- Modal : `max-w-2xl` (672px)
- Cartes : Layout flex normal

**Mobile (<768px)** :
- Modal : `w-full` avec padding `p-4`
- Cartes : Stack vertical
- Bouton "Conseils" : Taille réduite

---

## ✅ Tests à Effectuer

### 1. Affichage des Cartes
- [ ] Cartes affichées en format ticket
- [ ] Badges de type visibles
- [ ] Scores colorés correctement
- [ ] Bouton "Conseils" positionné en bas à droite

### 2. Modal Conseils
- [ ] Modal s'ouvre au clic sur "Conseils"
- [ ] Loading spinner affiché pendant génération
- [ ] Points forts/faibles/suggestions affichés
- [ ] Message d'encouragement présent
- [ ] Design responsive (mobile/desktop)

### 3. Génération IA
- [ ] Conseils générés par Gemini 2.0
- [ ] JSON parsé correctement
- [ ] Conseils pertinents selon score/activité
- [ ] Fallback fonctionne si erreur

### 4. Bouton Recommencer
- [ ] Navigation vers quiz correcte
- [ ] Navigation vers examen correcte
- [ ] Navigation vers courses pour chapitres
- [ ] Modal se ferme après clic

### 5. Edge Cases
- [ ] Service IA indisponible → Message d'erreur
- [ ] Activité sans score → Conseils génériques
- [ ] JSON invalide → Conseils par défaut
- [ ] Timeout API → Fallback

---

## 🚀 Améliorations Futures

### Court terme
- [ ] Cache des conseils (éviter régénération)
- [ ] Historique des conseils consultés
- [ ] Partage des conseils (PDF, email)

### Moyen terme
- [ ] Analyse comparative (vs moyenne classe)
- [ ] Graphiques de progression
- [ ] Recommendations de révision ciblées

### Long terme
- [ ] Chatbot contextuel dans le modal
- [ ] Vidéos de cours suggérées
- [ ] Exercices personnalisés selon faiblesses

---

## 📝 Notes Techniques

- **Modèle IA** : Gemini 2.0 Flash Exp
- **Température** : 0.9 (créatif mais cohérent)
- **Max tokens** : 2048
- **Format sortie** : JSON structuré
- **Latence moyenne** : 2-4 secondes

---

## 🎓 Adaptation Contexte Sénégalais

L'IA est configurée pour :
- ✅ Références au BFEM et BAC (pas Brevet/Bac français)
- ✅ Ton amical et encourageant
- ✅ Exemples concrets adaptés au programme
- ✅ Valorisation de l'effort et de la persévérance
- ✅ Suggestions pratiques et réalisables

---

**Système opérationnel et prêt pour tests utilisateurs** ✅
