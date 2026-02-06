import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import "../global.css";

const AISuggestionsScreen = ({ navigation }: { navigation: any }) => {
    const [activeTab, setActiveTab] = useState('all');
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(50)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const suggestions = [
        {
            id: 1,
            category: 'Mindfulness Activities',
            icon: '🧘',
            description: 'Breathing, Body ...',
            time: '~10min',
            color: '#8EBA6B',
        },
        {
            id: 2,
            category: 'Physical Activities',
            icon: '🏃',
            description: 'Jogging, Running, Swimming',
            time: '~30min',
            color: '#FF8C42',
        },
        {
            id: 3,
            category: 'Social Connection',
            icon: '👥',
            description: 'Hangout, Shopping',
            time: '~1hr',
            color: '#9B8BB4',
        },
        {
            id: 4,
            category: 'Professional Support',
            icon: '👨‍⚕️',
            description: 'Psychiatrist, Doctor',
            time: '~30min',
            color: '#6D482F',
        },
    ];

    const tabs = [
        { id: 'all', label: 'All Suggestions' },
        { id: 'sorted', label: 'Sorted' },
    ];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F3EDE4' }}>
            <StatusBar barStyle="dark-content" backgroundColor="#F3EDE4" />

            {/* Header */}
            <View className="flex-row items-center justify-between px-5 py-4">
                <TouchableOpacity
                    className="w-10 h-10 rounded-full bg-white justify-center items-center shadow-sm"
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="chevron-back" size={24} color="#6D482F" />
                </TouchableOpacity>
                <View>
                    <Text className="text-lg font-bold text-dark-brown text-center">AI Score Suggestions</Text>
                    <View className="flex-row items-center justify-center mt-1 gap-1">
                        <Text className="text-xs">🤖</Text>
                        <Text className="text-xs text-placeholder">92 Total</Text>
                        <View className="bg-primary-green px-2 py-0.5 rounded-xl">
                            <Text className="text-white text-[10px] font-semibold">GPT-5</Text>
                        </View>
                    </View>
                </View>
                <View className="w-10" />
            </View>

            {/* Tabs */}
            <View className="flex-row px-5 mb-5 gap-2.5">
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab.id}
                        className={`flex-1 py-3 rounded-3xl items-center ${activeTab === tab.id ? 'bg-dark-brown' : 'bg-white'
                            }`}
                        onPress={() => setActiveTab(tab.id)}
                    >
                        <Text className={`text-sm font-semibold ${activeTab === tab.id ? 'text-white' : 'text-text-dark'
                            }`}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                {/* Suggestions List */}
                {suggestions.map((suggestion) => (
                    <Animated.View
                        key={suggestion.id}
                        style={{
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }}
                    >
                        <TouchableOpacity
                            className="flex-row items-center bg-white rounded-2xl p-4 mb-3 shadow-sm"
                            onPress={() => navigation.navigate('MindfulnessActivities', { suggestion })}
                        >
                            <View
                                className="w-12 h-12 rounded-full justify-center items-center mr-4"
                                style={{ backgroundColor: suggestion.color + '20' }}
                            >
                                <Text className="text-2xl">{suggestion.icon}</Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-base font-semibold text-dark-brown mb-1">{suggestion.category}</Text>
                                <Text className="text-sm text-placeholder">{suggestion.description}</Text>
                            </View>
                            <View className="flex-row items-center gap-1">
                                <Text className="text-xs text-placeholder">{suggestion.time}</Text>
                                <Ionicons name="chevron-forward" size={20} color="#A0A0A0" />
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                ))}

                {/* Score Impact Info */}
                <Animated.View
                    className="flex-row items-center bg-green-100 rounded-2xl p-4 mt-2 mb-8 gap-3"
                    style={{ opacity: fadeAnim }}
                >
                    <Ionicons name="information-circle" size={24} color="#8EBA6B" />
                    <Text className="flex-1 text-sm text-text-dark leading-5">
                        Completing AI suggestions can improve your Pal Score by +5 points each!
                    </Text>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default AISuggestionsScreen;
