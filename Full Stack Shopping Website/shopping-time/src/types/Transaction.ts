export default class Transaction {
    id: number;
	purchaseDate: Date | undefined;
    shippingAddress: string;
    status: string; // TODO: change to Enum
    isReturn: boolean;
    totalPrice : number;
    shopId: number;
    cardInfoId: number;
    customerId: number;
	productIds: number[];

    constructor(
        id: number,
        purchaseDate: Date | undefined,
        shippingAddress: string,
        status: string,
        isReturn: boolean,
        totalPrice: number,
        shopId: number,
        cardInfoId: number,
        customerId: number,
        productIds: number[] = []
    ) {
        this.id = id;
		this.purchaseDate = purchaseDate;
        this.shippingAddress = shippingAddress;
        this.status = status;
        this.isReturn = isReturn;
        this.totalPrice = totalPrice;
        this.shopId = shopId;
        this.cardInfoId = cardInfoId;
        this.customerId = customerId;
		this.productIds = productIds;
    };
}