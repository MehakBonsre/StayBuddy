// Coupon utility functions

/**
 * Validates if a coupon code is valid and applicable for the given service type
 * @param {string} code - Coupon code to validate
 * @param {string} serviceType - Type of service ('hotel' or 'cab')
 * @param {object} coupons - Coupons object from mockData
 * @returns {object|null} - Coupon object if valid, null otherwise
 */
export const validateCoupon = (code, serviceType, coupons) => {
    const coupon = coupons[code.toUpperCase()];

    if (!coupon) {
        return { valid: false, error: 'Invalid coupon code' };
    }

    if (!coupon.active) {
        return { valid: false, error: 'Coupon has expired' };
    }

    if (!coupon.applicableTo.includes(serviceType)) {
        return { valid: false, error: `This coupon is only applicable for ${coupon.applicableTo.join(' and ')} bookings` };
    }

    return { valid: true, coupon };
};

/**
 * Calculates discount amount based on coupon and amount
 * @param {number} amount - Base amount before discount
 * @param {object} coupon - Coupon object
 * @returns {number} - Discount amount
 */
export const calculateDiscount = (amount, coupon) => {
    if (!coupon) return 0;

    // Check minimum amount requirement
    if (amount < coupon.minAmount) {
        return 0;
    }

    let discount = 0;

    if (coupon.type === 'percentage') {
        discount = Math.round(amount * coupon.discount);
    } else if (coupon.type === 'fixed') {
        discount = coupon.discount;
    }

    // Apply max discount cap
    if (discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
    }

    return discount;
};

/**
 * Gets user-friendly error message for coupon validation
 * @param {number} amount - Amount to check against minimum
 * @param {object} coupon - Coupon object
 * @returns {string|null} - Error message or null if valid
 */
export const getCouponErrorMessage = (amount, coupon) => {
    if (!coupon) return null;

    if (amount < coupon.minAmount) {
        return `Minimum booking amount of ₹${coupon.minAmount} required for this coupon`;
    }

    return null;
};
