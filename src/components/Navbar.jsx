import React, { useMemo, useState } from "react";
import TitlePiece from "../assets/Sbtrn_Logo_Type.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCartShopping,
  faUser,
  faBars,
  faXmark,
  faTruck,
  faRotateLeft,
} from "@fortawesome/free-solid-svg-icons";
import { Link, NavLink, useNavigate } from "react-router-dom";

const Navbar = ({
  onLoginHoverStart,
  onLoginHoverEnd,
  onLoginClick,
  onCartHoverStart,
  onCartHoverEnd,
  onCheckoutClick,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const links = useMemo(
    () => [
      { to: "/", label: "New", end: true },
      { to: "/category/men", label: "Men" },
      { to: "/category/women", label: "Women" },
      { to: "/category/accessories", label: "Accessories" },
      { to: "/outlet", label: "Outlet" },
    ],
    []
  );

  const navLinkClass = ({ isActive }) =>
    `text-[0.72rem] tracking-[0.32em] uppercase transition ${
      isActive ? "text-zinc-950" : "text-zinc-500 hover:text-zinc-950"
    }`;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-zinc-200">
      {/* Utility bar */}
      <div className="hidden sm:block border-b border-zinc-200 bg-white">
        <div className="mx-auto w-full max-w-6xl px-6 sm:px-8 h-9 flex items-center justify-between">
          <div className="flex items-center gap-6 text-[0.68rem] tracking-[0.18em] uppercase text-zinc-500">
            <span className="inline-flex items-center gap-2">
              <FontAwesomeIcon icon={faTruck} />
              Free delivery over £60
            </span>
            <span className="inline-flex items-center gap-2">
              <FontAwesomeIcon icon={faRotateLeft} />
              Easy returns
            </span>
          </div>
          <div className="text-[0.68rem] tracking-[0.18em] uppercase text-zinc-500">
            UK Shipping
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">
        <div className="h-16 grid grid-cols-[1fr_auto_1fr] items-center">

          {/* LEFT: wordmark */}
          <div className="justify-self-start min-w-0">
            <Link to="/" className="inline-flex items-center">
              <img
                src={TitlePiece}
                alt="Subterrain"
                className="h-6 w-auto opacity-95 hover:opacity-100 transition"
              />
            </Link>
          </div>

          {/* CENTER: nav */}
          <nav className="hidden md:flex items-center gap-10 justify-self-center">
            {links.map((l) => (
              <NavLink
                key={l.label}
                to={l.to}
                end={l.end}
                className={navLinkClass}
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* RIGHT: actions */}
          <div className="justify-self-end flex items-center gap-1">
            {/* Desktop actions */}
            <div className="hidden sm:flex items-center gap-1">
              <button
                type="button"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-[0.72rem] tracking-[0.22em] uppercase text-zinc-600 hover:text-zinc-950 transition"
                onMouseEnter={onCartHoverStart}
                onMouseLeave={onCartHoverEnd}
                onClick={onCheckoutClick}
                aria-label="Cart"
              >
                <FontAwesomeIcon icon={faCartShopping} className="text-[0.95rem]" />
                <span>Cart</span>
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-[0.72rem] tracking-[0.22em] uppercase text-zinc-600 hover:text-zinc-950 transition"
                onMouseEnter={onLoginHoverStart}
                onMouseLeave={onLoginHoverEnd}
                onClick={onLoginClick}
                aria-label="Account"
              >
                <FontAwesomeIcon icon={faUser} className="text-[0.95rem]" />
                <span>Account</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-full border border-zinc-200 text-zinc-900 hover:border-zinc-400 transition"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menu"
            >
              <FontAwesomeIcon icon={mobileOpen ? faXmark : faBars} />
            </button>
          </div>
        </div>
      </div>

      {/* Promo bar */}
      {/* <div className="border-t border-zinc-200 bg-white">
        <div className="mx-auto w-full max-w-6xl px-6 sm:px-8 h-9 flex items-center justify-center">
          <p className="text-[0.7rem] tracking-[0.22em] uppercase text-zinc-500">
            Free delivery when you spend £60+
          </p>
        </div>
      </div> */}

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-200 bg-white">
          <div className="mx-auto w-full max-w-6xl px-6 sm:px-8 py-4 space-y-3">
            <div className="grid gap-2">
              {links.map((l) => (
                <button
                  key={l.label}
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    navigate(l.to);
                  }}
                  className="text-left py-3 px-3 rounded-xl border border-zinc-200 text-[0.78rem] tracking-[0.22em] uppercase text-zinc-700 hover:text-zinc-950 hover:border-zinc-400 transition"
                >
                  {l.label}
                </button>
              ))}
            </div>

            <div className="pt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onCheckoutClick?.();
                }}
                className="py-3 rounded-xl border border-zinc-200 text-[0.78rem] tracking-[0.22em] uppercase text-zinc-700 hover:text-zinc-950 hover:border-zinc-400 transition"
              >
                Cart
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onLoginClick?.();
                }}
                className="py-3 rounded-xl border border-zinc-200 text-[0.78rem] tracking-[0.22em] uppercase text-zinc-700 hover:text-zinc-950 hover:border-zinc-400 transition"
              >
                Account
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
