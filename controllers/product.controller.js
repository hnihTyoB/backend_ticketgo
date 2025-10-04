import { countTotalProductPages, findAllProducts, findProductById, insertProduct, modifyProduct, removeProduct } from "../services/product.service.js";
import { productSchema } from "../validation/product.schema.js";

export const getAllProducts = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    try {
        const products = await findAllProducts(page);
        const totalPages = await countTotalProductPages();
        res.json({ products, totalPages });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
};

export const getProductById = async (req, res) => {
    try {
        const user = await findProductById(req.params.id);
        if (!user) return res.status(404).json({ error: "Product not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
};

export const createProduct = async (req, res) => {
    try {
        const validate = await productSchema.safeParseAsync(req.body);

        if (!validate.success) {
            return res.status(400).json({
                message: "Dữ liệu không hợp lệ",
                // errors: validate.error.issues.map(err => `${err.message} (${err.path[0]})`)
                errors: validate.error.issues.map(err => `${err.message}`)
            });
        }

        const { name, price, detailDesc, shortDesc, quantity, factory, target } = validate.data;
        const image = req.file ? req.file.filename : null;

        const newProduct = await insertProduct(
            name,
            price,
            image,
            detailDesc,
            shortDesc,
            quantity,
            factory,
            target
        );

        res.status(201).json({ message: "Tạo sản phẩm thành công", product: newProduct });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const validate = await productSchema.safeParseAsync(req.body);

        if (!validate.success) {
            return res.status(400).json({
                message: "Dữ liệu không hợp lệ",
                errors: validate.error.issues.map(err => `${err.message}`)
            });
        }

        const { name, price, detailDesc, shortDesc, quantity, factory, target } = validate.data;
        const image = req.file ? req.file.filename : null;
        const updatedProduct = await modifyProduct(
            parseInt(req.params.id, 10),
            name,
            parseInt(price, 10),
            image,
            detailDesc,
            shortDesc,
            parseInt(quantity, 10),
            factory,
            target
        );
        res.json({ message: "Cập nhật sản phẩm thành công", product: updatedProduct });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        await removeProduct(req.params.id);
        res.json({ message: "Xóa sản phẩm thành công" });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
};

// export const getAllFactories = async (req, res) => {
//     try {
//         const factories = await findAllFactories();
//         res.json({ factories });
//     } catch (err) {
//         res.status(500).json({ message: "Lỗi server", error: err.message });
//     }
// };

// export const getAllTargets = async (req, res) => {
//     try {
//         const targets = await findAllTargets();
//         res.json({ targets });
//     } catch (err) {
//         res.status(500).json({ message: "Lỗi server", error: err.message });
//     }
// };