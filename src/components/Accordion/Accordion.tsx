"use client";
import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Icon } from "@iconify-icon/react/dist/iconify.mjs";

type PropsType = {
  title: string;
  content: ReactNode;
};

export default function Accordion({ title, content }: PropsType) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full">
      <motion.div
        className="flex items-center justify-between w-full p-4 bg-papaya rounded-t-2xl cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
        initial={false}
      >
        <h3 className="text-lg font-medium text-cocoa">{title}</h3>
        <motion.div
          className="text-cocoa"
          initial={false}
          animate={{ rotate: isOpen ? 180 : 0, y: isOpen ? -4 : 4 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          <Icon icon="heroicons:chevron-down" width="24" height="24" />
        </motion.div>
      </motion.div>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            className="p-4 bg-papaya/70 rounded-b-2xl text-cocoa"
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
