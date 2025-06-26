"use client";
import Button from "@/component/csr/Button";
import { motion } from "motion/react";
import { useAside } from "@store/asideMenu";
import AsideMenuChats from "./AsideMenuChats";
import AsideMenuFooter from "./AsideMenuFooter";
import { useRouter } from "next/navigation";
export default function AsideMenu() {
  console.log("Renderizei AsideMenu");
  const { asideIsOpen } = useAside();
  const router = useRouter();

  return (
    <motion.div
      animate={{
        x: asideIsOpen ? 0 : "-100%",
        opacity: asideIsOpen ? 1 : 0,
      }}
      className="h-[96vh] w-95/100 md:w-64 flex flex-col bg-input-bg rounded-lg p-2 z-50
        border-2 border-almond absolute left-1/2 -translate-x-1/2 md:translate-x-0 md:left-5
        top-1/2 -translate-y-1/2 bg-peach"
    >
      <Button
        className="py-2 gap-0.5 flex items-center
                justify-center text-center"
        variant={{
          color: "secondary",
          size: "sm",
          hoverAnimationSize: 0.98,
          tapAnimationSize: 0.9,
        }}
        onClick={() => router.replace("/chat/new")}
      >
        Novo chat
      </Button>
      {/*Dvisória abaixo*/}
      <div
        className="relative flex items-center justify-center
            text-center my-2 overflow-hidden"
      >
        <span className="w-full rounded-2xl bg-strawberry h-0.5" />
        <p className="text-input-border text-center w-full">Chats</p>
        <span className="w-full rounded-2xl bg-strawberry h-0.5" />
      </div>
      {/*Dvisória acima*/}
      <section className="flex flex-col justify-between h-full">
        <div className="flex flex-col gap-2 w-full overflow-hidden h-[70vh relative">
          <AsideMenuChats />
          <span
            className="w-full h-6 bg-gradient-to-b
                        to-transparent from-peach fixed"
          />
          <span
            className="w-full h-6 bg-gradient-to-t
                        to-transparent from-peach fixed bottom-26"
          />
        </div>
        <AsideMenuFooter />
      </section>
    </motion.div>
  );
}
