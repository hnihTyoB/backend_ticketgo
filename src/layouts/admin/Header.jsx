import { Link } from "react-router-dom";

export default function Header({ setOpen }) {
  return (
    <>
      <header className="bg-blue-600 text-white py-3 px-6 text-2xl font-bold flex justify-between items-center fixed top-0 left-0 right-0 z-50">
        <Link to="/admin">Dashboard Demo</Link>
        <button
          aria-controls="default-sidebar"
          type="button"
          className="inline-flex items-center p-2 text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 sm:hidden"
          onClick={() => setOpen((open) => !open)}
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
      </header>
    </>
  );
}
