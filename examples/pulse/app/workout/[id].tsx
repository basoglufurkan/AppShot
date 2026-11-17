import { CameraView } from 'expo-camera';
import { View, Text } from 'react-native';
import OpenAI from 'openai';

// The AI coach reviews pose keypoints on device and asks the model for a one-line form tip.
export default function WorkoutPlayerScreen() {
  return (
    <View>
      <CameraView facing="front" />
      <Text>Reps</Text>
      <Text>Form tip from your AI coach</Text>
      <Text>Next exercise</Text>
    </View>
  );
}
