import "./ProductDetail.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Product from "../../types/Product";
import Tag from "../../types/Tag";
import { getProductById } from "../../api/productApi";
import { getTagsByProductId } from "../../api/tagApi";
import { getCustomerById, updateCustomerCart } from "../../api/customerApi";
import { getImageByUrl } from "../../api/imageApi";
import { useAuth } from "../auth/AuthContext";
import Customer from "../../types/Customer";

function ProductDetail() {
  const { id } = useParams();
  const { user, userType } = useAuth();
  const customer = user as Customer;

  const [product, setProduct] = useState<Product | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [localCustomer, setLocalCustomer] = useState<Customer | null>(customer);
  const [imageSrcs, setImageSrcs] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!id) return;

    const loadProduct = async () => {
      try {
        const productId = parseInt(id);
        const fetchedProduct = await getProductById(productId);
        const fetchedTags = await getTagsByProductId(productId);

        // Prepare image sources
        let newImageSrcs: Record<string, string> = {};
        newImageSrcs[fetchedProduct.imageUrl] = await getImageByUrl(fetchedProduct.imageUrl);
        for (const tag of fetchedTags) {
          newImageSrcs[tag.imageUrl] = await getImageByUrl(tag.imageUrl);
        }

        setProduct(fetchedProduct);
        setTags(fetchedTags);
        setImageSrcs(newImageSrcs);
      } catch (err) {
        console.error("Error loading product:", err);
        setError("Failed to load product data.");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  useEffect(() => {
    if (localCustomer) {
      loadCustomer();
    }
  }, []);

  const handleAddToCart = async () => {
    if (!localCustomer || !product) return;

    try {
      const updatedCart = [...localCustomer.cart, product.id];
      await updateCustomerCart(localCustomer.id, updatedCart);
      const updatedCustomer = { ...localCustomer, cart: updatedCart };
      setLocalCustomer(updatedCustomer);
      localStorage.setItem("currentUser", JSON.stringify(updatedCustomer));
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 2000);
    } catch (err) {
      console.error("Failed to update cart:", err);
    }
  };

  const loadCustomer = async () => {
    if (!localCustomer) return;
    try {
      const user = await getCustomerById(localCustomer.id);
      setLocalCustomer(user);
    } catch (error) {
      console.error("Failed to load local customer", error);
    }
  };

  if (loading) return <p>Loading product...</p>;
  if (error || !product) return <p>{error || "Product not found."}</p>;

  return (
    <div className="manager-container">
      <div className="product-detail-card">
        <div className="product-left">
          <img
            className="product-image"
            src={imageSrcs[product.imageUrl]}
            alt={product.name}
          />
        </div>

        <div className="product-right">
          <h1 className="product-name">{product.name}</h1>
          <p className="product-price">Price: ${product.price.toFixed(2)}</p>
          <p className="product-stock">
            Stock: {product.amountInStock > 0 ? `${product.amountInStock} available` : "Out of Stock"}
          </p>
          <p className="product-description">{product.description}</p>
          {userType === "customer" && (
            <>
              <button className="add-to-cart" onClick={handleAddToCart}>
                Add to Cart
              </button>
              {showMessage && <p className="cart-confirmation">Added!</p>}
            </>
          )}
        </div>
      </div>

      {tags.length > 0 && (
        <div className="product-tags">
          <h4>Tags:</h4>
          <div className="tags-list">
            {tags.map(tag => (
              <div key={tag.id} className="tag-item">
                <img
                  src={imageSrcs[tag.imageUrl]}
                  alt={tag.name}
                />
                <div>{tag.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetail;
