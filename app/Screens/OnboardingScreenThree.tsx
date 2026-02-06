import React from 'react';
import { Text } from 'react-native';
import OnboardingLayout from '../components/OnboardingLayout';

const OnboardingScreenThree = ({ navigation }: { navigation: any }) => {
  return (
    <OnboardingLayout
      backgroundColor="#F0F0F0" // Light Grey (approx)
      imageSource={require('../assets/jornalising.png')}
      stepText="Step Three"
      currentStep={3}
      totalSteps={5}
      onNext={() => navigation.navigate('OnboardingFour')}
    >
      <Text className="text-3xl font-bold text-center text-[#4A3B32] leading-tight mb-2">
        AI Mental{' '}
        <Text className="text-[#6D6D6D]">Journaling</Text> & Therapy Chatbot
      </Text>
    </OnboardingLayout>
  );
};

export default OnboardingScreenThree;
