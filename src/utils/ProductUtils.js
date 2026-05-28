export const getFormattedQuantity = (product) => {
    if (!product || typeof product.quantity === 'undefined') {
        return '';
    }
    return `${product.quantity} ${product.packageType || 'U'}`;
};