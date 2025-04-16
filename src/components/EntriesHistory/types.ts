
export interface TraineeAnalytics {
    hourData: { name: string; count: number }[];
    dayData: { name: string; count: number }[];
    monthlyAverage: string;
    percentile: number;
    totalEntries: number;
  }
  