import Ionicons from "@expo/vector-icons/Ionicons";
import { router, Tabs } from "expo-router";
import type { ComponentProps } from "react";
import type { ColorValue } from "react-native";
import {
  TabBar,
  type TabBarActionConfig,
  type TabBarProps,
} from "@/components/navigation/tab-bar";
import { colors } from "@/theme/colors";

type IconName = ComponentProps<typeof Ionicons>["name"];

interface TabIconProps {
  color: ColorValue;
  focused: boolean;
  size: number;
}

function createTabIcon(activeIcon: IconName, inactiveIcon: IconName) {
  return function TabIcon({ color, focused, size }: TabIconProps) {
    return (
      <Ionicons
        color={color}
        name={focused ? activeIcon : inactiveIcon}
        size={size}
      />
    );
  };
}

const HomeIcon = createTabIcon("home", "home-outline");
const AppointmentsIcon = createTabIcon("calendar", "calendar-outline");
const ProfileIcon = createTabIcon("person", "person-outline");

const BOOKING_ACTION: TabBarActionConfig = {
  accessibilityLabel: "Agendar um horário",
  icon: "add",
  label: "Agendar",
  onPress: () => router.push("/booking"),
  position: 1,
};

function renderTabBar(props: TabBarProps) {
  return <TabBar {...props} action={BOOKING_ACTION} />;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        animation: "fade",
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
      }}
      tabBar={renderTabBar}
    >
      <Tabs.Screen
        name="index"
        options={{ tabBarIcon: HomeIcon, title: "Início" }}
      />
      <Tabs.Screen
        name="appointments"
        options={{ tabBarIcon: AppointmentsIcon, title: "Agendamentos" }}
      />
      <Tabs.Screen
        name="profile"
        options={{ tabBarIcon: ProfileIcon, title: "Perfil" }}
      />
    </Tabs>
  );
}
