import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import "../global.css";

const FingerprintSetupScreen = ({ navigation, route }: { navigation: any, route: any }) => {
    const [fingerprintEnabled, setFingerprintEnabled] = useState(false);

    const handleEnableFingerprint = () => {
        setFingerprintEnabled(true);
        setTimeout(() => {
            navigation.navigate('MeditationSetup', {
                ...route.params,
                biometricEnabled: true,
            });
        }, 1000);
    };

    const handleSkip = () => {
        navigation.navigate('MeditationSetup', {
            ...route.params,
            biometricEnabled: false,
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
                    <Text className="text-base font-semibold text-dark-brown">Fingerprint Setup</Text>
                    <Text className="text-xs text-placeholder mt-0.5">Step 4/6</Text>
                </View>
            </View>

            <View className="flex-1 px-5 items-center">
                {/* Illustration */}
                <View className="mt-10 mb-8 relative">
                    <View className="w-[150px] h-[150px] rounded-full bg-white justify-center items-center shadow-lg">
                        <Ionicons
                            name="finger-print"
                            size={80}
                            color={fingerprintEnabled ? '#8EBA6B' : '#6D482F'}
                        />
                    </View>
                    {fingerprintEnabled && (
                        <View className="absolute bottom-2.5 right-2.5 w-9 h-9 rounded-full bg-primary-green justify-center items-center">
                            <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                        </View>
                    )}
                </View>

                <Text className="text-3xl font-bold text-dark-brown text-center mb-4">Fingerprint Note</Text>
                <Text className="text-sm text-placeholder text-center leading-6 mb-8 px-5">
                    Fingerprint is used to ensure security and quick access to your account.
                    You can enable or disable this feature any time in your settings.
                </Text>

                {/* Status Cards */}
                <View className="bg-white rounded-2xl p-5 w-full mb-8 shadow-sm">
                    <View className="flex-row items-center gap-4 py-2.5">
                        <Ionicons name="lock-closed" size={24} color="#8EBA6B" />
                        <Text className="text-sm text-text-dark flex-1">Secure biometric authentication</Text>
                    </View>
                    <View className="flex-row items-center gap-4 py-2.5">
                        <Ionicons name="flash" size={24} color="#8EBA6B" />
                        <Text className="text-sm text-text-dark flex-1">Quick access to your account</Text>
                    </View>
                    <View className="flex-row items-center gap-4 py-2.5">
                        <Ionicons name="settings" size={24} color="#8EBA6B" />
                        <Text className="text-sm text-text-dark flex-1">Can be changed anytime</Text>
                    </View>
                </View>

                {/* Buttons */}
                <TouchableOpacity
                    className="bg-dark-brown flex-row items-center justify-center py-5 rounded-3xl w-full gap-2.5"
                    onPress={handleEnableFingerprint}
                >
                    <Ionicons name="finger-print" size={20} color="#FFFFFF" />
                    <Text className="text-white text-lg font-bold">Enable Fingerprint</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="py-4 mt-4"
                    onPress={handleSkip}
                >
                    <Text className="text-primary-green text-base font-semibold">Skip for now</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default FingerprintSetupScreen;
