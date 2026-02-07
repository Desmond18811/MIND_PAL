import React from "react";
import { View, Text, TouchableOpacity, Dimensions, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ArrowRight } from "lucide-react-native";
import Svg, { Path, Mask, G } from "react-native-svg";
import Background3 from "../assets/background3.svg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function OnboardingScreenThree() {
  const navigation = useNavigation();

  return (
    <View className="flex-1 bg-[#C9C7C5]">
      {/* SVG Background */}
      <View className="absolute top-0 left-0 right-0 bottom-0">
        <Svg width={SCREEN_WIDTH} height="100%" viewBox="0 0 375 587" fill="none" preserveAspectRatio="xMidYMid slice">
          <Mask id="mask0_22_2792" maskContentUnits="userSpaceOnUse" x="-106" y="44" width="729" height="498">
            <Path d="M307.087 73.4395C205.222 27.0901 64.6584 34.5846 29.7095 102.988C7.48609 146.419 35.98 203.119 5.24222 240.715C-14.6759 265.072 -25.096 268.021 -49.5018 287.863C-70.4035 304.849 -88.5695 321.466 -98.4056 347.666C-112.084 384.033 -106.336 425.959 -84.9424 457.964C-66.5305 485.516 -34.5325 499.768 -4.68608 511.194C37.7321 527.412 84.1461 534.292 129.361 532.295C191.79 529.562 253.665 508.122 315.602 516.416C345.663 520.439 374.403 531.374 404.157 537.302C461.514 548.697 532.426 539.329 566.76 485.27C581.207 462.51 586.371 435.604 583.143 408.912C579.578 379.487 571.125 349.201 577.149 319.5C583.85 286.511 607.887 259.697 618.092 227.661C635.551 172.896 604.291 107.134 550.93 86.3706C529.967 78.2004 507.067 76.4803 484.567 76.3574C424.444 75.9888 361.893 98.3803 307.087 73.4395Z" fill="white" />
          </Mask>
          <G mask="url(#mask0_22_2792)">
            <Path d="M678 0H-149V562.458H678V0Z" fill="#F5F5F5" />
          </G>
        </Svg>
      </View>

      {/* Header */}
      <View className="absolute top-12 left-0 right-0 items-center z-20">
        <View className="px-6 py-2 rounded-full border border-[#C9C7C5] bg-white/90">
          <Text className="text-[#3F3C36] font-semibold text-sm tracking-wide">Step Three</Text>
        </View>
      </View>

      {/* Main Illustration Area */}
      <View className="flex-1 items-center justify-center mt-10 -mb-24 z-10 relative">
        {/* Person */}
        <Background3 width={SCREEN_WIDTH} height={SCREEN_WIDTH * 1.2} />
      </View>

      {/* White Bottom Section */}
      <View className="absolute bottom-0 left-0 right-0 z-50" style={{ height: 280 }}>
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
            {/* 60% width for step 3 of 5 */}
            <View className="h-full bg-[#5C4033] rounded-full" style={{ width: '60%' }} />
          </View>

          {/* Title */}
          <Text className="text-[28px] font-bold text-[#5C4033] text-center mb-1 leading-tight">
            AI <Text className="text-[#736B66]">Mental Journaling</Text>
          </Text>
          <Text className="text-[28px] font-bold text-[#5C4033] text-center mb-10 leading-tight">
            & AI Therapy Chatbot
          </Text>

          {/* Next Button */}
          <View className="items-center">
            <TouchableOpacity
              className="w-16 h-16 rounded-full bg-[#5C4033] items-center justify-center shadow-lg"
              onPress={() => navigation.navigate('OnboardingFour')}
            >
              <ArrowRight size={28} color="#fff" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}