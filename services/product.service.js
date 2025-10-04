import { prisma } from "../config/client.js";
import { TOTAL_ITEM_PER_PAGE } from "../config/constant.js";

export const findAllProducts = async (page) => {
    const pageSize = TOTAL_ITEM_PER_PAGE;
    const skip = (page - 1) * pageSize;
    const products = await prisma.product.findMany({
        skip: skip,
        take: pageSize,
    });
    return products;
};

export const countTotalProductPages = async () => {
    const totalItems = await prisma.product.count();
    const pageSize = TOTAL_ITEM_PER_PAGE;
    const totalPages = Math.ceil(totalItems / pageSize);
    return totalPages;
}

// export const findAllFactories = async () => {
//     return await prisma.product.findMany({
//         distinct: ["factory"],
//         select: { factory: true }
//     });
// };

// export const findAllTargets = async () => {
//     return await prisma.product.findMany({
//         distinct: ["target"],
//         select: { target: true }
//     });
// };

export const findProductById = async (id) => {
    return await prisma.product.findUnique({
        where: { id: parseInt(id) }
    });
};

export const insertProduct = async (
    name,
    price,
    image,
    detailDesc,
    shortDesc,
    quantity,
    factory,
    target
) => {
    return await prisma.product.create({
        data: {
            name,
            price,
            image,
            detailDesc,
            shortDesc,
            quantity,
            factory,
            target,
        },
    });
};

export const modifyProduct = async (id, name, price, image, detailDesc, shortDesc, quantity, factory, target) => {
    const dataToUpdate = {
        name,
        price,
        image,
        detailDesc,
        shortDesc,
        quantity,
        factory,
        target,
    };

    if (image) {
        dataToUpdate.image = image;
    }

    return await prisma.product.update({
        where: { id: parseInt(id) },
        data: dataToUpdate,
    });
};

export const removeProduct = async (id) => {
    return await prisma.product.delete({
        where: { id: parseInt(id) },
    });
};
