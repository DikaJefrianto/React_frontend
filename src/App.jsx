import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Sidebar } from "./components/Sidebar";
import AppRouter from "./AppRouter";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
