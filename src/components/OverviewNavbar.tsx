"use client";
import Image from "next/image";
import JhulyNoBg from "@public/avatars/avatar_nobg.png";
import { Icon } from "@iconify-icon/react";
import { authClient } from "@lib/betterAuth/auth-client";
import { HTMLAttributeAnchorTarget, ReactNode } from "react";
import Link, { LinkProps } from "next/link";

export default function HomeNavbar() {
  console.log("Renderizei HomeNavbar");
  return (
    <nav
      className="absolute top-6 md:top-10 left-1/2 -translate-x-1/2
            bg-navbar px-4 py-1.5 h-14 w-9/10 md:w-7/10 rounded-2xl
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
      <section className="flex gapx-2">
        <NavbarItem href="https://github.com/d3veduardo" target="_blank">
          <Icon icon="fluent:code-block-16-filled" width="24" height="24" />
          <p>Desenvolvedor</p>
        </NavbarItem>
        <LoginOrGoToChatItem />
      </section>
    </nav>
  );
}

function LoginOrGoToChatItem() {
  const { data, isPending } = authClient.useSession();
  return (
    <NavbarItem href={isPending || !data?.user ? "login" : "/chat/new"}>
      {isPending || !data?.user ? (
        <>
          <Icon icon="solar:login-2-bold-duotone" width="24" height="24" />{" "}
          <p></p>Login
        </>
      ) : (
        <>
          <Icon icon="solar:login-2-bold-duotone" width="24" height="24" />{" "}
          Conversar com Jhuly
        </>
      )}
    </NavbarItem>
  );
}

function NavbarItem({
  children,
  target = "_self",
  ...props
}: {
  children: ReactNode;
  target?: HTMLAttributeAnchorTarget;
} & LinkProps) {
  return (
    <Link
      target={target}
      {...props}
      className="relative px-2 py-1 group text-lg text-cocoa custom-cursor-hover
    text-center h-full flex items-center justify-center"
    >
      <span
        className="h-full bg-cinnamon/20 absolute bottom-0 rounded-2xl
        left-1/2 group-hover:left-0 w-0 group-hover:w-full transition-all duration-400 ease-in-out"
      />
      {children}
    </Link>
  );
}
