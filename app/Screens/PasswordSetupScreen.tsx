import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import "../global.css";

const PasswordSetupScreen = ({ navigation, route }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const requirements = [
        { id: 1, text: 'Must have at least 8 characters', check: (p) => p.length >= 8 },
        { id: 2, text: 'At least one uppercase letter', check: (p) => /[A-Z]/.test(p) },
        { id: 3, text: 'At least one number', check: (p) => /[0-9]/.test(p) },
        { id: 4, text: 'At least one special character', check: (p) => /[!@#$%^&*]/.test(p) },
    ];

    const passwordStrength = () => {
        let strength = 0;
        requirements.forEach(req => {
            if (req.check(password)) strength++;
        });
        return strength;
    };

    const getStrengthColor = () => {
        const strength = passwordStrength();
        if (strength <= 1) return '#FF0000';
        if (strength <= 2) return '#FFA500';
        if (strength <= 3) return '#FFD700';
        return '#4CAF50';
    };

    const canContinue = passwordStrength() >= 3 && password === confirmPassword && confirmPassword.length > 0;

    const handleContinue = () => {
        if (!canContinue) return;
        navigation.navigate('OTPVerification', {
            ...route.params,
            password,
        });
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F3EDE4' }}>
            <StatusBar barStyle="dark-content" backgroundColor="#F3EDE4" />

            {/* Header */}
            <View className="flex-row items-center px-5 py-4">
                <TouchableOpacity
                    className="w-10 h-10 rounded-full bg-white justify-center items-center shadow-sm"
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="chevron-back" size={24} color="#6D482F" />
                </TouchableOpacity>
                <View className="flex-1 items-center">
                    <Text className="text-base font-semibold text-dark-brown">Password Setup</Text>
                    <Text className="text-xs text-placeholder mt-0.5">Step 2/6</Text>
                </View>
            </View>

            <View className="flex-1 px-5 pt-5">
                <Text className="text-3xl font-bold text-dark-brown mb-2">Password Manager</Text>
                <Text className="text-base text-placeholder mb-6">Please enter a strong password to protect your account</Text>

                {/* Password Requirements */}
                <View className="bg-white rounded-2xl p-4 mb-6">
                    {requirements.map((req) => (
                        <View key={req.id} className="flex-row items-center my-1 gap-2">
                            <Ionicons
                                name={req.check(password) ? "checkmark-circle" : "ellipse-outline"}
                                size={20}
                                color={req.check(password) ? '#4CAF50' : '#A0A0A0'}
                            />
                            <Text className={`text-sm ${req.check(password) ? 'text-[#4CAF50]' : 'text-placeholder'}`}>
                                {req.text}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Password Input */}
                <Text className="text-base font-semibold text-dark-brown mb-2">CPR Verification</Text>
                <View className="flex-row items-center bg-white rounded-2xl border-2 border-[#8DC63F] px-4 mb-4 gap-2">
                    <Ionicons name="lock-closed-outline" size={20} color="#6D482F" />
                    <TextInput
                        className="flex-1 py-4 text-base text-text-dark"
                        placeholder="Enter your password..."
                        placeholderTextColor="#A0A0A0"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons
                            name={showPassword ? "eye-off-outline" : "eye-outline"}
                            size={20}
                            color="#A0A0A0"
                        />
                    </TouchableOpacity>
                </View>

                {/* Strength Indicator */}
                <View className="flex-row items-center mb-6 gap-2">
                    <View className="flex-1 h-2 bg-light-gray rounded overflow-hidden">
                        <View
                            style={{
                                width: `${(passwordStrength() / 4) * 100}%`,
                                backgroundColor: getStrengthColor(),
                                height: '100%',
                                borderRadius: 4
                            }}
                        />
                    </View>
                    <Text className="text-sm font-semibold text-dark-brown min-w-[50px]">
                        {passwordStrength() <= 1 ? 'Weak' :
                            passwordStrength() <= 2 ? 'Fair' :
                                passwordStrength() <= 3 ? 'Good' : 'Strong'}
                    </Text>
                </View>

                {/* Confirm Password */}
                <Text className="text-base font-semibold text-dark-brown mb-2">Confirm Password</Text>
                <View className="flex-row items-center bg-white rounded-2xl border-2 border-[#8DC63F] px-4 mb-4 gap-2">
                    <Ionicons name="lock-closed-outline" size={20} color="#6D482F" />
                    <TextInput
                        className="flex-1 py-4 text-base text-text-dark"
                        placeholder="Confirm your password..."
                        placeholderTextColor="#A0A0A0"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                        <Ionicons
                            name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                            size={20}
                            color="#A0A0A0"
                        />
                    </TouchableOpacity>
                </View>

                {password && confirmPassword && password !== confirmPassword && (
                    <Text className="text-[#FF0000] text-sm mb-4">Passwords do not match</Text>
                )}

                {/* Continue Button */}
                <TouchableOpacity
                    className={`bg-dark-brown flex-row items-center justify-center py-5 rounded-3xl mt-auto mb-8 gap-2.5 ${!canContinue ? 'opacity-50' : ''}`}
                    onPress={handleContinue}
                    disabled={!canContinue}
                >
                    <Text className="text-white text-lg font-bold">Continue</Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default PasswordSetupScreen;
