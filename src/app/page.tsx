"use client";

import ZoopText from "@components/csr/ZoopText";
import Button from "@components/csr/Button";
import Navbar from "@components/csr/Navbar";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";


export default function Home() {

  const router = useRouter();

  return (
    <main className="w-screen min-h-dvh flex flex-col items-center justify-center">
      <Navbar />
      <header
        className="w-screen h-full p-3 md:p-10 flex flex-col items-center justify-center gap-4"
      >
        <div
          className="flex flex-col items-center justify-center w-full md:w-8/10 lg:w-73/100 text-center"
        >
          <div
            className="flex flex-col items-center justify-center g-0"
          >
            <h1
              className="text-2xl w-full md:text-4xl lg:text-6xl text-text-primary overflow-hidden pb-0 md:pb-1.5"
            >
              Faça perguntas. Ganhe carinho.
            </h1>
            <motion.h1
              layout
              transition={{
                ease: "backOut",
                type: "spring",
                bounce: 0.2,
                stiffness: 200,
              }}
              className="text-2xl w-full md:text-4xl lg:text-6xl text-text-primary
              overflow-hidden pb-4 md:pb-2 flex items-center justify-center max-h-15 gap-2.5"
            >
              <span
                className="overflow-hidden pb-2"
              >
                Descubra algo
              </span>
              <ZoopText
                className="bg-button-secondary rounded-2xl px-2 mt-2 h-full"
                texts={[
                  "novo.", "incrível.", "fantástico.", "inspirador.", "mágico.", "especial."
                ]}
              />
            </motion.h1>
          </div>
          <p
            className="text-md md:text-lg lg:text-2xl text-text-secondary w-full lg:w-8/10"
          >
            100% gratuita. Super fácil de usar. É só chamar que a Jhuly AI te ajuda com ideias, estudos, textos criativos e até aquele empurrãozinho.
          </p>
        </div>
        <section
          className="flex flex-col w-screen md:flex-row items-center justify-center gap-4 p-2"
        >
          <Button
            className="gap-x-1.5 w-9/10 md:w-auto"
            onClick={() => router.push("/chat")}
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
