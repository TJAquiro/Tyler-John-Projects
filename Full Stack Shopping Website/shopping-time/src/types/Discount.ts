export default class Discount {
    id: number;
    name: string;
    description: string;
    percentOff: number;
    productIds: number[];

    constructor(
        id: number,
        name: string,
        description: string,
        percentOff: number,
        productIds: number[] = []
    ) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.percentOff = percentOff;
        this.productIds = productIds;
    }

}