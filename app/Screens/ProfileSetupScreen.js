import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Image,
    ScrollView,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const colors = {
    primaryGreen: '#8EBA6B',
    darkBrown: '#6D482F',
    lightBeige: '#F3EDE4',
    textDark: '#333333',
    textLight: '#FFFFFF',
    borderColor: '#8DC63F',
    placeholderText: '#A0A0A0',
    lightGray: '#E0E0E0',
    orange: '#FF8C42',
};

const ProfileSetupScreen = ({ navigation, route }) => {
    const [nickname, setNickname] = useState('');
    const [selectedGender, setSelectedGender] = useState(null);
    const [selectedAvatar, setSelectedAvatar] = useState(0);

    const genderOptions = [
        { id: 'male', label: 'Male' },
        { id: 'female', label: 'Female' },
        { id: 'prefer_not_to_say', label: 'Prefer not to say' },
    ];

    const avatarEmojis = ['👤', '👨', '👩', '🧑', '👶', '🧓'];

    const handleContinue = () => {
        if (!nickname.trim() || !selectedGender) {
            return;
        }
        // Navigate to next screen (PasswordSetup)
        navigation.navigate('PasswordSetup', {
            ...route.params,
            nickname: nickname.trim(),
            gender: selectedGender,
            avatar: selectedAvatar,
        });
    };

    const canContinue = nickname.trim().length > 0 && selectedGender;

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
                    <Text style={styles.stepText}>Profile Setup</Text>
                    <Text style={styles.stepNumber}>Step 1/6</Text>
                </View>
            </View>

            {/* Illustration */}
            <View style={styles.illustrationContainer}>
                <View style={styles.illustrationPlaceholder}>
                    <Text style={styles.illustrationEmoji}>👤</Text>
                    <View style={styles.circleDecoration} />
                </View>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Title */}
                <Text style={styles.title}>Individual Details</Text>
                <Text style={styles.subtitle}>Please fill the form below</Text>
                <Text style={styles.subtitle}>to continue to freud.ai</Text>

                {/* Avatar Selection */}
                <View style={styles.avatarSection}>
                    <Text style={styles.sectionLabel}>Select Avatar</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.avatarList}
                    >
                        {avatarEmojis.map((emoji, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.avatarOption,
                                    selectedAvatar === index && styles.avatarSelected,
                                ]}
                                onPress={() => setSelectedAvatar(index)}
                            >
                                <Text style={styles.avatarEmoji}>{emoji}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Nickname Input */}
                <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>Nickname</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Enter your nickname..."
                            placeholderTextColor={colors.placeholderText}
                            value={nickname}
                            onChangeText={setNickname}
                            autoCapitalize="words"
                        />
                    </View>
                </View>

                {/* Gender Selection */}
                <View style={styles.genderSection}>
                    <Text style={styles.inputLabel}>Gender</Text>
                    <View style={styles.genderOptions}>
                        {genderOptions.map((option) => (
                            <TouchableOpacity
                                key={option.id}
                                style={[
                                    styles.genderOption,
                                    selectedGender === option.id && styles.genderSelected,
                                ]}
                                onPress={() => setSelectedGender(option.id)}
                            >
                                <View style={[
                                    styles.radioOuter,
                                    selectedGender === option.id && styles.radioOuterSelected,
                                ]}>
                                    {selectedGender === option.id && (
                                        <View style={styles.radioInner} />
                                    )}
                                </View>
                                <Text style={[
                                    styles.genderLabel,
                                    selectedGender === option.id && styles.genderLabelSelected,
                                ]}>
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Continue Button */}
                <TouchableOpacity
                    style={[
                        styles.continueButton,
                        !canContinue && styles.continueButtonDisabled,
                    ]}
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
    illustrationPlaceholder: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: colors.primaryGreen,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    illustrationEmoji: {
        fontSize: 60,
    },
    circleDecoration: {
        position: 'absolute',
        width: 170,
        height: 170,
        borderRadius: 85,
        borderWidth: 2,
        borderColor: colors.orange,
        borderStyle: 'dashed',
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
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
        color: colors.placeholderText,
        textAlign: 'center',
    },
    avatarSection: {
        marginTop: 25,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.darkBrown,
        marginBottom: 10,
    },
    avatarList: {
        flexDirection: 'row',
    },
    avatarOption: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.textLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    avatarSelected: {
        borderColor: colors.primaryGreen,
        backgroundColor: '#E8F5E8',
    },
    avatarEmoji: {
        fontSize: 24,
    },
    inputSection: {
        marginTop: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.darkBrown,
        marginBottom: 10,
    },
    inputContainer: {
        backgroundColor: colors.textLight,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: colors.borderColor,
        paddingHorizontal: 15,
    },
    textInput: {
        paddingVertical: 15,
        fontSize: 16,
        color: colors.textDark,
    },
    genderSection: {
        marginTop: 20,
    },
    genderOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    genderOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 25,
        backgroundColor: colors.textLight,
        borderWidth: 1,
        borderColor: colors.lightGray,
    },
    genderSelected: {
        borderColor: colors.primaryGreen,
        backgroundColor: '#E8F5E8',
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colors.lightGray,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    radioOuterSelected: {
        borderColor: colors.primaryGreen,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.primaryGreen,
    },
    genderLabel: {
        fontSize: 14,
        color: colors.textDark,
    },
    genderLabelSelected: {
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

export default ProfileSetupScreen;
