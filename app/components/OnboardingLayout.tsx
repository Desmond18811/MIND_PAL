import React from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions, Platform, ImageSourcePropType } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import "../global.css";

const { width, height } = Dimensions.get('window');

interface OnboardingLayoutProps {
    backgroundColor: string;
    imageSource: ImageSourcePropType;
    stepText: string;
    children: React.ReactNode;
    onNext: () => void;
    currentStep: number;
    totalSteps?: number;
    nextButtonColor?: string;
    darkButton?: boolean; // If true, arrow is white on dark background. If false, arrow is dark on light bg?
}

const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
    backgroundColor,
    imageSource,
    stepText,
    children,
    onNext,
    currentStep,
    totalSteps = 5,
    nextButtonColor = '#4A3B32',
}) => {
    const insets = useSafeAreaInsets();

    // Progress Bar Width calculation
    // The design shows a segmented/continuous bar. 
    // Let's make it a single bar that fills up or segments.
    // Design reference: "Step One" image shows a segmented bar with first part filled.
    // Actually, looking at the code in OnboardingScreen (previous), it was:
    // <View className="w-[30%] h-full bg-[#A27562] rounded-md" /> 
    // Let's implement dynamic width.

    const progressWidth = `${(currentStep / totalSteps) * 100}%`;

    return (
        <View style={{ flex: 1, backgroundColor }}>

            {/* Top Image Section - Absolute to fill behind header? Or just top half? */}
            {/* Design shows illustration taking up top ~60% */}
            <View className="absolute top-0 left-0 w-full" style={{ height: height * 0.65 }}>
                <Image
                    source={imageSource}
                    className="w-full h-full"
                    resizeMode="cover"
                />

                {/* Step Pill */}
                <View
                    className="absolute w-full items-center"
                    style={{ top: insets.top + 20 }}
                >
                    <View className="border border-[#4A3B32] px-6 py-2 rounded-full bg-transparent">
                        <Text className="text-[#4A3B32] font-semibold text-sm">{stepText}</Text>
                    </View>
                </View>
            </View>

            {/* Bottom Sheet Content */}
            <View
                className="absolute bottom-0 w-full bg-white rounded-t-[40px] items-center px-8 pt-8 pb-10"
                style={{
                    height: height * 0.40, // Adjust based on content needs
                    minHeight: 320
                }}
            >
                {/* Progress Bar */}
                <View className="w-24 h-1.5 bg-[#E0E0E0] rounded-full mb-8 overflow-hidden self-center">
                    {/* Design variant: The mockup shows a centered small bar? OR a wide bar? */}
                    {/* Looking at the mockup again (via user's verbal description or code): */}
                    {/* Previously: w-4/5 h-1.5 ... w-[30%] filled. */}
                    {/* Let's stick to a clean centered progress indicator. */}
                    <View
                        className="h-full rounded-full"
                        style={{
                            width: progressWidth as any,
                            backgroundColor: nextButtonColor
                        }}
                    />
                </View>

                {/* Dynamic Content (Title/Subtitle) */}
                <View className="flex-1 w-full items-center">
                    {children}
                </View>

                {/* Navigation Button */}
                <TouchableOpacity
                    className="w-16 h-16 rounded-full items-center justify-center mb-4 active:opacity-90 shadow-sm"
                    style={{ backgroundColor: nextButtonColor }}
                    onPress={onNext}
                >
                    <Ionicons name="arrow-forward" size={32} color="white" />
                </TouchableOpacity>

                {/* Safe Area Bottom Padding */}
                <View style={{ height: insets.bottom }} />
            </View>
        </View>
    );
};

export default OnboardingLayout;
