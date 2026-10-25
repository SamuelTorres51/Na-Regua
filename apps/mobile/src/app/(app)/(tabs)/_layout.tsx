import { router, Tabs } from "expo-router";
import {
  TabBar,
  type TabBarActionConfig,
  type TabBarProps,
} from "@/components/navigation/tab-bar";
import { Icon, type IconName } from "@/components/ui/icon";
import { colors } from "@/theme/colors";

interface TabIconProps {
  focused: boolean;
}

function createTabIcon(activeIcon: IconName, inactiveIcon: IconName) {
  return function TabIcon({ focused }: TabIconProps) {
    return (
      <Icon
        name={focused ? activeIcon : inactiveIcon}
        size="lg"
        tone={focused ? "accent" : "muted"}
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
