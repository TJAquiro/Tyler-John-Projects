import { render, screen, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom';
import PurchasePage from "../PurchasePage";
import { vi } from "vitest";

// 🔧 Mock the AuthContext
vi.mock("../../auth/AuthContext", () => ({
  useAuth: () => ({
    user: { username: "testuser" }
  })
}));

// 🧪 Mock the API functions
vi.mock("../../../api/customerApi", () => ({
  getCustomerByUsername: vi.fn(() =>
    Promise.resolve({
      transactionIds: [101, 102]
    })
  )
}));

vi.mock("../../../api/transactionApi", () => ({
  getTransactionById: vi.fn((id: number) =>
    Promise.resolve({
      id,
      purchaseDate: new Date("2025-01-01"),
      shippingAddress: "123 Main St",
      status: "Delivered",
      isReturn: false,
      totalPrice: 42.99,
      shopId: 1,
      cardInfoId: 1,
      customerId: 1,
      productIds: [1, 2]
    })
  ),
  deleteTransaction: vi.fn(() => Promise.resolve())
}));

describe("PurchasePage UI", () => {
  it("renders the purchase list and buttons correctly", async () => {
    render(<PurchasePage />);

    expect(screen.getByText("Previous Purchases")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/transaction #1/i)).toBeInTheDocument();
      expect(screen.getByText(/transaction #2/i)).toBeInTheDocument();

      expect(screen.getAllByText(/date/i, { exact: false })).toHaveLength(2);
      expect(screen.getAllByText(/shipping/i, { exact: false })).toHaveLength(2);
      expect(screen.getAllByText(/status/i, { exact: false })).toHaveLength(2);
      expect(screen.getAllByText(/return/i, { exact: false })).toHaveLength(2);
      expect(screen.getAllByText(/total/i, { exact: false })).toHaveLength(2);

      expect(screen.getAllByText("Delete").length).toBe(2);
      expect(screen.getByText("Delete All")).toBeInTheDocument();
    });
  });
});
