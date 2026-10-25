import Constants from "expo-constants";
import { Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { TabScreen } from "@/components/layout/tab-screen";
import { Avatar } from "@/components/ui/avatar";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Divider } from "@/components/ui/divider";
import { InfoRow } from "@/components/ui/info-row";
import { ScreenHeader } from "@/components/ui/screen-header";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { useSession } from "@/features/auth/session-provider";
import { useSignOutDialog } from "@/features/auth/use-sign-out-dialog";
import { classNames } from "@/theme/class-names";
import { formatPhone } from "@/utils/phone";

const IDENTITY_DELAY = 260;
const CONTACT_DELAY = 340;
const ACTIONS_DELAY = 420;
const ENTERING_DURATION = 600;
const APP_VERSION = Constants.expoConfig?.version;

export default function Profile() {
  const { session } = useSession();
  const {
    handleCloseDialog,
    handleConfirmSignOut,
    handleRequestSignOut,
    isDialogVisible,
    isSigningOut,
  } = useSignOutDialog();

  if (!session) {
    return null;
  }

  const { user } = session;

  return (
    <>
      <TabScreen>
        <View className="flex-1 justify-between px-6">
          <View>
            <ScreenHeader subtitle="Seus dados de cadastro." title="Perfil" />

            <Animated.View
              className={`mt-8 flex-row items-center p-5 ${classNames.card}`}
              entering={FadeInDown.delay(IDENTITY_DELAY).duration(
                ENTERING_DURATION
              )}
            >
              <Avatar name={user.fullName} />
              <View className="ml-4 flex-1">
                <Text className="font-roboto-semibold text-lg text-white">
                  {user.fullName}
                </Text>
                <Text className="mt-0.5 font-roboto text-sm text-zinc-500">
                  Cliente Na Régua
                </Text>
              </View>
            </Animated.View>

            <Animated.View
              className="mt-8"
              entering={FadeInDown.delay(CONTACT_DELAY).duration(
                ENTERING_DURATION
              )}
            >
              <Text className="mb-3 font-roboto-medium text-sm text-zinc-400">
                Dados de contato
              </Text>
              <View className={`p-5 ${classNames.card}`}>
                <InfoRow
                  icon="mail-outline"
                  label="E-mail"
                  value={user.email}
                />
                <Divider />
                <InfoRow
                  icon="call-outline"
                  label="Telefone"
                  value={formatPhone(user.phone)}
                />
              </View>
            </Animated.View>
          </View>

          <Animated.View
            className="mt-10"
            entering={FadeInDown.delay(ACTIONS_DELAY).duration(
              ENTERING_DURATION
            )}
          >
            <SecondaryButton
              accessibilityLabel="Sair da conta"
              label="Sair da conta"
              onPress={handleRequestSignOut}
            />
            {APP_VERSION ? (
              <Text className="mt-6 text-center font-roboto text-xs text-zinc-600">
                Na Régua · versão {APP_VERSION}
              </Text>
            ) : null}
          </Animated.View>
        </View>
      </TabScreen>

      <ConfirmDialog
        cancelLabel="Voltar"
        confirmLabel="Sair"
        description="Você vai precisar entrar de novo para ver seus agendamentos."
        isConfirming={isSigningOut}
        isDestructive
        isVisible={isDialogVisible}
        onCancel={handleCloseDialog}
        onConfirm={handleConfirmSignOut}
        title="Sair da conta?"
      />
    </>
  );
}
