import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Dimensions,
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
};

const FingerprintSetupScreen = ({ navigation, route }) => {
    const [fingerprintEnabled, setFingerprintEnabled] = useState(false);

    const handleEnableFingerprint = () => {
        setFingerprintEnabled(true);
        // In a real app, this would trigger biometric authentication
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
                    <Text style={styles.stepText}>Fingerprint Setup</Text>
                    <Text style={styles.stepNumber}>Step 4/6</Text>
                </View>
            </View>

            <View style={styles.content}>
                {/* Illustration */}
                <View style={styles.illustrationContainer}>
                    <View style={styles.fingerprintCircle}>
                        <Ionicons
                            name="finger-print"
                            size={80}
                            color={fingerprintEnabled ? colors.primaryGreen : colors.darkBrown}
                        />
                    </View>
                    {fingerprintEnabled && (
                        <View style={styles.successBadge}>
                            <Ionicons name="checkmark" size={20} color={colors.textLight} />
                        </View>
                    )}
                </View>

                <Text style={styles.title}>Fingerprint Note</Text>
                <Text style={styles.subtitle}>
                    Fingerprint is used to ensure security and quick access to your account.
                    You can enable or disable this feature any time in your settings.
                </Text>

                {/* Status Cards */}
                <View style={styles.statusCard}>
                    <View style={styles.statusRow}>
                        <Ionicons name="lock-closed" size={24} color={colors.primaryGreen} />
                        <Text style={styles.statusText}>Secure biometric authentication</Text>
                    </View>
                    <View style={styles.statusRow}>
                        <Ionicons name="flash" size={24} color={colors.primaryGreen} />
                        <Text style={styles.statusText}>Quick access to your account</Text>
                    </View>
                    <View style={styles.statusRow}>
                        <Ionicons name="settings" size={24} color={colors.primaryGreen} />
                        <Text style={styles.statusText}>Can be changed anytime</Text>
                    </View>
                </View>

                {/* Buttons */}
                <TouchableOpacity
                    style={styles.enableButton}
                    onPress={handleEnableFingerprint}
                >
                    <Ionicons name="finger-print" size={20} color={colors.textLight} />
                    <Text style={styles.enableButtonText}>Enable Fingerprint</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.skipButton}
                    onPress={handleSkip}
                >
                    <Text style={styles.skipButtonText}>Skip for now</Text>
                </TouchableOpacity>
            </View>
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
    content: {
        flex: 1,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    illustrationContainer: {
        marginTop: 40,
        marginBottom: 30,
        position: 'relative',
    },
    fingerprintCircle: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: colors.textLight,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 5,
    },
    successBadge: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.primaryGreen,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.darkBrown,
        textAlign: 'center',
        marginBottom: 15,
    },
    subtitle: {
        fontSize: 14,
        color: colors.placeholderText,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    statusCard: {
        backgroundColor: colors.textLight,
        borderRadius: 20,
        padding: 20,
        width: '100%',
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        paddingVertical: 10,
    },
    statusText: {
        fontSize: 14,
        color: colors.textDark,
        flex: 1,
    },
    enableButton: {
        backgroundColor: colors.darkBrown,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 25,
        width: '100%',
        gap: 10,
    },
    enableButtonText: {
        color: colors.textLight,
        fontSize: 18,
        fontWeight: 'bold',
    },
    skipButton: {
        paddingVertical: 15,
        marginTop: 15,
    },
    skipButtonText: {
        color: colors.primaryGreen,
        fontSize: 16,
        fontWeight: '600',
    },
});

export default FingerprintSetupScreen;
