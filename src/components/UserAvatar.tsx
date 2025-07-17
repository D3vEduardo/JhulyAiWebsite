"use client";

import { authClient } from "@lib/betterAuth/auth-client";
import Avatar from "@public/avatars/avatar_3.png";
import { useRouter } from "next/navigation";
import { useIsClient } from "@hooks/useIsClient";
import Image from "next/image";

export default function UserAvatar() {
  const { data } = authClient.useSession();
  const isClient = useIsClient();
  const router = useRouter();
  if (!isClient) {
    return (
      <Image
        src={Avatar.src}
        alt="Loading Avatar"
        width={32}
        height={32}
        className="rounded-full"
      />
    );
  }

  return (
    <Image
      onClick={() => {
        authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              router.push("/overview");
            },
          },
        });
      }}
      src={data?.user?.image || Avatar.src}
      alt={data?.user?.name || "User Avatar"}
      width={32}
      height={32}
      className="rounded-full"
    />
  );
}
