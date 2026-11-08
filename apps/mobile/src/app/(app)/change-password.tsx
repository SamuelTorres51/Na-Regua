import { View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { FormAlert } from "@/components/feedback/form-alert";
import { FormField } from "@/components/form/form-field";
import { PasswordStrengthMeter } from "@/components/form/password-strength-meter";
import { FormScreen } from "@/components/layout/form-screen";
import { BackButton } from "@/components/ui/back-button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenHeader } from "@/components/ui/screen-header";
import { useChangePasswordForm } from "@/features/auth/use-change-password-form";
import { layout } from "@/theme/styles";
import {
  getPasswordScore,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
} from "@/utils/password";

const ACTIONS_DELAY = 420;
const ACTIONS_DURATION = 700;

export default function ChangePassword() {
  const {
    confirmPassword,
    confirmPasswordRef,
    currentPassword,
    errors,
    handleCancelDiscard,
    handleConfirmDiscard,
    handleFocusConfirmPassword,
    handleFocusNewPassword,
    handleSubmit,
    hasChanges,
    isDiscardDialogVisible,
    isSubmitting,
    newPassword,
    newPasswordRef,
    setConfirmPassword,
    setCurrentPassword,
    setNewPassword,
    shakeTrigger,
    submitError,
  } = useChangePasswordForm();

  return (
    <>
      <FormScreen>
        <View className="px-6">
          <BackButton />

          <ScreenHeader
            subtitle="Você continua conectado depois de trocar a senha."
            title={"Alterar\nsenha"}
          />

          <View className="mt-10" style={layout.fieldGroup}>
            <FormField
              autoComplete="current-password"
              delay={220}
              error={errors.currentPassword}
              isSecure
              label="Senha atual"
              maxLength={MAX_PASSWORD_LENGTH}
              onChangeText={setCurrentPassword}
              onSubmit={handleFocusNewPassword}
              placeholder="Sua senha de hoje"
              returnKeyType="next"
              shakeTrigger={shakeTrigger}
              value={currentPassword}
            />

            <View>
              <FormField
                autoComplete="new-password"
                delay={280}
                error={errors.newPassword}
                inputRef={newPasswordRef}
                isSecure
                label="Nova senha"
                maxLength={MAX_PASSWORD_LENGTH}
                onChangeText={setNewPassword}
                onSubmit={handleFocusConfirmPassword}
                placeholder={`Mínimo de ${MIN_PASSWORD_LENGTH} caracteres`}
                returnKeyType="next"
                shakeTrigger={shakeTrigger}
                value={newPassword}
              />

              {newPassword.length > 0 ? (
                <PasswordStrengthMeter score={getPasswordScore(newPassword)} />
              ) : null}
            </View>

            <FormField
              autoComplete="new-password"
              delay={340}
              error={errors.confirmPassword}
              inputRef={confirmPasswordRef}
              isSecure
              label="Confirmar nova senha"
              maxLength={MAX_PASSWORD_LENGTH}
              onChangeText={setConfirmPassword}
              onSubmit={handleSubmit}
              placeholder="Repita a nova senha"
              returnKeyType="go"
              shakeTrigger={shakeTrigger}
              value={confirmPassword}
            />
          </View>
        </View>

        <Animated.View
          className="mt-10 px-6"
          entering={FadeInUp.delay(ACTIONS_DELAY).duration(ACTIONS_DURATION)}
        >
          <FormAlert message={submitError} />

          <PrimaryButton
            accessibilityLabel="Salvar nova senha"
            isDisabled={!hasChanges}
            isLoading={isSubmitting}
            label="Salvar nova senha"
            onPress={handleSubmit}
          />
        </Animated.View>
      </FormScreen>

      <ConfirmDialog
        cancelLabel="Continuar editando"
        confirmLabel="Descartar"
        description="Sua senha não será alterada."
        isDestructive
        isVisible={isDiscardDialogVisible}
        onCancel={handleCancelDiscard}
        onConfirm={handleConfirmDiscard}
        title="Descartar alterações?"
      />
    </>
  );
}
