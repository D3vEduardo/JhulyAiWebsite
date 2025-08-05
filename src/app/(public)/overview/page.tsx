"use client";

import ZoopText from "@components/ZoopText";
import Button from "@components/Button";
import HomeNavbar from "@/components/OverviewNavbar/OverviewNavbar";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="w-screen min-h-dvh flex flex-col items-center justify-center">
      <HomeNavbar />
      <header className="w-screen h-full p-3 md:p-10 flex flex-col items-center justify-center gap-4">
        <div className="flex flex-col items-center justify-center w-full md:w-8/10 lg:w-73/100 text-center">
          <section className="w-auto flex flex-col items-center justify-center g-0">
            <h1
              className="text-3xl md:text-[40px] lg:text-6xl text-cocoa
            overflow-hidden p-1"
            >
              Faça perguntas. Ganhe carinho. Descubra algo
              <ZoopText
                className="bg-strawberry rounded-xl md:rounded-2xl
                px-2 h-full ml-2"
                texts={[
                  "novo.",
                  "incrível.",
                  "fantástico.",
                  "inspirador.",
                  "mágico.",
                  "especial.",
                ]}
              />
            </h1>
          </section>
          <p className="text-md md:text-lg lg:text-2xl text-cinnamon w-full lg:w-8/10">
            100% gratuita. Super fácil de usar. É só chamar que a Jhuly AI te
            ajuda com ideias, estudos, textos criativos e até aquele
            empurrãozinho.
          </p>
        </div>
        <section className="flex flex-col w-screen md:flex-row items-center justify-center gap-4 p-2">
          <Button
            className="gap-x-1.5 w-9/10 md:w-auto"
            onClick={() => router.push("/login")}
          >
            Comece agora
            <Icon icon="mingcute:arrow-right-fill" width="24" height="24" />
          </Button>
          <Button
            variant={{ color: "secondary" }}
            className="gap-1.5 w-9/10 md:w-auto"
          >
            <Icon icon="mingcute:discord-fill" width="24" height="24" />
            Comunidade
          </Button>
        </section>
      </header>
    </main>
  );
}
