import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Home } from "./pages/Home";
import { Wrap } from "./pages/Wrap";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/wrap/:username" element={<Wrap />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
