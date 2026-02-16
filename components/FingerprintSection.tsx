import React from 'react';

interface FingerprintSectionProps {
  title: string;
  icon: React.ReactNode;
  description: string;
  score: number;
  color: 'cyan' | 'purple' | 'rose' | 'emerald';
  children: React.ReactNode;
}

const FingerprintSection: React.FC<FingerprintSectionProps> = ({ 
  title, 
  icon, 
  description, 
  score, 
  color,
  children 
}) => {
  const colorClasses = {
    cyan: 'border-cyan-500/20 text-cyan-400 bg-cyan-500/10',
    purple: 'border-purple-500/20 text-purple-400 bg-purple-500/10',
    rose: 'border-rose-500/20 text-rose-400 bg-rose-500/10',
    emerald: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/10',
  };

  const borderClass = {
    cyan: 'border-t-cyan-500',
    purple: 'border-t-purple-500',
    rose: 'border-t-rose-500',
    emerald: 'border-t-emerald-500',
  };

  return (
    <div className={`relative bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden border-t-4 ${borderClass[color]}`}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
              {icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Entropy Contribution</p>
            </div>
          </div>
          <div className="text-right">
             <span className={`text-2xl font-bold ${colorClasses[color].split(' ')[1]}`}>{score}%</span>
          </div>
        </div>
        
        <p className="text-slate-400 text-sm mb-6 border-b border-slate-800 pb-4">
          {description}
        </p>

        <div className="space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default FingerprintSection;