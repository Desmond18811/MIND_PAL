import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import "../global.css";

const MeditationSetupScreen = ({ navigation, route }: { navigation: any, route: any }) => {
    const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);

    const preferences = [
        { id: 'new_meditation', label: 'New to meditation', icon: '🧘' },
        { id: 'relieve_stress', label: 'Relieve stress', icon: '😌' },
        { id: 'improve_sleep', label: 'Improve sleep', icon: '😴' },
        { id: 'increase_focus', label: 'Increase focus', icon: '🎯' },
        { id: 'reduce_anxiety', label: 'Reduce anxiety', icon: '💆' },
        { id: 'build_habit', label: 'Build a habit', icon: '📅' },
    ];

    const togglePreference = (id: string) => {
        setSelectedPreferences(prev =>
            prev.includes(id)
                ? prev.filter(p => p !== id)
                : [...prev, id]
        );
    };

    const handleContinue = () => {
        navigation.navigate('ComputingScore', {
            ...route.params,
            meditationPreferences: selectedPreferences,
        });
    };

    const canContinue = selectedPreferences.length > 0;

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
                    <Text className="text-base font-semibold text-dark-brown">Meditation Setup</Text>
                    <Text className="text-xs text-placeholder mt-0.5">Step 5/6</Text>
                </View>
            </View>

            {/* Spiral Illustration */}
            <View className="items-center py-5">
                <View className="w-[150px] h-[150px] justify-center items-center relative">
                    <View className="absolute w-[150px] h-[150px] rounded-full border-2 border-[#9B8BB4] opacity-30" />
                    <View className="absolute w-[110px] h-[110px] rounded-full border-2 border-[#9B8BB4] opacity-50" />
                    <View className="absolute w-[70px] h-[70px] rounded-full border-2 border-[#9B8BB4] opacity-70" />
                    <View className="w-12 h-12 rounded-full bg-[#9B8BB4] justify-center items-center">
                        <Text className="text-2xl">🌀</Text>
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                <Text className="text-3xl font-bold text-dark-brown text-center mb-2">Mediation Roles</Text>
                <Text className="text-sm text-placeholder text-center leading-6 mb-6">
                    Select what you want to achieve with meditation. You can select multiple options.
                </Text>

                {/* Preference Options */}
                <View className="gap-3">
                    {preferences.map((pref) => (
                        <TouchableOpacity
                            key={pref.id}
                            className={`flex-row items-center bg-white p-4 rounded-2xl gap-3 border-2 ${selectedPreferences.includes(pref.id)
                                ? 'border-primary-green bg-green-50'
                                : 'border-transparent'
                                }`}
                            onPress={() => togglePreference(pref.id)}
                        >
                            <Text className="text-2xl">{pref.icon}</Text>
                            <Text className={`flex-1 text-base ${selectedPreferences.includes(pref.id)
                                ? 'text-dark-brown font-semibold'
                                : 'text-text-dark'
                                }`}>
                                {pref.label}
                            </Text>
                            {selectedPreferences.includes(pref.id) && (
                                <Ionicons name="checkmark-circle" size={20} color="#8EBA6B" />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Continue Button */}
                <TouchableOpacity
                    className={`bg-dark-brown flex-row items-center justify-center py-5 rounded-3xl mt-8 mb-8 gap-2.5 ${!canContinue ? 'opacity-50' : ''
                        }`}
                    onPress={handleContinue}
                    disabled={!canContinue}
                >
                    <Text className="text-white text-lg font-bold">Continue</Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default MeditationSetupScreen;
