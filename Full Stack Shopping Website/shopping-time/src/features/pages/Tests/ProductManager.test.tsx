import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi } from "vitest";
import ProductManager from "../ProductManager";

vi.mock("../../../api/productApi", () => ({
  getProductsByShopId: vi.fn(() =>
    Promise.resolve([
      {
        id: 1,
        name: "Apple",
        price: 1.99,
        description: "Fresh apple",
        imageUrl: "apple.jpg",
        tagIds: []
      }
    ])
  ),
  getProductById: vi.fn(),
  createProduct: vi.fn(() => Promise.resolve({ id: 2 })),
  updateProduct: vi.fn(() => Promise.resolve()),
  deleteProduct: vi.fn(() => Promise.resolve())
}));

vi.mock("../../../api/tagApi", () => ({
  getTagsByShopId: vi.fn(() => Promise.resolve([])),
  createTag: vi.fn(),
  deleteTag: vi.fn(),
  updateTag: vi.fn()
}));

describe("ProductManager", () => {
  it("renders product info", async () => {
    render(<ProductManager />);
    await waitFor(() => {
      expect(screen.getByText("Apple")).toBeInTheDocument();
      expect(screen.getByText("$1.99")).toBeInTheDocument();
      expect(screen.getByText("Fresh apple")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Edit/i })).toBeInTheDocument();
    });
  });

  it("creates a new product", async () => {
    render(<ProductManager />);
    fireEvent.click(screen.getByText("Create Product"));

    fireEvent.change(screen.getByPlaceholderText("Name"), { target: { value: "Orange" } });
    fireEvent.change(screen.getByPlaceholderText("Price"), { target: { value: "2.99" } });
    fireEvent.change(screen.getByPlaceholderText("Description"), { target: { value: "Juicy orange" } });
    fireEvent.change(screen.getByPlaceholderText("Image URL"), { target: { value: "orange.jpg" } });

    fireEvent.click(screen.getByRole("button", { name: /Add/i }));
  });

  it("edits an existing product", async () => {
    render(<ProductManager />);
    fireEvent.click(await screen.findByRole("button", { name: /Edit/i }));

    fireEvent.change(screen.getByPlaceholderText("Name"), { target: { value: "Green Apple" } });
    fireEvent.click(screen.getByRole("button", { name: /Update/i }));
  });

  it("deletes a product", async () => {
    render(<ProductManager />);
    fireEvent.click(await screen.findByRole("button", { name: /Delete/i }));
  });

  it("shows empty tag section", async () => {
    render(<ProductManager />);
    fireEvent.click(screen.getByText("Manage Tags"));
    await waitFor(() => {
      expect(screen.getByText("Manage Tags")).toBeInTheDocument();
    });
  });
});
