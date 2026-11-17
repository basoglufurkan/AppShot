import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useStreak, useTodayPlan } from '../../src/hooks';

export default function TodayScreen() {
  const streak = useStreak();
  const plan = useTodayPlan();
  return (
    <View>
      <Text>Good morning, {plan.userName}</Text>
      <Text>{streak.days}-day streak</Text>
      <Text>Your AI plan for today</Text>
      <Text>{plan.title}</Text>
      <Pressable onPress={() => router.push(`/workout/${plan.id}`)}><Text>Start workout</Text></Pressable>
      <Text>This week</Text>
      <Text>Active minutes</Text>
    </View>
  );
}
