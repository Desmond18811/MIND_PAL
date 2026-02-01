import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import WelcomeScreen from './Screens/Welcome';
import OnboardingScreen from './Screens/OnboardingScreen';
import OnboardingScreenTwo from './Screens/OnboardingScreenTwo'
import OnboardingScreenThree from './Screens/OnboardingScreenThree'
import OnboardingScreenFour from './Screens/OnboardingScreenFour'
import OnboardingFive from './Screens/OnboardingScreenFive'
import LoginScreen from './Screens/LoginScreen'
import SignUpScreen from './Screens/SignUpScreen'
import HomeScreen from './Screens/HomeScreen';
import ForgotPasswordScreen from './Screens/ForgotPasswordScreen';
import ResetPasswordScreen from './Screens/ResetPasswordScreen'
import AssessmentScreen from './Screens/AssessmentScreen';

// Profile Setup Flow Screens
import ProfileSetupScreen from './Screens/ProfileSetupScreen';
import PasswordSetupScreen from './Screens/PasswordSetupScreen';
import OTPVerificationScreen from './Screens/OTPVerificationScreen';
import FingerprintSetupScreen from './Screens/FingerprintSetupScreen';
import MeditationSetupScreen from './Screens/MeditationSetupScreen';
import ComputingScoreScreen from './Screens/ComputingScoreScreen';
import FreudScoreResultScreen from './Screens/FreudScoreResultScreen';

// Home & Score Flow Screens
import FreudScoreScreen from './Screens/FreudScoreScreen';
import AISuggestionsScreen from './Screens/AISuggestionsScreen';
import MindfulnessActivitiesScreen from './Screens/MindfulnessActivitiesScreen';

const Stack = createNativeStackNavigator();


export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="OnboardingTwo" component={OnboardingScreenTwo} />
          <Stack.Screen name="OnboardingThree" component={OnboardingScreenThree} />
          <Stack.Screen name="OnboardingFour" component={OnboardingScreenFour} />
          <Stack.Screen name="OnboardingFive" component={OnboardingFive} />
          <Stack.Screen name="SignIn" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          <Stack.Screen name="Assessment" component={AssessmentScreen} />

          {/* Profile Setup Flow */}
          <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
          <Stack.Screen name="PasswordSetup" component={PasswordSetupScreen} />
          <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
          <Stack.Screen name="FingerprintSetup" component={FingerprintSetupScreen} />
          <Stack.Screen name="MeditationSetup" component={MeditationSetupScreen} />
          <Stack.Screen name="ComputingScore" component={ComputingScoreScreen} />
          <Stack.Screen name="FreudScoreResult" component={FreudScoreResultScreen} />

          {/* Home & Score Flow */}
          <Stack.Screen name="FreudScore" component={FreudScoreScreen} />
          <Stack.Screen name="AISuggestions" component={AISuggestionsScreen} />
          <Stack.Screen name="MindfulnessActivities" component={MindfulnessActivitiesScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}