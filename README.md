Database

[Click](https://drive.google.com/file/d/1pPoUSRrpEq3lz7T04iFTS1QzlU4_Rqwt/view?usp=sharing)

# 📚 Hướng Dẫn Chi Tiết Cart Controller & Service

## 🎯 Tổng Quan

### Controller Layer (`cart.controller.js`)

Xử lý HTTP requests, validate input, gọi service, trả về response

### Service Layer (`cart.service.js`)

Chứa business logic, tương tác với database qua Prisma

---

## 📋 CART.CONTROLLER.JS - 8 Functions

### 1️⃣ `addTicketToCart(req, res)`

**Công dụng**: Thêm vé vào giỏ hàng

**Khi nào dùng**:

- User nhấn nút "Thêm vào giỏ hàng" trên trang chi tiết sự kiện
- User chọn loại vé và số lượng

**Input từ client**:

```json
{
  "ticketTypeId": 5,
  "quantity": 2
}
```

**Flow**:

1. Kiểm tra user đã đăng nhập chưa → 401 nếu chưa
2. Validate `ticketTypeId` và `quantity` bằng Zod schema
3. Gọi service `addToCart(ticketTypeId, quantity, userId)`
4. Trả về success message

**Response**:

```json
// Success
{
  "success": true,
  "message": "Đã thêm vé vào giỏ hàng"
}

// Error - Validation
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": [
    { "path": "quantity", "message": "Số lượng phải lớn hơn 0" }
  ]
}

// Error - Server
{
  "success": false,
  "message": "Lỗi thêm vé vào giỏ hàng"
}
```

---

### 2️⃣ `getCart(req, res)`

**Công dụng**: Lấy thông tin giỏ hàng hiện tại

**Khi nào dùng**:

- User vào trang giỏ hàng
- Cần hiển thị số lượng items trong giỏ (icon giỏ hàng)
- Trước khi checkout

**Input**: Không cần (lấy từ req.user)

**Flow**:

1. Kiểm tra user đã đăng nhập
2. Gọi `ticketTypeInCart(userId)` để lấy cart details
3. Tính tổng giá bằng `calculateCartTotal(cartDetails)`
4. Lấy `cartId` từ cartDetails[0]
5. Trả về thông tin giỏ hàng

**Response**:

```json
{
  "success": true,
  "cartDetails": [
    {
      "id": 10,
      "quantity": 2,
      "price": 500000,
      "cartId": 5,
      "ticketType": {
        "id": 3,
        "type": "VIP",
        "event": {
          "id": 1,
          "title": "Concert Sơn Tùng MTP"
        }
      }
    }
  ],
  "totalPrice": 1000000,
  "cartId": 5
}
```

---

### 3️⃣ `updateQuantity(req, res)`

**Công dụng**: Cập nhật số lượng vé trong giỏ

**Khi nào dùng**:

- User thay đổi số lượng vé trong giỏ hàng (tăng/giảm)
- User nhập số lượng mới

**Input**:

```json
{
  "cartDetailId": 10,
  "quantity": 5
}
```

**Flow**:

1. Check login
2. Validate với `updateQuantitySchema`
3. Gọi `updateCartItemQuantity(cartDetailId, quantity, userId)`
4. Trả về success

**Lưu ý**:

- Nếu `quantity = 0` → Service sẽ tự động XÓA item khỏi giỏ
- Service đã check ownership (user chỉ sửa được giỏ của mình)

---

### 4️⃣ `removeTicketFromCart(req, res)`

**Công dụng**: Xóa vé khỏi giỏ hàng

**Khi nào dùng**:

- User nhấn nút "Xóa" trong giỏ hàng
- User muốn bỏ một loại vé ra khỏi giỏ

**Input**:

- URL param: `/api/carts/:id` (id = cartDetailId)

**Flow**:

1. Lấy `cartDetailId` từ `req.params.id`
2. Check login
3. Gọi `removeFromCart(cartDetailId, userId)`
4. Trả về success

---

### 5️⃣ `handleCartToCheckout(req, res)`

**Công dụng**: Chuẩn bị giỏ hàng trước khi chuyển sang trang thanh toán

**Khi nào dùng**:

- User nhấn "Thanh toán" từ trang giỏ hàng
- Trước khi chuyển sang trang checkout

**Input**:

```json
{
  "cartId": 5,
  "currentCartDetails": [
    { "id": 10, "quantity": 2 },
    { "id": 11, "quantity": 3 }
  ]
}
```

**Mục đích**:

- Đồng bộ số lượng vé giữa frontend và backend
- Validate giỏ hàng không trống
- Cập nhật lại tổng số lượng trong cart

**Flow**:

1. Check login
2. Validate với `prepareCheckoutSchema`
3. Gọi `prepareCartBeforeCheckout(currentCartDetails, cartId)`
4. Trả về redirect sang `/checkout`

---

### 6️⃣ `checkOut(req, res)`

**Công dụng**: Lấy thông tin giỏ hàng tại trang checkout

**Khi nào dùng**:

- User vừa vào trang checkout
- Hiển thị tóm tắt đơn hàng trước khi thanh toán

**Flow**:

1. Check login
2. Gọi `ticketTypeInCart(userId)`
3. Tính `totalPrice` bằng `calculateCartTotal`
4. Trả về cart details + totalPrice

**Khác với `getCart`**:

- `getCart`: Dùng cho trang giỏ hàng (có thể sửa)
- `checkOut`: Dùng cho trang checkout (chỉ xem, không sửa)

---

### 7️⃣ `placeOrder(req, res)`

**Công dụng**: Đặt hàng (tạo đơn hàng từ giỏ hàng)

**Khi nào dùng**:

- User nhấn "Xác nhận đặt hàng" trong trang checkout
- User đã điền đầy đủ thông tin nhận vé

**Input**:

```json
{
  "receiverName": "Nguyễn Văn A",
  "receiverPhone": "0912345678",
  "receiverEmail": "nguyenvana@gmail.com",
  "totalPrice": 1000000
}
```

**Flow**:

1. Check login
2. Validate thông tin người nhận với `placeOrderSchema`
3. **Quan trọng**: Lấy lại giỏ hàng và tính lại `totalPrice` từ backend (KHÔNG TIN CLIENT)
4. Gọi `handlePlaceOrder()` với giá đã tính lại
5. Nếu thành công → Redirect sang `/thanks`

**Lưu ý bảo mật**:

- Dù client gửi `totalPrice` = 1,000, backend vẫn tính lại đúng giá
- Validate số lượng tồn kho
- Validate sự kiện chưa diễn ra
- Sử dụng Transaction để đảm bảo data consistency

**Response thành công**:

```json
{
  "success": true,
  "message": "Đặt vé thành công",
  "redirect": "/thanks"
}
```

**Response lỗi**:

```json
{
  "success": false,
  "message": "Loại vé 'VIP' không đủ số lượng! Chỉ còn 5 vé."
}
```

---

### 8️⃣ `getThanks(req, res)`

**Công dụng**: Xác nhận đặt hàng thành công

**Khi nào dùng**:

- User được redirect sang trang `/thanks` sau khi đặt hàng
- Hiển thị thông báo "Đặt vé thành công"

**Flow**:

1. Check login
2. Trả về success message

**Lưu ý**: Function này khá đơn giản, có thể bỏ hoặc mở rộng để lấy thông tin đơn hàng vừa tạo.

---

### 9️⃣ `getOrderHistory(req, res)`

**Công dụng**: Lấy lịch sử đơn hàng của user

**Khi nào dùng**:

- User vào trang "Đơn hàng của tôi"
- User muốn xem lại các vé đã mua

**Input (Query params)**:

```
GET /api/carts/order-history?page=1&limit=10
```

**Flow**:

1. Check login
2. Lấy `page` và `limit` từ query (mặc định: page=1, limit=TOTAL_ITEM_PER_PAGE)
3. Gọi song song 2 service:
   - `orderHistory(userId, page, limit)` - Lấy danh sách đơn hàng
   - `countTotalOrderPages(limit)` - Đếm tổng số trang
4. Trả về orders + totalPages

**Response**:

```json
{
  "orders": [
    {
      "id": 15,
      "totalPrice": 1500000,
      "receiverName": "Nguyễn Văn A",
      "receiverPhone": "0912345678",
      "status": "PENDING",
      "createdAt": "2025-11-02T10:30:00.000Z",
      "ticketOrderDetails": [
        {
          "quantity": 2,
          "price": 500000,
          "ticketType": {
            "type": "VIP",
            "event": {
              "title": "Concert Sơn Tùng MTP"
            }
          }
        }
      ]
    }
  ],
  "totalPages": 5
}
```

---

## 📋 CART.SERVICE.JS - 8 Functions

### 1️⃣ `addToCart(ticketTypeId, quantity, userId)`

**Công dụng**: Logic thêm vé vào giỏ hàng

**Flow chi tiết**:

1. **Tìm ticketType** (include event)

   - Nếu không tìm thấy → throw Error "Loại vé không tồn tại"

2. **Check sự kiện đã diễn ra**

   ```js
   if (startDate <= now) throw Error("Không thể mua vé của sự kiện đã diễn ra");
   ```

3. **Check số lượng tồn kho**

   ```js
   availableQuantity = quantity - sold
   if (availableQuantity < quantity) throw Error(...)
   ```

4. **Tìm hoặc tạo Cart**

   - Nếu user chưa có cart → Tạo mới
   - Nếu đã có → Tăng `sum` (tổng số lượng items)

5. **Tìm hoặc tạo CartDetail**
   - Nếu vé này đã có trong giỏ → Tăng `quantity`
   - Nếu chưa có → Tạo mới CartDetail

**Kết quả**: Vé được thêm vào giỏ hàng

---

### 2️⃣ `ticketTypeInCart(userId)`

**Công dụng**: Lấy danh sách vé trong giỏ hàng của user

**Flow**:

1. Tìm Cart của user (include cartDetails, ticketType, event)
2. Nếu giỏ trống → Return `[]`
3. **Tự động cập nhật giá nếu thay đổi**:
   - Với mỗi item, check giá hiện tại của ticketType
   - Nếu giá thay đổi → Update CartDetail với giá mới
   - Return danh sách đã cập nhật

**Ví dụ**:

```
Giỏ hàng có vé VIP giá 500k (lưu từ 2 ngày trước)
Admin thay đổi giá VIP thành 600k
→ Function này tự động update giỏ hàng thành 600k
```

**Return**:

```js
[
  {
    id: 10,
    quantity: 2,
    price: 600000, // Đã được update
    cartId: 5,
    ticketType: { ... },
  }
]
```

---

### 3️⃣ `removeFromCart(cartDetailId, userId)`

**Công dụng**: Xóa một loại vé khỏi giỏ hàng

**Flow**:

1. Tìm CartDetail theo `cartDetailId` AND `cart.userId` (check ownership)
2. Nếu không tìm thấy → throw Error (không tìm thấy hoặc không có quyền)
3. Xóa CartDetail
4. Giảm `cart.sum` theo số lượng đã xóa

**Bảo mật**:

- WHERE clause có `cart: { userId }` → User chỉ xóa được vé trong giỏ của mình

---

### 4️⃣ `updateCartItemQuantity(cartDetailId, newQuantity, userId)`

**Công dụng**: Cập nhật số lượng vé trong giỏ

**Flow**:

1. Tìm CartDetail (check ownership)
2. Nếu không tìm thấy → throw Error

3. **Case 1: newQuantity <= 0**

   - Gọi `removeFromCart()` để xóa luôn

4. **Case 2: newQuantity > 0**
   - Update CartDetail với quantity mới
   - Tính lại tổng `sum` của Cart
   - Update Cart.sum

**Ví dụ**:

```
User có 3 items: 2 VIP, 3 Standard, 1 Regular (sum = 6)
User thay đổi VIP từ 2 → 5
→ sum mới = 5 + 3 + 1 = 9
```

---

### 5️⃣ `prepareCartBeforeCheckout(currentCartDetails, cartId)`

**Công dụng**: Đồng bộ số lượng giỏ hàng trước khi checkout

**Tại sao cần?**

- Frontend có thể thay đổi quantity offline (chưa gửi API)
- User thay đổi nhiều items rồi nhấn checkout
- Cần update tất cả cùng lúc

**Flow**:

1. Validate input (phải là array, không trống)
2. Dùng **Transaction** để update:
   - Update quantity của từng CartDetail
   - Tính lại tổng `sum`
   - Update Cart.sum

**Input example**:

```js
currentCartDetails = [
  { id: 10, quantity: 5 },
  { id: 11, quantity: 2 },
];
```

---

### 6️⃣ `handlePlaceOrder(...)`

**Công dụng**: Xử lý đặt hàng (function quan trọng nhất)

**Params**:

- `userId`: ID user
- `receiverName`: Tên người nhận
- `receiverPhone`: SĐT người nhận
- `receiverEmail`: Email người nhận
- `totalPrice`: Tổng giá (đã tính từ backend)
- `paymentMethod`: Phương thức thanh toán (default: "VNPAY")

**Flow trong Transaction**:

1. **Lấy giỏ hàng**

   - Include cartDetails, ticketType, event

2. **Validate giỏ hàng**

   - Giỏ không trống
   - Tính lại tổng giá từ cart
   - So sánh với `totalPrice` từ tham số (chênh lệch < 1đ)

3. **Validate từng item**

   - Sự kiện chưa diễn ra
   - Số lượng tồn kho đủ
   - Giá chưa thay đổi

4. **Tạo TicketOrder**

   - Lưu thông tin đơn hàng
   - Status: "PENDING"
   - PaymentStatus: "PAYMENT_UNPAID"

5. **Tạo TicketOrderDetails**

   - Lưu chi tiết từng loại vé trong đơn

6. **Cập nhật TicketType**

   - Giảm `quantity` (số lượng tồn kho)
   - Tăng `sold` (số lượng đã bán)

7. **Xóa giỏ hàng**
   - Xóa tất cả CartDetails
   - Xóa Cart

**Tại sao dùng Transaction?**

- Nếu 1 bước fail → Rollback tất cả
- Đảm bảo không bị mất dữ liệu
- Tránh race condition (2 user mua cùng lúc)

**Return**:

- Success: `""` (empty string)
- Error: `error.message`

---

### 7️⃣ `countTotalOrderPages(limit)`

**Công dụng**: Đếm tổng số trang cho pagination

**Flow**:

1. Đếm tổng số TicketOrder trong DB
2. Tính: `totalPages = Math.ceil(totalItems / limit)`

**Ví dụ**:

```
totalOrders = 47
limit = 10
→ totalPages = Math.ceil(47/10) = 5
```

---

### 8️⃣ `orderHistory(userId, page, limit)`

**Công dụng**: Lấy lịch sử đơn hàng có phân trang

**Flow**:

1. Tính `skip = (page - 1) * limit`
2. Query TicketOrder:
   - WHERE: userId
   - Include: orderDetails, ticketType, event
   - OrderBy: createdAt DESC (mới nhất lên đầu)
   - Skip & Take (pagination)
3. Return danh sách orders

**Ví dụ**:

```
page = 2, limit = 10
→ skip = 10 (bỏ qua 10 orders đầu)
→ take = 10 (lấy 10 orders tiếp theo)
→ Return orders từ 11-20
```

---

### 9️⃣ `calculateCartTotal(cartDetails)`

**Công dụng**: Tính tổng giá giỏ hàng

**Flow**:

1. Check input là array và không rỗng
2. Reduce: `sum += (item.price * item.quantity)`
3. Return tổng giá

**Ví dụ**:

```js
cartDetails = [
  { price: 500000, quantity: 2 }, // 1,000,000
  { price: 300000, quantity: 3 }, //   900,000
]
→ Total = 1,900,000
```

---

## 🔄 Flow Hoàn Chỉnh - Từ Chọn Vé Đến Đặt Hàng

### **Bước 1: User chọn vé**

```
Frontend: Click "Thêm vào giỏ"
   ↓
Controller: addTicketToCart()
   ↓
Service: addToCart()
   → Check tồn tại, sự kiện, tồn kho
   → Tạo/update Cart và CartDetail
```

### **Bước 2: User xem giỏ hàng**

```
Frontend: Vào trang /cart
   ↓
Controller: getCart()
   ↓
Service: ticketTypeInCart() + calculateCartTotal()
   → Lấy cart details (tự động update giá)
   → Tính tổng tiền
```

### **Bước 3: User sửa số lượng**

```
Frontend: Thay đổi quantity input
   ↓
Controller: updateQuantity()
   ↓
Service: updateCartItemQuantity()
   → Update quantity
   → Tính lại sum
```

### **Bước 4: User checkout**

```
Frontend: Click "Thanh toán"
   ↓
Controller: handleCartToCheckout()
   ↓
Service: prepareCartBeforeCheckout()
   → Đồng bộ số lượng cuối cùng

Frontend: Redirect sang /checkout
   ↓
Controller: checkOut()
   ↓
Service: ticketTypeInCart() + calculateCartTotal()
   → Hiển thị tóm tắt đơn hàng
```

### **Bước 5: User đặt hàng**

```
Frontend: Điền thông tin + click "Xác nhận"
   ↓
Controller: placeOrder()
   → Validate thông tin người nhận
   → Lấy lại giỏ hàng
   → Tính lại totalPrice từ backend
   ↓
Service: handlePlaceOrder()
   → Validate toàn bộ (sự kiện, tồn kho, giá)
   → Tạo Order + OrderDetails
   → Update TicketType (giảm quantity, tăng sold)
   → Xóa Cart
   ↓
Frontend: Redirect sang /thanks
```

### **Bước 6: User xem lịch sử**

```
Frontend: Vào trang /my-orders
   ↓
Controller: getOrderHistory()
   ↓
Service: orderHistory() + countTotalOrderPages()
   → Lấy danh sách đơn hàng có phân trang
   → Tính tổng số trang
```

---

## 🔒 Các Điểm Bảo Mật

### 1. **Không tin client về giá tiền**

```js
// placeOrder controller
const calculatedTotalPrice = calculateCartTotal(cartDetails);
// Dùng giá tính từ backend, KHÔNG dùng req.body.totalPrice
```

### 2. **Check ownership mọi nơi**

```js
// removeFromCart service
where: {
  id: cartDetailId,
  cart: { userId } // Chỉ xóa được giỏ của mình
}
```

### 3. **Validate kỹ trong Transaction**

```js
// handlePlaceOrder
- Check sự kiện chưa diễn ra
- Check số lượng tồn kho
- Check giá chưa thay đổi
→ Nếu 1 điều fail → Rollback toàn bộ
```

### 4. **Tự động cập nhật giá**

```js
// ticketTypeInCart
Nếu admin thay đổi giá → Tự động update giỏ hàng
→ User luôn thấy giá mới nhất
```

---

## ✅ Tóm Tắt

| Function          | Controller             | Service                                  | Mục đích chính               |
| ----------------- | ---------------------- | ---------------------------------------- | ---------------------------- |
| Thêm vé           | `addTicketToCart`      | `addToCart`                              | Thêm vé vào giỏ + validate   |
| Xem giỏ           | `getCart`              | `ticketTypeInCart`, `calculateCartTotal` | Hiển thị giỏ hàng            |
| Sửa số lượng      | `updateQuantity`       | `updateCartItemQuantity`                 | Thay đổi quantity            |
| Xóa vé            | `removeTicketFromCart` | `removeFromCart`                         | Xóa item khỏi giỏ            |
| Chuẩn bị checkout | `handleCartToCheckout` | `prepareCartBeforeCheckout`              | Đồng bộ số lượng             |
| Xem checkout      | `checkOut`             | `ticketTypeInCart`, `calculateCartTotal` | Hiển thị tóm tắt             |
| Đặt hàng          | `placeOrder`           | `handlePlaceOrder`                       | Tạo order + validate toàn bộ |
| Lịch sử           | `getOrderHistory`      | `orderHistory`, `countTotalOrderPages`   | Xem đơn hàng đã mua          |

**Nguyên tắc**:

- Controller: Validate input → Gọi service → Trả response
- Service: Business logic → Database operations → Return data
