import { useState } from "react";
import Header from "./Header";
import SideBar from "./SideBar";

export default function Layout({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Header setOpen={setOpen} />
      <SideBar open={open} setOpen={setOpen} />
      <div className="p-4 sm:ml-64 mt-16">{children}</div>
    </div>
  );
}
