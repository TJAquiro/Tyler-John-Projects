import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './features/pages/Dashboard'
import CartPage from './features/pages/CartDetail';
import Header from './features/components/Header';
import BusinessTools from './features/pages/BusinessTools';
import PurchasePage from './features/pages/PurchasePage';
import ProductManager from './features/pages/ProductManager';
import CataloguePage from './features/pages/CataloguePage';
import Checkout from './features/pages/Checkout';
import Login from './features/pages/Login';
import Signup from './features/pages/Signup';
import BusinessDashboard from './features/pages/BusinessAnalytics';
import Profile from './features/pages/Profile';
import ProductDetail from './features/pages/ProductDetail';
import PurchaseSuccess from './features/pages/PurchaseSuccess';

function App() {
  return (
    <Router>
	  <Header/>
	
      <main>
        <Routes>
          {/* common links */}
          <Route path='/' element={<Dashboard/>} />
          <Route path='/dashboard' element={<Dashboard/>} />
          <Route path='/login' element={<Login/>} />
          <Route path='/profile' element={<Profile/>} />

          {/* business links */}
          <Route path='/business-tools' element={<BusinessTools/>} />
          <Route path="/product-manager" element={<ProductManager />} />
          <Route path='/business-dashboard' element={<BusinessDashboard/>} />

          {/* customer links */}
          <Route path="/purchase-page" element={<PurchasePage />} />
          <Route path='/cart-page' element={<CartPage/>} />
          <Route path='/catalogue-page' element={<CataloguePage/>} />
          <Route path='/signup' element={<Signup/>} />
          <Route path='/Checkout' element={<Checkout/>} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/purchase-success" element={<PurchaseSuccess />} />

        </Routes>
      </main>
    </Router>
    

  )
}

export default App;