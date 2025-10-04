import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Pagination from "../../../components/Pagination";
import axios from "../../../../config/axiosInstance";

export default function ProductShow() {
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

      const res = await axios.get(`/products?page=${page}`);
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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      await axios.delete(`/products/${id}`);

      setProducts((prevProducts) => {
        const newProducts = prevProducts.filter((u) => u.id !== id);
        if (newProducts.length === 0 && page > 1) setPage((p) => p - 1);
        return newProducts;
      });
    } catch (err) {
      alert("Delete failed: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="px-6 py-4">
      <h1 className="text-2xl font-bold mb-2">Manage Products</h1>

      <nav className="text-sm text-gray-500 mb-6">
        <ol className="flex space-x-2">
          <li>
            <Link to="/admin" className="text-blue-600 hover:underline">
              Dashboard
            </Link>
            <span className="ms-2">/</span>
          </li>
          <li className="text-gray-700">Products</li>
        </ol>
      </nav>

      <div className="flex items-center justify-between mb-4">
        <h5 className="text-lg font-semibold">Table products:</h5>
        <Link
          to="/admin/product-create"
          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition cursor-pointer"
        >
          Create a new product
        </Link>
      </div>

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-200">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Price</th>
              <th className="px-6 py-3">Factory</th>
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
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                      >
                        Delete
                      </button>
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
