
import LandingPage from './pages/LandingPage'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FAQ from './pages/FAQPage';
import MaintenancePage from './pages/MaintenancePage';

function AppRouter() {
    return (
        <div>
            <Router>
                <Routes>
                    <Route exact path="/" element={<LandingPage />} />
                    <Route exact path="/faq" element={<FAQ />} />
                </Routes>
            </Router>
        </div>
    )
}

export default AppRouter