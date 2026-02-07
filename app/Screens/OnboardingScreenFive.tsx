import React from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ArrowRight } from "lucide-react-native";
import Svg, { Path } from "react-native-svg";
import Background5 from "../assets/background5.svg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function OnboardingScreenFive() {
  const navigation = useNavigation();

  return (
    <View className="flex-1 bg-[#E9DFF7]">
      {/* SVG Background */}
      <View className="absolute top-0 left-0 right-0 z-0">
        <Background5 width={SCREEN_WIDTH} height={SCREEN_WIDTH * 1.5} />
      </View>

      {/* Header */}
      <View className="absolute top-16 left-0 right-0 items-center z-20">
        <View className="px-6 py-2 rounded-full border border-[#5C4033] bg-[#E9DFF7]/90">
          <Text className="text-[#5C4033] font-semibold text-sm tracking-wide">Step Five</Text>
        </View>
      </View>

      {/* Spacer */}
      <View className="flex-1" />

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
            {/* 100% width for step 5 */}
            <View className="h-full w-full bg-[#5C4033] rounded-full" />
          </View>

          {/* Title */}
          <Text className="text-[28px] font-bold text-[#3D2817] text-center mb-1 leading-tight">
            Loving & Supportive
          </Text>
          <Text className="text-[28px] font-bold text-[#8A76F7] text-center mb-10 leading-tight">
            Community
          </Text>

          {/* Next Button */}
          <View className="items-center">
            <TouchableOpacity
              className="w-16 h-16 rounded-full bg-[#5C4033] items-center justify-center shadow-lg"
              onPress={() => navigation.navigate('SignUp')} // Final Step -> Welcome
            >
              <ArrowRight size={28} color="#fff" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}