import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function SidebarItem({ to, icon, label }) {
  return (
    <li>
      <Link
        to={to}
        className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
      >
        <FontAwesomeIcon
          icon={icon}
          className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
        />
        <span className="flex-1 ms-3 whitespace-nowrap">{label}</span>
      </Link>
    </li>
  );
}
