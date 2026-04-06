"use client";
import { motion } from "framer-motion";
const SplashScreen = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="text-center space-y-8"
      >
        <div className="relative inline-block">
          <motion.h1 
            initial={{ letterSpacing: "0.2em", opacity: 0 }}
            animate={{ letterSpacing: "-0.05em", opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="text-8xl font-black text-accent tracking-tighter font-bruno"
          >
            vitMaps
          </motion.h1>
          <div className="absolute -inset-2 bg-accent/20 blur-2xl rounded-full -z-10" />
        </div>

        <p className="text-2xl text-gray-500 font-medium tracking-[0.3em] uppercase font-bebas">
          Indoor Navigation System
        </p>

        <div className="mt-12 w-64 h-0.5 rounded-full bg-white/5 overflow-hidden mx-auto relative">
          <motion.div
            className="h-full bg-accent"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              repeat: Infinity,
              repeatType: "loop",
              duration: 2,
              ease: "easeInOut",
            }}
          />
        </div>
      </motion.div>
    </div>
  );
};
export default SplashScreen;