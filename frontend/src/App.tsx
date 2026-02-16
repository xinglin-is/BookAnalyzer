import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Books from './pages/Books';
import Analyze from './pages/Analyze';
import BookView from './pages/BookView';
import Chat from './pages/Chat';
import Layout from './components/Layout';

function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/books" element={<Books />} />
                    <Route path="/analyze" element={<Analyze />} />
                    <Route path="/book/:id" element={<BookView />} />
                    <Route path="/chat" element={<ProtectedRoute component={<Chat />} />} />
                </Routes>
            </Layout>
        </Router>
    );
}

// Simple wrapper to handle the conditional logic cleanly
function ProtectedRoute({ component }: { component: any }) {
    const hasKey = !!localStorage.getItem('openai_api_key');
    return hasKey ? component : <Home />;
}

export default App;
