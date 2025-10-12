import { Icon } from "@iconify-icon/react/dist/iconify.mjs";
import Button from "../Button";
import { useAside } from "@store/asideMenu";

export default function AsideMenuFooter() {
  console.debug(
    "[src/components/AsideMenu/AsideMenuFooter.tsx:AsideMenuFooter]",
    "Renderizei AsideMenuFooter"
  );
  const { toggleAside } = useAside();
  return (
    <div className="flex flex-col gap-2 overflow-hidden min-h-[90px]">
      <Button
        className="py-2 text-white flex items-center
                        justify-center text-center"
        variant={{
          size: "sm",
          color: "danger",
          hoverAnimationSize: 0.98,
          tapAnimationSize: 0.9,
        }}
        onClick={() => toggleAside()}
      >
        <Icon icon="ion:close" width={30} height={30} />
        Fechar menu
      </Button>
      <Button
        className="py-2 text-white gap-1.5 flex items-center
                        justify-center text-center"
        variant={{
          size: "sm",
          hoverAnimationSize: 0.98,
          tapAnimationSize: 0.9,
        }}
      >
        Configurações
        <Icon icon="octicon:gear-16" width="20" height="20" />
      </Button>
    </div>
  );
}
