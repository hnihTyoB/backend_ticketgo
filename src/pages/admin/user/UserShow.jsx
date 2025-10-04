import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Pagination from "../../../components/Pagination";
import axios from "../../../../config/axiosInstance";

export default function UserShow() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  const fetchUsers = async (page) => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`/users?page=${page}`);
      const data = res.data;

      const fetchedUsers = data.users || data.data || [];
      const pages = data.totalPages || data.total_pages || 1;

      setUsers(fetchedUsers);
      setTotalPages(pages);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await axios.delete(`/users/${id}`);

      setUsers((prevUsers) => {
        const newUsers = prevUsers.filter((u) => u.id !== id);
        if (newUsers.length === 0 && page > 1) setPage((p) => p - 1);
        return newUsers;
      });
    } catch (err) {
      alert("Delete failed: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="px-6 py-4">
      <h1 className="text-2xl font-bold mb-2">Manage Users</h1>

      <nav className="text-sm text-gray-500 mb-6">
        <ol className="flex space-x-2">
          <li>
            <Link to="/admin" className="text-blue-600 hover:underline">
              Dashboard
            </Link>
            <span className="ms-2">/</span>
          </li>
          <li className="text-gray-700">Users</li>
        </ol>
      </nav>

      <div className="flex items-center justify-between mb-4">
        <h5 className="text-lg font-semibold">Table users:</h5>
        <Link
          to="/admin/user-create"
          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition cursor-pointer"
        >
          Create a new user
        </Link>
      </div>

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-200">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Address</th>
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
            ) : users.length > 0 ? (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="odd:bg-white even:bg-gray-50 border-b"
                >
                  <th className="px-6 py-4 font-medium text-gray-900">
                    {user.id}
                  </th>
                  <td className="px-6 py-4">{user.fullName || user.name}</td>
                  <td className="px-6 py-4">{user.username}</td>
                  <td className="px-6 py-4">{user.address || "N/A"}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link
                        to={`/admin/user-detail/${user.id}`}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDelete(user.id)}
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
                  No users found.
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
