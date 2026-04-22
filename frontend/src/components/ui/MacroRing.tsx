import React, { useEffect, useState } from 'react';

interface MacroRingProps {
  caloriesConsumed: number;
  caloriesGoal: number;
}

export const MacroRing: React.FC<MacroRingProps> = ({ caloriesConsumed, caloriesGoal }) => {
  const [offset, setOffset] = useState(0);
  
  const radius = 80;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  const percentage = Math.min((caloriesConsumed / caloriesGoal) * 100, 100);
  
  // Calculate remaining calories
  const remaining = Math.max(caloriesGoal - caloriesConsumed, 0);

  // Determine color based on progress
  let strokeColor = '#CCFF00'; // Primary (green-yellow)
  if (percentage >= 100) {
    strokeColor = '#EF4444'; // Red (over)
  } else if (percentage >= 80) {
    strokeColor = '#FBBF24'; // Amber (warning)
  }

  useEffect(() => {
    // Animate stroke dashoffset on mount or value change
    const progressOffset = circumference - (percentage / 100) * circumference;
    setOffset(progressOffset);
  }, [percentage, circumference]);

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90"
      >
        {/* Background track */}
        <circle
          stroke="#1F2937" // dark-900 equivalent
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Progress ring */}
        <circle
          stroke={strokeColor}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset: isNaN(offset) ? circumference : offset, transition: 'stroke-dashoffset 0.5s ease-in-out' }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      {/* Center text content */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-4xl font-display font-bold text-white block">
          {remaining.toLocaleString()}
        </span>
        <span className="text-xs font-bold tracking-widest text-gray-500 uppercase block">
          KCAL LEFT
        </span>
      </div>
    </div>
  );
};
