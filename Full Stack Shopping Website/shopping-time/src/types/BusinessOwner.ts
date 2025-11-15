import User from "./User";

export default class BusinessOwner extends User {

    constructor(
        id: number,
        firstName: string,
        lastName: string,
        username: string,
        shopId: number
    ) {
        super(id, firstName, lastName, username, shopId);
    }
}