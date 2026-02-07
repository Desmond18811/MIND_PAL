import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import api from '../services/api';
import Logo2 from '../assets/logo-2.svg';
import { useNavigation } from '@react-navigation/native';


const { width: SCREEN_WIDTH } = Dimensions.get('window');

const LoginScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  /* Hardcoded Test Credentials */
  // Set 1: usertest@gmail.com / password123
  // Set 2: testuser2@gmail.com / password123

  const [email, setEmail] = useState('usertest@gmail.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignIn = async () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setLoading(true);

    // Hardcoded check for Test Users
    if (
      (email === 'usertest@gmail.com' && password === 'password123') ||
      (email === 'testuser2@gmail.com' && password === 'password123')
    ) {
      setTimeout(() => {
        setLoading(false);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      }, 1000);
      return;
    }

    try {
      const response = await api.auth.login({
        email: email.trim().toLowerCase(),
        password,
      });

      if (response && response.token) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      Alert.alert(
        'Sign In Failed',
        error.message || 'Please check your credentials and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#F9F9F9]">
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {/* Green Curved Header - Now Inside ScrollView */}
          <View className="relative items-center justify-center" style={{ height: 250 }}>
            <Svg
              height="100%"
              width={SCREEN_WIDTH}
              viewBox={`0 0 ${SCREEN_WIDTH} 280`}
              style={{ position: 'absolute', top: 0 }}
              preserveAspectRatio="none"
            >
              <Path
                d={`M 0 0 L ${SCREEN_WIDTH} 0 L ${SCREEN_WIDTH} 200 Q ${SCREEN_WIDTH / 2} 280 0 200 Z`}
                fill="#9BB168"
              />
            </Svg>

            {/* Logo Centered */}
            <View style={{ marginTop: insets.top - 20, alignItems: 'center' }}>
              {/* Assuming Logo2 accepts color/fill, or wrapping in View if needed. 
                     If straight svg import, standard size props work. 
                     We use a white tint if possible, or assume svg is updated. 
                     If not, we can wrap in a mask or just place it. 
                     User asked for 'white logo'. I'll try passing color. */}
              <Logo2 width={48} height={48} color="white" fill="white" />
            </View>
          </View>

          <View className="px-6 pb-10 -mt-4">
            {/* Title */}
            <Text className="text-3xl font-[Urbanist-Bold] text-[#4A3B32] text-center mb-8">Sign In To MindPal</Text>

            {/* Email Input */}
            <View className="mb-5">
              <Text className="text-sm font-[Urbanist-SemiBold] text-[#4A3B32] mb-2 ml-1">Email Address</Text>
              <View className={`flex-row items-center bg-white rounded-full border ${errors.email ? 'border-red-400' : 'border-[#E0E0E0]'} px-5 py-3.5 shadow-sm`}>
                <Ionicons name="mail-outline" size={20} color="#4A3B32" style={{ marginRight: 10 }} />
                <TextInput
                  className="flex-1 text-base text-[#4A3B32] font-[Urbanist-Medium]"
                  placeholder="princesskaguya@gmail.com"
                  placeholderTextColor="#A0A0A0"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {errors.email && <Text className="text-red-500 text-xs ml-2 mt-1 font-[Urbanist-Regular]">{errors.email}</Text>}
            </View>

            {/* Password Input */}
            <View className="mb-8">
              <Text className="text-sm font-[Urbanist-SemiBold] text-[#4A3B32] mb-2 ml-1">Password</Text>
              <View className={`flex-row items-center bg-white rounded-full border ${errors.password ? 'border-red-400' : 'border-[#E0E0E0]'} px-5 py-3.5 shadow-sm`}>
                <Ionicons name="lock-closed-outline" size={20} color="#4A3B32" style={{ marginRight: 10 }} />
                <TextInput
                  className="flex-1 text-base text-[#4A3B32] font-[Urbanist-Medium]"
                  placeholder="Enter your password.."
                  placeholderTextColor="#A0A0A0"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                  }}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#A0A0A0" />
                </TouchableOpacity>
              </View>
              {errors.password && <Text className="text-red-500 text-xs ml-2 mt-1 font-[Urbanist-Regular]">{errors.password}</Text>}
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
              className="bg-[#4A3B32] rounded-full py-4 flex-row justify-center items-center mb-10 shadow-md active:opacity-90"
              onPress={handleSignIn}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text className="text-white text-lg font-[Urbanist-Bold] mr-2">Sign In</Text>
                  <Ionicons name="arrow-forward" size={20} color="white" />
                </>
              )}
            </TouchableOpacity>

            {/* Social Logins - Updated to Monochrome Brown */}
            <View className="flex-row justify-center items-center gap-4 mb-10">
              <TouchableOpacity className="w-14 h-14 bg-white rounded-full items-center justify-center border border-[#E0E0E0] shadow-sm">
                <Ionicons name="logo-facebook" size={28} color="#4A3B32" />
              </TouchableOpacity>
              <TouchableOpacity className="w-14 h-14 bg-white rounded-full items-center justify-center border border-[#E0E0E0] shadow-sm">
                <Ionicons name="logo-google" size={28} color="#4A3B32" />
              </TouchableOpacity>
              <TouchableOpacity className="w-14 h-14 bg-white rounded-full items-center justify-center border border-[#E0E0E0] shadow-sm">
                <Ionicons name="logo-instagram" size={28} color="#4A3B32" />
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View className="items-center gap-2 pb-8">
              <Text className="text-[#4A3B32] text-sm font-[Urbanist-Medium]">
                Don't have an account? <Text className="text-[#FF8C42] font-[Urbanist-Bold]" onPress={() => navigation.navigate('SignUp')}>Sign Up.</Text>
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                <Text className="text-[#FF8C42] text-sm font-[Urbanist-Bold]">Forgot Password</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default LoginScreen;
