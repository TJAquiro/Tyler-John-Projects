class Product {
  id: number;
  name: string;
  description: string;
  price: number;
  amountInStock: number;
  imageUrl: string;
  listed: boolean;
  reviews: string[];
  shopId: number;
  tagIds: number[];

  constructor(
    id: number,
    name: string,
    description: string,
    price: number,
    amountInStock: number,
    imageUrl: string,
    listed: boolean,
    reviews: string[] = [],
    shopId: number,
    tagIds: number[] = []
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.amountInStock = amountInStock;
    this.imageUrl = imageUrl;
    this.listed = listed;
    this.reviews = reviews;
    this.shopId = shopId;
    this.tagIds = tagIds;
  }
}

export default Product;