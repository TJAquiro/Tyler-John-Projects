export default class CardInfo {
    id: number;
    cardNumber: string;
    securityCode: string;
    pin: string;
    type: string;   // debit or credit
    billingAddress: string;
    cardHolder: string;
    expirationDate: Date;

    constructor(
        id: number,
        cardNumber: string,
        securityCode: string,
        pin: string,
        type: string,
        billingAddress: string,
        cardHolder: string,
        expirationDate: Date
    ) {
        this.id = id;
        this.cardNumber = cardNumber;
        this.securityCode = securityCode;
        this.pin = pin;
        this.type = type;
        this.billingAddress = billingAddress;
        this.cardHolder = cardHolder;
        this.expirationDate = expirationDate;
    }
}

// TODO: could implement AMEX vs other cards and validate length of card number