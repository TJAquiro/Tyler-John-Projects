import { GoogleLogin, googleLogout } from "@react-oauth/google"
import { jwtDecode } from "jwt-decode"
import { useNavigate } from "react-router-dom";

export function Homepage() {

    let givenName = localStorage.getItem("givenName");
    let family_name = localStorage.getItem("family_name");
    let email = localStorage.getItem("email");

    return (
        <>
            <div class="container-fluid bg-info py-2">
                <div class="d-flex align-items-center justify-content-between">
                    <h3 className="text-white">
                        Ticketing App
                    </h3>

                    <div className="d-flex align-items-center gap-2">
                        <div class="d-inline-flex align-items-center gap-2 bg-primary text-white px-3 py-2 rounded-pill">
                            <p class="mb-0">Welcome, {givenName} {family_name}</p>
                        </div>
                        <button class="btn border-light btn-sm d-inline-flex align-items-center gap-2 bg-info text-white px-3 py-2 rounded-pill">Logout</button>
                    </div>
                </div>
            </div>
        </>
    )
}