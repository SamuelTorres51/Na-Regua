import { useRouter } from "expo-router";
import { useCallback } from "react";
import { View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { FormField } from "@/components/form/form-field";
import { FormScreen } from "@/components/layout/form-screen";
import { BackButton } from "@/components/ui/back-button";
import { FooterPrompt } from "@/components/ui/footer-prompt";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenHeader } from "@/components/ui/screen-header";
import { TextLink } from "@/components/ui/text-link";
import { useLoginForm } from "@/features/auth/use-login-form";
import { layout } from "@/theme/styles";

export default function Login() {
  const router = useRouter();
  const {
    email,
    errors,
    handleFocusPassword,
    handleSubmit,
    isSubmitting,
    password,
    passwordRef,
    setEmail,
    setPassword,
    shakeTrigger,
  } = useLoginForm();

  const handleGoToRegister = useCallback(
    () => router.push("/register"),
    [router]
  );

  const handleRecoverPassword = useCallback(() => {
    // PROVISÓRIO: abrir o fluxo de recuperação de senha.
  }, []);

  return (
    <FormScreen>
      <View className="px-6">
        <BackButton />

        <ScreenHeader
          subtitle="Entre para ver seus agendamentos."
          title={"Bem-vindo\nde volta"}
        />

        <View className="mt-10" style={layout.fieldGroup}>
          <FormField
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

          <FormField
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

        <Animated.View
          className="mt-4 self-end"
          entering={FadeInDown.delay(420).duration(600)}
        >
          <TextLink
            accessibilityLabel="Recuperar senha"
            label="Esqueci minha senha"
            onPress={handleRecoverPassword}
          />
        </Animated.View>
      </View>

      <Animated.View
        className="px-6"
        entering={FadeInUp.delay(520).duration(700)}
      >
        <PrimaryButton
          accessibilityLabel="Entrar na conta"
          isLoading={isSubmitting}
          label="Entrar"
          onPress={handleSubmit}
        />

        <FooterPrompt
          accessibilityLabel="Criar uma conta"
          actionLabel="Criar agora"
          message="Ainda não tem conta?"
          onPress={handleGoToRegister}
        />
      </Animated.View>
    </FormScreen>
  );
}
