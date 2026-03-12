import { Image, useWindowDimensions } from "react-native";
import {
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

type CategoryItem = {
  id: string;
  icon: any;
  title: string;
  value: string;
  screen: string;
};

export const useCategoryData = () => {
  const { width } = useWindowDimensions();

  // Scale icons proportionally to the screen width.
  // Baseline is a 390px phone (scale = 1). On a 800px tablet this gives ~2.05,
  // clamped at 2.4 so icons don't become enormous on very large displays.
  const scale = Math.min(width / 390, 2.4);
  const s = (base: number) => Math.round(base * scale);

  const categories: CategoryItem[] = [
    {
      id: "0",
      icon: <FontAwesome6 name="dumbbell" size={s(30)} color="#DE3163" />,
      title: "Wellness",
      value: "wellness_facilities",
      screen: "WellnessFacilities",
    },
    {
      id: "3",
      icon: (
        <Image
          source={require("@/assets/images/diseaseIcon.png")}
          resizeMode="contain"
          style={{ width: s(40), height: s(33), tintColor: "#DE3163" }}
        />
      ),
      title: "Diseases",
      value: "diseases",
      screen: "Diseases",
    },
    {
      id: "7",
      icon: <Ionicons name="fitness-outline" size={s(30)} color="#DE3163" />,
      title: "Healthy Living",
      value: "healthy_living",
      screen: "TopRated",
    },
    {
      id: "6",
      icon: <FontAwesome6 name="ribbon" size={s(26)} color="#DE3163" />,
      title: "Symptoms",
      value: "symptoms",
      screen: "Symptoms",
    },
    {
      id: "1",
      icon: <FontAwesome6 name="hospital" size={s(30)} color="#DE3163" />,
      title: "Hospitals",
      value: "hospitals_&_clinics",
      screen: "TopRated",
    },
    {
      id: "2",
      icon: (
        <Image
          source={require("@/assets/images/pharmacyIcon.png")}
          resizeMode="contain"
          style={{ width: s(40), height: s(33), tintColor: "#DE3163" }}
        />
      ),
      title: "Pharmacies",
      value: "pharmacies",
      screen: "TopRated",
    },
    {
      id: "4",
      icon: (
        <Image
          source={require("@/assets/images/bloodIcon.png")}
          resizeMode="contain"
          style={{ width: s(40), height: s(33), tintColor: "#DE3163" }}
        />
      ),
      title: "Plasence",
      value: "plasence",
      screen: "PeriodsTracker",
    },
    {
      id: "5",
      icon: <FontAwesome6 name="flask" size={s(22)} color="#DE3163" />,
      title: "Diagnostic Lab",
      value: "diagnostic_labs",
      screen: "TopRated",
    },
    {
      id: "8",
      icon: (
        <Image
          source={require("@/assets/images/herbalIcon.png")}
          resizeMode="contain"
          style={{ width: s(43), height: s(26), tintColor: "#DE3163" }}
        />
      ),
      title: "Herbal Hospital",
      value: "herbal_centers",
      screen: "TopRated",
    },
    {
      id: "9",
      icon: <FontAwesome6 name="truck-medical" size={s(24)} color="#DE3163" />,
      title: "Ambulance",
      value: "ambulance",
      screen: "TopRated",
    },
    {
      id: "10",
      icon: (
        <MaterialCommunityIcons
          name="shield-home-outline"
          size={s(30)}
          color="#DE3163"
        />
      ),
      title: "Homes",
      value: "homes",
      screen: "TopRated",
    },
    {
      id: "11",
      icon: (
        <Image
          source={require("@/assets/images/PhysiotherapyIcon.png")}
          style={{ width: s(30), height: s(30), tintColor: "#DE3163" }}
        />
      ),
      title: "Physiotherapy",
      value: "physiotherapy_centers",
      screen: "TopRated",
    },
    {
      id: "12",
      icon: (
        <Image
          source={require("@/assets/images/eyeCareIcon.png")}
          style={{ width: s(30), height: s(30), tintColor: "#DE3163" }}
        />
      ),
      title: "Eye Care",
      value: "eye_clinics",
      screen: "TopRated",
    },
    {
      id: "13",
      icon: (
        <Image
          source={require("@/assets/images/dentalIcon.png")}
          style={{ width: s(30), height: s(31), tintColor: "#DE3163" }}
        />
      ),
      title: "Dental",
      value: "dental_clinics",
      screen: "TopRated",
    },
    {
      id: "14",
      icon: (
        <FontAwesome6
          name="bone"
          size={s(24)}
          color="#DE3163"
          style={{ transform: [{ rotate: "45deg" }] }}
        />
      ),
      title: "Osteopathy",
      value: "osteopathy_centers",
      screen: "TopRated",
    },
    {
      id: "15",
      icon: (
        <Image
          source={require("@/assets/images/artificialIcon.png")}
          style={{ width: s(50), height: s(40), tintColor: "#DE3163" }}
        />
      ),
      title: "Prosthetics",
      value: "prosthetics_centers",
      screen: "TopRated",
    },
    {
      id: "16",
      icon: <Ionicons name="school-outline" size={s(40)} color="#DE3163" />,
      title: "Health Schools",
      value: "health_schools",
      screen: "TopRated",
    },
    {
      id: "17",
      icon: (
        <Image
          source={require("@/assets/images/mentalHealthIcon.png")}
          style={{ width: s(40), height: s(40), tintColor: "#DE3163" }}
        />
      ),
      title: "Psychiatric",
      value: "psychiatric_centers",
      screen: "TopRated",
    },
  ];

  return { categories, width };
};
