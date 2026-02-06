import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import "../global.css";

const HomeScreen = () => {
  const navigation = useNavigation();
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F3EDE4' }}>
      <StatusBar barStyle="light-content" backgroundColor="#8B7355" />

      {/* Header */}
      <View className="bg-[#8B7355] px-5 pb-4">
        <View className="flex-row justify-between items-center mt-2">
          <View className="flex-row items-center">
            <Image
              source={require('../assets/profile1.png')}
              className="w-12 h-12 rounded-full mr-4"
            />
            <View>
              <Text className="text-white text-lg font-bold">Hi, Shinomiya!</Text>
              <View className="flex-row items-center gap-2">
                <Text className="text-white text-xs bg-white/20 px-2 py-0.5 rounded-lg">Pro</Text>
                <Text className="text-white text-xs">80%</Text>
                <Text className="text-white text-xs">😊 Happy</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity className="p-1">
            <Ionicons name="notifications-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View className="bg-white flex-row items-center rounded-2xl px-4 py-2.5 mt-4">
          <Ionicons name="search" size={20} color="#666" style={{ marginRight: 10 }} />
          <Text className="text-[#666]">Search anything...</Text>
        </View>
      </View>

      <Animated.ScrollView
        className="flex-1"
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        showsVerticalScrollIndicator={false}
      >
        {/* Mental Health Metrics */}
        <Text className="text-lg text-[#503623] px-5 mt-5 mb-4">Mental Health Metrics</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-5"
        >
          {/* Pal Score Card */}
          <TouchableOpacity
            className="w-[150px] rounded-2xl p-4 mr-4 bg-[#A8D5A8] items-center justify-between"
            onPress={() => navigation.navigate('FreudScore')}
          >
            <View className="flex-row items-center self-start mb-2">
              <Ionicons name="analytics" size={20} color="white" />
              <Text className="text-white text-base font-bold ml-2">Pal Score</Text>
            </View>
            <View className="w-20 h-20 rounded-full bg-white/20 justify-center items-center my-2">
              <View className="w-16 h-16 rounded-full bg-white/30 justify-center items-center">
                <Text className="text-white text-2xl font-bold">80</Text>
              </View>
            </View>
            <View className="self-stretch mt-auto">
              <Text className="text-white text-sm font-semibold">Healthy Mind</Text>
              <Text className="text-white/80 text-xs mt-1">Above average</Text>
            </View>
          </TouchableOpacity>

          {/* Mood Card */}
          <TouchableOpacity
            className="w-[150px] rounded-2xl p-4 mr-4 bg-[#FF8C42] items-center justify-between"
            onPress={() => navigation.navigate('FreudScore')}
          >
            <View className="flex-row items-center self-start mb-2">
              <Ionicons name="happy" size={20} color="white" />
              <Text className="text-white text-base font-bold ml-2">Mood</Text>
            </View>
            <Ionicons name="sad" size={40} color="white" style={{ marginVertical: 10 }} />
            <View className="self-stretch mt-auto">
              <Text className="text-white text-sm font-semibold">Currently Sad</Text>
              <Text className="text-white/80 text-xs mt-1">Improving</Text>
            </View>
          </TouchableOpacity>

          {/* Goals Card */}
          <View className="w-[150px] rounded-2xl p-4 mr-4 bg-[#87CEEB] items-center justify-between">
            <View className="flex-row items-center self-start mb-2">
              <Ionicons name="flag" size={20} color="white" />
              <Text className="text-white text-base font-bold ml-2">Goals</Text>
            </View>
            <View className="flex-row justify-around w-full my-2">
              <Ionicons name="checkmark-circle" size={24} color="white" />
              <Ionicons name="checkmark-circle" size={24} color="white" />
              <Ionicons name="checkmark-circle" size={24} color="white" />
            </View>
            <View className="self-stretch mt-auto">
              <Text className="text-white text-sm font-semibold">3 Completed</Text>
              <Text className="text-white/80 text-xs mt-1">2 remaining</Text>
            </View>
          </View>

          {/* Meditate Card */}
          <View className="w-[150px] rounded-2xl p-4 mr-4 bg-[#DDA0DD] items-center justify-between">
            <View className="flex-row items-center self-start mb-2">
              <Ionicons name="time" size={20} color="white" />
              <Text className="text-white text-base font-bold ml-2">Meditate</Text>
            </View>
            <Ionicons name="timer" size={40} color="white" style={{ marginVertical: 10 }} />
            <View className="self-stretch mt-auto">
              <Text className="text-white text-sm font-semibold">20 mins</Text>
              <Text className="text-white/80 text-xs mt-1">Daily streak: 7</Text>
            </View>
          </View>

          {/* Journal Card */}
          <View className="w-[150px] rounded-2xl p-4 mr-4 bg-[#FFB347] items-center justify-between">
            <View className="flex-row items-center self-start mb-2">
              <Ionicons name="book" size={20} color="white" />
              <Text className="text-white text-base font-bold ml-2">Journal</Text>
            </View>
            <View className="flex-row items-center justify-center my-2">
              <Ionicons name="flame" size={30} color="white" />
              <Text className="text-white text-2xl font-bold ml-1">64</Text>
            </View>
            <View className="self-stretch mt-auto">
              <Text className="text-white text-sm font-semibold">Day Streak</Text>
              <Text className="text-white/80 text-xs mt-1">Keep going!</Text>
            </View>
          </View>
        </ScrollView>

        {/* Mindful Tracker */}
        <View className="flex-row justify-between items-center px-5 mt-5">
          <Text className="text-lg text-[#503623]">Mindful Tracker</Text>
          <TouchableOpacity>
            <Text className="text-[#A8D5A8] text-sm">See All</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-white rounded-2xl mx-5 p-4 shadow-sm">
          {/* Mindful Hours */}
          <View className="flex-row items-center py-3 border-b border-[#F0F0F0]">
            <View className="w-10 h-10 rounded-full bg-[#A8D5A8] justify-center items-center mr-4">
              <Ionicons name="time-outline" size={20} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-[#333]">Mindful Hours</Text>
              <Text className="text-xs text-[#666] mt-1">2.5h/8h Today</Text>
            </View>
          </View>

          {/* Sleep Quality */}
          <View className="flex-row items-center py-3 border-b border-[#F0F0F0]">
            <View className="w-10 h-10 rounded-full bg-[#87CEEB] justify-center items-center mr-4">
              <Ionicons name="bed-outline" size={20} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-[#333]">Sleep Quality</Text>
              <Text className="text-xs text-[#666] mt-1">Incomplete (-2h Avg)</Text>
            </View>
          </View>

          {/* Mindful Journal */}
          <View className="flex-row items-center py-3 border-b border-[#F0F0F0]">
            <View className="w-10 h-10 rounded-full bg-[#FFB347] justify-center items-center mr-4">
              <Ionicons name="journal-outline" size={20} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-[#333]">Mindful Journal</Text>
              <Text className="text-xs text-[#666] mt-1">64 Day Streak</Text>
            </View>
          </View>

          {/* Stress Level */}
          <View className="flex-row items-center py-3 border-b border-[#F0F0F0]">
            <View className="w-10 h-10 rounded-full bg-[#FFA07A] justify-center items-center mr-4">
              <Ionicons name="speedometer-outline" size={20} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-[#333]">Stress Level</Text>
              <Text className="text-xs text-[#666] mt-1">Level 3 (Normal)</Text>
            </View>
          </View>

          {/* Mood Tracker */}
          <View className="flex-row items-center py-3">
            <View className="w-10 h-10 rounded-full bg-[#DDA0DD] justify-center items-center mr-4">
              <Ionicons name="analytics-outline" size={20} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-[#333]">Mood Tracker</Text>
              <Text className="text-xs text-[#666] mt-1">Sad → Happy → Neutral</Text>
            </View>
          </View>
        </View>

        {/* AI Therapy Chatbot */}
        <View className="bg-white rounded-2xl mx-5 mt-5 p-5 items-center">
          <View className="flex-row items-center justify-between w-full mb-4">
            <Ionicons name="chatbubble-outline" size={24} color="#8B7355" />
            <Text className="text-base font-bold text-[#333] flex-1 ml-2">AI Therapy Chatbot</Text>
            <TouchableOpacity className="p-1">
              <Ionicons name="settings-outline" size={20} color="#8B7355" />
            </TouchableOpacity>
          </View>

          <Text className="text-2xl font-bold text-[#333] mb-1">2,541</Text>
          <Text className="text-sm text-[#666] mb-1">Conversations</Text>
          <Text className="text-xs text-[#666] mb-2">💬 83 left this month</Text>

          <View className="flex-row items-center mt-2">
            <TouchableOpacity
              className="bg-[#A8D5A8] py-2 px-4 rounded-2xl mr-2"
              onPress={() => navigation.navigate('AISuggestions')}
            >
              <Text className="text-white text-xs font-semibold">Go Pro Now!</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-[#FF8C42] w-10 h-10 rounded-full justify-center items-center"
              onPress={() => navigation.navigate('AISuggestions')}
            >
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Mindful Resources */}
        <View className="flex-row justify-between items-center px-5 mt-5">
          <Text className="text-lg text-[#503623]">Mindful Resources</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MindfulnessActivities')}>
            <Text className="text-[#A8D5A8] text-sm">See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-5 mt-2 mb-4"
        >
          <TouchableOpacity
            className="bg-white rounded-2xl p-4 mr-4 w-[250px]"
            onPress={() => navigation.navigate('MindfulnessActivities')}
          >
            <View className="items-center mb-2">
              <Ionicons name="leaf" size={30} color="#A8D5A8" />
            </View>
            <Text className="text-sm font-bold text-[#333] text-center mb-1">Mental Health</Text>
            <Text className="text-xs text-[#666] text-center mb-2">Will meditation help you get out from the rat race?</Text>
            <View className="flex-row justify-around">
              <Text className="text-[10px] text-[#666]">👍 5,241</Text>
              <Text className="text-[10px] text-[#666]">💬 987</Text>
              <Text className="text-[10px] text-[#666]">🔗 22</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="bg-white rounded-2xl p-4 mr-4 w-[250px]">
            <View className="items-center mb-2">
              <Ionicons name="leaf" size={30} color="#A8D5A8" />
            </View>
            <Text className="text-sm font-bold text-[#333] text-center mb-1">Mental Health</Text>
            <Text className="text-xs text-[#666] text-center mb-2">Will meditation help you get out from it?</Text>
            <View className="flex-row justify-around">
              <Text className="text-[10px] text-[#666]">👍 5,241</Text>
              <Text className="text-[10px] text-[#666]">💬 9</Text>
              <Text className="text-[10px] text-[#666]">🔗 9</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </Animated.ScrollView>

      {/* Bottom Navigation */}
      <View className="flex-row bg-white py-2 px-5 justify-between items-center border-t border-[#F0F0F0]">
        <TouchableOpacity className="items-center" onPress={() => navigation.navigate('Home')}>
          <Ionicons name="home" size={24} color="#A8D5A8" />
          <Text className="text-[10px] text-[#A8D5A8] mt-1">Home</Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center" onPress={() => navigation.navigate('AISuggestions')}>
          <Ionicons name="chatbubbles-outline" size={24} color="#8B7355" />
          <Text className="text-[10px] text-[#8B7355] mt-1">Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity className="bg-[#A8D5A8] w-12 h-12 rounded-full justify-center items-center" onPress={() => navigation.navigate('Assessment')}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity className="items-center" onPress={() => navigation.navigate('FreudScore')}>
          <Ionicons name="analytics-outline" size={24} color="#8B7355" />
          <Text className="text-[10px] text-[#8B7355] mt-1">Analytics</Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center" onPress={() => navigation.navigate('ProfileSetup')}>
          <Ionicons name="person-outline" size={24} color="#8B7355" />
          <Text className="text-[10px] text-[#8B7355] mt-1">Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
