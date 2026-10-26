import { View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { FormAlert } from "@/components/feedback/form-alert";
import { FormField } from "@/components/form/form-field";
import { FormScreen } from "@/components/layout/form-screen";
import { BackButton } from "@/components/ui/back-button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenHeader } from "@/components/ui/screen-header";
import { useProfileForm } from "@/features/auth/use-profile-form";
import { layout } from "@/theme/styles";
import { PHONE_MASK_LENGTH } from "@/utils/phone";

const ACTIONS_DELAY = 420;
const ACTIONS_DURATION = 700;

export default function EditProfile() {
  const {
    email,
    emailRef,
    errors,
    fullName,
    handleCancelDiscard,
    handleChangePhone,
    handleConfirmDiscard,
    handleFocusEmail,
    handleFocusPhone,
    handleSubmit,
    hasChanges,
    isDiscardDialogVisible,
    isSubmitting,
    phone,
    phoneRef,
    setEmail,
    setFullName,
    shakeTrigger,
    submitError,
  } = useProfileForm();

  return (
    <>
      <FormScreen>
        <View className="px-6">
          <BackButton />

          <ScreenHeader
            subtitle="Seu e-mail também é usado para entrar no app."
            title={"Editar\ndados"}
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
              onSubmit={handleSubmit}
              placeholder="(89) 99999-9999"
              returnKeyType="go"
              shakeTrigger={shakeTrigger}
              value={phone}
            />
          </View>
        </View>

        <Animated.View
          className="mt-10 px-6"
          entering={FadeInUp.delay(ACTIONS_DELAY).duration(ACTIONS_DURATION)}
        >
          <FormAlert message={submitError} />

          <PrimaryButton
            accessibilityLabel="Salvar alterações"
            isDisabled={!hasChanges}
            isLoading={isSubmitting}
            label="Salvar alterações"
            onPress={handleSubmit}
          />
        </Animated.View>
      </FormScreen>

      <ConfirmDialog
        cancelLabel="Continuar editando"
        confirmLabel="Descartar"
        description="As mudanças que você fez nos seus dados não serão salvas."
        isDestructive
        isVisible={isDiscardDialogVisible}
        onCancel={handleCancelDiscard}
        onConfirm={handleConfirmDiscard}
        title="Descartar alterações?"
      />
    </>
  );
}
