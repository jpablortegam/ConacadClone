import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AlumnoDashboard from "@/components/dashboards/AlumnoDashboard";
import ProfesorDashboard from "@/components/dashboards/ProfesorDashboard";

const PageDashboard = async () => {
    const session = await auth();

    if (!session || !session.user) {
        redirect("/sign-in");
    }

    const userRole = session.user.role;

    if (!userRole) {
        return <div>Rol de usuario no definido.</div>;
    }

    const renderDashboard = () => {
        switch (userRole) {
            case "profesor":
                return <ProfesorDashboard />;
            case "alumno":
                return <AlumnoDashboard />;
        }
    };
    const currentTime = new Date().getTime();
    if (session.expires && new Date(session.expires).getTime() < currentTime) {
        redirect("/sign-in");
    }
    return (
        <div className="mt-8">
            {renderDashboard()}
        </div>
    )
}
export default PageDashboard;