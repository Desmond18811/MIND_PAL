

import React from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ArrowRight } from "lucide-react-native";
import Svg, { Path } from "react-native-svg";
import Step2Svg from "../assets/step2.svg";
import BigCloud from "../assets/bigcloud.svg";
import DeadEmoji from "../assets/dead.svg";
import SadEmoji from "../assets/sad.svg";
import SecondEmoji from "../assets/secondemoji.svg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function OnboardingScreenTwo() {
  const navigation = useNavigation();

  return (
    <View className="flex-1 bg-[#FFD6A5]">
      {/* Background Cloud */}
      <View className="absolute top-0 left-0 right-0 z-0">
        <BigCloud width={SCREEN_WIDTH} height={SCREEN_WIDTH * 1.2} style={{ opacity: 0.6 }} />
      </View>

      {/* Header */}
      <View className="absolute top-16 left-0 right-0 items-center z-20">
        <View className="px-6 py-2 rounded-full border border-[#5C4033] bg-[#FFD6A5]/80">
          <Text className="text-[#5C4033] font-semibold text-sm tracking-wide">Step Two</Text>
        </View>
      </View>

      {/* Main Illustration Area */}
      <View className="flex-1 items-center justify-center mt-10 -mb-24 z-10 relative">
        {/* Person */}
        <Step2Svg width={SCREEN_WIDTH} height={SCREEN_WIDTH * 1.1} />

        {/* Floating Emojis - Positioned relative to container */}
        <View className="absolute top-0 right-10">
          <DeadEmoji width={70} height={70} />
        </View>

        <View className="absolute bottom-40 left-6">
          <SadEmoji width={70} height={70} />
        </View>

        <View className="absolute bottom-60 right-4">
          <SecondEmoji width={75} height={75} />
        </View>
      </View>

      {/* White Bottom Section */}
      <View className="absolute bottom-0 left-0 right-0 z-20" style={{ height: 280 }}>
        {/* Curved Top */}
        <Svg
          height="100"
          width={SCREEN_WIDTH}
          viewBox={`0 0 ${SCREEN_WIDTH} 100`}
          style={{ position: "absolute", top: -99 }}
        >
          <Path
            d={`M 0 100 L 0 40 Q ${SCREEN_WIDTH / 2} -40 ${SCREEN_WIDTH} 40 L ${SCREEN_WIDTH} 100 Z`}
            fill="#FFFFFF"
          />
        </Svg>

        {/* Main White Content */}
        <View className="flex-1 bg-white px-8 pt-4 pb-10">
          {/* Progress Bar */}
          <View className="w-2/3 self-center h-2 bg-[#EFE5DA] rounded-full mb-8 overflow-hidden">
            {/* 50% width to represent step 2 of ~4 */}
            <View className="h-full w-2/4 bg-[#5C4033] rounded-full" />
          </View>

          {/* Title */}
          <Text className="text-[28px] font-bold text-[#E67E22] text-center mb-1 leading-tight">
            Intelligent <Text className="text-[#3D2817]">Mood Tracking</Text>
          </Text>
          <Text className="text-[28px] font-bold text-[#3D2817] text-center mb-10 leading-tight">
            & AI Emotion Insights
          </Text>

          {/* Next Button */}
          <View className="items-center">
            <TouchableOpacity
              className="w-16 h-16 rounded-full bg-[#5C4033] items-center justify-center shadow-lg"
              onPress={() => navigation.navigate('OnboardingThree')}
            >
              <ArrowRight size={28} color="#fff" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}