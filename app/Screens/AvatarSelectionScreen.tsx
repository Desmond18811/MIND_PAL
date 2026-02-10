import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    FlatList,
    Dimensions,
    Image,
    StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, G, Circle, Defs, ClipPath, Rect } from 'react-native-svg';
import "../global.css";

const { width } = Dimensions.get('window');
const ITEM_SIZE = width * 0.6; // Size of the avatar circle
const SPACING = (width - ITEM_SIZE) / 2;

import * as ImagePicker from 'expo-image-picker';

const AvatarSelectionScreen = ({ navigation, route }: { navigation: any, route: any }) => {
    const [selectedAvatarIndex, setSelectedAvatarIndex] = useState(0);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const flatListRef = useRef<FlatList>(null);

    // Placeholder data for the carousel - representing the abstract avatars
    const avatars = [
        { id: '1', colors: ['#9BB168', '#4A3B32', '#E8F5E9'] }, // The one in the image
        { id: '2', colors: ['#E67E22', '#F1C40F', '#FEF9E7'] },
        { id: '3', colors: ['#3498DB', '#2980B9', '#EBF5FB'] },
        { id: '4', colors: ['#9B59B6', '#8E44AD', '#F4ECF7'] },
    ];

    const pickImage = async () => {
        // request permission
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Sorry, we need camera roll permissions to make this work!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setUploadedImage(result.assets[0].uri);
        }
    };

    const handleScroll = (event: any) => {
        const scrollX = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollX / ITEM_SIZE);
        setSelectedAvatarIndex(index);
        if (uploadedImage) setUploadedImage(null);
    };

    const handleContinue = () => {
        // Navigate to the Profile Setup Form (Step 2)
        navigation.navigate('ProfileSetup', {
            ...route?.params,
            avatar: selectedAvatarIndex,
            uploadedImage: uploadedImage,
        });
    };


    // Render the Abstract Pie Chart Avatar
    const renderAvatar = (colors: string[], isSelected: boolean) => {
        // Simplified representation of the pie chart in the image
        // It has 3 segments essentially.
        return (
            <View
                className={`rounded-full overflow-hidden items-center justify-center ${isSelected ? 'shadow-lg' : 'opacity-50'}`}
                style={{
                    width: ITEM_SIZE,
                    height: ITEM_SIZE,
                    backgroundColor: 'white',
                    borderWidth: isSelected ? 8 : 0,
                    borderColor: 'white',
                }}
            >
                <Svg height={ITEM_SIZE} width={ITEM_SIZE} viewBox="0 0 100 100">
                    <G rotation="-90" origin="50, 50">
                        {/* Segment 1: Top Left (25%) */}
                        <Path d="M 50 50 L 50 0 A 50 50 0 0 0 0 50 Z" fill={colors[0]} />

                        {/* Segment 2: Top Right (25%) */}
                        <Path d="M 50 50 L 100 50 A 50 50 0 0 0 50 0 Z" fill={colors[1]} />

                        {/* Segment 3: Bottom Half (50%) - Wait, image shows 3 segments roughly equal or 2 quarters and a half? 
                           Looking at image: 
                           Top Right: Dark Brown
                           Left Side: Green (looks like half circle?)
                           Bottom Right: Light Green
                           
                           Actually looks like:
                           Left Semi-circle: Green
                           Top Right Quadrant: Brown
                           Bottom Right Quadrant: Light Beige
                        */}

                        {/* Let's try to match the image geometry better */}
                        {/* Left Half - Green */}
                        <Path d="M 50 50 L 50 100 A 50 50 0 0 1 50 0 Z" fill={colors[0]} />

                        {/* Top Right Quadrant - Brown */}
                        <Path d="M 50 50 L 50 0 A 50 50 0 0 1 100 50 Z" fill={colors[1]} />

                        {/* Bottom Right Quadrant - Light */}
                        <Path d="M 50 50 L 100 50 A 50 50 0 0 1 50 100 Z" fill={colors[2]} />
                    </G>
                </Svg>
            </View>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FBFBF9' }}>
            <StatusBar barStyle="dark-content" backgroundColor="#FBFBF9" />

            {/* Header */}
            <View className="flex-row items-center px-6 py-4">
                <TouchableOpacity
                    className="w-12 h-12 rounded-full border border-[#6D482F] justify-center items-center"
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="chevron-back" size={24} color="#6D482F" />
                </TouchableOpacity>
                <Text className="text-xl font-[Urbanist-Bold] text-[#4A3B32] ml-4">Profile Setup</Text>
            </View>

            {/* Carousel Section */}
            <View className="mt-10 mb-8 items-center justify-center">
                {/* Top Indicator */}
                <View className="mb-4">
                    <Svg width={20} height={30} viewBox="0 0 20 30">
                        <Path d="M10 30 C10 30 0 15 0 10 A10 10 0 0 1 20 10 C20 15 10 30 10 30 Z" fill="#4A3B32" />
                    </Svg>
                </View>

                {/* Carousel */}
                <View style={{ height: ITEM_SIZE + 20 }}>
                    <FlatList
                        ref={flatListRef}
                        data={avatars}
                        keyExtractor={(item) => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        snapToInterval={ITEM_SIZE}
                        decelerationRate="fast"
                        contentContainerStyle={{ paddingHorizontal: SPACING }}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        renderItem={({ item, index }: { item: { id: string, colors: string[] }, index: number }) => {
                            const isSelected = index === selectedAvatarIndex;
                            return (
                                <TouchableOpacity
                                    activeOpacity={0.9}
                                    onPress={() => {
                                        flatListRef.current?.scrollToIndex({ index, animated: true });
                                        setSelectedAvatarIndex(index);
                                    }}
                                    style={{ width: ITEM_SIZE, alignItems: 'center', justifyContent: 'center' }}
                                >
                                    {renderAvatar(item.colors, isSelected)}
                                </TouchableOpacity>
                            );
                        }}
                        // @ts-ignore
                        getItemLayout={undefined}
                    />
                </View>

                {/* Bottom Indicator */}
                <View className="mt-4 transform rotate-180">
                    <Svg width={20} height={30} viewBox="0 0 20 30">
                        <Path d="M10 30 C10 30 0 15 0 10 A10 10 0 0 1 20 10 C20 15 10 30 10 30 Z" fill="#4A3B32" />
                    </Svg>
                </View>
            </View>

            {/* Text Content */}
            <View className="items-center px-10 mb-10">
                <Text className="text-2xl font-[Urbanist-Bold] text-[#4A3B32] mb-4 text-center">
                    Select your Avatar
                </Text>
                <Text className="text-base font-[Urbanist-Medium] text-[#8B7B6B] text-center leading-6">
                    We have a set of customizable avatar. Or you can upload your own image from your local file.
                </Text>
            </View>

            {/* Upload Section */}
            <View className="items-center flex-1 justify-end pb-10">
                <TouchableOpacity
                    className={`w-24 h-24 rounded-full border-2 border-dashed border-[#6D482F] justify-center items-center mb-4 bg-[#F5F3EF] overflow-hidden ${uploadedImage ? 'border-solid' : ''}`}
                    onPress={pickImage}
                >
                    {uploadedImage ? (
                        <Image source={{ uri: uploadedImage }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                        <View className="mt-2">
                            <Ionicons name="add" size={40} color="#6D482F" />
                        </View>
                    )}
                </TouchableOpacity>
                <Text className="text-sm font-[Urbanist-Bold] text-[#9A9A9A]">
                    {uploadedImage ? 'Image Selected' : 'Or upload your profile'}
                </Text>

                {/* Continue/Next Action */}
                <TouchableOpacity
                    className="mt-6 bg-[#4A3B32] px-8 py-3 rounded-full"
                    onPress={handleContinue}
                >
                    <Text className="text-white font-[Urbanist-Bold]">Continue</Text>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
};

export default AvatarSelectionScreen;
