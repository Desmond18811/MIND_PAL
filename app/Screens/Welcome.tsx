import { View, Text, TouchableOpacity } from "react-native";
import { ArrowRight } from "lucide-react-native";
import Logo from "../assets/logo.svg";
import Welcome from "../assets/illustration.svg";
import { useNavigation } from "@react-navigation/native";


export default function WelcomeScreen() {

  const navigation = useNavigation()

  const handleGetStarted = () => {
    navigation.navigate('Onboarding')
  }

  const handleSignIn = () => {
    navigation.navigate('SignIn')
  }

  return (
    <View className="flex-1 bg-[#F7F4F2] px-6 pt-[60px] pb-10">
      {/* Top Section: Logo & Titles */}
      <View className="items-center mb-10">
        {/* Logo */}
        <View className="w-20 h-20 rounded-full bg-[#5C4033] items-center justify-center mb-5">
          <Logo width={60} height={60} />
        </View>
        {/* Title */}
        <Text className="text-[28px] font-bold text-[#3D2817] mb-3 text-center">
          Welcome to MindPal!!
        </Text>
        {/* Subtitle */}
        <Text className="text-[15px] text-[#6B5A4A] text-center leading-[22px] px-5">
          Your mindful mental health AI companion{"\n"}
          for everyone, anywhere 🌿
        </Text>
      </View>
      {/* Middle Section: Illustration */}
      <View className="flex-1 items-center justify-center my-5">
        <Welcome width={300} height={490} />
      </View>
      {/* Bottom Section: Buttons */}
      <View className="items-center gap-4 my-20">
        {/* CTA Button */}
        <TouchableOpacity className="flex-row items-center justify-center bg-[#5C4033] py-4 px-8 rounded-[30px] gap-2 w-full max-w-[280px] shadow-[0_4px_8px_rgba(0,0,0,0.15)]"
          onPress={handleGetStarted}
        >
          <Text className="text-white text-[17px] font-semibold">
            Get Started
          </Text>
          <ArrowRight size={20} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>
        {/* Sign In */}
        <View className="flex-row items-center mt-2">
          <Text className="text-sm text-[#6B5A4A]">
            Already have an account?{" "}
          </Text>
          <TouchableOpacity
            onPress={handleSignIn}
          >
            <Text className="text-sm text-[#E67E22] font-semibold">
              Sign In.
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
