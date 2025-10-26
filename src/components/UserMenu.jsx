import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faBox, faHeart, faLocationDot, faRightFromBracket, faReceipt } from "@fortawesome/free-solid-svg-icons";

const UserMenu = ({ onLoginClick, isLoggedIn = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {/* --- User Icon --- */}
      <button
        onClick={() => {
          if (!isLoggedIn) return onLoginClick();
          setIsOpen(!isOpen);
        }}
        className="text-white text-xl hover:scale-110 transition-transform"
      >
        <FontAwesomeIcon icon={faUser} />
      </button>

      {/* --- Dropdown Panel --- */}
      <AnimatePresence>
        {isOpen && isLoggedIn && (
          <motion.div
            key="user-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="absolute right-0 mt-4 w-48 bg-neutral-900 border border-neutral-700 rounded-2xl shadow-lg overflow-hidden"
          >
            <ul className="text-gray-300 text-sm">
              <li className="flex items-center gap-2 px-4 py-3 hover:bg-neutral-800 cursor-pointer">
                <FontAwesomeIcon icon={faReceipt} className="text-gray-400" />
                Orders
              </li>
              <li className="flex items-center gap-2 px-4 py-3 hover:bg-neutral-800 cursor-pointer">
                <FontAwesomeIcon icon={faHeart} className="text-gray-400" />
                Likes
              </li>
              <li className="flex items-center gap-2 px-4 py-3 hover:bg-neutral-800 cursor-pointer">
                <FontAwesomeIcon icon={faLocationDot} className="text-gray-400" />
                Addresses
              </li>
              <li className="flex items-center gap-2 px-4 py-3 hover:bg-neutral-800 text-red-400 cursor-pointer border-t border-neutral-800">
                <FontAwesomeIcon icon={faRightFromBracket} />
                Logout
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;
