import { authClient } from "@lib/betterAuth/auth-client";
import { Icon } from "@iconify-icon/react/dist/iconify.mjs";
import OverviewNavbarItem from "./OverviewNavbarItem";

export default function LoginOrGoToChatItem() {
  const { data, isPending } = authClient.useSession();

  return (
    <OverviewNavbarItem href={isPending || !data?.user ? "login" : "/chat/new"}>
      {isPending || !data?.user ? (
        <>
          <Icon icon="solar:login-2-bold-duotone" width="24" height="24" />{" "}
          <p>Login</p>
        </>
      ) : (
        <>
          <Icon icon="solar:login-2-bold-duotone" width="24" height="24" />{" "}
          Conversar com Jhuly
        </>
      )}
    </OverviewNavbarItem>
  );
}
