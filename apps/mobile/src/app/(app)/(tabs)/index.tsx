import { View } from "react-native";
import { TabScreen } from "@/components/layout/tab-screen";
import { ScreenHeader } from "@/components/ui/screen-header";
import { useSession } from "@/features/auth/session-provider";
import { getFirstName, getGreeting } from "@/utils/format";

// PROVISÓRIO: conteúdo completo na Parte 4.
export default function Home() {
  const { session } = useSession();
  const firstName = getFirstName(session?.user.fullName ?? "");

  return (
    <TabScreen>
      <View className="px-6">
        <ScreenHeader
          subtitle="Pronto para ficar na régua?"
          title={`${getGreeting()},\n${firstName}`}
        />
      </View>
    </TabScreen>
  );
}
