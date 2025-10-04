import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Pagination from "../../../components/Pagination";
import axios from "../../../../config/axiosInstance";

export default function OrderShow() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts(page);
  }, [page]);

  const fetchProducts = async (page) => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`/orders?page=${page}`);
      const data = res.data;

      const fetchedProducts = data.products || data.data || [];
      const pages = data.totalPages || data.total_pages || 1;

      setProducts(fetchedProducts);
      setTotalPages(pages);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-6 py-4">
      <h1 className="text-2xl font-bold mb-2">Manage Orders</h1>

      <nav className="text-sm text-gray-500 mb-6">
        <ol className="flex space-x-2">
          <li>
            <Link to="/admin" className="text-blue-600 hover:underline">
              Dashboard
            </Link>
            <span className="ms-2">/</span>
          </li>
          <li className="text-gray-700">Orders</li>
        </ol>
      </nav>

      <div className="flex items-center justify-between mb-4">
        <h5 className="text-lg font-semibold">Table orders:</h5>
      </div>

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-200">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">User</th>
              <th className="px-6 py-3">Total Price</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Payment Method</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="5" className="text-center py-4 text-red-500">
                  Error: {error}
                </td>
              </tr>
            ) : products.length > 0 ? (
              products.map((product) => (
                <tr
                  key={product.id}
                  className="odd:bg-white even:bg-gray-50 border-b"
                >
                  <th className="px-6 py-4 font-medium text-gray-900">
                    {product.id}
                  </th>
                  <td className="px-6 py-4">
                    {product.fullName || product.name}
                  </td>
                  <td className="px-6 py-4">{product.price}</td>
                  <td className="px-6 py-4">{product.factory || "N/A"}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link
                        to={`/admin/product-detail/${product.id}`}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                      >
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
      />
    </div>
  );
}
