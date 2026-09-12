import { useRouter } from "expo-router";
import { useCallback } from "react";
import { View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { FormField } from "@/components/form/form-field";
import { PasswordStrengthMeter } from "@/components/form/password-strength-meter";
import { TermsCheckbox } from "@/components/form/terms-checkbox";
import { FormScreen } from "@/components/layout/form-screen";
import { BackButton } from "@/components/ui/back-button";
import { FooterPrompt } from "@/components/ui/footer-prompt";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenHeader } from "@/components/ui/screen-header";
import { useRegisterForm } from "@/features/auth/use-register-form";
import { layout } from "@/theme/styles";
import { getPasswordScore, MIN_PASSWORD_LENGTH } from "@/utils/password";
import { PHONE_MASK_LENGTH } from "@/utils/phone";

export default function Register() {
  const router = useRouter();
  const {
    confirmPassword,
    confirmPasswordRef,
    email,
    emailRef,
    errors,
    fullName,
    handleChangePhone,
    handleFocusConfirmPassword,
    handleFocusEmail,
    handleFocusPassword,
    handleFocusPhone,
    handleSubmit,
    handleToggleTerms,
    hasAcceptedTerms,
    isSubmitting,
    password,
    passwordRef,
    phone,
    phoneRef,
    setConfirmPassword,
    setEmail,
    setFullName,
    setPassword,
    shakeTrigger,
  } = useRegisterForm();

  const handleGoToLogin = useCallback(() => router.push("/login"), [router]);

  return (
    <FormScreen>
      <View className="px-6">
        <BackButton />

        <ScreenHeader
          subtitle="Leva menos de um minuto."
          title={"Criar\nconta"}
        />

        <View className="mt-10" style={layout.fieldGroup}>
          <FormField
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

          <FormField
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

          <FormField
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
            <FormField
              autoComplete="new-password"
              delay={400}
              error={errors.password}
              inputRef={passwordRef}
              isSecure
              label="Senha"
              onChangeText={setPassword}
              onSubmit={handleFocusConfirmPassword}
              placeholder={`Mínimo de ${MIN_PASSWORD_LENGTH} caracteres`}
              returnKeyType="next"
              shakeTrigger={shakeTrigger}
              value={password}
            />

            {password.length > 0 ? (
              <PasswordStrengthMeter score={getPasswordScore(password)} />
            ) : null}
          </View>

          <FormField
            autoComplete="new-password"
            delay={460}
            error={errors.confirmPassword}
            inputRef={confirmPasswordRef}
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
            error={errors.hasAcceptedTerms}
            isChecked={hasAcceptedTerms}
            onToggle={handleToggleTerms}
          />
        </Animated.View>
      </View>

      <Animated.View
        className="mt-10 px-6"
        entering={FadeInUp.delay(600).duration(700)}
      >
        <PrimaryButton
          accessibilityLabel="Criar a conta"
          isLoading={isSubmitting}
          label="Criar conta"
          onPress={handleSubmit}
        />

        <FooterPrompt
          accessibilityLabel="Entrar com uma conta existente"
          actionLabel="Entrar"
          message="Já tem conta?"
          onPress={handleGoToLogin}
        />
      </Animated.View>
    </FormScreen>
  );
}
