import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    Switch,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import "../global.css";

const { width } = Dimensions.get('window');

const NotificationSetupScreen = ({ navigation }: { navigation: any }) => {
    const [aiChatbot, setAiChatbot] = useState(true);
    const [mentalJournal, setMentalJournal] = useState(false);
    const [moodTracker, setMoodTracker] = useState(true);
    const animation = useRef(null);

    return (
        <View className="flex-1 bg-[#FBFBF9]">
            <StatusBar barStyle="dark-content" backgroundColor="#FBFBF9" />
            <SafeAreaView className="flex-1 px-6">

                {/* Header */}
                <View className="flex-row items-center mt-4 mb-2">
                    <TouchableOpacity
                        className="w-10 h-10 rounded-full border border-[#E8D5B7] justify-center items-center"
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="chevron-back" size={24} color="#4A3B32" />
                    </TouchableOpacity>
                    <Text className="text-xl font-[Urbanist-Bold] text-[#4A3B32] ml-4">Notification Setup</Text>
                </View>

                {/* Animation Area */}
                <View className="items-center justify-center flex-1 my-4">
                    <View className="w-full h-[350px] items-center justify-center">
                        <LottieView
                            autoPlay
                            loop
                            // ref={animation}
                            style={{
                                width: '100%',
                                height: '100%',
                            }}
                            source={require('../assets/Yoga Se Hi hoga.json')}
                        />
                    </View>
                </View>

                {/* Toggles Container - Clean List */}
                <View className="mb-12 space-y-6 px-2">
                    {/* AI Chatbot Notification */}
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center flex-1">
                            <View className="w-12 h-12 rounded-full bg-[#E8E4F0] items-center justify-center mr-4">
                                <Ionicons name="chatbubbles-sharp" size={24} color="#8B7BA8" />
                            </View>
                            <Text className="font-[Urbanist-Bold] text-[#4A3B32] text-lg">AI Chatbot Notification</Text>
                        </View>
                        {/* @ts-ignore */}
                        <Switch
                            trackColor={{ false: "#E0E0E0", true: "#8EBA6B" }}
                            thumbColor={aiChatbot ? "#fff" : "#f4f3f4"}
                            ios_backgroundColor="#E0E0E0"
                            onValueChange={setAiChatbot}
                            value={aiChatbot}
                        />
                    </View>

                    {/* Mental Journal Notification */}
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center flex-1">
                            <View className="w-12 h-12 rounded-full bg-[#FFF3E0] items-center justify-center mr-4">
                                <Ionicons name="book" size={24} color="#E8A860" />
                            </View>
                            <Text className="font-[Urbanist-Bold] text-[#4A3B32] text-lg">Mental Journal Notification</Text>
                        </View>
                        {/* @ts-ignore */}
                        <Switch
                            trackColor={{ false: "#D5CFC4", true: "#D5CFC4" }}
                            thumbColor={mentalJournal ? "#fff" : "#f4f3f4"}
                            ios_backgroundColor="#D5CFC4"
                            onValueChange={setMentalJournal}
                            value={mentalJournal}
                        />
                    </View>

                    {/* Mood Tracker Notification */}
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center flex-1">
                            <View className="w-12 h-12 rounded-full bg-[#FFEBEE] items-center justify-center mr-4">
                                <Ionicons name="happy" size={24} color="#E57373" />
                            </View>
                            <Text className="font-[Urbanist-Bold] text-[#4A3B32] text-lg">Mood Tracker Notification</Text>
                        </View>
                        {/* @ts-ignore */}
                        <Switch
                            trackColor={{ false: "#E0E0E0", true: "#8EBA6B" }}
                            thumbColor={moodTracker ? "#fff" : "#f4f3f4"}
                            ios_backgroundColor="#E0E0E0"
                            onValueChange={setMoodTracker}
                            value={moodTracker}
                        />
                    </View>
                </View>

                {/* Continue Button */}
                <TouchableOpacity
                    className="bg-[#4A3B32] flex-row items-center justify-center py-4 rounded-full mb-8 shadow-lg shadow-orange-900/20"
                    onPress={() => {
                        navigation.navigate('ComputingScore');
                    }}
                >
                    <Text className="text-white text-lg font-[Urbanist-Bold] mr-2">Continue</Text>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                </TouchableOpacity>

            </SafeAreaView>
        </View>
    );
};

export default NotificationSetupScreen;
