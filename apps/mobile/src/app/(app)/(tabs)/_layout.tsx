import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import { TabBar, type TabBarProps } from "@/components/navigation/tab-bar";
import { colors } from "@/theme/colors";

type IconName = ComponentProps<typeof Ionicons>["name"];

interface TabIconProps {
  color: string;
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

function renderTabBar(props: TabBarProps) {
  return <TabBar {...props} />;
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
