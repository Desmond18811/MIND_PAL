import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
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
    borderColor: '#8DC63F',
    placeholderText: '#A0A0A0',
    lightGray: '#E0E0E0',
    errorRed: '#FF0000',
    successGreen: '#4CAF50',
};

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
        if (strength <= 1) return colors.errorRed;
        if (strength <= 2) return '#FFA500';
        if (strength <= 3) return '#FFD700';
        return colors.successGreen;
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
                    <Text style={styles.stepText}>Password Setup</Text>
                    <Text style={styles.stepNumber}>Step 2/6</Text>
                </View>
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>Password Manager</Text>
                <Text style={styles.subtitle}>Please enter a strong password to protect your account</Text>

                {/* Password Requirements */}
                <View style={styles.requirementsContainer}>
                    {requirements.map((req) => (
                        <View key={req.id} style={styles.requirementRow}>
                            <Ionicons
                                name={req.check(password) ? "checkmark-circle" : "ellipse-outline"}
                                size={20}
                                color={req.check(password) ? colors.successGreen : colors.placeholderText}
                            />
                            <Text style={[
                                styles.requirementText,
                                req.check(password) && styles.requirementMet
                            ]}>
                                {req.text}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Password Input */}
                <Text style={styles.inputLabel}>CPR Verification</Text>
                <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed-outline" size={20} color={colors.darkBrown} />
                    <TextInput
                        style={styles.textInput}
                        placeholder="Enter your password..."
                        placeholderTextColor={colors.placeholderText}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons
                            name={showPassword ? "eye-off-outline" : "eye-outline"}
                            size={20}
                            color={colors.placeholderText}
                        />
                    </TouchableOpacity>
                </View>

                {/* Strength Indicator */}
                <View style={styles.strengthContainer}>
                    <View style={styles.strengthBar}>
                        <View style={[
                            styles.strengthFill,
                            { width: `${(passwordStrength() / 4) * 100}%`, backgroundColor: getStrengthColor() }
                        ]} />
                    </View>
                    <Text style={styles.strengthText}>
                        {passwordStrength() <= 1 ? 'Weak' :
                            passwordStrength() <= 2 ? 'Fair' :
                                passwordStrength() <= 3 ? 'Good' : 'Strong'}
                    </Text>
                </View>

                {/* Confirm Password */}
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed-outline" size={20} color={colors.darkBrown} />
                    <TextInput
                        style={styles.textInput}
                        placeholder="Confirm your password..."
                        placeholderTextColor={colors.placeholderText}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                        <Ionicons
                            name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                            size={20}
                            color={colors.placeholderText}
                        />
                    </TouchableOpacity>
                </View>

                {password && confirmPassword && password !== confirmPassword && (
                    <Text style={styles.errorText}>Passwords do not match</Text>
                )}

                {/* Continue Button */}
                <TouchableOpacity
                    style={[styles.continueButton, !canContinue && styles.continueButtonDisabled]}
                    onPress={handleContinue}
                    disabled={!canContinue}
                >
                    <Text style={styles.continueButtonText}>Continue</Text>
                    <Ionicons name="arrow-forward" size={20} color={colors.textLight} />
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
        paddingTop: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.darkBrown,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: colors.placeholderText,
        marginBottom: 25,
    },
    requirementsContainer: {
        backgroundColor: colors.textLight,
        borderRadius: 15,
        padding: 15,
        marginBottom: 25,
    },
    requirementRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
        gap: 10,
    },
    requirementText: {
        fontSize: 14,
        color: colors.placeholderText,
    },
    requirementMet: {
        color: colors.successGreen,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.darkBrown,
        marginBottom: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.textLight,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: colors.borderColor,
        paddingHorizontal: 15,
        marginBottom: 15,
        gap: 10,
    },
    textInput: {
        flex: 1,
        paddingVertical: 15,
        fontSize: 16,
        color: colors.textDark,
    },
    strengthContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
        gap: 10,
    },
    strengthBar: {
        flex: 1,
        height: 8,
        backgroundColor: colors.lightGray,
        borderRadius: 4,
        overflow: 'hidden',
    },
    strengthFill: {
        height: '100%',
        borderRadius: 4,
    },
    strengthText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.darkBrown,
        minWidth: 50,
    },
    errorText: {
        color: colors.errorRed,
        fontSize: 14,
        marginBottom: 15,
    },
    continueButton: {
        backgroundColor: colors.darkBrown,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 25,
        marginTop: 'auto',
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

export default PasswordSetupScreen;
