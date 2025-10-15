import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  BookOpen, 
  Target, 
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Lightbulb
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

/**
 * Composant de suggestions de révision ciblées
 * Analyse les erreurs et propose des axes d'amélioration
 */
const QuizRevisionSuggestions = ({ sessionId, userId, questions, userAnswers }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [weakTopics, setWeakTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (questions && userAnswers) {
      analyzeMistakes();
    }
  }, [questions, userAnswers]);

  const analyzeMistakes = () => {
    try {
      setLoading(true);

      // Identifier les questions échouées
      const mistakes = questions.filter((q, index) => {
        const answer = userAnswers[index];
        return answer && !answer.is_correct;
      });

      // Analyser les catégories de questions échouées
      const topicAnalysis = {};
      
      mistakes.forEach(question => {
        // Déterminer le type de question (Mathématiques, Français, etc.)
        let topic = 'Général';
        
        if (question.question.includes('calculer') || 
            question.question.includes('×') || 
            question.question.includes('+') ||
            question.question.includes('aire')) {
          topic = 'Mathématiques';
        } else if (question.question.includes('capitale') || 
                   question.question.includes('pays')) {
          topic = 'Géographie';
        } else if (question.question.includes('anglais') || 
                   question.question.includes('traduction')) {
          topic = 'Langues';
        }

        if (!topicAnalysis[topic]) {
          topicAnalysis[topic] = {
            topic,
            mistakes: 0,
            total: 0,
            questions: []
          };
        }

        topicAnalysis[topic].mistakes++;
        topicAnalysis[topic].questions.push(question);
      });

      // Compter le total par catégorie
      questions.forEach(question => {
        let topic = 'Général';
        
        if (question.question.includes('calculer') || 
            question.question.includes('×') || 
            question.question.includes('+') ||
            question.question.includes('aire')) {
          topic = 'Mathématiques';
        } else if (question.question.includes('capitale') || 
                   question.question.includes('pays')) {
          topic = 'Géographie';
        } else if (question.question.includes('anglais') || 
                   question.question.includes('traduction')) {
          topic = 'Langues';
        }

        if (topicAnalysis[topic]) {
          topicAnalysis[topic].total++;
        }
      });

      // Trier par taux d'erreur
      const weakTopicsList = Object.values(topicAnalysis)
        .filter(t => t.mistakes > 0)
        .map(t => ({
          ...t,
          errorRate: (t.mistakes / t.total) * 100
        }))
        .sort((a, b) => b.errorRate - a.errorRate);

      setWeakTopics(weakTopicsList);

      // Générer des suggestions personnalisées
      const newSuggestions = [];

      if (mistakes.length === 0) {
        newSuggestions.push({
          type: 'success',
          icon: CheckCircle2,
          title: 'Parcours sans faute !',
          message: 'Tu as répondu correctement à toutes les questions. Continue comme ça !',
          action: null
        });
      } else if (mistakes.length === questions.length) {
        newSuggestions.push({
          type: 'critical',
          icon: AlertCircle,
          title: 'Révision approfondie nécessaire',
          message: 'Il semble que ce sujet soit nouveau pour toi. Je te recommande de revoir les bases avant de réessayer.',
          action: {
            label: 'Revoir le cours',
            type: 'review_course'
          }
        });
      } else {
        // Suggestions par thème faible
        weakTopicsList.forEach(topic => {
          if (topic.errorRate > 50) {
            newSuggestions.push({
              type: 'warning',
              icon: TrendingDown,
              title: `${topic.topic} : Points à améliorer`,
              message: `Tu as eu ${topic.mistakes}/${topic.total} erreurs en ${topic.topic}. Une révision ciblée t'aidera à progresser.`,
              action: {
                label: `Réviser ${topic.topic}`,
                type: 'review_topic',
                data: topic
              }
            });
          } else {
            newSuggestions.push({
              type: 'info',
              icon: Lightbulb,
              title: `${topic.topic} : Quelques ajustements`,
              message: `Tu maîtrises globalement ${topic.topic}, mais attention à quelques détails.`,
              action: {
                label: 'Revoir les erreurs',
                type: 'review_mistakes',
                data: topic
              }
            });
          }
        });

        // Suggestion générale
        if (mistakes.length < questions.length / 2) {
          newSuggestions.push({
            type: 'success',
            icon: Target,
            title: 'Bon niveau général',
            message: 'Tu as une bonne base ! Quelques révisions ciblées suffiront pour atteindre l\'excellence.',
            action: {
              label: 'Refaire le quiz',
              type: 'retry_quiz'
            }
          });
        }
      }

      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('Erreur analyse des erreurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'critical':
        return 'text-red-500';
      default:
        return 'text-blue-500';
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'critical':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analyse des Thèmes Faibles */}
      {weakTopics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Analyse de tes points faibles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weakTopics.map((topic, index) => (
                <motion.div
                  key={topic.topic}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      <span className="font-medium text-slate-700 dark:text-slate-200">
                        {topic.topic}
                      </span>
                    </div>
                    <span className={`text-sm font-semibold ${
                      topic.errorRate > 50 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {Math.round(topic.errorRate)}% d'erreurs
                    </span>
                  </div>
                  <Progress 
                    value={100 - topic.errorRate} 
                    className="h-2"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {topic.mistakes} erreur{topic.mistakes > 1 ? 's' : ''} sur {topic.total} question{topic.total > 1 ? 's' : ''}
                  </p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suggestions de Révision */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Suggestions personnalisées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => {
              const Icon = suggestion.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border ${getBgColor(suggestion.type)}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 mt-0.5 ${getIconColor(suggestion.type)}`} />
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-1">
                        {suggestion.title}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                        {suggestion.message}
                      </p>
                      {suggestion.action && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                        >
                          {suggestion.action.label}
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizRevisionSuggestions;
