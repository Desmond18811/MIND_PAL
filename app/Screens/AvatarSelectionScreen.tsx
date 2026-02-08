import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import "../global.css";

const AvatarSelectionScreen = ({ navigation, route }: { navigation: any, route: any }) => {
    const insets = useSafeAreaInsets();
    const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);

    // Avatar options with different styles
    const avatars = [
        { id: 1, emoji: '👤', bg: '#E8EDD8' },
        { id: 2, emoji: '👨', bg: '#FDF0E8' },
        { id: 3, emoji: '👩', bg: '#E8EDD8' },
        { id: 4, emoji: '🧑', bg: '#FDF0E8' },
        { id: 5, emoji: '👶', bg: '#E8EDD8' },
        { id: 6, emoji: '🧓', bg: '#FDF0E8' },
        { id: 7, emoji: '🧔', bg: '#E8EDD8' },
        { id: 8, emoji: '👧', bg: '#FDF0E8' },
    ];

    const handleContinue = () => {
        navigation.navigate('ProfileSetup', {
            ...route?.params,
            selectedAvatar: selectedAvatar,
        });
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#F3EDE4', paddingTop: insets.top }}>
            <StatusBar barStyle="dark-content" backgroundColor="#F3EDE4" />

            {/* Header */}
            <View className="flex-row items-center px-5 py-4">
                <TouchableOpacity
                    className="w-12 h-12 rounded-full bg-white justify-center items-center shadow-sm"
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="chevron-back" size={24} color="#4A3B32" />
                </TouchableOpacity>
                <View className="flex-1 items-center">
                    <Text className="text-lg font-[Urbanist-Bold] text-[#4A3B32]">Profile Setup</Text>
                </View>
                {/* Placeholder for balance */}
                <View className="w-12" />
            </View>

            {/* Progress Dots */}
            <View className="flex-row justify-center gap-2 mb-6">
                <View className="w-8 h-2 rounded-full bg-[#9BB168]" />
                <View className="w-2 h-2 rounded-full bg-[#E0D8CE]" />
                <View className="w-2 h-2 rounded-full bg-[#E0D8CE]" />
                <View className="w-2 h-2 rounded-full bg-[#E0D8CE]" />
                <View className="w-2 h-2 rounded-full bg-[#E0D8CE]" />
            </View>

            <ScrollView
                className="flex-1 px-6"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* Title */}
                <Text className="text-3xl font-[Urbanist-Bold] text-[#4A3B32] mb-2">
                    Select your Avatar
                </Text>
                <Text className="text-base text-gray-500 font-[Urbanist-Medium] mb-8">
                    Choose an avatar that represents you
                </Text>

                {/* Large Preview Avatar */}
                <View className="items-center mb-8">
                    <View className="w-[180px] h-[180px] rounded-full bg-[#9BB168] justify-center items-center relative">
                        <View className="w-[200px] h-[200px] rounded-full border-2 border-dashed border-[#E67E22] absolute" />
                        <Text className="text-[80px]">
                            {selectedAvatar !== null ? avatars[selectedAvatar - 1]?.emoji : '👤'}
                        </Text>
                    </View>
                </View>

                {/* Avatar Grid */}
                <Text className="text-lg font-[Urbanist-Bold] text-[#4A3B32] mb-4">
                    Avatar List
                </Text>

                <View className="flex-row flex-wrap justify-between gap-y-4">
                    {avatars.map((avatar) => (
                        <TouchableOpacity
                            key={avatar.id}
                            onPress={() => setSelectedAvatar(avatar.id)}
                            className={`w-[22%] aspect-square rounded-2xl justify-center items-center border-2 ${selectedAvatar === avatar.id
                                    ? 'border-[#9BB168] bg-[#E8EDD8]'
                                    : 'border-transparent bg-white'
                                }`}
                        >
                            <Text className="text-3xl">{avatar.emoji}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* More Avatars hint */}
                <View className="items-center mt-6">
                    <TouchableOpacity className="flex-row items-center">
                        <Text className="text-[#9BB168] font-[Urbanist-Medium] mr-1">More Avatars</Text>
                        <Ionicons name="chevron-down" size={16} color="#9BB168" />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Continue Button */}
            <View className="px-6 pb-10 pt-4" style={{ paddingBottom: insets.bottom + 20 }}>
                <TouchableOpacity
                    className={`rounded-full py-5 flex-row justify-center items-center shadow-lg ${selectedAvatar ? 'bg-[#4A3B32]' : 'bg-[#E0E0E0]'
                        }`}
                    onPress={handleContinue}
                    disabled={!selectedAvatar}
                >
                    <Text className={`text-lg font-[Urbanist-Bold] mr-2 ${selectedAvatar ? 'text-white' : 'text-gray-500'
                        }`}>
                        Continue
                    </Text>
                    <Ionicons
                        name="arrow-forward"
                        size={20}
                        color={selectedAvatar ? 'white' : 'gray'}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default AvatarSelectionScreen;
