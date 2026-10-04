import { useRouter } from "expo-router";
import { useCallback } from "react";
import { View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GradientBackground } from "@/components/layout/gradient-background";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenHeader } from "@/components/ui/screen-header";
import { layout } from "@/theme/styles";

const BOTTOM_SPACING = 24;
const TOP_SPACING = 16;

// PROVISÓRIA: destino do login até a issue de navegação principal, que
// substitui esta tela pela tab bar da área logada.
export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleGoToAppointments = useCallback(
    () => router.push("/appointments"),
    [router]
  );

  return (
    <GradientBackground>
      <View
        className="flex-1 justify-between px-6"
        style={{
          paddingBottom: insets.bottom + BOTTOM_SPACING,
          paddingTop: insets.top + TOP_SPACING,
        }}
      >
        <ScreenHeader
          subtitle="O que você quer fazer hoje?"
          title={"Olá,\ntudo certo?"}
        />

        <Animated.View
          entering={FadeInUp.delay(400).duration(700)}
          style={layout.actionGroup}
        >
          <PrimaryButton
            accessibilityLabel="Ver meus agendamentos"
            label="Meus agendamentos"
            onPress={handleGoToAppointments}
          />
        </Animated.View>
      </View>
    </GradientBackground>
  );
}
