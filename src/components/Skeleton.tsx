import { motion } from "framer-motion";

export function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
      className={`bg-gray-200 rounded-md ${className}`}
    />
  );
}
