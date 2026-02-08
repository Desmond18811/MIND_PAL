import React, { useRef } from 'react';
import { View, Text, PanResponder, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface VerticalSliderProps {
    currentQuestion: any;
    answers: any;
    setAnswers: (answers: any) => void;
    sleepValue: number;
    setSleepValue: (value: number) => void;
}

const VerticalSlider: React.FC<VerticalSliderProps> = ({ currentQuestion, answers, setAnswers, sleepValue, setSleepValue }) => {
    const options = currentQuestion.options || [];
    const sliderHeight = 350; // Height of the slider track

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt, gestureState) => {
                updateSleepValue(evt.nativeEvent.locationY);
            },
            onPanResponderMove: (evt, gestureState) => {
                updateSleepValue(evt.nativeEvent.locationY);
            },
        })
    ).current;

    const updateSleepValue = (y: number) => {
        // y goes from 0 (top) to sliderHeight (bottom)
        // We want to map this to 0-4 indices
        // 5 segments.
        // But visually Top is Index 0 (Excellent), Bottom is Index 4 (Worst) if we map linearly

        // Clamp y
        const clampedY = Math.max(0, Math.min(y, sliderHeight));

        const index = Math.floor((clampedY / sliderHeight) * 5);
        const safeIndex = Math.min(4, Math.max(0, index));

        if (safeIndex !== sleepValue) {
            setSleepValue(safeIndex);
            setAnswers({ ...answers, [currentQuestion.id]: options[safeIndex].id });
        }
    };

    return (
        <View className="flex-1 flex-row items-center justify-between px-4">
            {/* Left Labels */}
            <View className="h-[400px] justify-between items-start py-4">
                {options.map((opt: any, i: number) => (
                    <View key={i} className="h-12 justify-center">
                        <Text className={`font-[Urbanist-Bold] text-lg ${sleepValue === i ? 'text-[#4A3B32]' : 'text-gray-300'}`}>
                            {opt.label}
                        </Text>
                        <Text className={`font-[Urbanist-Medium] text-xs ${sleepValue === i ? 'text-gray-600' : 'text-gray-300'}`}>
                            {opt.subLabel}
                        </Text>
                    </View>
                ))}
            </View>

            {/* Slider Track Area */}
            <View
                className="h-[400px] items-center justify-center relative w-16"
                {...panResponder.panHandlers}
            >
                {/* Background Track */}
                <View className="w-4 h-[350px] bg-[#F0EAE2] rounded-full absolute" />

                {/* Active Track (Orange) */}
                <View
                    className="w-4 bg-[#E67E22] rounded-full absolute top-0"
                    style={{
                        height: (sleepValue + 0.5) * (350 / 5)
                    }}
                />

                {/* Thumb */}
                <View
                    className="w-12 h-12 bg-[#E67E22] rounded-full absolute border-4 border-[#FDF6F0] shadow-lg items-center justify-center z-10"
                    style={{
                        top: (sleepValue * (350 / 5)) + (350 / 10) - 24 + 25 // Center in segment
                    }}
                >
                    <Ionicons name="resize" size={16} color="white" style={{ transform: [{ rotate: '90deg' }] }} />
                </View>
            </View>

            {/* Right Icons */}
            <View className="h-[400px] justify-between items-end py-4">
                {options.map((opt: any, i: number) => {
                    const Icon = opt.svg;
                    return (
                        <View
                            key={i}
                            className={`h-12 w-12 items-center justify-center rounded-full transition-all ${sleepValue === i ? 'bg-opacity-100' : 'opacity-40'}`}
                            style={{ transform: [{ scale: sleepValue === i ? 1.1 : 1 }] }}
                        >
                            {Icon && <Icon width={48} height={48} />}
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

export default VerticalSlider;
