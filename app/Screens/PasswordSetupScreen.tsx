import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import "../global.css";

const PasswordSetupScreen = ({ navigation }: { navigation: any }) => {
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    // Validation
    const hasLetters = /[A-Z]/.test(password); // Screenshot says A-Z, usually means uppercase? or just letters? "Must have A-Z" usu. means uppercase.
    const hasNumbers = /[0-9]/.test(password);

    // Strength Calculation
    const getStrength = () => {
        let score = 0;
        if (password.length > 5) score++;
        if (hasLetters) score++;
        if (hasNumbers) score++;
        if (password.length > 8) score++;
        return score; // Max 4
    };

    const strength = getStrength();
    const strengthColor = strength < 2 ? '#E67E22' : strength < 4 ? '#F1C40F' : '#9BB168';
    const strengthText = strength < 2 ? 'Weak!! Increase strength 💪' : strength < 4 ? 'Medium' : 'Strong! Great job';

    return (
        <View className="flex-1 bg-[#FBFBF9]">
            <StatusBar barStyle="dark-content" backgroundColor="#FBFBF9" />
            <SafeAreaView className="flex-1 px-6">

                {/* Header */}
                <View className="flex-row items-center mt-4 mb-8">
                    <TouchableOpacity
                        className="w-10 h-10 rounded-full border border-[#E8D5B7] justify-center items-center"
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="chevron-back" size={24} color="#4A3B32" />
                    </TouchableOpacity>
                    <Text className="text-xl font-[Urbanist-Bold] text-[#4A3B32] ml-4">Password Setup</Text>
                </View>

                {/* Password Display / Input */}
                <View className="mt-4 mb-8">
                    <View className="flex-row items-center justify-between border-2 border-[#F4A460] rounded-[30px] px-6 py-5 bg-white relative">
                        {/* We can use a TextInput, but design shows big dots. Let's use standard secure text input stylized. */}
                        <TextInput
                            className="flex-1 text-3xl font-[Urbanist-Bold] text-[#4A3B32] tracking-widest"
                            value={password}
                            onChangeText={setPassword}
                            placeholder="••••••"
                            secureTextEntry={!isPasswordVisible}
                            placeholderTextColor="#D3C1B0"
                        />
                        <TouchableOpacity
                            style={{ backgroundColor: '#F5F5F5', padding: 8, borderRadius: 20 }}
                            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                        >
                            <Ionicons name={isPasswordVisible ? "eye-off" : "eye"} size={20} color="#B0A090" />
                        </TouchableOpacity>

                        {/* Vertical bar aesthetic if strict to design? Design has a vertical line before the eye icon maybe? */}
                    </View>
                </View>

                {/* Strength Meter */}
                <Text className="text-center font-[Urbanist-Bold] text-[#4A3B32] text-lg mb-4">Password Strength</Text>

                <View className="flex-row justify-between mb-4 px-2">
                    {[1, 2, 3, 4].map((step) => (
                        <View
                            key={step}
                            className={`h-2 flex-1 mx-1 rounded-full ${step <= strength ? '' : 'bg-[#E0E0E0]'}`}
                            style={step <= strength ? { backgroundColor: strengthColor } : {}}
                        />
                    ))}
                </View>

                <Text className="text-center text-[#8B7B6B] font-[Urbanist-Medium] mb-8">{strengthText}</Text>

                {/* Requirements Chips */}
                <View className="flex-row justify-between mb-10">
                    <View className={`flex-1 mr-2 flex-row items-center justify-center border rounded-[20px] py-4 ${hasLetters ? 'border-[#9BB168] bg-[#F1F8E9]' : 'border-[#F4A460] bg-[#FFF3E0]'}`}>
                        <Ionicons name={hasLetters ? "checkmark-circle" : "warning"} size={20} color={hasLetters ? "#9BB168" : "#E67E22"} />
                        <Text className="ml-2 font-[Urbanist-Bold] text-[#4A3B32] text-xs">Must have A-Z</Text>
                    </View>
                    <View className={`flex-1 ml-2 flex-row items-center justify-center border rounded-[20px] py-4 ${hasNumbers ? 'border-[#9BB168] bg-[#F1F8E9]' : 'border-[#F4A460] bg-[#FFF3E0]'}`}>
                        <Ionicons name={hasNumbers ? "checkmark-circle" : "warning"} size={20} color={hasNumbers ? "#9BB168" : "#E67E22"} />
                        <Text className="ml-2 font-[Urbanist-Bold] text-[#4A3B32] text-xs">Must Have 0-9</Text>
                    </View>
                </View>

                {/* Continue Button */}
                <TouchableOpacity
                    className="bg-[#4A3B32] flex-row items-center justify-center py-4 rounded-full mt-auto mb-10"
                    onPress={() => {
                        navigation.navigate('OTPSetup');
                    }}
                >
                    <Text className="text-white text-lg font-[Urbanist-Bold] mr-2">Continue</Text>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                </TouchableOpacity>

            </SafeAreaView>
        </View>
    );
};

export default PasswordSetupScreen;
