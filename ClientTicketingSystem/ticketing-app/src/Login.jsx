import { GoogleLogin, googleLogout } from "@react-oauth/google"
import { jwtDecode } from "jwt-decode"
import { useNavigate } from "react-router-dom";
import { LoginWithGoogle } from "./LoginWithGoogle";

export function Login() {

    const navigate = useNavigate()

    return (
        <>
            <div className="container">
                <h1>
                    Login to your Ticketing Center
                </h1>

                <div className="row">
                    <div className="col">
                        <div className="card">
                            <div className="card-body">
                                <form>
                                    <div className="mb-3">
                                        <label className="form-label">Email</label>
                                        <input type="email" className="form-control" />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Password</label>
                                        <input type="Password" className="form-control" />
                                    </div>
                                </form>


                                <div className="d-grid" >
                                    <LoginWithGoogle />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}