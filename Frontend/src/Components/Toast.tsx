import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, X, Download, Eye, AlertCircle, Info } from "lucide-react";
interface ToastProps {
  message: string;
  type: "success" | "error" | "info";
  icon?: "download" | "preview" | "check";
  duration?: number;
  onClose: () => void;
}
const Toast: React.FC<ToastProps> = ({
  message,
  type,
  icon = "check",
  duration = 3000,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  const getIcon = () => {
    const iconClass = "w-6 h-6";
    switch (icon) {
      case "download":
        return <Download className={iconClass} />;
      case "preview":
        return <Eye className={iconClass} />;
      default:
        return <CheckCircle className={iconClass} />;
    }
  };
  const getErrorIcon = () => {
    return <AlertCircle className="w-6 h-6" />;
  };
  const getInfoIcon = () => {
    return <Info className="w-6 h-6" />;
  };
  const getStyles = () => {
    switch (type) {
      case "success":
        return {
          container:
            "bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 shadow-lg",
          text: "text-green-800",
          icon: "text-green-600",
        };
      case "error":
        return {
          container:
            "bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 shadow-lg",
          text: "text-red-800",
          icon: "text-red-600",
        };
      default:
        return {
          container:
            "bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 shadow-lg",
          text: "text-blue-800",
          icon: "text-blue-600",
        };
    }
  };
  const styles = getStyles();
  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.3 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.5, transition: { duration: 0.2 } }}
      className={`fixed top-6 right-6 z-50 max-w-md w-full ${styles.container} rounded-xl p-5 backdrop-blur-sm`}
    >
      <div className="flex items-start">
        <motion.div
          className={`flex-shrink-0 ${styles.icon}`}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            delay: 0.2,
            type: "spring",
            stiffness: 200,
            damping: 15,
          }}
        >
          {type === "error"
            ? getErrorIcon()
            : type === "info"
            ? getInfoIcon()
            : getIcon()}
        </motion.div>
        <motion.div
          className="ml-4 flex-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className={`text-sm font-semibold leading-relaxed ${styles.text}`}>
            {message}
          </p>
        </motion.div>
        <motion.div
          className="ml-4 flex-shrink-0"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <motion.button
            onClick={onClose}
            className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none p-1 rounded-full hover:bg-white/50 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent rounded-full"
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: duration / 1000, ease: "linear" }}
      />
    </motion.div>
  );
};
export default Toast;
