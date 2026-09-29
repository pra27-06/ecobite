/**
 * EcoBite AI - Mock Weekly Impact Data
 * 
 * IMPORTANT:
 * These figures represent sample mock UI data for the prototype hackathon demo.
 * In later stages, these will be populated from authenticated student logs in Cloud Firestore (`impactLogs`).
 */

export interface ActivityTimelineItem {
  id: string;
  date: string;
  foodName: string;
  actionType: 'swap' | 'healthy_choice' | 'analyzed';
  details: string;
  moneySaved: number; // INR
  co2SavedKg: number; // kg CO₂
}

export interface MockWeeklyImpactData {
  timeframe: string;
  moneySaved: number;
  smartSwapsCount: number;
  foodDecisionsCount: number;
  estimatedCo2Kg: number;
  isDemoData: boolean;
  activityTimeline: ActivityTimelineItem[];
  dailySavings: { day: string; amount: number }[];
}

export const MOCK_WEEKLY_IMPACT: MockWeeklyImpactData = {
  timeframe: 'This Week',
  moneySaved: 120,
  smartSwapsCount: 3,
  foodDecisionsCount: 8,
  estimatedCo2Kg: 1.45,
  isDemoData: true,
  dailySavings: [
    { day: 'Mon', amount: 20 },
    { day: 'Tue', amount: 35 },
    { day: 'Wed', amount: 0 },
    { day: 'Thu', amount: 45 },
    { day: 'Fri', amount: 20 },
  ],
  activityTimeline: [
    {
      id: 'act-1',
      date: 'Today, 1:15 PM',
      foodName: 'Chole Bhature → Dal Tadka Thali',
      actionType: 'swap',
      details: 'Swapped at MAIT Main Canteen for higher protein and lighter digestion.',
      moneySaved: 20,
      co2SavedKg: 0.35,
    },
    {
      id: 'act-2',
      date: 'Yesterday, 4:30 PM',
      foodName: 'Veg Burger → Paneer Sandwich',
      actionType: 'swap',
      details: 'Swapped fried snack for fresh grilled sandwich at Nescafe booth.',
      moneySaved: 15,
      co2SavedKg: 0.25,
    },
    {
      id: 'act-3',
      date: '28 Sep, 1:00 PM',
      foodName: 'Rajma Chawal',
      actionType: 'healthy_choice',
      details: 'Chose high-sustainability native legume meal at Block 1 Canteen.',
      moneySaved: 25,
      co2SavedKg: 0.45,
    },
    {
      id: 'act-4',
      date: '27 Sep, 11:30 AM',
      foodName: 'Masala Maggi → Paneer Sandwich',
      actionType: 'swap',
      details: 'Accepted morning snack upgrade for sustained focus in lecture.',
      moneySaved: 10,
      co2SavedKg: 0.20,
    },
    {
      id: 'act-5',
      date: '26 Sep, 3:00 PM',
      foodName: 'Cold Coffee',
      actionType: 'analyzed',
      details: 'Checked nutritional breakdown and high sugar alert.',
      moneySaved: 0,
      co2SavedKg: 0.0,
    },
  ],
};
