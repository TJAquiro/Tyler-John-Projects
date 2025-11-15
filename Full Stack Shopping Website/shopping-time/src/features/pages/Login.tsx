import './Login.css';
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../auth/AuthContext';
import Customer from '../../types/Customer';
import { getCustomerByUsername } from '../../api/customerApi';
import BusinessOwner from '../../types/BusinessOwner';
import { getBusinessOwnerByUsername } from '../../api/businessOwnerApi';
import { usernameExists } from '../../api/userApi';

function Login(){
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if(!username.trim() || !password.trim()){
            alert("Please fill in both username and password");
            return;
        }

        try {
            const userExists = await usernameExists(username);
            if(!userExists) {
                alert("Invalid username");
                return;
            }

            // const passValid = await authenticatePassword(password);
            const passValid = true;
            if(!passValid) {
                alert("Invalid password");
                return;
            }

            let userObject: Customer | BusinessOwner | null;
            let type: 'customer' | 'businessOwner' = 'customer';
            
            try {
                userObject = await getCustomerByUsername(username);
            } catch (err) {
                console.warn("Customer lookup failed:", err);
                userObject = null;
            }

            if(!userObject){
                try {
                    userObject = await getBusinessOwnerByUsername(username);
                    type = 'businessOwner';
                } catch (err) {
                    console.warn("Buisness owner lookup failed:", err);
                    userObject = null;
                }
            }

            if(!userObject){
                alert("User not found in records");
                return;
            }

            login(userObject, type);
            navigate('/dashboard');
            
        } catch(error) {
            console.error("Login error:", error);
            alert("An error occured during login. Please try again.");
        }
    };

    return(
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h1 className="login-title">Log In</h1>
                <input 
                    type="text" 
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="login-input"
                    required
                />
                <input 
                    type="password" 
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="login-input"
                    required
                />
                <button type="submit" className="login-button">
                    Log In
                </button>
                <p className="login-text">
                    Don't have an account? <Link to="/signup">Sign Up</Link>
                </p>
            </form>

        </div>
    );
}

export default Login;