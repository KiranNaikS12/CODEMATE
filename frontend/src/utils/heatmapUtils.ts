import { UserAdditional } from '../types/userTypes';

export const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

export const generateHeatmapData = (user: UserAdditional) => {
  const currentDate = new Date();

  const normalizedCurrentDate = new Date(
    currentDate.getFullYear(), 
    currentDate.getMonth(), 
    currentDate.getDate() + 1
  );

  const eightMonthAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 6, 1);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const days: { date: Date; submission: number }[] = [];
  const monthLabels: { name: string }[] = [];
  let activeDays = 0;
  let maxStreak = 0;
  let currentStreak = 0;

  // Create a map to store submission counts for each day
  const submissionMap = new Map<string, number>();

  // Process user submissions
  user.totalSubmission?.submissions.forEach(submission => {
    const submissionDate = new Date(submission.submittedAt);
    if (submissionDate >= eightMonthAgo && submissionDate <= currentDate) {
      const dateKey = submissionDate.toISOString().split('T')[0];
      submissionMap.set(dateKey, (submissionMap.get(dateKey) || 0) + 1);
    }
  });

  // Generate month labels for the last 8 months
  for (let i = 0; i < 8; i++) {
    const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - 7 + i, 1);
    monthLabels.push({ name: months[month.getMonth()] });
  }


  // Generate heatmap data looping each day
  for (let d = new Date(eightMonthAgo); d <= normalizedCurrentDate; d.setDate(d.getDate() + 1) ) {
    //This loop starts from a date 8 months ago and continues until it reaches today.
    const dateKey = d.toISOString().split('T')[0];
    const submissionCount = submissionMap.get(dateKey) || 0;

    days.push({
      date: new Date(d),
      submission: submissionCount
    });

    if (submissionCount > 0) {
      activeDays++;
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return {
    days,
    monthLabels,
    activeDays,
    maxStreak
  };
};