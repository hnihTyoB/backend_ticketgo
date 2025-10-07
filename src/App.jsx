import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./layouts/admin/Layout";
import Dashboard from "./pages/admin/dashboard/Dashboard";
import UserShow from "./pages/admin/user/UserShow";
import UserCreate from "./pages/admin/user/UserCreate";
import UserDetail from "./pages/admin/user/UserDetail";
import ProductShow from "./pages/admin/product/ProductShow";
import ProductDetail from "./pages/admin/product/ProductDetail";
import ProductCreate from "./pages/admin/product/ProductCreate";
import OrderShow from "./pages/admin/order/OrderShow";
import OrderDetail from "./pages/admin/order/OrderDetail";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* <Route path="/login" element={<Login />} /> */}

          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/users" element={<UserShow />} />
          <Route path="/admin/user-detail/:id" element={<UserDetail />} />
          <Route path="/admin/user-create" element={<UserCreate />} />
          <Route path="/admin/products" element={<ProductShow />} />
          <Route path="/admin/product-detail/:id" element={<ProductDetail />} />
          <Route path="/admin/product-create" element={<ProductCreate />} />
          <Route path="/admin/orders" element={<OrderShow />} />
          <Route path="/admin/order-detail/:id" element={<OrderDetail />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
