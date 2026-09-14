import { View } from "react-native";
import { TabScreen } from "@/components/layout/tab-screen";
import { ScreenHeader } from "@/components/ui/screen-header";

// PROVISÓRIO: lista, filtro e cancelamento na Parte 6.
export default function Appointments() {
  return (
    <TabScreen>
      <View className="px-6">
        <ScreenHeader
          subtitle="Seus horários marcados e o histórico."
          title="Agendamentos"
        />
      </View>
    </TabScreen>
  );
}
