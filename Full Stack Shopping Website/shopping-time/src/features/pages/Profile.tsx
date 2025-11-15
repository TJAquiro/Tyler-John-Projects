import './Profile.css';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Customer from '../../types/Customer';
import BusinessOwner from '../../types/BusinessOwner';
import { useAuth } from '../auth/AuthContext';
import { updateCustomer } from '../../api/customerApi';
import { updateBusinessOwner } from '../../api/businessOwnerApi';
import { usernameExists } from '../../api/userApi';

function Profile() {
    const { user, userType, login, logout } = useAuth();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const navigate = useNavigate();

    useEffect(() => {

        const rawUser = localStorage.getItem('currentUser');

        if(!rawUser){
            navigate('/login');
            return;
        }
        const storedUser = JSON.parse(rawUser);
        setFirstName(storedUser.firstName);
        setLastName(storedUser.lastName);
        setUsername(storedUser.username);

    }, [user, userType, navigate])

    const handleSave = async (event: React.FormEvent) => {
        event.preventDefault();

        if(!user) return;

        if (username !== user.username) {
            const exists = await usernameExists(username);
            if (exists) {
                alert("That username is already in use. Please pick another.");
                return;
            }
        }

        const updated = { ...user, firstName, lastName, username, };

        try {
            logout();
            let saved;
            if (userType === 'customer') {
                saved = await updateCustomer(updated as Customer);
                login(updated, 'customer');
            } else {
                saved = await updateBusinessOwner(updated as BusinessOwner);
                login(updated, 'businessOwner');
            }
            navigate('/dashboard');
        } catch (error: any) {
            console.error("Update failed", error);
            alert("Failed to update profile");
        }
    };

    if (!user) {
        return null;
    }

    return(
        <div className="profile-container">
            <form className="profile-form" onSubmit={handleSave}>
                <h1 className="profile-title">
                    Your Profile
                </h1>
                <input 
                    type="text" 
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="profile-input"
                    required
                />
                <input 
                    type="text" 
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="profile-input"
                    required
                />
                <input 
                    type="text" 
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="profile-input"
                    required
                />
                <button type="submit" className="profile-button">
                    Save Changes
                </button>
                <p className="Profile-text">
                    <Link to="/dashboard">Back to Dashboard</Link>
                </p>
            </form>
        </div>
    );
}

export default Profile;
