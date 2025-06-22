"use client";

import ZoopText from "@component/csr/ZoopText";
import Button from "@component/csr/Button";
import HomeNavbar from "@component/csr/HomeNavbar";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="w-screen min-h-dvh flex flex-col items-center justify-center">
      <HomeNavbar />
      <header className="w-screen h-full p-3 md:p-10 flex flex-col items-center justify-center gap-4">
        <div className="flex flex-col items-center justify-center w-full md:w-8/10 lg:w-73/100 text-center">
          <div className="w-screen flex flex-col items-center justify-center g-0">
            <h1 className="text-2xl md:text-[42px] lg:text-6xl text-cocoa overflow-hidden pb-0 md:pb-1.5">
              Faça perguntas. Ganhe carinho.
            </h1>
            <div
              className="text-2xl w-full md:text-4xl lg:text-6xl text-cocoa
              flex items-center justify-center gap-2.5"
            >
              <span className="overflow-hidden! pb-2">Descubra algo</span>
              <ZoopText
                className="bg-strawberry rounded-xl md:rounded-2xl px-2 lg:mt-2 h-full"
                texts={[
                  "novo.",
                  "incrível.",
                  "fantástico.",
                  "inspirador.",
                  "mágico.",
                  "especial.",
                ]}
              />
            </div>
          </div>
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
