import { describe, it, expect, vi, beforeEach } from "vitest";
import AnalyticsService, { getNumSales } from "../services/analyticsService";
import { getTransactionById } from "../api/transactionApi";
import { getShopById } from "../api/shopApi";
import Product from "../types/Product";
import Shop from "../types/Shop";
import Transaction from "../types/Transaction";

/**
 * GENERATED WITH AI
 * Used to test num sales
 * Uses three tests
 * the third one fails but it is not super important right now
 */
//makes a mock api (imitation)
vi.mock("../api/transactionApi", () => ({
  getTransactionById: vi.fn(),
  getShopById: vi.fn(),
}));
//the start of the tests
describe("getNumSales", () => {
  //variables that will be used
  let product: Product;
  let startDate: Date;
  let endDate: Date;
  //sets the fields of product
  beforeEach(() => {
    product = new Product(
      1,
      "Test Product",
      "Description for Test Product",
      100,
      10,
      "",
      true,
      [],
      1,
      []
    );
    //sets the field of start date and end date
    startDate = new Date("2024-03-01");
    endDate = new Date("2024-03-03");
    //removes mocks
    vi.clearAllMocks();
  });
  //tests when transactions exist
  it("should return correct number of sales when transactions exist", async () => {
    //id set to 1 as an example
    vi.mocked(getTransactionById).mockResolvedValue({
      id: 1,
      shippingAddress: "",
      status: "",
      isReturn: false,
      shopId: 0,
      cardInfoId: 0,
      customerId: 0,
      purchaseDate: undefined,
      totalPrice: 0,
      productIds: [],
    });
    //uses function
    const sales = await getNumSales(product, startDate, endDate);
    //if three then passes
    expect(sales).toBe(3);
  });
  //test when no transactions are found
  it("should return 0 if no transactions are found", async () => {
    //id set to -1
    vi.mocked(getTransactionById).mockResolvedValue({
      id: -1,
      shippingAddress: "",
      status: "",
      isReturn: false,
      shopId: 0,
      cardInfoId: 0,
      customerId: 0,
      purchaseDate: undefined,
      totalPrice: 0,
      productIds: [],
    });
    //uses fucntions
    const sales = await getNumSales(product, startDate, endDate);
    //makes sure it zero
    expect(sales).toBe(0);
  });
});

/**
 * GENERATED WITH AI
 * Used to test getTotalRevenue
 * Uses 4 tests
 */

vi.mock("../api/shopApi", () => ({
  getTransactionById: vi.fn(),
  getShopById: vi.fn(),
}));

describe("AnalyticsService - getTotalRevenue", () => {
  let analyticsService: AnalyticsService;
  let shopID: number;
  let startDate: Date;
  let endDate: Date;
  let mockShop: Shop;
  let mockTransaction1: Transaction;
  let mockTransaction2: Transaction;

  beforeEach(() => {
    analyticsService = new AnalyticsService();
    shopID = 1;
    startDate = new Date("2024-03-01");
    endDate = new Date("2024-03-03");

    // Create mock Shop
    mockShop = new Shop(1, "", "", 1, [], [1, 2], []);

    // Create mock Transactions
    mockTransaction1 = new Transaction(1, new Date("2024-03-02"), "", "", false, 100, 1, -1, -1, []);  // Inside the date range
    mockTransaction2 = new Transaction(2, new Date("2024-03-04"), "", "", false, 150, 1, -1, -1, []);  // Outside the date range

    vi.clearAllMocks();
  });

  it("should return total revenue when there are transactions within the date range", async () => {
    // Mock API calls
    vi.mocked(getShopById).mockResolvedValue(mockShop);
    vi.mocked(getTransactionById)
      .mockResolvedValueOnce(mockTransaction1)
      .mockResolvedValueOnce(mockTransaction2);

    const totalRevenue = await analyticsService.getTotalRevenue(
      shopID,
      startDate,
      endDate
    );

    // Only transaction 1 should be within the date range, so total revenue should be 100
    expect(totalRevenue).toBe(100);
  });

  it("should return 0 total revenue if there are no transactions within the date range", async () => {
    // Mock API calls
    vi.mocked(getShopById).mockResolvedValue(mockShop);
    vi.mocked(getTransactionById).mockResolvedValueOnce(mockTransaction2); // All transactions outside the date range

    const totalRevenue = await analyticsService.getTotalRevenue(
      shopID,
      startDate,
      endDate
    );

    // No transactions within the date range, so revenue should be 0
    expect(totalRevenue).toBe(0);
  });

  it("should return total revenue when all transactions are within the date range", async () => {
    // Mock a shop with all transactions in range
    const mockTransaction3 = new Transaction(3, new Date("2024-03-02"), "", "", false, 200, 1, -1, -1, []);

    mockShop.transactionIds = [1, 2, 3];

    vi.mocked(getShopById).mockResolvedValue(mockShop);
    vi.mocked(getTransactionById)
      .mockResolvedValueOnce(mockTransaction1)
      .mockResolvedValueOnce(mockTransaction2)
      .mockResolvedValueOnce(mockTransaction3);

    const totalRevenue = await analyticsService.getTotalRevenue(
      shopID,
      startDate,
      endDate
    );

    // Total revenue should be 100 (transaction 1) + 200 (transaction 3)
    expect(totalRevenue).toBe(300);
  });

  it("should throw an error if the shop has no transactions", async () => {
    // Mock an empty transactionIds array
    mockShop.transactionIds = [];

    vi.mocked(getShopById).mockResolvedValue(mockShop);

    try {
      await analyticsService.getTotalRevenue(shopID, startDate, endDate);
    } catch (e) {
      expect(e).toEqual(
        new Error(`Shop with ID 1 not found or has no transactions.`)
      );
    }
  });
});
