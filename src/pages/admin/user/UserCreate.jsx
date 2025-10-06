import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../../../../config/axiosInstance";

export default function UserCreate() {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    phone: "",
    role: "",
    avatar: null,
    address: "",
  });
  const navigate = useNavigate();
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [roles, setRoles] = useState([]);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await axios.get("/users/roles");
        setRoles(Array.isArray(res.data.roles) ? res.data.roles : []);
      } catch (err) {
        console.error("Failed to fetch roles:", err);
      }
    };
    fetchRoles();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "avatar" && files.length > 0) {
      setFormData({ ...formData, avatar: files[0] });
      setAvatarPreview(URL.createObjectURL(files[0]));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "avatar") {
          if (value) form.append("avatar", value);
        } else {
          form.append(key, value);
        }
      });

      await axios.post("/users", form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("User created successfully!");
      navigate("/admin/users");
    } catch (err) {
      if (err.response?.status === 400) {
        setErrors(err.response.data.errors);
      } else {
        alert(
          "Failed to create user: " +
            (err.response?.data?.message || err.message)
        );
      }
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-2">Manage Users</h1>
      <nav className="text-sm text-gray-500 mb-6">
        <ol className="flex space-x-2">
          <li>
            <Link to="/admin" className="text-blue-600 hover:underline">
              Dashboard
            </Link>
            <span className="ms-2">/</span>
          </li>
          <li>
            <Link to="/admin/users" className="text-blue-600 hover:underline">
              Users
            </Link>
            <span className="ms-2">/</span>
          </li>
          <li className="text-gray-700">Create A User</li>
        </ol>
      </nav>

      <h5 className="text-lg font-semibold mb-6 max-w-lg mx-auto">
        Create A User
      </h5>

      {/* Error */}
      {Array.isArray(errors) &&
        errors.length > 0 &&
        errors.map((error, idx) => (
          <div
            key={idx}
            className="mx-auto max-w-lg mb-6 rounded-lg border border-red-400 bg-red-100 p-2.5 font-medium text-red-700"
            role="alert"
          >
            {error}
          </div>
        ))}

      <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
        {/* Full Name */}
        <div className="mb-5">
          <label className="block mb-2 text-sm font-medium text-gray-900">
            Full Name:
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg outline-none
               focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="your name"
          />
        </div>

        {/* Username */}
        <div className="mb-5">
          <label className="block mb-2 text-sm font-medium text-gray-900">
            Email:
          </label>
          <input
            type="email"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg outline-none focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="name@example.com"
          />
        </div>

        {/* Phone + Role */}
        <div className="grid grid-cols-2 gap-4">
          <div className="mb-5">
            <label className="block mb-2 text-sm font-medium text-gray-900">
              Phone:
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg outline-none focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            />
          </div>

          <div className="mb-5">
            <label className="block mb-2 text-sm font-medium text-gray-900">
              Role:
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg outline-none focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            >
              <option value="">-- Select role --</option>
              {Array.isArray(roles) &&
                roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Avatar */}
        <div className="mb-5">
          <label className="block mb-2 text-sm font-medium text-gray-900">
            Avatar:
          </label>
          <input
            type="file"
            name="avatar"
            accept=".png, .jpg, .jpeg"
            onChange={handleChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg outline-none focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          />
          {avatarPreview && (
            <img
              src={avatarPreview}
              alt="avatar preview"
              className="mt-3 max-h-48 rounded-lg"
            />
          )}
        </div>

        {/* Address */}
        <div className="mb-5">
          <label className="block mb-2 text-sm font-medium text-gray-900">
            Address:
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows="2"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg outline-none focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer"
        >
          Create
        </button>
      </form>
    </div>
  );
}
