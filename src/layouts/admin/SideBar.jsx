import {
  faChartPie,
  faUsers,
  faCartShopping,
  faBox,
} from "@fortawesome/free-solid-svg-icons";
import SidebarItem from "./SidebarItem";

export default function SideBar({ open, setOpen }) {
  const handleOverlayClick = () => setOpen(false);
  return (
    <>
      <aside
        id="default-sidebar"
        className={`fixed top-14 left-0 z-40 w-64 h-[calc(100vh-3rem)] transition-transform
    ${
      open ? "translate-x-0" : "-translate-x-full"
    } sm:translate-x-0 sm:top-14 sm:h-[calc(100vh-3rem)]`}
        aria-label="Sidebar"
      >
        <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-800 flex flex-col">
          <ul className="space-y-2 font-medium flex-1">
            <SidebarItem to="/admin" icon={faChartPie} label="Dashboard" />
            <SidebarItem to="/admin/users" icon={faUsers} label="Users" />
            <SidebarItem
              to="/admin/products"
              icon={faCartShopping}
              label="Products"
            />
            <SidebarItem to="/admin/orders" icon={faBox} label="Order" />
          </ul>
          <div className="text-center text-lg font-semibold text-gray-700 mb-2">
            Logged in as:
          </div>
        </div>
      </aside>
      {open && (
        <div
          className="fixed top-16 inset-x-0 bottom-0 bg-black/40 backdrop-blur-sm z-30 sm:hidden"
          onClick={handleOverlayClick}
        />
      )}
    </>
  );
}
