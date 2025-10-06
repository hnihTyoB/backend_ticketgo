import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../../../../config/axiosInstance";

export default function OrderDetail() {
  const { id } = useParams();
  const [orderDetails, setOrderDetails] = useState([]);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const res = await axios.get(`/orders/${id}`);
        setOrderDetails(res.data.orderDetails || []);
      } catch (err) {
        console.error("Error fetching order details:", err);
      }
    };

    fetchOrderDetails();
  }, [id]);

  const formatCurrency = (num) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(num || 0);

  const total = orderDetails.reduce(
    (sum, item) => sum + item.quantity * item.product.price,
    0
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Manage Orders</h1>

      <nav className="text-sm text-gray-500 mb-6">
        <ol className="flex space-x-2">
          <li>
            <Link to="/admin" className="text-blue-600 hover:underline">
              Dashboard
            </Link>
            <span className="ms-2">/</span>
          </li>
          <li>
            <Link to="/admin/orders" className="text-blue-600 hover:underline">
              Orders
            </Link>
            <span className="ms-2">/</span>
          </li>
          <li className="text-gray-700">Order Details</li>
        </ol>
      </nav>

      <div className="flex items-center justify-between mb-4">
        <h5 className="text-lg font-semibold">
          Order details ID: <span className="text-green-600 text-lg">{id}</span>
        </h5>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-gray-900 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Sản phẩm</th>
              <th className="px-6 py-3">Tên</th>
              <th className="px-6 py-3">Giá</th>
              <th className="px-6 py-3">Số lượng</th>
              <th className="px-6 py-3">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {orderDetails.length > 0 ? (
              orderDetails.map((item, idx) => (
                <tr
                  key={idx}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <img
                      src={`/images/product/${item.product.image}`}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-full"
                    />
                  </td>
                  <td className="px-6 py-4 font-medium">
                    <Link
                      to={`/product/${item.product.id}`}
                      target="_blank"
                      className="text-blue-600 hover:underline"
                    >
                      {item.product.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    {formatCurrency(item.product.price)}
                  </td>
                  <td className="px-6 py-4">{item.quantity}</td>
                  <td className="px-6 py-4 font-semibold">
                    {formatCurrency(item.quantity * item.product.price)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-6 text-gray-500 italic"
                >
                  Không có sản phẩm nào trong đơn hàng này.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {orderDetails.length > 0 && (
        <div className="flex justify-end mt-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-5 py-3 shadow-sm">
            <p className="text-gray-700 font-semibold">
              Tổng cộng:{" "}
              <span className="text-green-600 text-lg">
                {formatCurrency(total)}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
