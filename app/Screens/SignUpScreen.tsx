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

const SignUpScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignUp = async () => {
    const newErrors: { name?: string; email?: string; password?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Invalid Email Address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.auth.register({
        email: email.trim().toLowerCase(),
        name: name.trim(),
        password,
      });

      if (response && (response.token || response.user)) {
        Alert.alert(
          'Success',
          'Account created successfully! Please sign in.',
          [
            {
              text: 'Sign In',
              onPress: () => navigation.navigate('SignIn') // Assuming route name is SignIn or Login? LoginScreen usually maps to 'Login' or 'SignIn'
            }
          ]
        );
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      Alert.alert(
        'Registration Failed',
        error.message || 'Failed to create account. Please try again.'
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
          {/* Green Curved Header - Inside ScrollView */}
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
            <View style={{ marginTop: insets.top - 20, alignItems: 'center' }}>
              <Logo2 width={48} height={48} color="white" fill="white" />
            </View>
          </View>

          <View className="px-6 pb-10 -mt-4">
            <Text className="text-3xl font-[Urbanist-Bold] text-[#4A3B32] text-center mb-8">Sign Up For Free</Text>

            {/* Name Input */}
            <View className="mb-5">
              <Text className="text-sm font-[Urbanist-SemiBold] text-[#4A3B32] mb-2 ml-1">Full Name</Text>
              <View className={`flex-row items-center bg-white rounded-full border ${errors.name ? 'border-red-400' : 'border-[#E0E0E0]'} px-5 py-3.5 shadow-sm`}>
                <Ionicons name="person-outline" size={20} color="#4A3B32" style={{ marginRight: 10 }} />
                <TextInput
                  className="flex-1 text-base text-[#4A3B32] font-[Urbanist-Medium]"
                  placeholder="John Doe"
                  placeholderTextColor="#A0A0A0"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                  }}
                  autoCapitalize="words"
                />
              </View>
              {errors.name && <Text className="text-red-500 text-xs ml-2 mt-1 font-[Urbanist-Regular]">{errors.name}</Text>}
            </View>

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
                  placeholder="Create a password"
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

            {/* Sign Up Button */}
            <TouchableOpacity
              className="bg-[#4A3B32] rounded-full py-4 flex-row justify-center items-center mb-6 shadow-md active:opacity-90"
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text className="text-white text-lg font-[Urbanist-Bold] mr-2">Sign Up</Text>
                  <Ionicons name="arrow-forward" size={20} color="white" />
                </>
              )}
            </TouchableOpacity>

            {/* Footer */}
            <View className="items-center pb-8 border-t border-gray-100 pt-6">
              <Text className="text-[#4A3B32] text-sm mb-4 font-[Urbanist-Bold]">Or sign up with</Text>

              {/* Social Logins */}
              <View className="flex-row justify-center items-center gap-4 mb-8">
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

              <Text className="text-[#4A3B32] text-sm font-[Urbanist-Medium]">
                Already have an account? <Text className="text-[#FF8C42] font-[Urbanist-Bold]" onPress={() => navigation.navigate('SignIn')}>Sign In.</Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default SignUpScreen;
