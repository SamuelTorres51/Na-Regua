import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeOutUp,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FRASES = [
  "Agende seu corte em menos de um minuto.",
  "Escolha o barbeiro e o horário que você prefere.",
  "Sem mensagem, sem ligação, sem fila de espera.",
];

const INVERVALO_MS = 3800;

export default function BemVindo() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndice((atual: number) => (atual + 1) % FRASES.length);
    }, INVERVALO_MS);

    return () => clearInterval(id);
  }, []);

  return (
    <View className="flex-1 bg-zinc-950">
      <LinearGradient
        colors={["#27272a", "#111113", "#09090b"]}
        style={{ flex: 1 }}
      >
        <View
          className="flex-1 justify-between px-6"
          style={{
            paddingBottom: insets.bottom + 24,
            paddingTop: insets.top + 40,
          }}
        >
          {/* Marca */}
          <Animated.View entering={FadeInDown.delay(150).duration(700)}>
            <View className="h-1 w-12 rounded-full bg-amber-500" />
            <Text className="mt-6 font-roboto-bold text-6xl text-white leading-[1.05]">
              Na{"\n"}Régua
            </Text>
            <Text className="mt-4 font-roboto text-base text-zinc-400">
              A sua barbearia, no seu tempo.
            </Text>
          </Animated.View>

          {/* Frases que se alternam */}
          <View className="h-32 justify-center">
            <Animated.View
              entering={FadeInDown.duration(500)}
              exiting={FadeOutUp.duration(400)}
              key={indice}
            >
              <Text className="font-roboto-medium text-2xl text-zinc-100 leading-snug">
                {FRASES[indice]}
              </Text>
            </Animated.View>

            <View className="mt-8 flex-row gap-2">
              {FRASES.map((frase, i) => (
                <View
                  className={
                    i === indice
                      ? "h-1.5 w-7 rounded-full bg-amber-500"
                      : "h-1.5 w-1.5 rounded-full bg-zinc-700"
                  }
                  key={frase}
                />
              ))}
            </View>
          </View>

          {/* Ações */}
          <Animated.View
            entering={FadeInUp.delay(500).duration(700)}
            style={{ gap: 12 }}
          >
            <Pressable
              accessibilityLabel="Criar uma conta"
              accessibilityRole="button"
              className="items-center rounded-2xl bg-amber-500 py-4 active:opacity-80"
              // biome-ignore lint/performance/noJsxPropsBind: .
              onPress={() => router.push("/cadastro")}
            >
              <Text className="font-roboto-semibold text-base text-zinc-950">
                Criar conta
              </Text>
            </Pressable>

            <Pressable
              accessibilityLabel="Entrar com uma conta existente"
              accessibilityRole="button"
              className="items-center rounded-2xl border border-zinc-700 py-4 active:opacity-70"
              // biome-ignore lint/performance/noJsxPropsBind: <.>
              onPress={() => router.push("/login")}
            >
              <Text className="font-roboto-medium text-base text-white">
                Já tenho conta
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </LinearGradient>
    </View>
  );
}
