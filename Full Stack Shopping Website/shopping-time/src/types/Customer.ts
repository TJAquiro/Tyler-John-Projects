import User from "./User";

export default class Customer extends User {
    cart: number[];
    transactionIds: number[];
    cardInfoIds: number[];
    discountIds: number[];

    constructor(
        id: number,
        firstName: string,
        lastName: string,
        username: string,
        shopId: number,
        cart: number[] = [],
        transactionIds: number[] = [],
        cardInfoIds: number[] = [],
        discountIds: number[] = []
    ) {
        super(id, firstName, lastName, username, shopId);
        this.cart = cart;
        this.transactionIds = transactionIds;
        this.cardInfoIds = cardInfoIds;
        this.discountIds = discountIds;
    }
}