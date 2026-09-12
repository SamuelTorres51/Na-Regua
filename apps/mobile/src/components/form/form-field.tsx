import { type RefObject, useCallback, useEffect, useState } from "react";
import { Pressable, Text, TextInput, type TextInputProps } from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { colors } from "@/theme/colors";

const COLOR_DURATION = 180;
const ENTERING_DURATION = 600;
const ERROR_FADE_DURATION = 220;
const SHAKE_DURATION = 55;
const SHAKE_OFFSET = 7;

const BORDER_STEPS = [0, 1, 2];
const BORDER_COLORS = [
  colors.border.idle,
  colors.border.focused,
  colors.border.error,
];

interface FormFieldProps {
  autoCapitalize?: "none" | "words";
  autoComplete: TextInputProps["autoComplete"];
  delay: number;
  error?: string;
  inputRef?: RefObject<TextInput | null>;
  isSecure?: boolean;
  keyboardType?: TextInputProps["keyboardType"];
  label: string;
  maxLength?: number;
  onChangeText: (value: string) => void;
  onSubmit?: () => void;
  placeholder: string;
  returnKeyType: "go" | "next";
  shakeTrigger: number;
  value: string;
}

export function FormField({
  autoCapitalize = "none",
  autoComplete,
  delay,
  error,
  inputRef,
  isSecure = false,
  keyboardType = "default",
  label,
  maxLength,
  onChangeText,
  onSubmit,
  placeholder,
  returnKeyType,
  shakeTrigger,
  value,
}: FormFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const focusProgress = useSharedValue(0);
  const shakeX = useSharedValue(0);

  const colorTarget = error ? 2 : Number(isFocused);

  useEffect(() => {
    focusProgress.value = withTiming(colorTarget, { duration: COLOR_DURATION });
  }, [colorTarget, focusProgress]);

  useEffect(() => {
    if (shakeTrigger > 0 && error) {
      shakeX.value = withSequence(
        withTiming(-SHAKE_OFFSET, { duration: SHAKE_DURATION }),
        withTiming(SHAKE_OFFSET, { duration: SHAKE_DURATION }),
        withTiming(-SHAKE_OFFSET / 2, { duration: SHAKE_DURATION }),
        withTiming(0, { duration: SHAKE_DURATION })
      );
    }
  }, [error, shakeTrigger, shakeX]);

  const fieldStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      focusProgress.value,
      BORDER_STEPS,
      BORDER_COLORS
    ),
    transform: [{ translateX: shakeX.value }],
  }));

  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => setIsFocused(false), []);
  const handleToggleVisibility = useCallback(
    () => setIsPasswordVisible((current) => !current),
    []
  );

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(ENTERING_DURATION)}
    >
      <Text className="mb-2 font-roboto-medium text-sm text-zinc-400">
        {label}
      </Text>

      <Animated.View
        className="flex-row items-center rounded-2xl border bg-zinc-900/60 px-4"
        style={fieldStyle}
      >
        <TextInput
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          autoCorrect={false}
          className="flex-1 py-4 font-roboto text-base text-white"
          keyboardType={keyboardType}
          maxLength={maxLength}
          onBlur={handleBlur}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onSubmitEditing={onSubmit}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          ref={inputRef}
          returnKeyType={returnKeyType}
          secureTextEntry={isSecure && !isPasswordVisible}
          value={value}
        />

        {isSecure ? (
          <Pressable
            accessibilityLabel={
              isPasswordVisible ? "Ocultar senha" : "Mostrar senha"
            }
            accessibilityRole="button"
            hitSlop={8}
            onPress={handleToggleVisibility}
          >
            <Text className="font-roboto-medium text-brand text-xs uppercase">
              {isPasswordVisible ? "Ocultar" : "Mostrar"}
            </Text>
          </Pressable>
        ) : null}
      </Animated.View>

      {error ? (
        <Animated.Text
          className="mt-2 font-roboto text-danger text-xs"
          entering={FadeIn.duration(ERROR_FADE_DURATION)}
        >
          {error}
        </Animated.Text>
      ) : null}
    </Animated.View>
  );
}
