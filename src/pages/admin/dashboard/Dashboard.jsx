import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <>
      <div class="px-6 py-4">
        <h1 class="text-2xl font-bold mb-2">Dashboard</h1>
        <nav class="text-sm text-gray-500 mb-6">
          <ol class="flex space-x-2">
            <li class="after:content-['/'] after:mx-2">Dashboard</li>
          </ol>
        </nav>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="bg-blue-600 text-white rounded-2xl shadow-md overflow-hidden">
            <div class="p-4 text-lg font-semibold">Users</div>
            <div class="flex items-center justify-between bg-blue-700 px-4 py-3 text-sm">
              <Link to="/admin/users" class="hover:underline">
                View Details
              </Link>
              <i class="fas fa-angle-right"></i>
            </div>
          </div>

          <div class="bg-red-600 text-white rounded-2xl shadow-md overflow-hidden">
            <div class="p-4 text-lg font-semibold">Products</div>
            <div class="flex items-center justify-between bg-red-700 px-4 py-3 text-sm">
              <Link to="/admin/products" class="hover:underline">
                View Details
              </Link>
              <i class="fas fa-angle-right"></i>
            </div>
          </div>

          <div class="bg-green-600 text-white rounded-2xl shadow-md overflow-hidden">
            <div class="p-4 text-lg font-semibold">Orders</div>
            <div class="flex items-center justify-between bg-green-700 px-4 py-3 text-sm">
              <Link to="/admin/orders" class="hover:underline">
                View Details
              </Link>
              <i class="fas fa-angle-right"></i>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
