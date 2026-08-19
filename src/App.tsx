import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { ProductDetail } from './pages/ProductDetail';
import { MyEntries } from './pages/MyEntries';
import { Calendar } from './pages/Calendar';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/my-entries" element={<MyEntries />} />
        <Route path="/calendar" element={<Calendar />} />
      </Route>
    </Routes>
  );
}
