import { useCallback } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GradientBackground } from "@/components/layout/gradient-background";
import { ScreenHeader } from "@/components/ui/screen-header";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { useSession } from "@/features/auth/session-provider";
import { getFirstName, getGreeting } from "@/utils/format";

const BOTTOM_SPACING = 24;
const TOP_SPACING = 16;

// PROVISÓRIO: substituída pelas abas na Parte 3.
export default function Home() {
  const insets = useSafeAreaInsets();
  const { session, signOut } = useSession();
  const firstName = getFirstName(session?.user.fullName ?? "");

  const handleSignOut = useCallback(() => {
    signOut();
  }, [signOut]);

  return (
    <GradientBackground>
      <View
        className="flex-1 justify-between px-6"
        style={{
          paddingBottom: insets.bottom + BOTTOM_SPACING,
          paddingTop: insets.top + TOP_SPACING,
        }}
      >
        <ScreenHeader
          subtitle="Amém Jesus, Deus é bom"
          title={`${getGreeting()},\n${firstName}`}
        />

        <SecondaryButton
          accessibilityLabel="Sair da conta"
          label="Sair"
          onPress={handleSignOut}
        />
      </View>
    </GradientBackground>
  );
}
