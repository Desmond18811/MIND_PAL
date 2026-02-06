import React from 'react';
import { Text } from 'react-native';
import OnboardingLayout from '../components/OnboardingLayout';

const OnboardingScreenTwo = ({ navigation }: { navigation: any }) => {
  return (
    <OnboardingLayout
      backgroundColor="#F8E9DE" // Light Orange/Peach
      imageSource={require('../assets/moodtracking.png')}
      stepText="Step Two"
      currentStep={2}
      totalSteps={5}
      onNext={() => navigation.navigate('OnboardingThree')}
      nextButtonColor="#4A3B32"
    >
      <Text className="text-3xl font-bold text-center text-[#4A3B32] leading-tight mb-2">
        <Text className="text-[#EF8A2C]">Intelligent</Text> Mood Tracking{'\n'}
        & AI Emotion Insights
      </Text>
    </OnboardingLayout>
  );
};

export default OnboardingScreenTwo;