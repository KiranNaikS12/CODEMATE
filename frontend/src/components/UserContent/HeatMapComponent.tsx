import React from 'react'
import { generateHeatmapData, getDaysInMonth } from '../../utils/heatmapUtils';
import { UserAdditional } from '../../types/userTypes';

export interface HeatMapComponentProps {
    user?: UserAdditional
}

const HeatMapComponent: React.FC<HeatMapComponentProps> = ({ user }) => {
  if (!user) return null;
  
  const { days, monthLabels, activeDays, maxStreak } = generateHeatmapData(user);
  
  const getBgColor = (submission: number) => {
    if (submission > 4) return 'bg-green-600';
    if (submission > 3) return 'bg-green-500';
    if (submission > 2) return 'bg-green-400';
    if (submission >= 1) return 'bg-green-300';
    if (submission > 0) return 'bg-green-200';
    return 'bg-gray-400';
  };
  
  const currentDate = new Date();
  const eightMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 7, 1);
  
  
  return (
    <div className="p-4 border border-white rounded-md shadow-md py-7 text-themeColor">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xl font-medium text-gray-500">
          {user?.totalSubmission?.count || 0} submissions in the past 6 months
        </p>
        <div className="space-x-4 text-sm">
          <span>Total active days: <span className="font-bold">{activeDays}</span></span>
          <span>Max streak: <span className="font-bold">{maxStreak}</span></span>
        </div>
      </div>

      {/* Month Labels */}
      <div className="grid grid-cols-8 gap-2 ml-2">
        {monthLabels.map(({ name }, monthIndex) => {
          const currentMonth = new Date(eightMonthsAgo.getFullYear(), eightMonthsAgo.getMonth() + monthIndex, 1);
          return (
            <div key={monthIndex} className="space-y-1">
              <h3 className="text-sm text-gray-500">{name}</h3>
              <div className="grid grid-cols-6 gap-4">
                <div className="grid grid-cols-6 gap-3 gap-y-2">
                  {Array.from({ length: getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth()) }, (_, dayIndex) => {
                    const currentDay = days.find(
                      (day) =>
                        day.date.getMonth() === currentMonth.getMonth() &&
                        day.date.getDate() === dayIndex + 1 &&
                        day.date.getFullYear() === currentMonth.getFullYear()
                    );
                    return (
                      <div
                        key={dayIndex}
                        className={`w-[10px] h-[10px] rounded-xs hover:scale-110 transition-transform ${getBgColor(
                          currentDay?.submission || 0
                        )}`}
                        title={`${currentDay?.date.toDateString() || 'N/A'}: ${
                          currentDay?.submission || 0
                        } submissions`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HeatMapComponent;

