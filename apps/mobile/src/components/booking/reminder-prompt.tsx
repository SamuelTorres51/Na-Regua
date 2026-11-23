import { ActivityIndicator, Pressable, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Icon } from "@/components/ui/icon";
import { TextLink } from "@/components/ui/text-link";
import type { ReminderPermission } from "@/services/appointment-reminders";
import { classNames } from "@/theme/class-names";
import { colors } from "@/theme/colors";

const FADE_DURATION = 280;

interface ReminderPromptProps {
  isRequesting: boolean;
  onEnable: () => void;
  onOpenSettings: () => void;
  permission: ReminderPermission | null;
}

const DESCRIPTIONS: Record<ReminderPermission, string> = {
  blocked:
    "As notificações do NaRégua estão desativadas. Ative nas configurações do celular para receber o lembrete.",
  granted: "Vamos te avisar 1 hora antes, mesmo com o app fechado.",
  undetermined:
    "Avisamos 1 hora antes do horário, mesmo com o app fechado. Basta permitir as notificações.",
};

const TITLES: Record<ReminderPermission, string> = {
  blocked: "Lembrete desativado",
  granted: "Lembrete ativado",
  undetermined: "Quer um lembrete?",
};

interface ReminderActionProps {
  isRequesting: boolean;
  onEnable: () => void;
  onOpenSettings: () => void;
  permission: ReminderPermission;
}

function ReminderAction({
  isRequesting,
  onEnable,
  onOpenSettings,
  permission,
}: ReminderActionProps) {
  switch (permission) {
    case "undetermined":
      return (
        <Pressable
          accessibilityLabel="Ativar lembrete do horário"
          accessibilityRole="button"
          accessibilityState={{ busy: isRequesting, disabled: isRequesting }}
          className="mt-4 h-11 flex-row items-center justify-center rounded-2xl border border-brand/30 bg-brand/10 active:opacity-70"
          disabled={isRequesting}
          onPress={onEnable}
        >
          {isRequesting ? (
            <ActivityIndicator color={colors.accent} />
          ) : (
            <>
              <Icon name="notifications-outline" size="sm" tone="accent" />
              <Text className="ml-2 font-roboto-medium text-brand text-sm">
                Ativar lembrete
              </Text>
            </>
          )}
        </Pressable>
      );
    case "blocked":
      return (
        <View className="mt-3 flex-row">
          <TextLink
            accessibilityLabel="Abrir as configurações do celular"
            label="Abrir configurações"
            onPress={onOpenSettings}
          />
        </View>
      );
    default:
      return null;
  }
}

export function ReminderPrompt({
  isRequesting,
  onEnable,
  onOpenSettings,
  permission,
}: ReminderPromptProps) {
  if (!permission) {
    return null;
  }

  const isGranted = permission === "granted";

  return (
    <Animated.View
      className={`p-5 ${classNames.card}`}
      entering={FadeIn.duration(FADE_DURATION)}
    >
      <View className="flex-row items-center">
        <View className="h-11 w-11 items-center justify-center rounded-full bg-brand/15">
          <Icon
            name={isGranted ? "alarm" : "alarm-outline"}
            tone={isGranted ? "accent" : "subtle"}
          />
        </View>
        <View className="ml-4 flex-1">
          <Text className="font-roboto-semibold text-base text-white">
            {TITLES[permission]}
          </Text>
          <Text className="mt-0.5 font-roboto text-sm text-zinc-400 leading-5">
            {DESCRIPTIONS[permission]}
          </Text>
        </View>
      </View>

      <ReminderAction
        isRequesting={isRequesting}
        onEnable={onEnable}
        onOpenSettings={onOpenSettings}
        permission={permission}
      />
    </Animated.View>
  );
}
