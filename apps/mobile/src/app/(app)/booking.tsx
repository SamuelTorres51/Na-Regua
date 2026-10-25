import { View } from "react-native";
import { FormScreen } from "@/components/layout/form-screen";
import { BackButton } from "@/components/ui/back-button";
import { EmptyState } from "@/components/ui/empty-state";
import { ScreenHeader } from "@/components/ui/screen-header";

export default function Booking() {
  return (
    <FormScreen>
      <View className="px-6">
        <BackButton />

        <ScreenHeader
          subtitle="Escolha o serviço, o profissional e o horário."
          title={"Novo\nagendamento"}
        />

        <View className="mt-10">
          <EmptyState
            description="O agendamento pelo app está em construção."
            icon="construct-outline"
            title="Em breve"
          />
        </View>
      </View>
    </FormScreen>
  );
}
