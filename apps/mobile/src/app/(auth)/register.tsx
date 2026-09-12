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
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BORDER_FOCUSED, BORDER_IDLE, Field } from "../../components/field";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UPPERCASE_PATTERN = /[A-Z]/;
const DIGIT_PATTERN = /\d/;
const SYMBOL_PATTERN = /[^A-Za-z0-9]/;
const NON_DIGIT_PATTERN = /\D/g;

const MIN_PASSWORD_LENGTH = 8;
const MIN_PHONE_DIGITS = 10;
const MAX_PHONE_DIGITS = 11;
const PHONE_MASK_LENGTH = 15;
const MAX_SCORE = 4;
const FAKE_REQUEST_MS = 900;
const METER_DURATION = 280;
const CHECKBOX_DURATION = 180;

const SCORE_COLORS = [BORDER_IDLE, "#f87171", "#fbbf24", "#a3e635", "#4ade80"];
const SCORE_LABELS = ["", "Fraca", "Razoável", "Boa", "Forte"];
const SCORE_STEPS = [0, 1, 2, 3, 4];

function formatPhone(raw: string) {
  const digits = raw.replace(NON_DIGIT_PATTERN, "").slice(0, MAX_PHONE_DIGITS);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function countDigits(value: string) {
  return value.replace(NON_DIGIT_PATTERN, "").length;
}

function getPasswordScore(value: string) {
  let score = 0;

  if (value.length >= MIN_PASSWORD_LENGTH) {
    score += 1;
  }
  if (UPPERCASE_PATTERN.test(value)) {
    score += 1;
  }
  if (DIGIT_PATTERN.test(value)) {
    score += 1;
  }
  if (SYMBOL_PATTERN.test(value)) {
    score += 1;
  }

  return score;
}

interface PasswordMeterProps {
  score: number;
}

function PasswordMeter({ score }: PasswordMeterProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(score, { duration: METER_DURATION });
  }, [progress, score]);

  const barStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      SCORE_STEPS,
      SCORE_COLORS
    ),
    width: `${(progress.value / MAX_SCORE) * 100}%`,
  }));

  return (
    <View className="mt-3">
      <View className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
        <Animated.View className="h-full rounded-full" style={barStyle} />
      </View>

      {score > 0 ? (
        <Animated.Text
          className="mt-2 font-roboto text-xs text-zinc-500"
          entering={FadeIn.duration(200)}
          key={score}
        >
          Força da senha: {SCORE_LABELS[score]}
        </Animated.Text>
      ) : null}
    </View>
  );
}

interface TermsCheckboxProps {
  hasError: boolean;
  isChecked: boolean;
  onToggle: () => void;
}

function TermsCheckbox({ hasError, isChecked, onToggle }: TermsCheckboxProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(Number(isChecked), {
      duration: CHECKBOX_DURATION,
    });
  }, [isChecked, progress]);

  const boxStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ["rgba(245, 158, 11, 0)", BORDER_FOCUSED]
    ),
    borderColor: interpolateColor(
      progress.value,
      [0, 1],
      [BORDER_IDLE, BORDER_FOCUSED]
    ),
    transform: [{ scale: 0.92 + progress.value * 0.08 }],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  return (
    <View>
      <Pressable
        accessibilityLabel="Aceitar os termos de uso"
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isChecked }}
        className="mt-6 flex-row items-center active:opacity-70"
        hitSlop={6}
        onPress={onToggle}
      >
        <Animated.View
          className="h-6 w-6 items-center justify-center rounded-lg border"
          style={boxStyle}
        >
          <Animated.Text
            className="font-roboto-bold text-sm text-zinc-950"
            style={checkStyle}
          >
            ✓
          </Animated.Text>
        </Animated.View>

        <Text className="ml-3 flex-1 font-roboto text-sm text-zinc-400">
          Li e aceito os termos de uso e a política de privacidade.
        </Text>
      </Pressable>

      {hasError ? (
        <Animated.Text
          className="mt-2 font-roboto text-red-400 text-xs"
          entering={FadeIn.duration(220)}
        >
          É preciso aceitar os termos para continuar.
        </Animated.Text>
      ) : null}
    </View>
  );
}

interface FormErrors {
  confirmPassword?: string;
  email?: string;
  fullName?: string;
  password?: string;
  phone?: string;
  terms?: boolean;
}

