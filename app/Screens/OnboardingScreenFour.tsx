import React from 'react';
import { Text } from 'react-native';
import OnboardingLayout from '../components/OnboardingLayout';

const OnboardingScreenFour = ({ navigation }: { navigation: any }) => {
  return (
    <OnboardingLayout
      backgroundColor="#FFF4E0" // Light Yellow
      imageSource={require('../assets/resources.png')}
      stepText="Step Four"
      currentStep={4}
      totalSteps={5}
      onNext={() => navigation.navigate('OnboardingFive')}
    >
      <Text className="text-3xl font-bold text-center text-[#4A3B32] leading-tight mb-2">
        Mindful <Text className="text-[#FFCE5C]">Resources</Text>{'\n'}
        That Makes You Happy
      </Text>
    </OnboardingLayout>
  );
};

export default OnboardingScreenFour;
