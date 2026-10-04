import { useCallback } from "react";
import { View } from "react-native";
import { TabScreen } from "@/components/layout/tab-screen";
import { ScreenHeader } from "@/components/ui/screen-header";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { useSession } from "@/features/auth/session-provider";

// PROVISÓRIO: dados do perfil na Parte 7.
export default function Profile() {
  const { session, signOut } = useSession();

  const handleSignOut = useCallback(() => {
    signOut();
  }, [signOut]);

  return (
    <TabScreen>
      <View className="flex-1 justify-between px-6">
        <ScreenHeader subtitle={session?.user.email ?? ""} title="Perfil" />

        <SecondaryButton
          accessibilityLabel="Sair da conta"
          label="Sair"
          onPress={handleSignOut}
        />
      </View>
    </TabScreen>
  );
}
