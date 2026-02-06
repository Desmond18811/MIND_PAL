import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StatusBar,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import "../global.css";

const ProfileSetupScreen = ({ navigation, route }: { navigation: any, route: any }) => {
    const [nickname, setNickname] = useState('');
    const [selectedGender, setSelectedGender] = useState<string | null>(null);
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
        navigation.navigate('PasswordSetup', {
            ...route.params,
            nickname: nickname.trim(),
            gender: selectedGender,
            avatar: selectedAvatar,
        });
    };

    const canContinue = nickname.trim().length > 0 && selectedGender;

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
                    <Text className="text-base font-semibold text-dark-brown">Profile Setup</Text>
                    <Text className="text-xs text-placeholder mt-0.5">Step 1/6</Text>
                </View>
            </View>

            {/* Illustration */}
            <View className="items-center py-5">
                <View className="w-[150px] h-[150px] rounded-full bg-primary-green justify-center items-center relative">
                    <Text className="text-6xl">👤</Text>
                    <View className="absolute w-[170px] h-[170px] rounded-full border-2 border-dashed border-[#FF8C42]" />
                </View>
            </View>

            <ScrollView
                className="flex-1 px-5"
                showsVerticalScrollIndicator={false}
            >
                {/* Title */}
                <Text className="text-3xl font-bold text-dark-brown text-center mb-1">Individual Details</Text>
                <Text className="text-base text-placeholder text-center">Please fill the form below</Text>
                <Text className="text-base text-placeholder text-center">to continue to freud.ai</Text>

                {/* Avatar Selection */}
                <View className="mt-6">
                    <Text className="text-sm font-semibold text-dark-brown mb-2">Select Avatar</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                    >
                        {avatarEmojis.map((emoji, index) => (
                            <TouchableOpacity
                                key={index}
                                className={`w-12 h-12 rounded-full bg-white justify-center items-center mr-2 border-2 ${selectedAvatar === index
                                    ? 'border-primary-green bg-green-50'
                                    : 'border-transparent'
                                    }`}
                                onPress={() => setSelectedAvatar(index)}
                            >
                                <Text className="text-2xl">{emoji}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Nickname Input */}
                <View className="mt-5">
                    <Text className="text-base font-semibold text-dark-brown mb-2">Nickname</Text>
                    <View className="bg-white rounded-2xl border-2 border-[#8DC63F] px-4">
                        <TextInput
                            className="py-4 text-base text-text-dark"
                            placeholder="Enter your nickname..."
                            placeholderTextColor="#A0A0A0"
                            value={nickname}
                            onChangeText={setNickname}
                            autoCapitalize="words"
                        />
                    </View>
                </View>

                {/* Gender Selection */}
                <View className="mt-5">
                    <Text className="text-base font-semibold text-dark-brown mb-2">Gender</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {genderOptions.map((option) => (
                            <TouchableOpacity
                                key={option.id}
                                className={`flex-row items-center px-4 py-3 rounded-3xl bg-white border ${selectedGender === option.id
                                    ? 'border-primary-green bg-green-50'
                                    : 'border-light-gray'
                                    }`}
                                onPress={() => setSelectedGender(option.id)}
                            >
                                <View className={`w-5 h-5 rounded-full border-2 justify-center items-center mr-2 ${selectedGender === option.id
                                    ? 'border-primary-green'
                                    : 'border-light-gray'
                                    }`}>
                                    {selectedGender === option.id && (
                                        <View className="w-2.5 h-2.5 rounded-full bg-primary-green" />
                                    )}
                                </View>
                                <Text className={`text-sm ${selectedGender === option.id
                                    ? 'text-dark-brown font-semibold'
                                    : 'text-text-dark'
                                    }`}>
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
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

export default ProfileSetupScreen;
