// src/components/SubNavbar.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faReceipt,
  faHeart,
  faLocationDot,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";

const SubNavbar = ({ isLoggedIn, onLogout }) => {
  return (
    <AnimatePresence>
      {isLoggedIn && (
        <motion.nav
          key="subnavbar"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="w-full bg-neutral-950 border-t border-neutral-800 text-gray-300 text-sm flex justify-center gap-10 py-3 shadow-md cursor-pointer"
        >
          <button className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
            <FontAwesomeIcon icon={faReceipt} />
            Orders
          </button>
          <button className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
            <FontAwesomeIcon icon={faHeart} />
            Likes
          </button>
          <button className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
            <FontAwesomeIcon icon={faLocationDot} />
            Addresses
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-red-400 hover:text-red-500 transition-colors cursor-pointer"
          >
            <FontAwesomeIcon icon={faRightFromBracket} />
            Logout
          </button>
        </motion.nav>
      )}
    </AnimatePresence>
  );
};

export default SubNavbar;
