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
          {/* Stats Grid - ENRICHI PHASE 1.5 */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Salaire moyen</div>
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {formatSalary(career.average_salary_min, career.average_salary_max)}
              </div>
            </div>

            <div className={`rounded-xl p-4 ${outlookColors[career.job_market] || 'bg-gray-50 dark:bg-gray-900/20'}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white/50 dark:bg-black/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="text-sm">Marché emploi</div>
              </div>
              <div className="text-lg font-bold">
                {career.job_market || 'Non spécifié'}
              </div>
              {career.employment_rate_percentage && (
                <div className="text-xs mt-1 opacity-80">
                  Insertion: {career.employment_rate_percentage}%
                </div>
              )}
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Formation</div>
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {career.academic_difficulty === 'very_hard' && '⭐⭐⭐⭐ Très difficile'}
                {career.academic_difficulty === 'hard' && '⭐⭐⭐ Difficile'}
                {career.academic_difficulty === 'medium' && '⭐⭐ Modéré'}
                {career.academic_difficulty === 'easy' && '⭐ Accessible'}
                {!career.academic_difficulty && 'Modéré'}
              </div>
              {career.success_rate_percentage && (
                <div className="text-xs mt-1 text-gray-600 dark:text-gray-400">
                  Taux réussite: {career.success_rate_percentage}%
                </div>
              )}
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">ROI formation</div>
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {career.roi_months ? `${career.roi_months} mois` : 'N/A'}
              </div>
              {career.training_cost_fcfa && (
                <div className="text-xs mt-1 text-gray-600 dark:text-gray-400">
                  Coût: {(career.training_cost_fcfa / 1000000).toFixed(1)}M FCFA
                </div>
              )}
            </div>
          </div>

          {/* NOUVEAU : Tendance marché + zones géographiques */}
          {(career.growth_trend || career.geographic_availability) && (
            <div className="grid md:grid-cols-2 gap-4">
              {career.growth_trend && (
                <div className={`rounded-xl p-4 ${
                  career.growth_trend === 'growing' || career.growth_trend === 'emerging' 
                    ? 'bg-emerald-50 dark:bg-emerald-900/20' 
                    : career.growth_trend === 'declining' 
                    ? 'bg-red-50 dark:bg-red-900/20'
                    : 'bg-gray-50 dark:bg-gray-900/20'
                }`}>
                  <div className="font-semibold text-gray-900 dark:text-white mb-1">
                    📈 Tendance du marché
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {career.growth_trend === 'growing' && '🚀 En forte croissance'}
                    {career.growth_trend === 'emerging' && '💡 Secteur émergent'}
                    {career.growth_trend === 'stable' && '➡️ Stable'}
                    {career.growth_trend === 'declining' && '📉 En déclin'}
                  </div>
                </div>
              )}

              {career.geographic_availability && career.geographic_availability.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                  <div className="font-semibold text-gray-900 dark:text-white mb-1">
                    📍 Régions disponibles
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {career.geographic_availability.slice(0, 3).join(', ')}
                    {career.geographic_availability.length > 3 && ` (+${career.geographic_availability.length - 3})`}
                  </div>
                </div>
              )}
            </div>
          )}

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

          {/* NOUVEAU : Témoignage professionnel */}
          {career.testimonial && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-5 border-l-4 border-amber-500">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Users className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-amber-900 dark:text-amber-300 mb-1">
                    💬 Témoignage d'un professionnel
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 italic">
                    "{career.testimonial}"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* NOUVEAU : Parcours de carrière */}
          {career.career_path && career.career_path.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white mb-3">
                <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                Évolution de carrière
              </h3>
              <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-400 to-emerald-600"></div>
                <div className="space-y-4">
                  {career.career_path.map((step, index) => (
                    <div key={index} className="flex items-start gap-4 relative">
                      <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center font-bold text-emerald-700 dark:text-emerald-300 z-10 flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4">
                        <p className="text-gray-800 dark:text-gray-200 font-medium">{step}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* NOUVEAU : Débouchés concrets */}
          {career.concrete_jobs && career.concrete_jobs.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white mb-3">
                <Briefcase className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                Débouchés professionnels
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {career.concrete_jobs.map((job, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-4"
                  >
                    <CheckCircle className="w-5 h-5 text-cyan-600 dark:text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{job}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NOUVEAU : Conditions de travail réelles */}
          {career.work_conditions && (
            <div className="bg-slate-50 dark:bg-slate-900/30 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
              <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white mb-3">
                ⚙️ Conditions de travail réelles
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {career.work_conditions}
              </p>
            </div>
          )}

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
                Compétences techniques requises
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

          {/* NOUVEAU : Soft skills comportementales */}
          {career.soft_skills_required && career.soft_skills_required.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white mb-3">
                <Users className="w-6 h-6 text-fuchsia-600 dark:text-fuchsia-400" />
                Qualités comportementales essentielles
              </h3>
              <div className="flex flex-wrap gap-2">
                {career.soft_skills_required.map((skill, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-800 dark:text-fuchsia-300 rounded-lg font-medium"
                  >
                    ✨ {skill}
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
