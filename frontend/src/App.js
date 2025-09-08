import { Routes, Route } from "react-router";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/Notfound";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import OrderConfirmation from "./pages/OrderConfirmation";
import WishList from "./pages/WishList";
import Profile from "./pages/Profile";
import Addresses from "./pages/Addresses";
import OrderHistory from "./pages/OrderHistory";

function App() {
  return (
    <Routes>
      <Route path = "/" element = {<Home />} />
      <Route path = "/signup" element = {<Signup />} />
      <Route path = "/login" element = {<Login />} />
      <Route path = "/dashboard" element = {<Dashboard />} />
      <Route path = "/products" element = {<Products />} />
      <Route path = "/cart" element = {<Cart />} />
      <Route path = "/wish-list" element = {<WishList />} />
      <Route path = "/order-confirmation" element = {<OrderConfirmation />} />
      <Route path = "/profile" element = {<Profile />} />
      <Route path = "/profile/addresses" element = {<Addresses />} />
      <Route path = "/profile/order-history" element = {<OrderHistory />} />
      <Route path = "*" element = {<NotFound />} />
      {/* Specify the routes here */}
    </Routes>
  );
}

export default App;
