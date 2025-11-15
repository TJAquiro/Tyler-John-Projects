export default class User {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    shopId: number;

    constructor(
        id: number,
        firstName: string,
        lastName: string,
        username: string,
        shopId: number
    ) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.username = username;
        this.shopId = shopId;
    }
}