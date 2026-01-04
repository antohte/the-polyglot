import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import useUserProfile from "../hooks/useUserProfile";

export default function AdminRoute() {
    const { user, loading: authLoading } = useAuth();
    const { profile, loading: profileLoading } = useUserProfile(user?.uid);

    if (authLoading || profileLoading) {
        return <div className="loading-screen">Chargement...</div>;
    }

    // Si pas connecté ou pas admin -> redirect Home
    if (!user || !profile || profile.role !== "admin") {
        return <Navigate to="/" replace />;
    }

    // Si admin -> on affiche les enfants (Outlet)
    return <Outlet />;
}
