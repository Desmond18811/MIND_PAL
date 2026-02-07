import React from "react";
import { View, Text, TouchableOpacity, Image, Dimensions } from "react-native";
import { ArrowRight } from "lucide-react-native";
import Svg, { Path } from "react-native-svg";
import Step1Svg from "../assets/step1.svg";
import Cloud1 from "../assets/cloud1.svg";
import Cloud2 from "../assets/cloud2.svg";
import Cloud3 from "../assets/cloud3.svg";
import { useNavigation } from "@react-navigation/native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function OnboardingStepOne() {

  const navigation = useNavigation()

  return (
    <View className="flex-1 bg-[#E6E8D6]">
      {/* Static Clouds */}
      <View className="absolute top-0 left-0 right-0 h-[400px] z-0">
        {/* Top Left Cloud */}
        <View className="absolute -left-10 top-12 opacity-80">
          <Cloud1 width={140} height={70} />
        </View>

        {/* Top Right Cloud */}
        <View className="absolute -right-8 top-16 opacity-80">
          <Cloud2 width={140} height={70} />
        </View>

        {/* Middle Left Cloud */}
        <View className="absolute left-8 top-32 opacity-80">
          <Image
            source={require("../assets/cloud4.png")}
            className="w-[100px] h-[60px]"
            resizeMode="contain"
            style={{ opacity: 0.7 }}
          />
        </View>

        {/* Middle Right Cloud - Cloud3 */}
        <View className="absolute right-12 top-24 opacity-80">
          <Cloud3 width={110} height={55} />
        </View>
      </View>

      {/* Header */}
      <View className="absolute top-16 left-0 right-0 items-center z-20">
        <View className="px-5 py-1.5 rounded-full border border-[#5C4033] bg-transparent">
          <Text className="text-[#5C4033] font-semibold text-sm tracking-wide">Step One</Text>
        </View>
      </View>

      {/* Character Illustration */}
      <View className="flex-1 items-center justify-center mt-10 -mb-22 z-0">
        <Step1Svg width={SCREEN_WIDTH} height={SCREEN_WIDTH * 1.1} />
      </View>

      {/* White Bottom Section */}
      <View className="absolute bottom-0 left-0 right-0 z-10" style={{ height: 280 }}>
        {/* Curved Top */}
        <Svg
          height="100"
          width={SCREEN_WIDTH}
          viewBox={`0 0 ${SCREEN_WIDTH} 100`}
          style={{ position: "absolute", top: -99 }}
        >
          <Path
            d={`M 0 100 L 0 50 Q ${SCREEN_WIDTH / 2} -40 ${SCREEN_WIDTH} 50 L ${SCREEN_WIDTH} 100 Z`}
            fill="#FFFFFF"
          />
        </Svg>

        {/* Main White Background */}
        <View className="flex-1 bg-white px-8 pt-2 pb-10">
          {/* Progress Bar */}
          <View className="w-2/3 self-center h-2 bg-[#EFE5DA] rounded-full mb-8 overflow-hidden">
            <View className="h-full w-1/4 bg-[#5C4033] rounded-full" />
          </View>

          {/* Title */}
          <Text className="text-[28px] font-bold text-[#3D2817] text-center mb-1 leading-tight">
            Personalize Your Mental
          </Text>
          <Text className="text-[28px] font-bold text-center mb-10 leading-tight">
            <Text className="text-[#8B9B6B]">Health State</Text>
            <Text className="text-[#3D2817]"> With AI</Text>
          </Text>

          {/* Next Button */}
          <View className="items-center">
            <TouchableOpacity className="w-16 h-16 rounded-full bg-[#5C4033] items-center justify-center shadow-lg"
              onPress={() => navigation.navigate('OnboardingTwo')}
            >
              <ArrowRight size={28} color="#fff" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}