import { useState, useEffect } from "react";
import Product from "../../types/Product";
import Tag from "../../types/Tag";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByShopId
} from "../../api/productApi";
import {
  getTagsByShopId,
  createTag,
  deleteTag,
  updateTag
} from "../../api/tagApi";
import api from "../../api/apiClient";
import "./ProductManager.css";

function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [productTags, setProductTags] = useState<Record<number, Tag[]>>({});
  const [tagEdits, setTagEdits] = useState<Record<number, string>>({});
  const [editingTags, setEditingTags] = useState<Record<number, boolean>>({});
  const [showTagManager, setShowTagManager] = useState(false);
  const [formState, setFormState] = useState({
    name: "",
    price: "",
    description: "",
    imageUrl: ""
  });
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newTagName, setNewTagName] = useState("");
  const shopId = 1;

  useEffect(() => {
    fetchProductsAndTags();
  }, []);

  const fetchProductsAndTags = async () => {
    try {
      const prods = await getProductsByShopId(shopId);
      const tags = await getTagsByShopId(shopId);
      setProducts(prods);
      setAvailableTags(tags);

      const tagMap: Record<number, Tag[]> = {};
      for (const product of prods) {
        tagMap[product.id] = tags.filter(tag => product.tagIds.includes(tag.id));
      }
      setProductTags(tagMap);
    } catch (err) {
      console.error("Failed to load data:", err);
    }
  };

  const syncProductTags = async (productId: number, tagIds: number[]) => {
    try {
      await api.put(`/products/${productId}/tagIds`, { tagIds });
    } catch (err) {
      console.error("Error syncing tagIds:", err);
    }
  };

  const addTagToProduct = async (product: Product, tag: Tag) => {
    try {
      const newTagIds = product.tagIds.includes(tag.id)
        ? product.tagIds
        : [...product.tagIds, tag.id];
      await syncProductTags(product.id, newTagIds);
      fetchProductsAndTags();
    } catch (err) {
      console.error("Error adding tag to product:", err);
    }
  };

  const removeTagFromProduct = async (product: Product, tag: Tag) => {
    try {
      const newTagIds = product.tagIds.filter(id => id !== tag.id);
      await syncProductTags(product.id, newTagIds);
      fetchProductsAndTags();
    } catch (err) {
      console.error("Error removing tag from product:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseFloat(formState.price);
    if (!formState.name || !formState.description || !formState.imageUrl || isNaN(parsedPrice)) return;

    const newProduct: Partial<Product> = {
      name: formState.name,
      description: formState.description,
      price: parsedPrice,
      amountInStock: 10,
      imageUrl: formState.imageUrl,
      listed: true,
      reviews: [],
      shopId,
      tagIds: []
    };

    try {
      if (editingProduct) {
        await updateProduct({ ...editingProduct, ...newProduct } as Product);
      } else {
        await createProduct(newProduct as Product);
      }
      resetForm();
      fetchProductsAndTags();
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      await deleteProduct(id);
      fetchProductsAndTags();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleAddTag = async () => {
    const name = newTagName.trim();
    if (!name) return;
    try {
      await createTag({ id: 0, name, imageUrl: "", shopId, productIds: [] });
      setNewTagName("");
      fetchProductsAndTags();
    } catch (err) {
      console.error("Failed to add tag", err);
    }
  };

  const handleDeleteTag = async (tagId: number) => {
    try {
      await deleteTag(tagId);
      fetchProductsAndTags();
    } catch (err) {
      console.error("Failed to delete tag", err);
    }
  };

  const handleStartEditTag = (tagId: number, currentName: string) => {
    setTagEdits(prev => ({ ...prev, [tagId]: currentName }));
    setEditingTags(prev => ({ ...prev, [tagId]: true }));
  };

  const handleSaveEditTag = async (tagId: number) => {
    const name = tagEdits[tagId]?.trim();
    if (!name) return;
    try {
      const tag = availableTags.find(t => t.id === tagId);
      if (!tag) return;
      await updateTag({ ...tag, name });
      setEditingTags(prev => ({ ...prev, [tagId]: false }));
      fetchProductsAndTags();
    } catch (err) {
      console.error("Failed to edit tag", err);
    }
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setFormState({
      name: product.name,
      price: product.price.toString(),
      description: product.description,
      imageUrl: product.imageUrl
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormState({ name: "", price: "", description: "", imageUrl: "" });
    setEditingProduct(null);
    setShowForm(false);
  };

  return (
    <div className="manager-container">
      <h1>Product Manager</h1>
      <button onClick={() => setShowForm(true)} className="create-button">
        {editingProduct ? "Edit Product" : "Create Product"}
      </button>
      <button onClick={() => setShowTagManager(prev => !prev)} className="create-button">
        {showTagManager ? "Hide Tags" : "Manage Tags"}
      </button>

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingProduct ? "Edit Product" : "New Product"}</h2>
            <form onSubmit={handleSubmit} className="form-grid">
              <input value={formState.name} onChange={e => setFormState({ ...formState, name: e.target.value })} placeholder="Name" required />
              <input type="number" step="0.01" value={formState.price} onChange={e => setFormState({ ...formState, price: e.target.value })} placeholder="Price" required />
              <textarea value={formState.description} onChange={e => setFormState({ ...formState, description: e.target.value })} placeholder="Description" required />
              <input type="text" value={formState.imageUrl} onChange={e => setFormState({ ...formState, imageUrl: e.target.value })} placeholder="Image URL" required />
              <button type="submit">{editingProduct ? "Update" : "Add"}</button>
              <button type="button" onClick={resetForm}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {showTagManager && (
        <div className="tag-management">
        <h2>Manage Tags</h2>
        <input
          value={newTagName}
          onChange={e => setNewTagName(e.target.value)}
          placeholder="New tag name"
        />
        <button onClick={handleAddTag}>Add Tag</button>
      
        {/* Horizontal scroll wrapper */}
        <div className="tag-scroll-container">
          {availableTags.map(tag => (
            <div key={tag.id} className="tag-row">
              {editingTags[tag.id] ? (
                <>
                  <button className="save-button" onClick={() => handleSaveEditTag(tag.id)}>Save</button>
                  <input
                    className="edit-tag-input"
                    value={tagEdits[tag.id] ?? tag.name}
                    onChange={e => setTagEdits(prev => ({ ...prev, [tag.id]: e.target.value }))}
                  />
                </>
              ) : (
                <>
                  <span>{tag.name}</span>
                  <button onClick={() => handleStartEditTag(tag.id, tag.name)}>Edit</button>
                </>
              )}
              <button onClick={() => handleDeleteTag(tag.id)}>Delete</button>
            </div>
          ))}
        </div>
      </div>
      
      )}

      <h2>Inventory</h2>
      <div className="product-grid">
        {products.map((p) => (
          <div key={p.id} className="product-card">
            <img src={p.imageUrl} alt={p.name} className="uploaded-image" />
            <h3>{p.name}</h3>
            <p>${p.price.toFixed(2)}</p>
            <p>{p.description}</p>

            <div className="tags">
              {(productTags[p.id] || []).map(tag => (
                <span key={tag.id} className="tag">
                  #{tag.name}
                  <button
                    className="remove-tag-button"
                    onClick={() => removeTagFromProduct(p, tag)}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>

            <div className="tags">
              {availableTags.map(tag => !p.tagIds.includes(tag.id) && (
                <button key={tag.id} onClick={() => addTagToProduct(p, tag)} className="form-button">
                  + #{tag.name}
                </button>
              ))}
            </div>

            <button onClick={() => startEdit(p)} className="form-button">Edit</button>
            <button onClick={() => handleDeleteProduct(p.id)} className="delete-button">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductManager;
