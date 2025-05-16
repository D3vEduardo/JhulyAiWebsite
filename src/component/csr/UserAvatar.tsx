"use client"

import { signOut, useSession } from "@lib/nextAuth/auth-client"
import Avatar from "@public/avatars/avatar_3.png";
import Image from "next/image";

export default function UserAvatar() {
    const { data } = useSession();

    return (
        <Image
            onClick={() => signOut()}
            src={data?.user?.image || Avatar.src}
            alt={data?.user?.name || "User Avatar"}
            width={32}
            height={32}
            className="rounded-full"
        />
    );
}