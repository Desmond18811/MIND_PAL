import React from 'react';
import { Text } from 'react-native';
import OnboardingLayout from '../components/OnboardingLayout';

const OnboardingScreenFive = ({ navigation }) => {
  return (
    <OnboardingLayout
      backgroundColor="#D8C4E5" // Light Purple
      imageSource={require('../assets/supportive.png')}
      stepText="Step Five"
      currentStep={5}
      totalSteps={5}
      onNext={() => navigation.navigate('SignUp')}
    >
      <Text className="text-3xl font-bold text-center text-[#4A3B32] leading-tight mb-2">
        Loving & Supportive{'\n'}
        <Text className="text-[#9370DB]">Community</Text>
      </Text>
    </OnboardingLayout>
  );
};

export default OnboardingScreenFive;