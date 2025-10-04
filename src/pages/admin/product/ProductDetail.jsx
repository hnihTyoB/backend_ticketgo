import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "../../../../config/axiosInstance";
import { FACTORIES, TARGETS } from "../../../../config/constant";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    detailDesc: "",
    shortDesc: "",
    quantity: "",
    factory: "",
    target: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [factories] = useState(Object.values(FACTORIES));
  const [targets] = useState(Object.values(TARGETS));
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/products/${id}`);
        const product = res.data;
        setFormData({
          name: product.name || "",
          price: product.price || "",
          detailDesc: product.detailDesc || "",
          shortDesc: product.shortDesc || "",
          quantity: product.quantity || "",
          factory: product.factory || "",
          target: product.target || "",
          image: null,
        });
        if (product.image) {
          setImagePreview(`/images/product/${product.image}`);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      }
    };

    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files.length > 0) {
      setFormData({ ...formData, image: files[0] });
      setImagePreview(URL.createObjectURL(files[0]));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      form.append("name", formData.name);
      form.append("price", formData.price);
      form.append("detailDesc", formData.detailDesc);
      form.append("shortDesc", formData.shortDesc);
      form.append("quantity", formData.quantity);
      form.append("factory", formData.factory);
      form.append("target", formData.target);
      if (formData.image) {
        form.append("image", formData.image);
      }

      await axios.put(`/products/${id}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Cập nhật thành công!");
      navigate("/admin/products");
    } catch (err) {
      if (err.response?.status === 400) {
        setErrors(err.response.data.errors);
      } else {
        alert(
          "Failed to update product: " +
            (err.response?.data?.message || err.message)
        );
      }
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-2">Manage Products</h1>
      <nav className="text-sm text-gray-500 mb-6">
        <ol className="flex space-x-2">
          <li>
            <Link to="/admin" className="text-blue-600 hover:underline">
              Dashboard
            </Link>
            <span className="ms-2">/</span>
          </li>
          <li>
            <Link
              to="/admin/products"
              className="text-blue-600 hover:underline"
            >
              Product
            </Link>
          </li>
        </ol>
      </nav>

      <h5 className="text-lg font-semibold mb-6 max-w-lg mx-auto">
        Detail Product
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
        <div className="grid grid-cols-2 gap-4">
          <div className="mb-5">
            <label className="block mb-2 text-sm font-medium text-gray-900">
              Name:
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg outline-none focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            />
          </div>
          <div className="mb-5">
            <label className="block mb-2 text-sm font-medium text-gray-900">
              Price:
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg outline-none focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            />
          </div>
        </div>

        <div className="mb-5">
          <label className="block mb-2 text-sm font-medium text-gray-900">
            Detail Description:
          </label>
          <textarea
            type="text"
            name="detailDesc"
            value={formData.detailDesc}
            onChange={handleChange}
            rows="2"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg outline-none focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="mb-5">
            <label className="block mb-2 text-sm font-medium text-gray-900">
              Short Description:
            </label>
            <input
              type="text"
              name="shortDesc"
              value={formData.shortDesc}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg outline-none focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            />
          </div>
          <div className="mb-5">
            <label className="block mb-2 text-sm font-medium text-gray-900">
              Quantity:
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg outline-none focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="mb-5">
            <label className="block mb-2 text-sm font-medium text-gray-900">
              Factory:
            </label>
            <select
              name="factory"
              value={formData.factory}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg outline-none focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            >
              <option value="">-- Select factory --</option>
              {Array.isArray(factories) &&
                factories.map((factory, index) => (
                  <option key={index} value={factory}>
                    {factory}
                  </option>
                ))}
            </select>
          </div>
          <div className="mb-5">
            <label className="block mb-2 text-sm font-medium text-gray-900">
              Target:
            </label>
            <select
              name="target"
              value={formData.target}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg outline-none focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            >
              <option value="">-- Select target --</option>
              {Array.isArray(targets) &&
                targets.map((target, index) => (
                  <option key={index} value={target}>
                    {target}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="mb-5">
          <label className="block mb-2 text-sm font-medium text-gray-900">
            Avatar:
          </label>
          <input
            type="file"
            name="image"
            accept=".png, .jpg, .jpeg"
            onChange={handleChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg outline-none focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="product preview"
              className="mt-3 max-h-48 rounded-lg border"
            />
          )}
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer"
        >
          Update
        </button>
      </form>
    </div>
  );
}
