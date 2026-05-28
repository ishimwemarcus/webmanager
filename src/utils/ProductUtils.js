export const getFormattedQuantity = (product) => {
    if (!product || typeof product.quantity === 'undefined') return '';
    if (hasBundleSupport(product)) {
        return getStockDisplay(product);
    }
    return `${product.quantity} ${product.packageType || 'U'}`;
};

/** Returns true when a product has bundle decomposition configured */
export const hasBundleSupport = (product) => {
    return !!(product?.bundleName && product?.bundleSize && parseFloat(product.bundleSize) > 1);
};

/**
 * Returns bundle metadata for a product.
 * All stock is stored internally in baseUnit (child units).
 * bundleName is the parent display unit (e.g. "Box"), bundleSize is how many base units = 1 bundle.
 */
export const getBundleInfo = (product) => {
    if (!hasBundleSupport(product)) return null;
    const size = parseFloat(product.bundleSize) || 1;
    const baseQty = parseFloat(product.quantity) || 0;
    const fullBundles = Math.floor(baseQty / size);
    const remainder = baseQty % size;
    return {
        bundleName: product.bundleName,          // e.g. "Box"
        baseUnit: product.baseUnit || product.packageType || 'U',  // e.g. "Apple"
        bundleSize: size,                         // e.g. 12
        fullBundles,                              // e.g. 3
        remainder,                                // e.g. 10 leftover apples
        totalBase: baseQty,                       // e.g. 46 apples total
        bundlePrice: parseFloat(product.bundlePrice) || parseFloat(product.price) * size,
        basePrice: parseFloat(product.price),
        bundleCost: parseFloat(product.bundleCost) || parseFloat(product.cost) * size,
        baseCost: parseFloat(product.cost),
    };
};

/**
 * For a given sale, returns how many BASE units were consumed.
 * saleUnit: 'bundle' | 'base'  (stored in sale.saleUnit)
 */
export const getBaseQuantity = (sale, product) => {
    if (!hasBundleSupport(product) || sale.saleUnit !== 'bundle') {
        return parseFloat(sale.quantity) || 0;
    }
    const size = parseFloat(product.bundleSize) || 1;
    return (parseFloat(sale.quantity) || 0) * size;
};

/** Returns a human-readable stock display string e.g. "3 Boxes + 10 Apples" */
export const getStockDisplay = (product) => {
    const info = getBundleInfo(product);
    if (!info) return `${product.quantity} ${product.packageType || 'U'}`;
    if (info.remainder === 0) {
        return `${info.fullBundles} ${info.bundleName}${info.fullBundles !== 1 ? 's' : ''}`;
    }
    if (info.fullBundles === 0) {
        return `${info.remainder} ${info.baseUnit}`;
    }
    return `${info.fullBundles} ${info.bundleName}${info.fullBundles !== 1 ? 's' : ''} + ${info.remainder} ${info.baseUnit}`;
};