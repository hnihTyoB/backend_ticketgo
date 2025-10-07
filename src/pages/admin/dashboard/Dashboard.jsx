import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../../../config/axiosInstance";

export default function Dashboard() {
  const [stats, setStats] = useState({
    countUser: 0,
    countProduct: 0,
    countOrder: 0,
    totalRevenue: 0,
  });

  const formatCurrency = (num) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(num || 0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await axios.get("/dashboard/count");
        if (res.data.info) {
          setStats(res.data.info);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <>
      <div class="px-6 py-4">
        <h1 class="text-2xl font-bold mb-2">Dashboard</h1>
        <nav class="text-sm text-gray-500 mb-6">
          <ol class="flex space-x-2">
            <li class="after:content-['/'] after:mx-2">Dashboard</li>
          </ol>
        </nav>

        <div class="bg-yellow-500 text-white rounded-2xl shadow-md overflow-hidden mb-6">
          <div class="p-4 text-lg font-semibold">
            Revenue ({formatCurrency(stats.totalRevenue)})
          </div>
          <div class="flex items-center justify-between bg-yellow-600 px-4 py-3 text-sm">
            <Link to="/admin/orders" class="hover:underline">
              View Details
            </Link>
            <i class="fas fa-angle-right"></i>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="bg-blue-600 text-white rounded-2xl shadow-md overflow-hidden">
            <div class="p-4 text-lg font-semibold">
              Users ({stats.countUser})
            </div>
            <div class="flex items-center justify-between bg-blue-700 px-4 py-3 text-sm">
              <Link to="/admin/users" class="hover:underline">
                View Details
              </Link>
              <i class="fas fa-angle-right"></i>
            </div>
          </div>

          <div class="bg-red-600 text-white rounded-2xl shadow-md overflow-hidden">
            <div class="p-4 text-lg font-semibold">
              Products ({stats.countProduct})
            </div>
            <div class="flex items-center justify-between bg-red-700 px-4 py-3 text-sm">
              <Link to="/admin/products" class="hover:underline">
                View Details
              </Link>
              <i class="fas fa-angle-right"></i>
            </div>
          </div>

          <div class="bg-green-600 text-white rounded-2xl shadow-md overflow-hidden">
            <div class="p-4 text-lg font-semibold">
              Orders ({stats.countOrder})
            </div>
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
