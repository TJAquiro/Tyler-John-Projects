import "./Signup.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createCustomer } from "../../api/customerApi";
import Customer from "../../types/Customer";
import { useAuth } from "../auth/AuthContext";

function Signup(){
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if(password !== confirmPassword){
            alert("Passwords do not match");
            return;
        }
        if(!firstName || !lastName || !username || !password){
            alert("Please fill in all fields");
            return;
        }

        try {
            const payload = {
            id: -1,
            firstName,
            lastName,
            username,
            password,
            shopId: 1,
            cart: [],
            transactionIds: [],
            cardInfoIds: [],
            discountIds: []
            };

            const created: Customer = await createCustomer(payload as Customer);
            console.log("Created Customer:", created);

            login(created, 'customer');

            navigate('/dashboard');
        } catch (error: any) {
            console.error("Full signup error:", error);
            console.error("Response data:", error.response?.data);
            console.error("Status code:", error.response?.status);
            alert("Signup failed, please try again.");
        }
    };

    return(
        <div className="signup-container">
            <form className="signup-form" onSubmit={handleSubmit}>
                <h1 className="signup-title">Sign Up</h1>
                <input 
                    type="text" 
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="signup-input"
                    required
                />
                <input 
                    type="text" 
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="signup-input"
                    required
                />
                <input 
                    type="text" 
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="signup-input"
                    required
                />
                <input 
                    type="password" 
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="signup-input"
                    required
                />
                <input 
                    type="password" 
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="signup-input"
                    required
                />
                <button type="submit" className="signup-button">
                    Sign Up
                </button>
                <p className="signup-text">
                    Already have an account? <Link to="/login">Log In</Link>
                </p>
            </form>
        </div>
    );
}

export default Signup;