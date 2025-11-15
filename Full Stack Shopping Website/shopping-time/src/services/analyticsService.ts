import { getTransactionById } from "../api/transactionApi";
import { getShopById } from "../api/shopApi"
import Product from "../types/Product";
import Transaction from "../types/Transaction";
/**
 * Get number of sales for a specific product.
 * @param product Product type. The product to check sales for.
 * @param startDate Date type. The start date.
 * @param endDate Data type. The end date.
 * @returns The total number of sales for a product.
 */
/**
 *Developers note
 * When a data structure is eventually made.
 * It will be mapped to the Dates with all types of ids especially products and transactions.
 * Amount in stock will not be changed within this function.
 * This function is only for analyzing sales and it is not making sales.
 * Sales are only for a specific product and a data structure will track all these sales.
 */
export async function getNumSales(
  product: Product,
  startDate: Date,
  endDate: Date
) {
  //amount of sales
  let sales = 0;
  //loop used to check sales for each date in the range
  for (
    let i = new Date(startDate);
    i.valueOf() <= endDate.valueOf();
    i.setDate(i.getDate() + 1)
  ) {
    //the transition object used to the id related the product id
    //that means if they match(not equal ids) then the transaction is selected
    let transaction: Transaction = await getTransactionById(product.id);
    //if transition null or less than 0 it won't be valid
    //if the transaction id is greater than -1 then it is Valid
    if (transaction && transaction.id > -1) {
      //each transaction that has a match(not equal ids) to the product is a sale
      //hence incremented.
      sales++;
    }
  }

  return sales;
}

export default class AnalyticsService {
  constructor() {}

  async getTotalRevenue(
    shopID: number,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    console.info(`shopID:${shopID}`);

    // Fetch shop data
    const shop = await getShopById(shopID);

    console.info(`shop: ${JSON.stringify(shop)}`);

    if (!shop || !shop.transactionIds) {
      throw new Error(
        `Shop with ID ${shopID} not found or has no transactions.`
      );
    }

    // Fetch all transactions asynchronously
    const transactions = await Promise.all(
      shop.transactionIds.map(async (trnID) => {
        return await getTransactionById(trnID);
      })
    );

    console.info(`transactions: ${JSON.stringify(transactions)}`);

    // Calculate total revenue
    const total = transactions.reduce((sum, tran) => {
      if (
        tran.purchaseDate &&
        new Date(tran.purchaseDate) >= startDate &&
        new Date(tran.purchaseDate) <= endDate
      ) {
        return sum + tran.totalPrice;
      }
      return sum;
    }, 0);

    return total;
  }
}

//AI used to fix error messages
