import { useState, useEffect } from "react";
import {
  deleteTransaction,
  getTransactionById
} from "../../api/transactionApi";
import { getCustomerByUsername } from "../../api/customerApi";
import { useAuth } from "../auth/AuthContext";
import "./PurchasePage.css";

function PurchasePage() {
  const { user } = useAuth();
  const [purchaseItems, setPurchaseItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchCustomerTransactions = async () => {
      if (!user) return;

      try {
        const customer = await getCustomerByUsername(user.username);
        const transactionIds = customer.transactionIds;

        const transactions = await Promise.all(
          transactionIds.map((id: number) =>
            getTransactionById(id).catch(() => null)
          )
        );

        const validTransactions = transactions.filter((t): t is any => t !== null);
        setPurchaseItems(validTransactions);
        console.log("🧾 Loaded customer transactions:", validTransactions);
      } catch (error) {
        console.error("❌ Failed to load transactions:", error);
      }
    };

    fetchCustomerTransactions();
  }, [user]);

  const deleteItem = async (index: number) => {
    const item = purchaseItems[index];
    if (!item) return;

    try {
      await deleteTransaction(item.id);
      const updatedItems = [...purchaseItems];
      updatedItems.splice(index, 1);
      setPurchaseItems(updatedItems);
      console.log(`🗑️ Deleted transaction with ID ${item.id}`);
    } catch (error) {
      console.error("❌ Failed to delete transaction:", error);
    }
  };

  const deleteAllItems = async () => {
    try {
      await Promise.all(purchaseItems.map((item) => deleteTransaction(item.id)));
      setPurchaseItems([]);
      console.log("🗑️ Deleted all transactions");
    } catch (error) {
      console.error("❌ Failed to delete all transactions:", error);
    }
  };
  let purchase=1;
  return (
    <div className="manager-container">
      <h1>Previous Purchases</h1>
      <div className="scroll-container">
        {purchaseItems.length > 0 ? (
          purchaseItems.map((item, index) => (
            <div className="item" key={item.id}>
              <div className="fields">
                <h3>Transaction #{purchase++}</h3>
                <p><strong>Date:</strong> {new Date(item.purchaseDate).toLocaleDateString()}</p>
                <p><strong>Shipping:</strong> {item.shippingAddress}</p>
                <p><strong>Status:</strong> {item.status}</p>
                <p><strong>Return:</strong> {item.isReturn ? "Yes" : "No"}</p>
                <p><strong>Total:</strong> ${item.totalPrice.toFixed(2)}</p>
                <button className="delete-btn" onClick={() => deleteItem(index)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <h2>No purchases found</h2>
        )}
      </div>

      {purchaseItems.length > 0 && (
        <div className="delete-all-container">
          <button className="delete-all-btn" onClick={deleteAllItems}>
            Delete All
          </button>
        </div>
      )}
    </div>
  );
}

export default PurchasePage;
