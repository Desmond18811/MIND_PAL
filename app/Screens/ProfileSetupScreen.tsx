import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Image,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, G, Circle } from 'react-native-svg';
import Slider from '@react-native-community/slider';
import "../global.css";

const { width } = Dimensions.get('window');

const ProfileSetupScreen = ({ navigation, route }: { navigation: any, route: any }) => {
    // Receive params from AvatarSelectionScreen
    const { avatar, uploadedImage } = route.params || {};

    const [fullName, setFullName] = useState('Shinomiya Kagi');
    const [email, setEmail] = useState('elementary221b@gmail.com');
    // Password removed - moved to PasswordSetupScreen
    const [accountType, setAccountType] = useState('Patient'); // Psychiatrist, Patient, Professional
    const [weight, setWeight] = useState(65);
    const [gender, setGender] = useState('Trans Female');
    const [location, setLocation] = useState('Tokyo, Japan');

    // Abstract Avatar Colors (Same as in AvatarSelectionScreen)
    const getAvatarColors = (index: number) => {
        const avatars = [
            ['#9BB168', '#4A3B32', '#E8F5E9'],
            ['#E67E22', '#F1C40F', '#FEF9E7'],
            ['#3498DB', '#2980B9', '#EBF5FB'],
            ['#9B59B6', '#8E44AD', '#F4ECF7'],
        ];
        return avatars[index] || avatars[0];
    };

    const selectedColors = getAvatarColors(avatar || 0);

    const renderHeader = () => (
        <View className="relative w-full h-[180px]">
            {/* Green Wavy Background */}
            <Svg height="180" width={width} viewBox={`0 0 ${width} 180`} style={{ position: 'absolute', top: 0 }}>
                <Path
                    d={`M0 0 L${width} 0 L${width} 130 C${width} 130 ${width * 0.75} 170 ${width / 2} 170 C${width * 0.25} 170 0 130 0 130 Z`}
                    fill="#9BB168"
                />

                {/* Decorative Elements - faint shapes */}
                <Circle cx="40" cy="40" r="60" fill="rgba(255,255,255,0.1)" />
                <Path d={`M${width - 40} 20 L${width} 60 L${width - 60} 80 Z`} fill="rgba(255,255,255,0.1)" />
            </Svg>

            <SafeAreaView className="z-10 w-full px-5 pt-2">
                <View className="flex-row items-center mt-2">
                    <TouchableOpacity
                        className="w-10 h-10 rounded-full border border-white justify-center items-center"
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="chevron-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-xl font-[Urbanist-Bold] text-white ml-4">Profile Setup</Text>
                </View>
            </SafeAreaView>
        </View>
    );

    const renderAvatarDisplay = () => (
        <View className="items-center -mt-24 mb-6 z-20">
            <View className="w-28 h-28 rounded-full border-4 border-white bg-white justify-center items-center shadow-sm overflow-hidden relative">
                {uploadedImage ? (
                    <Image source={{ uri: uploadedImage }} className="w-full h-full" resizeMode="cover" />
                ) : (
                    // Render Abstract Avatar
                    <Svg height={100} width={100} viewBox="0 0 100 100">
                        <G rotation="-90" origin="50, 50">
                            <Path d="M 50 50 L 50 100 A 50 50 0 0 1 50 0 Z" fill={selectedColors[0]} />
                            <Path d="M 50 50 L 50 0 A 50 50 0 0 1 100 50 Z" fill={selectedColors[1]} />
                            <Path d="M 50 50 L 100 50 A 50 50 0 0 1 50 100 Z" fill={selectedColors[2]} />
                        </G>
                    </Svg>
                )}
                {/* Edit Icon Button */}
                <TouchableOpacity className="absolute bottom-0 right-0 bg-[#4A3B32] w-8 h-8 rounded-full justify-center items-center border-2 border-white">
                    <Ionicons name="pencil" size={14} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-[#FBFBF9]">
            <StatusBar barStyle="light-content" backgroundColor="#9BB168" />

            {/* ScrollView wraps EVERYTHING including Header for correct overlay behavior */}
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
                bounces={false}
            >
                {renderHeader()}

                {renderAvatarDisplay()}

                <View className="px-6">
                    {/* Form Fields */}

                    {/* Full Name */}
                    <View className="mb-5">
                        <Text className="text-sm font-[Urbanist-Bold] text-[#4A3B32] mb-2">Full Name</Text>
                        <View className="flex-row items-center bg-white border border-[#E8D5B7] rounded-[20px] px-4 py-3.5 shadow-sm">
                            <Ionicons name="person-outline" size={20} color="#6D482F" />
                            <TextInput
                                className="flex-1 ml-3 text-base font-[Urbanist-Medium] text-[#4A3B32]"
                                value={fullName}
                                onChangeText={setFullName}
                                placeholder="Enter your full name"
                            />
                        </View>
                    </View>

                    {/* Email Address */}
                    <View className="mb-5">
                        <Text className="text-sm font-[Urbanist-Bold] text-[#4A3B32] mb-2">Email Address</Text>
                        <View className="flex-row items-center bg-white border border-[#E8D5B7] rounded-[20px] px-4 py-3.5 shadow-sm">
                            <Ionicons name="mail-outline" size={20} color="#6D482F" />
                            <TextInput
                                className="flex-1 ml-3 text-base font-[Urbanist-Medium] text-[#4A3B32]"
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Enter your email"
                                keyboardType="email-address"
                            />
                        </View>
                    </View>

                    {/* Password - Navigation Trigger */}
                    <TouchableOpacity
                        className="mb-5"
                        onPress={() => {
                            // Main flow: Continue to Notification Setup (skipping password if not clicked)
                            navigation.navigate('PasswordSetup');
                        }}>
                        <Text className="text-sm font-[Urbanist-Bold] text-[#4A3B32] mb-2">Password</Text>
                        <View className="flex-row items-center bg-white border border-[#E8D5B7] rounded-[20px] px-4 py-3.5 shadow-sm">
                            <Ionicons name="lock-closed-outline" size={20} color="#6D482F" />
                            <Text className="flex-1 ml-3 text-base font-[Urbanist-Medium] text-[#D3C1B0] tracking-widest">
                                •••••••••
                            </Text>
                            <Ionicons name="eye-outline" size={20} color="#6D482F" />
                        </View>
                    </TouchableOpacity>

                    {/* Account Type */}
                    <View className="mb-5">
                        <Text className="text-sm font-[Urbanist-Bold] text-[#4A3B32] mb-2">Account Type</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                            {['Psychiatrist', 'Patient', 'Professional'].map((type) => {
                                const isSelected = accountType === type;
                                return (
                                    <TouchableOpacity
                                        key={type}
                                        onPress={() => setAccountType(type)}
                                        className={`px-6 py-3 rounded-full mr-3 border ${isSelected ? 'bg-[#9BB168] border-[#9BB168]' : 'bg-white border-[#E8D5B7]'}`}
                                    >
                                        <Text className={`font-[Urbanist-Bold] ${isSelected ? 'text-white' : 'text-[#4A3B32]'}`}>
                                            {type}
                                        </Text>
                                        {isSelected && (
                                            <View className="absolute right-3 top-3.5 w-2 h-2 rounded-full bg-white" />
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>

                    {/* Weight */}
                    <View className="mb-5">
                        <Text className="text-sm font-[Urbanist-Bold] text-[#4A3B32] mb-2">Weight</Text>
                        <View className="bg-white rounded-[20px] p-4 border border-[#E8D5B7] shadow-sm">
                            {/* @ts-ignore */}
                            <Slider
                                style={{ width: '100%', height: 40 }}
                                minimumValue={50}
                                maximumValue={100}
                                minimumTrackTintColor="#9BB168"
                                maximumTrackTintColor="#E0E0E0"
                                // @ts-ignore
                                thumbTintColor="#9BB168"
                                thumbImage={undefined}
                                value={weight}
                                onValueChange={setWeight}
                                step={1}
                            />
                            <View className="flex-row justify-between w-full px-1">
                                <Text className="text-xs text-[#8B7B6B] font-[Urbanist-Medium]">50kg</Text>
                                <Text className="text-base text-[#4A3B32] font-[Urbanist-Bold]">{weight}kg</Text>
                                <Text className="text-xs text-[#8B7B6B] font-[Urbanist-Medium]">100kg</Text>
                            </View>
                        </View>
                    </View>

                    {/* Gender */}
                    <View className="mb-5">
                        <Text className="text-sm font-[Urbanist-Bold] text-[#4A3B32] mb-2">Gender</Text>
                        <TouchableOpacity className="flex-row items-center justify-between bg-white border border-[#E8D5B7] rounded-[20px] px-4 py-3.5 shadow-sm">
                            <View className="flex-row items-center">
                                <Ionicons name="male-female-outline" size={20} color="#6D482F" />
                                <Text className="ml-3 text-base font-[Urbanist-Medium] text-[#4A3B32]">{gender}</Text>
                            </View>
                            <Ionicons name="chevron-down" size={20} color="#6D482F" />
                        </TouchableOpacity>
                    </View>

                    {/* Location */}
                    <View className="mb-8">
                        <Text className="text-sm font-[Urbanist-Bold] text-[#4A3B32] mb-2">Location</Text>
                        <TouchableOpacity className="flex-row items-center justify-between bg-white border border-[#E8D5B7] rounded-[20px] px-4 py-3.5 shadow-sm">
                            <View className="flex-row items-center">
                                <Ionicons name="location-outline" size={20} color="#6D482F" />
                                <Text className="ml-3 text-base font-[Urbanist-Medium] text-[#4A3B32]">{location}</Text>
                            </View>
                            <Ionicons name="chevron-down" size={20} color="#6D482F" />
                        </TouchableOpacity>
                    </View>

                    {/* Continue Button */}
                    <TouchableOpacity
                        className="bg-[#4A3B32] flex-row items-center justify-center py-4 rounded-full mb-10"
                        onPress={() => {
                            // Navigate to Password Setup (next screen)
                            navigation.navigate('NotificationSetup');
                        }}
                    >
                        <Text className="text-white text-lg font-[Urbanist-Bold] mr-2">Continue</Text>
                        <Ionicons name="arrow-forward" size={20} color="white" />
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </View>
    );
};

export default ProfileSetupScreen;
