import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Customer from "../../types/Customer";
import BusinessOwner from "../../types/BusinessOwner";

type AuthUser = Customer | BusinessOwner;
type UserType= 'customer' | 'businessOwner';


interface AuthContextType {
    user: AuthUser | null;
    userType: UserType | null;
    // login: (user: Customer, token: string) => void;
    login: (user: AuthUser, userType: UserType) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [userType, setUserType] = useState<UserType | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        const storedType = localStorage.getItem('userType') as UserType | null;

        // const token = localStorage.getItem('token');
        // if(storedUser && token){
        if(storedUser && storedType){
            setUser(JSON.parse(storedUser));
            setUserType(storedType);
        }
    }, []);

    // const login = (newUser: Customer, token: string) => {
    const login = (newUser: AuthUser, type: UserType) => {
        // localStorage.setItem('token', token);
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        localStorage.setItem('userType', type)
        setUser(newUser);
        setUserType(type);
    };
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userType');
        setUser(null);
        setUserType(null);
    };

    return(
        <AuthContext.Provider value={{ user, userType, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context;
}