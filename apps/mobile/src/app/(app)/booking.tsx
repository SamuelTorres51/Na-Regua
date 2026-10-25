import { View } from "react-native";
import { StateMessage } from "@/components/feedback/state-message";
import { FormScreen } from "@/components/layout/form-screen";
import { BackButton } from "@/components/ui/back-button";
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
          <StateMessage
            description="O agendamento pelo app está em construção."
            icon="construct-outline"
            title="Em breve"
          />
        </View>
      </View>
    </FormScreen>
  );
}
