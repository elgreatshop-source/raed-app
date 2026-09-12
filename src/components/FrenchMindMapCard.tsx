import React from 'react';
import { MindMapFrench, TeacherProfile, PrintTheme } from '../types';
import { getFontFamilyCss } from '../data/themePresets';
import { Check, Clock, Globe } from 'lucide-react';

interface FrenchMindMapCardProps {
  data: MindMapFrench;
  profile: TeacherProfile;
  theme: PrintTheme;
  onUpdate: (updated: MindMapFrench) => void;
}

export const FrenchMindMapCard: React.FC<FrenchMindMapCardProps> = ({
  data,
  profile,
  theme,
  onUpdate,
}) => {
  const primaryBg = theme.primaryColor || '#e07a38';
  const borderCol = theme.borderColor || '#d96c24';
  const fontCss = getFontFamilyCss(theme.latinFontFamily || theme.fontFamily, true);

  return (
    <div
      id="french-mind-map-printable"
      className="w-full max-w-4xl mx-auto bg-white border border-stone-300 rounded-xl shadow-sm p-4 sm:p-6 print:p-2 print:border-none print:shadow-none text-stone-900 leading-relaxed transition-all"
      style={{ fontFamily: fontCss }}
      dir="ltr"
    >
      {/* Main Banner Title */}
      <div
        className="w-full text-white text-center py-2 px-4 rounded-md font-bold text-base sm:text-lg mb-3 flex items-center justify-center gap-2 shadow-sm print:text-black print:border print:border-stone-800"
        style={{ backgroundColor: primaryBg }}
      >
        <Globe className="w-5 h-5 opacity-90 hidden sm:inline" />
        <span>Carte Mentale de la Leçon :</span>
        <input
          type="text"
          value={data.lessonTitle}
          onChange={(e) => onUpdate({ ...data, lessonTitle: e.target.value })}
          className="bg-transparent border-b border-white/60 focus:border-white outline-none px-2 py-0.5 text-center font-bold text-white placeholder-white/70 min-w-[240px] max-w-full text-sm sm:text-base print:text-black print:border-black"
          placeholder="Titre de la leçon..."
        />
      </div>

      {/* Lesson Meta Table */}
      <div className="w-full border border-stone-800 rounded mb-4 text-xs sm:text-sm overflow-hidden grid grid-cols-2 divide-x divide-stone-800 text-left">
        <div className="divide-y divide-stone-800">
          <div className="p-1.5 flex items-center justify-between gap-1 bg-stone-50">
            <span className="font-bold text-stone-800 whitespace-nowrap">Niveau :</span>
            <input
              type="text"
              value={data.level}
              onChange={(e) => onUpdate({ ...data, level: e.target.value })}
              className="w-full bg-transparent text-left px-1 outline-none text-stone-900 font-medium"
            />
          </div>
          <div className="p-1.5 flex items-center justify-between gap-1">
            <span className="font-bold text-stone-800 whitespace-nowrap">Phase / Étape :</span>
            <input
              type="text"
              value={data.phase}
              onChange={(e) => onUpdate({ ...data, phase: e.target.value })}
              className="w-full bg-transparent text-left px-1 outline-none text-stone-900 font-medium"
            />
          </div>
          <div className="p-1.5 flex items-center justify-between gap-1 bg-stone-50">
            <span className="font-bold text-stone-800 whitespace-nowrap">Discipline :</span>
            <span className="w-full text-left px-1 font-bold text-blue-900">Français</span>
          </div>
        </div>

        <div className="divide-y divide-stone-800">
          <div className="p-1.5 flex items-center justify-between gap-1 bg-stone-50">
            <span className="font-bold text-stone-800 whitespace-nowrap">Parcours :</span>
            <input
              type="text"
              value={data.pathway}
              onChange={(e) => onUpdate({ ...data, pathway: e.target.value })}
              className="w-full bg-transparent text-left px-1 outline-none text-stone-900 font-medium"
            />
          </div>
          <div className="p-1.5 flex items-center justify-between gap-1">
            <span className="font-bold text-stone-800 whitespace-nowrap">Palier :</span>
            <input
              type="text"
              value={data.milestone}
              onChange={(e) => onUpdate({ ...data, milestone: e.target.value })}
              className="w-full bg-transparent text-left px-1 outline-none text-stone-900 font-medium"
            />
          </div>
          <div className="p-1.5 flex items-center justify-between gap-1 bg-stone-50">
            <span className="font-bold text-stone-800 whitespace-nowrap">Séance :</span>
            <input
              type="text"
              value={data.session}
              onChange={(e) => onUpdate({ ...data, session: e.target.value })}
              className="w-full bg-transparent text-left px-1 outline-none text-stone-900 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Objectives Section */}
      <div className="w-full border border-stone-800 rounded p-2.5 mb-4 bg-stone-50/50">
        <div className="font-bold text-sm sm:text-base text-stone-900 mb-1.5 flex items-center gap-1.5">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Objectifs d'apprentissage :</span>
        </div>
        <div className="space-y-1.5 text-xs sm:text-sm text-stone-800 pl-2">
          {data.objectives.map((obj, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-emerald-700 font-bold">✓</span>
              <input
                type="text"
                value={obj}
                onChange={(e) => {
                  const newObjs = [...data.objectives];
                  newObjs[idx] = e.target.value;
                  onUpdate({ ...data, objectives: newObjs });
                }}
                className="w-full bg-transparent border-b border-dashed border-stone-300 focus:border-stone-600 outline-none pb-0.5 text-stone-800"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Top Split: 1- Ouverture & 3- Clôture */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {/* 1- Ouverture */}
        <div className="border border-stone-800 rounded overflow-hidden">
          <div
            className="p-1.5 px-3 text-white font-bold text-xs sm:text-sm flex items-center justify-between"
            style={{ backgroundColor: primaryBg }}
          >
            <span>1- Ouverture de la séance :</span>
            <div className="flex items-center gap-1 text-[11px] bg-white/20 px-2 py-0.5 rounded">
              <Clock className="w-3 h-3" />
              <input
                type="number"
                value={data.opening.durationMinutes}
                onChange={(e) =>
                  onUpdate({
                    ...data,
                    opening: { ...data.opening, durationMinutes: parseInt(e.target.value) || 10 },
                  })
                }
                className="w-8 bg-transparent text-center text-white outline-none font-bold"
              />
              <span>min</span>
            </div>
          </div>
          <div className="p-2.5 space-y-2 text-xs sm:text-sm bg-white">
            <div>
              <div className="font-semibold text-stone-800 mb-0.5 flex items-center gap-1">
                <span className="text-emerald-700">✓</span> Déclaration de l'objectif :
              </div>
              <textarea
                rows={2}
                value={data.opening.declareObjective}
                onChange={(e) =>
                  onUpdate({
                    ...data,
                    opening: { ...data.opening, declareObjective: e.target.value },
                  })
                }
                className="w-full text-xs p-1.5 border border-stone-200 rounded focus:border-amber-500 outline-none bg-stone-50/50 resize-none text-stone-800"
              />
            </div>
            <div>
              <div className="font-semibold text-stone-800 mb-0.5 flex items-center gap-1">
                <span className="text-emerald-700">✓</span> Activité rituelle :
              </div>
              <textarea
                rows={2}
                value={data.opening.routineActivity}
                onChange={(e) =>
                  onUpdate({
                    ...data,
                    opening: { ...data.opening, routineActivity: e.target.value },
                  })
                }
                className="w-full text-xs p-1.5 border border-stone-200 rounded focus:border-amber-500 outline-none bg-stone-50/50 resize-none text-stone-800"
              />
            </div>
          </div>
        </div>

        {/* 3- Clôture */}
        <div className="border border-stone-800 rounded overflow-hidden">
          <div
            className="p-1.5 px-3 text-white font-bold text-xs sm:text-sm flex items-center justify-between"
            style={{ backgroundColor: primaryBg }}
          >
            <span>3- Clôture de la séance :</span>
            <div className="flex items-center gap-1 text-[11px] bg-white/20 px-2 py-0.5 rounded">
              <Clock className="w-3 h-3" />
              <input
                type="number"
                value={data.closing.durationMinutes}
                onChange={(e) =>
                  onUpdate({
                    ...data,
                    closing: { ...data.closing, durationMinutes: parseInt(e.target.value) || 10 },
                  })
                }
                className="w-8 bg-transparent text-center text-white outline-none font-bold"
              />
              <span>min</span>
            </div>
          </div>
          <div className="p-2.5 space-y-1.5 text-xs sm:text-sm bg-white">
            <div>
              <div className="font-semibold text-stone-800 mb-0.5 flex items-center gap-1">
                <span className="text-emerald-700">✓</span> Jeu éducatif :
              </div>
              <input
                type="text"
                value={data.closing.game}
                onChange={(e) =>
                  onUpdate({
                    ...data,
                    closing: { ...data.closing, game: e.target.value },
                  })
                }
                className="w-full text-xs p-1 border border-stone-200 rounded focus:border-amber-500 outline-none bg-stone-50/50 text-stone-800"
              />
            </div>
            <div>
              <div className="font-semibold text-stone-800 mb-0.5 flex items-center gap-1">
                <span className="text-emerald-700">✓</span> Bilan / Objectivation :
              </div>
              <input
                type="text"
                value={data.closing.reflection}
                onChange={(e) =>
                  onUpdate({
                    ...data,
                    closing: { ...data.closing, reflection: e.target.value },
                  })
                }
                className="w-full text-xs p-1 border border-stone-200 rounded focus:border-amber-500 outline-none bg-stone-50/50 text-stone-800"
              />
            </div>
            <div>
              <div className="font-semibold text-stone-800 mb-0.5 flex items-center gap-1">
                <span className="text-emerald-700">✓</span> Travail à domicile :
              </div>
              <input
                type="text"
                value={data.closing.homework}
                onChange={(e) =>
                  onUpdate({
                    ...data,
                    closing: { ...data.closing, homework: e.target.value },
                  })
                }
                className="w-full text-xs p-1 border border-stone-200 rounded focus:border-amber-500 outline-none bg-stone-50/50 text-stone-800"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Activities Section Title */}
      <div
        className="w-full text-white text-center py-1.5 px-3 rounded font-bold text-sm sm:text-base mb-3 shadow-xs"
        style={{ backgroundColor: primaryBg }}
      >
        <span>2- Activités Principales (Enseignement Explicite)</span>
      </div>

      {/* 2 Main Activities Columns: Lecture & Écriture */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* 1-2 Activité de Lecture */}
        <div className="border border-stone-800 rounded overflow-hidden">
          <div
            className="p-1.5 px-3 text-white font-bold text-xs sm:text-sm flex items-center justify-between"
            style={{ backgroundColor: borderCol }}
          >
            <span>1-2- Activité de Lecture :</span>
            <div className="flex items-center gap-1 text-[11px] bg-white/20 px-2 py-0.5 rounded">
              <Clock className="w-3 h-3" />
              <input
                type="number"
                value={data.readingActivity.durationMinutes}
                onChange={(e) =>
                  onUpdate({
                    ...data,
                    readingActivity: {
                      ...data.readingActivity,
                      durationMinutes: parseInt(e.target.value) || 20,
                    },
                  })
                }
                className="w-8 bg-transparent text-center text-white outline-none font-bold"
              />
              <span>min</span>
            </div>
          </div>
          <div className="p-2.5 space-y-3 text-xs sm:text-sm bg-white">
            <div>
              <div className="font-bold text-stone-900 mb-0.5 flex items-center gap-1">
                <span className="text-emerald-700 font-bold">✓</span> Modelage (Je fais) :
              </div>
              <textarea
                rows={3}
                value={data.readingActivity.modeling}
                onChange={(e) =>
                  onUpdate({
                    ...data,
                    readingActivity: { ...data.readingActivity, modeling: e.target.value },
                  })
                }
                className="w-full text-xs p-1.5 border border-stone-200 rounded focus:border-amber-500 outline-none bg-stone-50/50 resize-none text-stone-800"
              />
            </div>
            <div>
              <div className="font-bold text-stone-900 mb-0.5 flex items-center gap-1">
                <span className="text-emerald-700 font-bold">✓</span> Pratique guidée (Nous faisons) :
              </div>
              <textarea
                rows={3}
                value={data.readingActivity.guidedPractice}
                onChange={(e) =>
                  onUpdate({
                    ...data,
                    readingActivity: { ...data.readingActivity, guidedPractice: e.target.value },
                  })
                }
                className="w-full text-xs p-1.5 border border-stone-200 rounded focus:border-amber-500 outline-none bg-stone-50/50 resize-none text-stone-800"
              />
            </div>
            <div>
              <div className="font-bold text-stone-900 mb-0.5 flex items-center gap-1">
                <span className="text-emerald-700 font-bold">✓</span> Pratique autonome (Tu fais) :
              </div>
              <textarea
                rows={3}
                value={data.readingActivity.independentPractice}
                onChange={(e) =>
                  onUpdate({
                    ...data,
                    readingActivity: { ...data.readingActivity, independentPractice: e.target.value },
                  })
                }
                className="w-full text-xs p-1.5 border border-stone-200 rounded focus:border-amber-500 outline-none bg-stone-50/50 resize-none text-stone-800"
              />
            </div>
          </div>
        </div>

        {/* 2-2 Activité d'Écriture */}
        <div className="border border-stone-800 rounded overflow-hidden">
          <div
            className="p-1.5 px-3 text-white font-bold text-xs sm:text-sm flex items-center justify-between"
            style={{ backgroundColor: borderCol }}
          >
            <span>2-2- Activité d'Écriture :</span>
            <div className="flex items-center gap-1 text-[11px] bg-white/20 px-2 py-0.5 rounded">
              <Clock className="w-3 h-3" />
              <input
                type="number"
                value={data.writingActivity.durationMinutes}
                onChange={(e) =>
                  onUpdate({
                    ...data,
                    writingActivity: {
                      ...data.writingActivity,
                      durationMinutes: parseInt(e.target.value) || 20,
                    },
                  })
                }
                className="w-8 bg-transparent text-center text-white outline-none font-bold"
              />
              <span>min</span>
            </div>
          </div>
          <div className="p-2.5 space-y-3 text-xs sm:text-sm bg-white">
            <div>
              <div className="font-bold text-stone-900 mb-0.5 flex items-center gap-1">
                <span className="text-emerald-700 font-bold">✓</span> Modelage (Je fais) :
              </div>
              <textarea
                rows={3}
                value={data.writingActivity.modeling}
                onChange={(e) =>
                  onUpdate({
                    ...data,
                    writingActivity: { ...data.writingActivity, modeling: e.target.value },
                  })
                }
                className="w-full text-xs p-1.5 border border-stone-200 rounded focus:border-amber-500 outline-none bg-stone-50/50 resize-none text-stone-800"
              />
            </div>
            <div>
              <div className="font-bold text-stone-900 mb-0.5 flex items-center gap-1">
                <span className="text-emerald-700 font-bold">✓</span> Pratique guidée (Nous faisons) :
              </div>
              <textarea
                rows={3}
                value={data.writingActivity.guidedPractice}
                onChange={(e) =>
                  onUpdate({
                    ...data,
                    writingActivity: { ...data.writingActivity, guidedPractice: e.target.value },
                  })
                }
                className="w-full text-xs p-1.5 border border-stone-200 rounded focus:border-amber-500 outline-none bg-stone-50/50 resize-none text-stone-800"
              />
            </div>
            <div>
              <div className="font-bold text-stone-900 mb-0.5 flex items-center gap-1">
                <span className="text-emerald-700 font-bold">✓</span> Pratique autonome (Tu fais) :
              </div>
              <textarea
                rows={3}
                value={data.writingActivity.independentPractice}
                onChange={(e) =>
                  onUpdate({
                    ...data,
                    writingActivity: { ...data.writingActivity, independentPractice: e.target.value },
                  })
                }
                className="w-full text-xs p-1.5 border border-stone-200 rounded focus:border-amber-500 outline-none bg-stone-50/50 resize-none text-stone-800"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
