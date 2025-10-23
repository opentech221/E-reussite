/**
 * 📖 CAREER DETAIL MODAL - Modal détaillé d'un métier
 * Date: 23 octobre 2025
 */

import { motion } from 'framer-motion';
import { 
  X, 
  DollarSign, 
  TrendingUp, 
  GraduationCap, 
  Briefcase,
  MapPin,
  Award,
  BookOpen,
  Target,
  Users,
  CheckCircle,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';

const CareerDetailModal = ({ career, onClose }) => {
  if (!career) return null;

  const IconComponent = career.icon ? LucideIcons[career.icon] : Briefcase;

  const formatSalary = (min, max) => {
    if (!min || !max) return 'Non spécifié';
    return `${(min / 1000).toFixed(0)}k - ${(max / 1000).toFixed(0)}k FCFA/mois`;
  };

  const outlookColors = {
    'Excellent': 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30',
    'Bon': 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
    'Moyen': 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-6 rounded-t-2xl z-10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
              <IconComponent className="w-12 h-12" />
            </div>
            <div>
              <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-medium mb-2">
                {career.category}
              </div>
              <h2 className="text-3xl font-bold">{career.title}</h2>
              <p className="text-white/80 mt-2">{career.short_description}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Salaire moyen</div>
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {formatSalary(career.average_salary_min, career.average_salary_max)}
              </div>
            </div>

            <div className={`rounded-xl p-4 ${outlookColors[career.job_market_outlook] || 'bg-gray-50 dark:bg-gray-900/20'}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white/50 dark:bg-black/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="text-sm">Marché de l'emploi</div>
              </div>
              <div className="text-xl font-bold">
                {career.job_market_outlook || 'Non spécifié'}
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Environnement</div>
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {career.work_environment || 'Mixte'}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white mb-3">
              <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              Description du métier
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {career.description}
            </p>
          </div>

          {/* Required Studies */}
          {career.required_studies && career.required_studies.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white mb-3">
                <GraduationCap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                Formation requise
              </h3>
              <ul className="space-y-2">
                {career.required_studies.map((study, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <span>{study}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Required Skills */}
          {career.required_skills && career.required_skills.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white mb-3">
                <Award className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                Compétences requises
              </h3>
              <div className="flex flex-wrap gap-2">
                {career.required_skills.map((skill, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-lg font-medium"
                  >
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Important Subjects */}
          {career.important_subjects && career.important_subjects.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white mb-3">
                <Target className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                Matières importantes
              </h3>
              <div className="flex flex-wrap gap-2">
                {career.important_subjects.map((subject, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300 rounded-lg font-medium"
                  >
                    {subject}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compatibility */}
          <div>
            <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white mb-3">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Accessible après
            </h3>
            <div className="flex gap-3">
              {career.suitable_for_bfem && (
                <div className="flex-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded-xl p-4 text-center font-semibold">
                  BFEM
                </div>
              )}
              {career.suitable_for_bac && (
                <div className="flex-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-xl p-4 text-center font-semibold">
                  BAC
                </div>
              )}
            </div>
          </div>

          {/* Interest Profile */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              🎯 Profil d'intérêt pour ce métier
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { key: 'interest_scientific', label: 'Scientifique', color: 'bg-blue-500' },
                { key: 'interest_literary', label: 'Littéraire', color: 'bg-green-500' },
                { key: 'interest_technical', label: 'Technique', color: 'bg-yellow-500' },
                { key: 'interest_artistic', label: 'Artistique', color: 'bg-pink-500' },
                { key: 'interest_social', label: 'Social', color: 'bg-purple-500' },
                { key: 'interest_commercial', label: 'Commercial', color: 'bg-red-500' },
              ].map(({ key, label, color }) => (
                <div key={key}>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color}`}
                      style={{ width: `${career[key] || 0}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                    {career[key] || 0}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Fermer
            </button>
            <button className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg">
              Enregistrer ce métier
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CareerDetailModal;
