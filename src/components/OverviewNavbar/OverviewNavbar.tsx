"use client";
import Image from "next/image";
import JhulyNoBg from "@public/avatars/avatar_nobg.png";
import { Icon } from "@iconify-icon/react";
import OverviewNavbarItem from "./OverviewNavbarItem";
import LoginOrGoToChatItem from "./LoginOrGoToChatItem";
import { useIsClient } from "@hooks/useIsClient";
import { useWindowSize } from "@hooks/useWindowSize";
import { ToggleMenuButton } from "./ToggleMenuButton";
import {
  NavbarMenuContextProvider,
  useNavbarMenuContext,
} from "./NavbarMenuContext";
import { motion } from "motion/react";
import { useMemo } from "react";

function HomeNavbarContent() {
  const isClient = useIsClient();
  const innerWidth = useWindowSize();
  const { menuIsOpen } = useNavbarMenuContext();

  const isMobile = useMemo(
    () => isClient && innerWidth < 769,
    [innerWidth, isClient],
  );

  const navFlexDirection = menuIsOpen && isMobile ? "column" : "row";
  const sectionFlexDirection = menuIsOpen && isMobile ? "column" : "row";
  const sectionGap = menuIsOpen && isMobile ? "0.5rem" : "1rem";

  return (
    <motion.nav
      className="absolute bg-navbar border-almond border-2 z-40
      overflow-hidden flex px-4 py-1.5 bg-peach"
      initial={{
        height: menuIsOpen ? (isMobile ? "100svh" : "3.5rem") : "3.5rem",
        width: isMobile ? (menuIsOpen ? "100vw" : "90vw") : "70vw",
        borderRadius: isMobile && menuIsOpen ? "0" : "1rem",
        top: isMobile ? (menuIsOpen ? "0" : "1.5rem") : "2.5rem",
        left: isMobile && menuIsOpen ? "0" : "50%",
        translateX: isMobile && menuIsOpen ? "0" : "-50%",
        flexDirection: navFlexDirection,
        justifyContent: menuIsOpen && isMobile ? "center" : "space-between",
        alignItems: "center",
      }}
      animate={{
        height: menuIsOpen ? (isMobile ? "100svh" : "3.5rem") : "3.5rem",
        width: isMobile ? (menuIsOpen ? "100vw" : "90vw") : "70vw",
        borderRadius: isMobile && menuIsOpen ? "0" : "1rem",
        top: isMobile ? (menuIsOpen ? "0" : "1.5rem") : "2.5rem",
        left: isMobile && menuIsOpen ? "0" : "50%",
        translateX: isMobile && menuIsOpen ? "0" : "-50%",
        flexDirection: navFlexDirection,
        justifyContent: menuIsOpen && isMobile ? "center" : "space-between",
        alignItems: "center",
      }}
      transition={{
        height: { type: "spring", stiffness: 150, damping: 14, mass: 0.8 },
        width: { type: "spring", stiffness: 120, damping: 15, mass: 0.8 },
        borderRadius: {
          type: "spring",
          stiffness: 100,
          damping: 18,
          mass: 0.8,
        },
        top: { type: "spring", stiffness: 150, damping: 14, mass: 0.8 },
        translateX: { type: "spring", stiffness: 150, damping: 14, mass: 0.8 },
        flexDirection: { duration: 0 },
      }}
    >
      <motion.div
        className="flex items-center md:w-auto gap-4"
        initial={{
          position: isMobile && menuIsOpen ? "absolute" : "relative",
          top: isMobile && menuIsOpen ? "0" : "auto",
          left: 0,
          width: isMobile ? "100%" : "auto",
          padding: isMobile ? "1rem" : 0,
          zIndex: 50,
        }}
        animate={{
          position: isMobile && menuIsOpen ? "absolute" : "relative",
          top: isMobile && menuIsOpen ? "0" : "auto",
          left: 0,
          width: isMobile ? "100%" : "auto",
          padding: isMobile ? "1rem" : 0,
          zIndex: 50,
        }}
      >
        <Image
          className="h-10 w-auto custom-cursor-hover"
          src={JhulyNoBg}
          alt="Jhuly AI picture"
          style={{
            maskImage: "linear-gradient(to top, transparent 0%, black 35%)",
          }}
        />
        {isMobile && (
          <div style={{ marginLeft: "auto" }}>
            <ToggleMenuButton />
          </div>
        )}
      </motion.div>
      {(isMobile && menuIsOpen) || !isMobile ? (
        <motion.section
          className="flex items-center overflow-visible"
          initial={{
            flexDirection: sectionFlexDirection,
            gap: sectionGap,
            marginTop: isMobile ? "1rem" : "0",
            marginLeft: !isMobile ? "auto" : "0",
          }}
          animate={{
            flexDirection: sectionFlexDirection,
            gap: sectionGap,
            marginTop: isMobile ? "1rem" : "0",
            marginLeft: !isMobile ? "auto" : "0",
          }}
          transition={{
            gap: {
              type: "spring",
              stiffness: 150,
              damping: 14,
              mass: 0.8,
            },
            marginTop: { duration: 0.3 },
            marginLeft: { duration: 0.3 },
          }}
        >
          <OverviewNavbarItem
            href="https://github.com/d3veduardo"
            target="_blank"
          >
            <Icon icon="fluent:code-block-16-filled" width="24" height="24" />
            <p>Desenvolvedor</p>
          </OverviewNavbarItem>

          <LoginOrGoToChatItem />
        </motion.section>
      ) : null}
    </motion.nav>
  );
}

export default function HomeNavbar() {
  return (
    <NavbarMenuContextProvider>
      <HomeNavbarContent />
    </NavbarMenuContextProvider>
  );
}
