import './Header.css'
import { Link, useNavigate } from "react-router-dom";
import { Button, IconButton, Menu, MenuItem } from "@mui/material";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';

const businessName = 'Shopping Time';

function Header(){
    const [anchorE1, setAnchorE1] = useState<null | HTMLElement>(null);
    const navigate = useNavigate();
    const { user, userType, logout } = useAuth();

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorE1(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorE1(null);
    };

    const handleLoginlogout = () => {
        handleMenuClose();
        if(user){
            logout();
            navigate('/');
        } else {
            navigate('/login');
        }
    }

    return(
        <header className="header">
            {/* <nav className="container"> */}
                <h1 className="logo">
                    {user ? `Welcome, ${user?.firstName}` : businessName}
                </h1>

                <div className="nav-links">
                    {/* common link */}
                    <Button color="inherit" component={Link} to="/dashboard">Dashboard</Button>

                    {/* customer links */}
                    {userType !== 'businessOwner' && (
                        <>
                            <Button color="inherit" component={Link} to="/cart-page">Cart</Button>
                        </>
                    )}

                    {/* businessOwner links */}
                    {userType === 'businessOwner' && (
                        <>
                            <Button color="inherit" component={Link} to="/product-manager">Product Manager</Button>
                        </>
                    )}
                

                    <IconButton color="inherit" onClick={handleMenuOpen} sx={{marginRight: "1rem"}}>
                        <AccountCircleIcon />
                    </IconButton>
                    <Menu
                        anchorEl={anchorE1}
                        open={Boolean(anchorE1)}
                        onClose={handleMenuClose}
                        anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                        transformOrigin={{vertical: 'top', horizontal: 'right'}}
                    >
                        <MenuItem component={Link} to="/profile" onClick={handleMenuClose}>
                            Profile
                        </MenuItem>
                        {userType === 'customer' && (
                            <MenuItem component={Link} to="/purchase-page" onClick={handleMenuClose}>
                                Previous Purchases
                            </MenuItem>
                        )}
                        <MenuItem onClick={handleLoginlogout}>
                            {user ? "Logout" : "Login"}
                        </MenuItem>
                    </Menu>
                </div>
            {/* </nav> */}
        </header>
    );
}

export default Header;