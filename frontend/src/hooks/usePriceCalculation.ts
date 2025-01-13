
const usePriceCalculations = () => {
    const calculateDiscountPrice = (price: number, discount: number) : number => {
        const discountedAmount = price - (price * discount / 100);
        return Number(discountedAmount.toFixed(2));
         
    };

    const formatPrice = (price: number): string => {
        return `₹${price.toFixed(2).toLocaleString()}`;
    }

    const calculateSavings = (originalPrice: number, discountedPrice: number): number => {
        return Number((originalPrice - discountedPrice).toFixed(2));
    };

    return {
        calculateDiscountPrice,
        formatPrice,
        calculateSavings
    };
}

export default usePriceCalculations