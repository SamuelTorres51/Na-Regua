import { PasswordForm } from "@/components/account/password-form";
import { ProfileForm } from "@/components/account/profile-form";
import { useSession } from "@/features/auth/session-provider";

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
      <div className="grid gap-6 xl:grid-cols-2" key={usuario.id}>
        <ProfileForm
          isBusy={isUpdatingAccount}
          onSave={updateProfile}
          usuario={usuario}
        />
        <PasswordForm isBusy={isUpdatingAccount} onSave={changePassword} />
      </div>
    </div>
  );
}
