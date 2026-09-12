import { Field } from "@/components/field";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  type TextInput,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;
const FAKE_REQUEST_MS = 900;

interface FormErrors {
  email?: string;
  password?: string;
}

export default function Login() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const passwordRef = useRef<TextInput>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [shakeTrigger, setShakeTrigger] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scale = useSharedValue(1);
  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, { damping: 18, stiffness: 320 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 18, stiffness: 320 });
  }, [scale]);

  const handleFocusPassword = useCallback(
    () => passwordRef.current?.focus(),
    []
  );

  const handleSubmit = useCallback(() => {
    const nextErrors: FormErrors = {};

    if (!EMAIL_PATTERN.test(email.trim())) {
      nextErrors.email = "Informe um e-mail válido.";
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      nextErrors.password = `A senha precisa de ao menos ${MIN_PASSWORD_LENGTH} caracteres.`;
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setShakeTrigger((current) => current + 1);
      return;
    }

    setIsSubmitting(true);

    timerRef.current = setTimeout(
      () => setIsSubmitting(false),
      FAKE_REQUEST_MS
    );
  }, [email, password]);

  const handleGoToSignUp = useCallback(
    () => router.push("/register"),
    [router]
  );

  return (
    <View className="flex-1 bg-zinc-950">
      <LinearGradient
        colors={["#27272a", "#111113", "#09090b"]}
        style={{ flex: 1 }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "space-between",
              paddingBottom: insets.bottom + 24,
              paddingTop: insets.top + 16,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="px-6">
              <Animated.View entering={FadeIn.duration(400)}>
                <Pressable
                  accessibilityLabel="Voltar"
                  accessibilityRole="button"
                  className="h-11 w-11 items-center justify-center rounded-full border border-zinc-800 active:opacity-60"
                  hitSlop={8}
                  onPress={router.back}
                >
                  <Text className="font-roboto-medium text-white text-xl">
                    ←
                  </Text>
                </Pressable>
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(120).duration(700)}>
                <View className="mt-8 h-1 w-12 rounded-full bg-amber-500" />
                <Text className="mt-6 font-roboto-bold text-4xl text-white leading-[1.1]">
                  Bem-vindo{"\n"}de volta
                </Text>
                <Text className="mt-3 font-roboto text-base text-zinc-400">
                  Entre para ver seus agendamentos.
                </Text>
              </Animated.View>

              <View className="mt-10" style={{ gap: 18 }}>
                <Field
                  autoComplete="email"
                  delay={260}
                  error={errors.email}
                  keyboardType="email-address"
                  label="E-mail"
                  onChangeText={setEmail}
                  onSubmit={handleFocusPassword}
                  placeholder="voce@email.com"
                  returnKeyType="next"
                  shakeTrigger={shakeTrigger}
                  value={email}
                />

                <Field
                  autoComplete="current-password"
                  delay={340}
                  error={errors.password}
                  inputRef={passwordRef}
                  isSecure
                  label="Senha"
                  onChangeText={setPassword}
                  onSubmit={handleSubmit}
                  placeholder="••••••••"
                  returnKeyType="go"
                  shakeTrigger={shakeTrigger}
                  value={password}
                />
              </View>

              <Animated.View entering={FadeInDown.delay(420).duration(600)}>
                <Pressable
                  accessibilityLabel="Recuperar senha"
                  accessibilityRole="button"
                  className="mt-4 self-end active:opacity-60"
                  hitSlop={8}
                >
                  <Text className="font-roboto-medium text-amber-500 text-sm">
                    Esqueci minha senha
                  </Text>
                </Pressable>
              </Animated.View>
            </View>

            <Animated.View
              className="px-6"
              entering={FadeInUp.delay(520).duration(700)}
            >
              <Animated.View style={buttonStyle}>
                <Pressable
                  accessibilityLabel="Entrar na conta"
                  accessibilityRole="button"
                  className="h-14 items-center justify-center rounded-2xl bg-amber-500 active:opacity-90"
                  disabled={isSubmitting}
                  onPress={handleSubmit}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#09090b" />
                  ) : (
                    <Text className="font-roboto-semibold text-base text-zinc-950">
                      Entrar
                    </Text>
                  )}
                </Pressable>
              </Animated.View>

              <View className="mt-8 flex-row justify-center">
                <Text className="font-roboto text-sm text-zinc-500">
                  Ainda não tem conta?{" "}
                </Text>
                <Pressable
                  accessibilityLabel="Criar uma conta"
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={handleGoToSignUp}
                >
                  <Text className="font-roboto-semibold text-amber-500 text-sm">
                    Criar agora
                  </Text>
                </Pressable>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}
