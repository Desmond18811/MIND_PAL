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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import Logo from '../assets/logo.svg';
import "../global.css";

const LoginScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Green Header */}
      <View
        className="bg-[#A8C789] w-full items-center pt-8 pb-12 rounded-b-[40px] absolute top-0 z-0"
        style={{ paddingTop: insets.top + 20, height: 220 }}
      >
        {typeof Logo === 'function' ? (
          <Logo width={40} height={40} />
        ) : (
          <View style={{ width: 40, height: 40, backgroundColor: '#4F3422', borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>MP</Text>
          </View>
        )}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingTop: 180, paddingHorizontal: 24, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="bg-white rounded-t-[30px] pt-6">
            <Text className="text-3xl font-bold text-[#4A3B32] text-center mb-8">Sign In To MindPal</Text>

            {/* Email Input */}
            <View className="mb-5">
              <Text className="text-sm font-semibold text-[#4A3B32] mb-2 ml-1">Email Address</Text>
              <View className={`flex-row items-center bg-white rounded-full border ${errors.email ? 'border-red-400' : 'border-[#E0E0E0]'} px-5 py-3.5 shadow-sm`}>
                <Ionicons name="mail-outline" size={20} color="#4A3B32" style={{ marginRight: 10 }} />
                <TextInput
                  className="flex-1 text-base text-[#4A3B32]"
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
              {errors.email && <Text className="text-red-500 text-xs ml-2 mt-1">{errors.email}</Text>}
            </View>

            {/* Password Input */}
            <View className="mb-8">
              <Text className="text-sm font-semibold text-[#4A3B32] mb-2 ml-1">Password</Text>
              <View className={`flex-row items-center bg-white rounded-full border ${errors.password ? 'border-red-400' : 'border-[#E0E0E0]'} px-5 py-3.5 shadow-sm`}>
                <Ionicons name="lock-closed-outline" size={20} color="#4A3B32" style={{ marginRight: 10 }} />
                <TextInput
                  className="flex-1 text-base text-[#4A3B32]"
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
              {errors.password && <Text className="text-red-500 text-xs ml-2 mt-1">{errors.password}</Text>}
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
                  <Text className="text-white text-lg font-bold mr-2">Sign In</Text>
                  <Ionicons name="arrow-forward" size={20} color="white" />
                </>
              )}
            </TouchableOpacity>

            {/* Social Logins */}
            <View className="flex-row justify-center items-center gap-4 mb-10">
              <TouchableOpacity className="w-12 h-12 bg-white rounded-full items-center justify-center border border-[#E0E0E0] shadow-sm">
                <Text className="text-xl text-[#3b5998] font-bold">f</Text>
              </TouchableOpacity>
              <TouchableOpacity className="w-12 h-12 bg-white rounded-full items-center justify-center border border-[#E0E0E0] shadow-sm">
                <Text className="text-xl text-[#DB4437] font-bold">G</Text>
              </TouchableOpacity>
              <TouchableOpacity className="w-12 h-12 bg-white rounded-full items-center justify-center border border-[#E0E0E0] shadow-sm">
                <Ionicons name="logo-instagram" size={24} color="#C13584" />
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View className="items-center gap-2 pb-8">
              <Text className="text-[#4A3B32] text-sm">
                Don't have an account? <Text className="text-[#FF8C42] font-bold" onPress={() => navigation.navigate('SignUp')}>Sign Up.</Text>
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                <Text className="text-[#FF8C42] text-sm font-bold">Forgot Password</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default LoginScreen;
