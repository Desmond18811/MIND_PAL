import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Dimensions,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const colors = {
    primaryGreen: '#8EBA6B',
    darkBrown: '#6D482F',
    lightBeige: '#F3EDE4',
    textDark: '#333333',
    textLight: '#FFFFFF',
    placeholderText: '#A0A0A0',
    lightGray: '#E0E0E0',
    purple: '#9B8BB4',
};

const MeditationSetupScreen = ({ navigation, route }) => {
    const [selectedPreferences, setSelectedPreferences] = useState([]);

    const preferences = [
        { id: 'new_meditation', label: 'New to meditation', icon: '🧘' },
        { id: 'relieve_stress', label: 'Relieve stress', icon: '😌' },
        { id: 'improve_sleep', label: 'Improve sleep', icon: '😴' },
        { id: 'increase_focus', label: 'Increase focus', icon: '🎯' },
        { id: 'reduce_anxiety', label: 'Reduce anxiety', icon: '💆' },
        { id: 'build_habit', label: 'Build a habit', icon: '📅' },
    ];

    const togglePreference = (id) => {
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
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.lightBeige} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="chevron-back" size={24} color={colors.darkBrown} />
                </TouchableOpacity>
                <View style={styles.stepIndicator}>
                    <Text style={styles.stepText}>Meditation Setup</Text>
                    <Text style={styles.stepNumber}>Step 5/6</Text>
                </View>
            </View>

            {/* Spiral Illustration */}
            <View style={styles.illustrationContainer}>
                <View style={styles.spiralPlaceholder}>
                    <View style={styles.spiralRing1} />
                    <View style={styles.spiralRing2} />
                    <View style={styles.spiralRing3} />
                    <View style={styles.spiralCenter}>
                        <Text style={styles.spiralEmoji}>🌀</Text>
                    </View>
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Mediation Roles</Text>
                <Text style={styles.subtitle}>
                    Select what you want to achieve with meditation. You can select multiple options.
                </Text>

                {/* Preference Options */}
                <View style={styles.preferencesContainer}>
                    {preferences.map((pref) => (
                        <TouchableOpacity
                            key={pref.id}
                            style={[
                                styles.preferenceOption,
                                selectedPreferences.includes(pref.id) && styles.preferenceSelected,
                            ]}
                            onPress={() => togglePreference(pref.id)}
                        >
                            <Text style={styles.preferenceIcon}>{pref.icon}</Text>
                            <Text style={[
                                styles.preferenceLabel,
                                selectedPreferences.includes(pref.id) && styles.preferenceLabelSelected,
                            ]}>
                                {pref.label}
                            </Text>
                            {selectedPreferences.includes(pref.id) && (
                                <Ionicons name="checkmark-circle" size={20} color={colors.primaryGreen} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Continue Button */}
                <TouchableOpacity
                    style={[styles.continueButton, !canContinue && styles.continueButtonDisabled]}
                    onPress={handleContinue}
                    disabled={!canContinue}
                >
                    <Text style={styles.continueButtonText}>Continue</Text>
                    <Ionicons name="arrow-forward" size={20} color={colors.textLight} />
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.lightBeige,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.textLight,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    stepIndicator: {
        flex: 1,
        alignItems: 'center',
    },
    stepText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.darkBrown,
    },
    stepNumber: {
        fontSize: 12,
        color: colors.placeholderText,
        marginTop: 2,
    },
    illustrationContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    spiralPlaceholder: {
        width: 150,
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    spiralRing1: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 2,
        borderColor: colors.purple,
        opacity: 0.3,
    },
    spiralRing2: {
        position: 'absolute',
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 2,
        borderColor: colors.purple,
        opacity: 0.5,
    },
    spiralRing3: {
        position: 'absolute',
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 2,
        borderColor: colors.purple,
        opacity: 0.7,
    },
    spiralCenter: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.purple,
        justifyContent: 'center',
        alignItems: 'center',
    },
    spiralEmoji: {
        fontSize: 24,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.darkBrown,
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        color: colors.placeholderText,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 25,
    },
    preferencesContainer: {
        gap: 12,
    },
    preferenceOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.textLight,
        padding: 15,
        borderRadius: 15,
        gap: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    preferenceSelected: {
        borderColor: colors.primaryGreen,
        backgroundColor: '#E8F5E8',
    },
    preferenceIcon: {
        fontSize: 24,
    },
    preferenceLabel: {
        flex: 1,
        fontSize: 16,
        color: colors.textDark,
    },
    preferenceLabelSelected: {
        color: colors.darkBrown,
        fontWeight: '600',
    },
    continueButton: {
        backgroundColor: colors.darkBrown,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 25,
        marginTop: 30,
        marginBottom: 30,
        gap: 10,
    },
    continueButtonDisabled: {
        opacity: 0.5,
    },
    continueButtonText: {
        color: colors.textLight,
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default MeditationSetupScreen;
