import React from 'react';
import { Text } from 'react-native';
import OnboardingLayout from '../components/OnboardingLayout';

const OnboardingScreen = ({ navigation }: { navigation: any }) => {
  return (
    <OnboardingLayout
      backgroundColor="#E5F0E5" // Light Green
      imageSource={require('../assets/meditation.png')}
      stepText="Step One"
      currentStep={1}
      totalSteps={5}
      onNext={() => navigation.navigate('OnboardingTwo')}
      nextButtonColor="#4A3B32" // Dark Brown
    >
      <Text className="text-3xl font-bold text-center text-[#4A3B32] leading-tight mt-2">
        Personalize Your Mental{'\n'}
        <Text className="text-[#8EAA79]">Health State</Text> With AI
      </Text>
    </OnboardingLayout>
  );
};

export default OnboardingScreen;