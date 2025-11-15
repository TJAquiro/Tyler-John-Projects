export default class Tag {
    id: number;
    name: string;
    imageUrl: string;
    shopId: number;
	productIds: number[];
    
    constructor(
        id: number,
        name: string,
        imageUrl: string,
        shopId: number,
        productIds: number[] = []
    ) {
        this.id = id;
		this.name = name;
        this.imageUrl = imageUrl;
        this.shopId = shopId;
		this.productIds = productIds;
    };

}