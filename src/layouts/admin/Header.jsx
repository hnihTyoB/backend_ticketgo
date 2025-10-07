import { useState, useEffect, useRef } from "react";
import logo from "../../../public/vite.svg";
import { Link } from "react-router-dom";
import { UserIcon } from "@heroicons/react/24/outline";

export default function Header({ setOpen }) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuRef]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white shadow-md">
      <div className="flex justify-between items-center px-6 py-3">
        <Link to="/admin" className="flex items-center gap-3">
          <img
            src={logo}
            alt="Logo"
            className="w-8 h-8 object-cover rounded-full"
          />
          <span className="text-base sm:text-xl md:text-2xl font-bold">
            Dashboard Demo
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <div className="relative flex items-center" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="text-white hover:text-gray-200"
            >
              <UserIcon className="h-6 w-6" />
            </button>

            <div
              className={`absolute right-0 top-11 w-30 origin-top-right transform rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition duration-100 ease-out ${
                isUserMenuOpen
                  ? "scale-100 opacity-100"
                  : "pointer-events-none scale-95 opacity-0"
              }`}
            >
              <div className="py-1 text-gray-700">
                <Link
                  to="/login"
                  className="block px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  Đăng ký
                </Link>
              </div>
            </div>
          </div>

          <button
            aria-controls="default-sidebar"
            type="button"
            onClick={() => setOpen((open) => !open)}
            className="inline-flex items-center p-2 text-gray-200 rounded-lg hover:bg-gray-100 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-gray-200 sm:hidden"
          >
            <span className="sr-only">Toggle sidebar</span>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                clipRule="evenodd"
                fillRule="evenodd"
                d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
