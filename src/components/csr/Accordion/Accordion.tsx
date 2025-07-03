"use client";
import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { tv } from "tailwind-variants";
import { Icon } from "@iconify-icon/react/dist/iconify.mjs";

type PropsType = {
  title: string;
  content: ReactNode;
};

const accordion = tv({
  slots: {
    base: "w-full",
    header:
      "flex items-center justify-between w-full p-4 bg-apricot rounded-t-lg cursor-pointer",
    title: "text-lg font-medium text-cocoa",
    icon: "text-cocoa",
    content: "p-4 bg-peach rounded-b-lg",
  },
});

export default function Accordion({ title, content }: PropsType) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    base,
    header,
    title: titleStyle,
    icon,
    content: contentStyle,
  } = accordion();

  return (
    <div className={base()}>
      <motion.div
        className={header()}
        onClick={() => setIsOpen(!isOpen)}
        initial={false}
      >
        <h3 className={titleStyle()}>{title}</h3>
        <motion.div
          className={icon()}
          initial={false}
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Icon icon="heroicons:chevron-down" width="24" height="24" />
        </motion.div>
      </motion.div>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            className={contentStyle()}
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, maxHeight: "500px" },
              collapsed: { opacity: 0, maxHeight: 0 },
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
