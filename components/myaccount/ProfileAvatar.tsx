import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, Text, View } from "react-native";

const ProfileAvatar = ({ uri, name }: { uri: string; name: string }) => {
  const handleEditPhoto = () => {
    // Navigate to Image Picker / Camera screen
    console.log("Trigger image upload");
  };

  return (
    <View className="items-center justify-center my-8">
      <View className="relative">
        <View className="size-36 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-100">
          <Image
            source={{ uri }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        {/* Floating Edit Button */}
        <Pressable
          onPress={handleEditPhoto}
          className="absolute bottom-1 right-1 bg-green-500 size-10 rounded-full border-4 border-white items-center justify-center shadow-lg"
        >
          <Ionicons name="pencil" size={16} color="white" />
        </Pressable>
      </View>

      <Text className="text-2xl font-black text-slate-800 mt-4 tracking-tight">
        {name}
      </Text>
    </View>
  );
};

export default ProfileAvatar;
