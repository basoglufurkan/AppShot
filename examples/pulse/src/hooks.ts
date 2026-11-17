import * as Notifications from 'expo-notifications';
import AppleHealthKit from 'react-native-health';

export function useStreak() { return { days: 12 }; }
export function useTodayPlan() { return { id: 'full-body-burn', title: 'Full-Body Burn', userName: 'Alex' }; }
export async function scheduleDailyReminder() {
  await Notifications.scheduleNotificationAsync({ content: { title: 'Time to move', body: 'Your 25-min plan is ready' }, trigger: { hour: 8, minute: 0, repeats: true } as any });
}
