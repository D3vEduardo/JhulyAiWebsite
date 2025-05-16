'use client'
import Button from "@/component/csr/Button";
import { Icon } from "@iconify-icon/react";
import { motion } from "motion/react";
import { useAside } from "@store/asideMenu";

export default function ChatsAside() {

    const { toggleAside, asideIsOpen } = useAside();

    const chats = [
        'Como criar um projeto em nextjs?',
        'Detalhes sobre a documentação do nextjs.',
        'Quero aprender go lang.',
        'Como criar um projeto em nextjs?',
        'Detalhes sobre a documentação do nextjs.',
        'Quero aprender go lang.',
        'Como criar um projeto em nextjs?',
        'Detalhes sobre a documentação do nextjs.',
        'Quero aprender go lang.',
        'Como criar um projeto em nextjs?',
        'Detalhes sobre a documentação do nextjs.',
        'Quero aprender go lang.',
        'Como criar um projeto em nextjs?',
        'Detalhes sobre a documentação do nextjs.',
        'Quero aprender go lang.',
        'Como criar um projeto em nextjs?',
        'Detalhes sobre a documentação do nextjs.',
        'Quero aprender go lang.',
        'Como criar um projeto em nextjs?',
        'Detalhes sobre a documentação do nextjs.',
        'Quero aprender go lang.',
        'Como criar um projeto em nextjs?',
        'Detalhes sobre a documentação do nextjs.',
        'Quero aprender go lang.',
        'Como criar um projeto em nextjs?',
        'Detalhes sobre a documentação do nextjs.',
        'Quero aprender go lang.',
        'Como criar um projeto em nextjs?',
        'Detalhes sobre a documentação do nextjs.',
        'Quero aprender go lang.'
    ];

    return (
        <motion.div
            animate={{
                x: asideIsOpen ? 0 : "-100%",
                opacity: asideIsOpen ? 1 : 0
            }}
            className="h-[96vh] w-95/100 md:w-64 flex flex-col bg-input-bg rounded-lg p-2 z-50
        border-2 border-input-border absolute left-1/2 -translate-x-1/2 md:translate-x-0 md:left-5 top-1/2 -translate-y-1/2">
            {/* Botão de novo chat */}
            <Button
                className="py-2 gap-0.5 flex items-center
                justify-center text-center"
                variant={{
                    color: "secondary",
                    size: "sm",
                    hoverAnimationSize: 0.98,
                    tapAnimationSize: 0.9
                }}
            >
                Novo chat
            </Button>

            {/* Título da seção de chats */}
            <div className="relative flex items-center justify-center
            text-center my-2 overflow-hidden">
                <span
                    className="w-full rounded-2xl bg-input-border h-0.5"
                />
                <p className="text-input-border text-center w-full">Chats</p>
                <span
                    className="w-full rounded-2xl bg-input-border h-0.5"
                />
            </div>

            {/* Lista de chats */}
            <section
                className="flex flex-col justify-between h-full"
            >
                <div className="flex flex-col gap-2 w-full h-[70vh] overflow-y-auto relative">
                    {chats.map((chat, index) => (
                        <Button
                            className="py-2 justify-start text-start items-start w-full min-h-11"
                            key={index}
                            variant={{
                                size: "sm",
                                color: index == 1 ? "quarternary" : "tertiary",
                                hoverAnimationSize: 0.98,
                                tapAnimationSize: 0.9
                            }}
                        >
                            <p className="truncate w-full">{chat}</p>
                        </Button>
                    ))}
                    <span
                        className="w-full h-6 bg-gradient-to-b
                        to-transparent from-input-bg fixed"
                    /><span
                        className="w-full h-6 bg-gradient-to-t
                        to-transparent from-input-bg fixed bottom-29"
                    />
                </div>
                <div
                    className="flex flex-col gap-2 mt-4"
                >
                    <Button
                        className="py-2 text-white gap-0.5 flex items-center
                        justify-center text-center"
                        variant={{
                            size: "sm",
                            color: "danger",
                            hoverAnimationSize: 0.98,
                            tapAnimationSize: 0.9
                        }}
                        onClick={() => toggleAside()}
                    >
                        Fechar menu
                    </Button>
                    <Button
                        className="py-2 text-white gap-1.5 flex items-center
                        justify-center text-center"
                        variant={{
                            size: "sm",
                            hoverAnimationSize: 0.98,
                            tapAnimationSize: 0.9
                        }}
                    >
                        Configurações<Icon icon="octicon:gear-16" width="20" height="20" />
                    </Button>
                </div>
            </section>
        </motion.div>
    );
}