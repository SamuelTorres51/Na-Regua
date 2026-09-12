import { useRouter } from "expo-router";
import { useCallback } from "react";
import { Text, View } from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeOutUp,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GradientBackground } from "@/components/layout/gradient-background";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { StepDots } from "@/components/ui/step-dots";
import { useRotatingIndex } from "@/hooks/use-rotating-index";
import { layout } from "@/theme/styles";

const HIGHLIGHTS = [
  "Agende seu corte em menos de um minuto.",
  "Escolha o barbeiro e o horário que você prefere.",
  "Sem mensagem, sem ligação, sem fila de espera.",
];

const HIGHLIGHT_INTERVAL_MS = 3800;
const BOTTOM_SPACING = 24;
const TOP_SPACING = 40;

export default function Welcome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const activeIndex = useRotatingIndex(
    HIGHLIGHTS.length,
    HIGHLIGHT_INTERVAL_MS
  );

  const handleGoToRegister = useCallback(
    () => router.push("/register"),
    [router]
  );
  const handleGoToLogin = useCallback(() => router.push("/login"), [router]);

  return (
    <GradientBackground>
      <View
        className="flex-1 justify-between px-6"
        style={{
          paddingBottom: insets.bottom + BOTTOM_SPACING,
          paddingTop: insets.top + TOP_SPACING,
        }}
      >
        <Animated.View entering={FadeInDown.delay(150).duration(700)}>
          <View className="h-1 w-12 rounded-full bg-brand" />
          <Text className="mt-6 font-roboto-bold text-6xl text-white leading-[1.05]">
            Na{"\n"}Régua
          </Text>
          <Text className="mt-4 font-roboto text-base text-zinc-400">
            A sua barbearia, no seu tempo.
          </Text>
        </Animated.View>

        <View className="h-32 justify-center">
          <Animated.View
            entering={FadeInDown.duration(500)}
            exiting={FadeOutUp.duration(400)}
            key={activeIndex}
          >
            <Text className="font-roboto-medium text-2xl text-zinc-100 leading-snug">
              {HIGHLIGHTS[activeIndex]}
            </Text>
          </Animated.View>

          <StepDots activeIndex={activeIndex} steps={HIGHLIGHTS} />
        </View>

        <Animated.View
          entering={FadeInUp.delay(500).duration(700)}
          style={layout.actionGroup}
        >
          <PrimaryButton
            accessibilityLabel="Criar uma conta"
            label="Criar conta"
            onPress={handleGoToRegister}
          />
          <SecondaryButton
            accessibilityLabel="Entrar com uma conta existente"
            label="Já tenho conta"
            onPress={handleGoToLogin}
          />
        </Animated.View>
      </View>
    </GradientBackground>
  );
}
