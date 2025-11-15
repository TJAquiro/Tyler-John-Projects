import { Button, Card, Grid, styled } from '@mui/material'
import { Link } from "react-router-dom";
import './Dashboard.css'
import Product from '../../types/Product';
import Tag from '../../types/Tag';
import { useAuth } from '../auth/AuthContext';
import { getProductsByShopId } from '../../api/productApi';
import { getTagsByShopId } from '../../api/tagApi';
import { useState, useEffect } from 'react';
import Shop from '../../types/Shop';
import { getShopById } from '../../api/shopApi';
import Customer from '../../types/Customer';
import BusinessOwner from '../../types/BusinessOwner';
import { getCustomerById, updateCustomerCart } from '../../api/customerApi';
import { getBusinessOwnerById } from '../../api/businessOwnerApi';
import { getImageByUrl } from '../../api/imageApi';

const ProductCard = styled(Card)(() => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  paddingBottom: '1em'
}))

function Dashboard() {

  // CONST VARIABLES ----------------------------------------------------
  const { user, userType } = useAuth();
  const initialUser = (userType == "customer") ? user as Customer : user as BusinessOwner;

  // USE STATES ----------------------------------------------------
  const [loggedInUser, setLoggedInUser] = useState<Customer | BusinessOwner>(initialUser)
  const [shop, setShop] = useState<Shop>();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [imageSrcs, setImageSrcs] = useState<Record<string, string>>({});

  // USE EFFECTS ----------------------------------------------------
  /**
   * Effect to load data on mount and whenever loggedInUser changes
   */
  useEffect(() => {
    if (loggedInUser) {
      loadData();
    }
  }, [loggedInUser]);

  /**
   * Effect to udpate the loggedInUser on mount
   */
  useEffect(() => {
    if (loggedInUser) {
      loadUser();
    }
  }, []);

  // CONST FUNCTION DECLARATIONS ----------------------------------------------------
  /**
  * Loads data from backend about the user.
  */
  const loadUser = async () => {
    try {
      const userId: number = loggedInUser.id;

      const user = userType === 'customer'
        ? await getCustomerById(userId)
        : await getBusinessOwnerById(userId);

      setLoggedInUser(user);
    }
    catch (error) {
      console.error("Failed to load logged in user", error)
    }
  }

  /**
   * Loads data from backend about the shop, products, and tags.
   */
  const loadData = async () => {
    try {
      const shopId: number = loggedInUser.shopId;
      const [shop, products, tags] = await Promise.all([
        getShopById(shopId),
        getProductsByShopId(shopId),
        getTagsByShopId(shopId)
      ]);

	  let newImageSrcs: Record<string, string> = {};
	  for (const product of products)
	  {
		newImageSrcs[product.imageUrl] = await getImageByUrl(product.imageUrl);
	  }
	  for (const tag of tags)
	  {
		newImageSrcs[tag.imageUrl] = await getImageByUrl(tag.imageUrl);
	  }
	  newImageSrcs[shop.logoImageUrl] = await getImageByUrl(shop.logoImageUrl);

      setShop(shop);
      setAllProducts(products);
      setAllTags(tags);
	  setImageSrcs(newImageSrcs);
    }
    catch (error) {
      console.error("Failed to load featured content", error)
    }
  }

  /**
   * Adds a product to logged in user's cart. (Should only be called when user is a Customer)
   * @param product product object to add to cart
   */
  const addToCart = async (product: Product) => {
    const updatedCart: number[] = (loggedInUser as Customer).cart;
    updatedCart.push(product.id);
    try {
      await updateCustomerCart(loggedInUser.id, updatedCart);
      const updatedCustomer = { ...loggedInUser, cart: updatedCart };
      setLoggedInUser(updatedCustomer);
    }
    catch {
      console.log("Could not update customer's cart.")
    }
  }

  // USE EFFECTS ----------------------------------------------------
  /**
   * Effect to load data on mount and whenever loggedInUser changes
   */
  useEffect(() => {
    if (!user) { return; }
    loadData();
  }, [loggedInUser]);

  // JSX COMPONENT ----------------------------------------------------
  return (
    <>
      <div className="dashboard-header">
        <Card sx={{ paddingInline: "2rem", marginBlock: "2em", minHeight: "20em", borderRadius: "2%", display: "flex", direction: 'horizontal', alignItems: 'center', justifyContent: 'center' }}>
          <img
            src={(typeof shop == 'undefined') ? undefined : imageSrcs[shop.logoImageUrl] }
            style={{ width: '95%', height: '200px', padding: '2.5%', objectFit: 'cover', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          />
        </Card>
      </div >

      <div className="featured-section">
        <div className="featured-header">
          <h2 style={{ color: 'white' }}>Featured Products</h2>
        </div>
        <div className="featured-list">
          <Grid container spacing={4}>
            {allProducts
              // .filter(product => product.listed == true)
              .map((product) => (
                <Grid size={4} key={product.id} sx={{ display: "flex", flexDirection: "column" }}>
                  <ProductCard>
                    <img
                      src={imageSrcs[product.imageUrl]}
                      style={{ width: '95%', height: '200px', padding: '2.5%', objectFit: 'cover'}}
                    />
                    <h4 style={{ marginTop: ".3em", marginBottom: ".3em" }}>{product.name}</h4>
                    <p style={{ marginTop: "0em", marginBottom: ".5em" }}>{product.description}</p>
                    {userType == "customer" &&
                      <div style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                        <Button onClick={() => addToCart(product)} variant="contained" size="small" sx={{ background: "lightgray", color: "black", marginTop: "auto", marginLeft: "4%" }}>
                          Add to Cart
                        </Button>
                        <Button component={Link} to={`/products/${product.id}`} variant="contained" size="small" sx={{ background: "lightgray", color: "black", marginTop: "auto", marginRight: "4%" }}>
                          View Product
                        </Button>
                      </div>
                    }
                    {userType == "businessOwner" &&
                      <Button component={Link} to={`/products/${product.id}`} variant="contained" size="small" sx={{ background: "lightgray", color: "black", marginTop: "auto", alignSelf: "center" }}>
                        Edit Product
                      </Button>
                    }
                  </ProductCard>
                </Grid>
              ))}
          </Grid>
        </div>
      </div>
      <div className="tags-section">
        <div className="tags-header">
          <h2 style={{ color: "white" }}>Tags</h2>
        </div>
        <div className="tags-list">
          <Grid container spacing={4}>
            {allTags.map((tag) => (
              <Grid size={3} key={tag.id} sx={{ display: "flex", flexDirection: "column" }}>
                <ProductCard>
                  <img
                    src={imageSrcs[tag.imageUrl]}
                    style={{ width: '95%', height: '200px', padding: '2.5%', objectFit: 'cover', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  />
                  <h3 style={{ marginTop: ".3em", marginBottom: ".7em" }}>{tag.name}</h3>
                  <Button component={Link} to="/catalogue-page" variant="contained" size="small" sx={{ background: "lightgray", color: "black", marginTop: "auto", alignSelf: "center" }}>
                    Browse Tag
                  </Button>
                </ProductCard>
              </Grid>
            ))}
          </Grid>
        </div>
      </div>
    </>
  );
}

export default Dashboard