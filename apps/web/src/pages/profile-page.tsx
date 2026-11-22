import { PasswordForm } from "@/components/account/password-form";
import { ProfileForm } from "@/components/account/profile-form";
import { ErrorPanel } from "@/components/ui/state-panels";
import { useSession } from "@/features/auth/session-provider";
import { isApiEnabled } from "@/services/api-client";

export function ProfilePage() {
  const { changePassword, isUpdatingAccount, session, updateProfile } =
    useSession();

  if (!session) {
    return null;
  }

  const { usuario } = session;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-roboto-bold text-2xl text-white">Meu perfil</h1>
      {isApiEnabled ? (
        <div className="grid gap-6 xl:grid-cols-2" key={usuario.id}>
          <ProfileForm
            isBusy={isUpdatingAccount}
            onSave={updateProfile}
            usuario={usuario}
          />
          <PasswordForm isBusy={isUpdatingAccount} onSave={changePassword} />
        </div>
      ) : (
        <ErrorPanel message="Conecte o painel à API para editar o perfil ou alterar a senha." />
      )}
    </div>
  );
}
