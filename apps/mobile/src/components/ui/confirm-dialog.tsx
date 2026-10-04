import Feather from "@expo/vector-icons/Feather";
import { useCallback } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/colors";
import { layout } from "@/theme/styles";
import { PrimaryButton } from "./primary-button";
import { SecondaryButton } from "./secondary-button";

const ICON_SIZE = 22;

const APPEARANCES = {
  danger: {
    badge: "bg-red-500/15",
    icon: "alert-triangle",
    iconColor: colors.icon.danger,
    tone: "danger",
  },
  neutral: {
    badge: "bg-amber-500/15",
    icon: "help-circle",
    iconColor: colors.icon.accent,
    tone: "brand",
  },
} as const;

interface ConfirmDialogProps {
  cancelLabel: string;
  confirmLabel: string;
  description: string;
  isConfirming?: boolean;
  isDestructive?: boolean;
  isVisible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
}

export function ConfirmDialog({
  cancelLabel,
  confirmLabel,
  description,
  isConfirming = false,
  isDestructive = false,
  isVisible,
  onCancel,
  onConfirm,
  title,
}: ConfirmDialogProps) {
  const appearance = isDestructive ? APPEARANCES.danger : APPEARANCES.neutral;

  // Enquanto a confirmação está em andamento, fechar o diálogo (fundo,
  // botão voltar do Android ou "cancelar") não deve fazer nada.
  const handleDismiss = useCallback(() => {
    if (!isConfirming) {
      onCancel();
    }
  }, [isConfirming, onCancel]);

  return (
    <Modal
      animationType="fade"
      onRequestClose={handleDismiss}
      statusBarTranslucent
      transparent
      visible={isVisible}
    >
      <View className="flex-1 items-center justify-center px-6">
        <Pressable
          accessibilityLabel="Fechar"
          accessibilityRole="button"
          className="bg-black/70"
          onPress={handleDismiss}
          style={StyleSheet.absoluteFill}
        />

        <View className="w-full rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <View
            className={`h-12 w-12 items-center justify-center rounded-full ${appearance.badge}`}
          >
            <Feather
              color={appearance.iconColor}
              name={appearance.icon}
              size={ICON_SIZE}
            />
          </View>

          <Text className="mt-5 font-roboto-bold text-2xl text-white">
            {title}
          </Text>
          <Text className="mt-2 font-roboto text-base text-zinc-400 leading-6">
            {description}
          </Text>

          <View className="mt-8" style={layout.actionGroup}>
            <PrimaryButton
              accessibilityLabel={confirmLabel}
              isLoading={isConfirming}
              label={confirmLabel}
              onPress={onConfirm}
              tone={appearance.tone}
            />
            <SecondaryButton
              accessibilityLabel={cancelLabel}
              label={cancelLabel}
              onPress={handleDismiss}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
