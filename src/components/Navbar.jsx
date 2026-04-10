import React from "react";
import logo from "../assets/S-logo-removebg.png";
import TitlePiece from "../assets/Sbtrn_Logo_Type.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping, faUser } from "@fortawesome/free-solid-svg-icons";
import { Link, NavLink } from "react-router-dom";

const Navbar = ({
  onLoginHoverStart,
  onLoginHoverEnd,
  onLoginClick,
  onCartHoverStart,
  onCartHoverEnd,
  onCheckoutClick,
}) => {
  const navLinkClass = ({ isActive }) =>
    `text-[0.72rem] tracking-[0.22em] uppercase transition ${
      isActive ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-900"
    }`;

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-zinc-200">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="h-16 flex items-center">
          {/* LEFT: S logo */}
          {/* <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center">
              <img
                src={logo}
                alt="Subterrain logo"
                className="h-8 w-auto opacity-90 hover:opacity-100 transition"
              />
            </Link>
          </div> */}

          {/* CENTER: Title + Nav */}
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-10">
              {/* TitlePiece (small, clean) */}
              <Link to="/" className="hidden sm:flex items-center">
                <img
                  src={TitlePiece}
                  alt="Subterrain"
                  className="h-6 w-auto opacity-95 hover:opacity-100 transition"
                />
              </Link>

              {/* Montirex-style nav links */}
              <nav className="hidden md:flex items-center gap-8">
                <NavLink to="/" className={navLinkClass} end>
                  New
                </NavLink>
                <NavLink to="/category/men" className={navLinkClass}>
                  Men
                </NavLink>
                <NavLink to="/category/women" className={navLinkClass}>
                  Women
                </NavLink>
                <NavLink to="/category/accessories" className={navLinkClass}>
                  Accessories
                </NavLink>
                <NavLink to="/outlet" className={navLinkClass}>
                  Outlet
                </NavLink>
              </nav>
            </div>
          </div>

          {/* RIGHT: icons */}
          <div className="flex items-center gap-5">
            <button
              className="text-zinc-800 text-xl hover:text-black transition cursor-pointer"
              onMouseEnter={onCartHoverStart}
              onMouseLeave={onCartHoverEnd}
              onClick={onCheckoutClick}
              aria-label="Cart"
              type="button"
            >
              <FontAwesomeIcon icon={faCartShopping} />
            </button>

            <button
              className="text-zinc-800 text-xl hover:text-black transition cursor-pointer"
              onMouseEnter={onLoginHoverStart}
              onMouseLeave={onLoginHoverEnd}
              onClick={onLoginClick}
              aria-label="Account"
              type="button"
            >
              <FontAwesomeIcon icon={faUser} />
            </button>
          </div>
        </div>
      </div>

      {/* Optional: slim promo bar like Montirex */}
      <div className="hidden sm:block border-t border-zinc-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 h-9 flex items-center justify-center">
          <p className="text-[0.7rem] tracking-[0.18em] uppercase text-zinc-500">
            Free delivery when you spend £60+
          </p>
        </div>
      </div>
    </header>
  );
};

export default Navbar;