"use client";
import Image from "next/image";
import JhulyNoBg from "@public/avatars/avatar_nobg.png";
import { Icon } from "@iconify-icon/react";
import { useSession } from "@/lib/nextAuth/auth-client";
import { redirect } from "next/navigation";

export default function HomeNavbar() {
  console.log("Renderizei HomeNavbar");
  const { status } = useSession();
  return (
    <nav
      className="absolute top-6 md:top-10 left-1/2 -translate-x-1/2
            bg-navbar px-4 py-1.5 h-14 w-9/10 md:w-7/10 rounded-xl
            border-almond border-2 flex items-center justify-between
            bg-peach"
    >
      <Image
        className="h-9/10 w-auto custom-cursor-hover"
        src={JhulyNoBg}
        alt="Jhuly AI picture"
        style={{
          maskImage: "linear-gradient(to top, transparent 0%, black 35%)",
        }}
      />

      <p
        onClick={() => {
          if (status === "loading") return;
          if (status === "unauthenticated") return redirect("/login");
          redirect("/chat");
        }}
        className="flex items-center justify-center text-center
                gap-0.5 h-full text-lg text-cocoa custom-cursor-hover"
      >
        {status === "loading" || status === "unauthenticated" ? (
          <>
            <Icon icon="solar:login-2-bold-duotone" width="24" height="24" />{" "}
            Login
          </>
        ) : (
          <>
            <Icon icon="solar:login-2-bold-duotone" width="24" height="24" />{" "}
            Conversar com Jhuly
          </>
        )}
      </p>
    </nav>
  );
}
