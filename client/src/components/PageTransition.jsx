import { motion } from "framer-motion";

export default function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 32 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -18 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className="mx-auto w-full max-w-7xl"
    >
      {children}
    </motion.div>
  );
}
