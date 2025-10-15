import {
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    prepareCartBeforeCheckout,
    handlePlaceOrder,
    orderHistory,
    ticketTypeInCart
} from "../services/cart.service.js";


export const addTicketToCart = async (req, res) => {
    const { ticketTypeId, quantity } = req.body;
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: "Bạn chưa đăng nhập" });
    }

    try {
        await addToCart(ticketTypeId, quantity, user.id);
        return res.status(200).json({ message: "Đã thêm vé vào giỏ hàng" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Lỗi thêm vé vào giỏ hàng" });
    }
};

export const getCart = async (req, res) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Bạn chưa đăng nhập",
            redirect: "/login",
        });
    }

    try {
        const cartDetails = await ticketTypeInCart(user.id);
        const totalPrice = cartDetails.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const cartId = cartDetails.length ? cartDetails[0].cartId : null;

        return res.status(200).json({
            success: true,
            cartDetails,
            totalPrice,
            cartId
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Lỗi khi lấy giỏ hàng" });
    }
};

export const updateQuantity = async (req, res) => {
    const { cartDetailId, quantity } = req.body;
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: "Bạn chưa đăng nhập" });
    }

    try {
        await updateCartItemQuantity(cartDetailId, quantity, user.id);
        return res.status(200).json({ success: true, message: "Cập nhật số lượng thành công" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Lỗi khi cập nhật số lượng" });
    }
};

export const removeTicketFromCart = async (req, res) => {
    const { id: cartDetailId } = req.params;
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: "Bạn chưa đăng nhập" });
    }

    try {
        await removeFromCart(cartDetailId, user.id);
        return res.status(200).json({ success: true, message: "Đã xoá vé khỏi giỏ hàng" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Lỗi khi xoá vé khỏi giỏ hàng" });
    }
};

export const handleCartToCheckout = async (req, res) => {
    const { cartId, currentCartDetails = [] } = req.body;
    const user = req.user;

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Bạn chưa đăng nhập",
            redirect: "/login",
        });
    }

    try {
        await prepareCartBeforeCheckout(currentCartDetails, cartId);
        return res.json({
            success: true,
            message: "Chuyển sang trang thanh toán",
            redirect: "/checkout",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Lỗi xử lý giỏ hàng",
        });
    }
};

export const checkOut = async (req, res) => {
    const user = req.user;
    if (user) {
        const cartDetails = await ticketTypeInCart(user.id);
        const totalPrice = cartDetails?.map(item => +item.price * +item.quantity)?.reduce((a, b) => a + b, 0);
        return res.status(200).json({ cartDetails, totalPrice });
    } else {
        return res.status(401).json({
            success: false,
            message: "Bạn chưa đăng nhập",
            redirect: "/login",
        });
    }
};

export const placeOrder = async (req, res) => {
    const user = req.user;
    const { receiverName, receiverPhone, receiverAddress, totalPrice } = req.body;

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Bạn chưa đăng nhập",
            redirect: "/login",
        });
    }

    try {
        const message = await handlePlaceOrder(
            user.id,
            receiverName,
            receiverPhone,
            receiverAddress,
            totalPrice
        );

        if (message) {
            return res.status(400).json({ success: false, message });
        }

        return res.status(200).json({
            success: true,
            message: "Đặt vé thành công",
            redirect: "/thanks",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Lỗi khi đặt vé" });
    }
};

export const getThanks = async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "Bạn chưa đăng nhập" });
    }

    return res.status(200).json({
        success: true,
        message: "Đặt vé thành công",
    });
};

export const getOrderHistory = async (req, res) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: "Bạn chưa đăng nhập" });
    }

    try {
        const orders = await orderHistory(user.id);
        return res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Lỗi khi lấy lịch sử đơn hàng" });
    }
};
