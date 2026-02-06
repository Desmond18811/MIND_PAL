import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Modal,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import "../global.css";

const MindfulnessActivitiesScreen = ({ navigation, route }: { navigation: any, route: any }) => {
    const [showCompletedModal, setShowCompletedModal] = useState(false);
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

    const suggestedActivities = [
        { id: 1, title: 'Daily Meditation', time: 'Routine', icon: '🧘' },
        { id: 2, title: 'Gratefulness Journaling', time: 'Daily', icon: '📝' },
    ];

    const mindfulResources = [
        {
            id: 1,
            title: 'Why should we be mindful?',
            description: 'Mindfulness, the practice of being fully present and engaged in the moment, has become increasingly important in our fast-paced world. It\'s not just a trend; it\'s a vital tool for enhancing overall well-being.',
            image: '🧠',
            tags: ['Reduce Stress', 'Improve Health'],
        },
    ];

    const handleComplete = () => {
        setShowCompletedModal(true);
    };

    const handleCloseModal = () => {
        setShowCompletedModal(false);
        navigation.goBack();
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F3EDE4' }}>
            <StatusBar barStyle="dark-content" backgroundColor="#8EBA6B" />

            {/* Header with Green Background */}
            <View className="bg-primary-green px-5 py-5 rounded-b-[30px] flex-row items-center justify-between">
                <TouchableOpacity
                    className="w-10 h-10 rounded-full bg-white/20 justify-center items-center"
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>

                <View className="flex-1 items-center">
                    <Text className="text-2xl font-bold text-white">Mindfulness</Text>
                    <Text className="text-2xl font-bold text-white">Activities</Text>
                </View>

                <TouchableOpacity>
                    <Text className="text-white text-sm">See All</Text>
                </TouchableOpacity>
            </View>

            <Animated.ScrollView
                className="flex-1 p-5"
                style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
                showsVerticalScrollIndicator={false}
            >
                {/* Suggested Activity Section */}
                <Text className="text-lg font-semibold text-dark-brown mb-4">Suggested Activity</Text>

                <View className="flex-row gap-4 mb-6">
                    {suggestedActivities.map((activity) => (
                        <TouchableOpacity key={activity.id} className="flex-1 bg-white rounded-2xl p-5 items-center shadow-sm">
                            <Text className="text-4xl mb-2">{activity.icon}</Text>
                            <Text className="text-sm font-semibold text-dark-brown text-center mb-1">{activity.title}</Text>
                            <Text className="text-xs text-placeholder">{activity.time}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Mindful Resources Section */}
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-lg font-semibold text-dark-brown">Mindful Resources</Text>
                    <TouchableOpacity>
                        <Text className="text-sm text-primary-green">See All</Text>
                    </TouchableOpacity>
                </View>

                {mindfulResources.map((resource) => (
                    <View key={resource.id} className="bg-white rounded-2xl p-5 mb-5 shadow-sm">
                        <View className="h-24 bg-light-gray rounded-2xl justify-center items-center mb-4">
                            <Text className="text-5xl">{resource.image}</Text>
                        </View>
                        <Text className="text-lg font-bold text-dark-brown mb-2">{resource.title}</Text>
                        <Text className="text-sm text-placeholder leading-6 mb-4" numberOfLines={4}>
                            {resource.description}
                        </Text>
                        <View className="flex-row gap-2">
                            {resource.tags.map((tag, index) => (
                                <View key={index} className="bg-light-gray px-3 py-1.5 rounded-2xl">
                                    <Text className="text-xs text-text-dark">✨ {tag}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ))}

                {/* Complete Button */}
                <TouchableOpacity className="bg-dark-brown flex-row items-center justify-center py-5 rounded-3xl mb-8 gap-2.5" onPress={handleComplete}>
                    <Text className="text-white text-lg font-semibold">Mark As Completed</Text>
                    <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                </TouchableOpacity>
            </Animated.ScrollView>

            {/* Completion Modal */}
            <Modal
                visible={showCompletedModal}
                transparent
                animationType="fade"
                onRequestClose={handleCloseModal}
            >
                <View className="flex-1 bg-black/70 justify-center items-center p-8">
                    <View className="bg-dark-brown rounded-3xl p-8 w-full items-center">
                        <TouchableOpacity className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 justify-center items-center" onPress={handleCloseModal}>
                            <Ionicons name="close" size={24} color="#FFFFFF" />
                        </TouchableOpacity>

                        <View className="w-24 h-24 rounded-full bg-white/20 justify-center items-center mb-5">
                            <Text className="text-5xl">🎉</Text>
                        </View>

                        <Text className="text-xl font-bold text-white text-center mb-1">AI Suggestion Completed.</Text>
                        <Text className="text-base text-primary-green font-semibold mb-2">+5 Pal Score Added!</Text>
                        <Text className="text-sm text-white/70 text-center mb-6">
                            Your Pal score has increased to 85
                        </Text>

                        <TouchableOpacity className="bg-white px-8 py-4 rounded-3xl" onPress={handleCloseModal}>
                            <Text className="text-dark-brown text-base font-semibold">Great, Thanks! ✓</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default MindfulnessActivitiesScreen;
