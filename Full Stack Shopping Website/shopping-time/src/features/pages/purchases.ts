const purchaseData = {
    //makes storage
    items: JSON.parse(localStorage.getItem("purchaseItems") || "[]"),
    //adds item
    /**
     * Takes in item name, price and image
     * @param purchase 
     */
    addItem(purchase: { itemname: string; price: number; image: string }) {
      this.items = this.getPurchases();  // Refresh items before adding
      this.items.push(purchase);  // Add new purchase
      localStorage.setItem("purchaseItems", JSON.stringify(this.items));  // Save to localStorage
    },
    /**
     * get items
     * @returns purchases
     */
    getPurchases() {
      return JSON.parse(localStorage.getItem("purchaseItems") || "[]");
    },
    /**
     * removes items
     * @param index
     */
    removeItem(index: number) {
      this.items = this.getPurchases(); // Refresh items
      this.items.splice(index, 1);  // Remove the item at the specified index
      localStorage.setItem("purchaseItems", JSON.stringify(this.items));  // Save to localStorage
    }
  };
  
  export default purchaseData;
  