export default function Register() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [shakeTrigger, setShakeTrigger] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scale = useSharedValue(1);
  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const passwordScore = getPasswordScore(password);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, { damping: 18, stiffness: 320 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 18, stiffness: 320 });
  }, [scale]);

  const handleChangePhone = useCallback(
    (value: string) => setPhone(formatPhone(value)),
    []
  );

  const handleToggleTerms = useCallback(
    () => setHasAcceptedTerms((current) => !current),
    []
  );

  const handleFocusEmail = useCallback(() => emailRef.current?.focus(), []);
  const handleFocusPhone = useCallback(() => phoneRef.current?.focus(), []);
  const handleFocusPassword = useCallback(
    () => passwordRef.current?.focus(),
    []
  );
  const handleFocusConfirm = useCallback(() => confirmRef.current?.focus(), []);

  const handleSubmit = useCallback(() => {
    const nextErrors: FormErrors = {};

    if (!fullName.trim().includes(" ")) {
      nextErrors.fullName = "Informe seu nome e sobrenome.";
    }

    if (!EMAIL_PATTERN.test(email.trim())) {
      nextErrors.email = "Informe um e-mail válido.";
    }

    if (countDigits(phone) < MIN_PHONE_DIGITS) {
      nextErrors.phone = "Informe um telefone com DDD.";
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      nextErrors.password = `A senha precisa de ao menos ${MIN_PASSWORD_LENGTH} caracteres.`;
    }

    if (confirmPassword !== password) {
      nextErrors.confirmPassword = "As senhas não conferem.";
    }

    if (!hasAcceptedTerms) {
      nextErrors.terms = true;
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setShakeTrigger((current) => current + 1);
      return;
    }

    setIsSubmitting(true);

    // PROVISÓRIO: troque pela chamada real de cadastro e, no sucesso,
    // navegue para a área logada (router.replace("/inicio")).
    timerRef.current = setTimeout(
      () => setIsSubmitting(false),
      FAKE_REQUEST_MS
    );
  }, [confirmPassword, email, fullName, hasAcceptedTerms, password, phone]);

  const handleGoToLogin = useCallback(() => router.push("/login"), [router]);

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
                  Criar{"\n"}conta
                </Text>
                <Text className="mt-3 font-roboto text-base text-zinc-400">
                  Leva menos de um minuto.
                </Text>
              </Animated.View>

              <View className="mt-10" style={{ gap: 18 }}>
                <Field
                  autoCapitalize="words"
                  autoComplete="name"
                  delay={220}
                  error={errors.fullName}
                  label="Nome completo"
                  onChangeText={setFullName}
                  onSubmit={handleFocusEmail}
                  placeholder="Seu nome e sobrenome"
                  returnKeyType="next"
                  shakeTrigger={shakeTrigger}
                  value={fullName}
                />

                <Field
                  autoComplete="email"
                  delay={280}
                  error={errors.email}
                  inputRef={emailRef}
                  keyboardType="email-address"
                  label="E-mail"
                  onChangeText={setEmail}
                  onSubmit={handleFocusPhone}
                  placeholder="voce@email.com"
                  returnKeyType="next"
                  shakeTrigger={shakeTrigger}
                  value={email}
                />

                <Field
                  autoComplete="tel"
                  delay={340}
                  error={errors.phone}
                  inputRef={phoneRef}
                  keyboardType="phone-pad"
                  label="Telefone"
                  maxLength={PHONE_MASK_LENGTH}
                  onChangeText={handleChangePhone}
                  onSubmit={handleFocusPassword}
                  placeholder="(89) 99999-9999"
                  returnKeyType="next"
                  shakeTrigger={shakeTrigger}
                  value={phone}
                />

                <View>
                  <Field
                    autoComplete="new-password"
                    delay={400}
                    error={errors.password}
                    inputRef={passwordRef}
                    isSecure
                    label="Senha"
                    onChangeText={setPassword}
                    onSubmit={handleFocusConfirm}
                    placeholder="Mínimo de 8 caracteres"
                    returnKeyType="next"
                    shakeTrigger={shakeTrigger}
                    value={password}
                  />

                  {password.length > 0 ? (
                    <PasswordMeter score={passwordScore} />
                  ) : null}
                </View>

                <Field
                  autoComplete="new-password"
                  delay={460}
                  error={errors.confirmPassword}
                  inputRef={confirmRef}
                  isSecure
                  label="Confirmar senha"
                  onChangeText={setConfirmPassword}
                  onSubmit={handleSubmit}
                  placeholder="Repita a senha"
                  returnKeyType="go"
                  shakeTrigger={shakeTrigger}
                  value={confirmPassword}
                />
              </View>

              <Animated.View entering={FadeInDown.delay(520).duration(600)}>
                <TermsCheckbox
                  hasError={Boolean(errors.terms)}
                  isChecked={hasAcceptedTerms}
                  onToggle={handleToggleTerms}
                />
              </Animated.View>
            </View>

            <Animated.View
              className="mt-10 px-6"
              entering={FadeInUp.delay(600).duration(700)}
            >
              <Animated.View style={buttonStyle}>
                <Pressable
                  accessibilityLabel="Criar a conta"
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
                      Criar conta
                    </Text>
                  )}
                </Pressable>
              </Animated.View>

              <View className="mt-8 flex-row justify-center">
                <Text className="font-roboto text-sm text-zinc-500">
                  Já tem conta?{" "}
                </Text>
                <Pressable
                  accessibilityLabel="Entrar com uma conta existente"
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={handleGoToLogin}
                >
                  <Text className="font-roboto-semibold text-amber-500 text-sm">
                    Entrar
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
