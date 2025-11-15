export default class Shop {
  id: number;
  name: string;
  logoImageUrl: string;
  businessOwnerId: number;
  productIds: number[];
  transactionIds: number[];
  customerIds: number[];

  constructor(
    id: number,
    name: string,
    logoImageUrl: string,
    businessOwnerId: number,
    productIds: number[] = [],
    transactionIds: number[] = [],
    customerIds: number[] = []
  ) {
    this.id = id;
    this.name = name;
    this.logoImageUrl = logoImageUrl;
    this.businessOwnerId = businessOwnerId;
    this.productIds = productIds;
    this.transactionIds = transactionIds;
    this.customerIds = customerIds;
  }
}
