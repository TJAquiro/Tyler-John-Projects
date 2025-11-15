const cartData = {
  items: JSON.parse(localStorage.getItem("cartItems") || "[]"),

  addItem(product: { name: string; price: number; image: string }) {
    this.items.push(product);
    localStorage.setItem("cartItems", JSON.stringify(this.items));
  },

  removeItem(index:number) {
    this.items.splice(index, 1);
    localStorage.setItem("cartItems", JSON.stringify(this.items));
  },

  clearCart() {
    this.items = [];
    localStorage.setItem("cartItems", JSON.stringify(this.items));
  },
};

export default cartData;
