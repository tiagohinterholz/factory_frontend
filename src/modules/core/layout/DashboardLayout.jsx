import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-gray-100">
      
      <Sidebar />

      <div className="flex-1 ml-64 flex flex-col">
        
        <Topbar />

        <main className="p-10">
          {children}
        </main>
      </div>

    </div>
  );
}
