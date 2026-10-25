import {
  createContext,
  type PropsWithChildren,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeInUp, FadeOutDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon, type IconName, type IconTone } from "@/components/ui/icon";
import { metrics } from "@/theme/metrics";

const TOAST_DURATION_MS = 3000;
const ENTERING_DURATION = 240;
const EXITING_DURATION = 200;
const TOAST_SPACING = 12;

export type ToastTone = "error" | "info" | "success";

interface ToastAppearance {
  icon: IconName;
  iconTone: IconTone;
}

const TOAST_APPEARANCES: Record<ToastTone, ToastAppearance> = {
  error: { icon: "alert-circle", iconTone: "danger" },
  info: { icon: "information-circle", iconTone: "accent" },
  success: { icon: "checkmark-circle", iconTone: "success" },
};

interface ToastOptions {
  message: string;
  tone?: ToastTone;
}

interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: PropsWithChildren) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = useCallback(({ message, tone = "info" }: ToastOptions) => {
    setToast({ id: Date.now(), message, tone });
  }, []);

  const handleDismiss = useCallback(() => setToast(null), []);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeoutId = setTimeout(handleDismiss, TOAST_DURATION_MS);

    return () => clearTimeout(timeoutId);
  }, [handleDismiss, toast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  const bottomOffset =
    insets.bottom +
    metrics.tabBar.bottomOffset +
    metrics.tabBar.height +
    TOAST_SPACING;

  return (
    <ToastContext value={value}>
      {children}

      <View
        className="absolute right-6 left-6"
        style={{ bottom: bottomOffset, pointerEvents: "box-none" }}
      >
        {toast ? (
          <Animated.View
            entering={FadeInUp.duration(ENTERING_DURATION)}
            exiting={FadeOutDown.duration(EXITING_DURATION)}
            key={toast.id}
          >
            <Pressable
              accessibilityLiveRegion="polite"
              accessibilityRole="alert"
              className="flex-row items-center rounded-2xl border border-zinc-700 bg-zinc-800 px-4 py-3.5 active:opacity-90"
              onPress={handleDismiss}
            >
              <Icon
                name={TOAST_APPEARANCES[toast.tone].icon}
                tone={TOAST_APPEARANCES[toast.tone].iconTone}
              />
              <Text className="ml-3 flex-1 font-roboto-medium text-sm text-white">
                {toast.message}
              </Text>
            </Pressable>
          </Animated.View>
        ) : null}
      </View>
    </ToastContext>
  );
}

export function useToast() {
  const context = use(ToastContext);

  if (!context) {
    throw new Error("useToast deve ser usado dentro de ToastProvider.");
  }

  return context;
}
