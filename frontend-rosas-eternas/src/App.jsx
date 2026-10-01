import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Protected from './components/Protected';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Home from './pages/Home';
import Catalogo from './pages/Catalogo';
import Producto from './pages/Producto';
import Promociones from './pages/Promociones';
import Carrito from './pages/Carrito';
import Checkout from './pages/Checkout';
import Pedidos from './pages/Pedidos';
import PedidoDetalle from './pages/PedidoDetalle';
import Ingresar from './pages/Ingresar';
import Registro from './pages/Registro';
import Contacto from './pages/Contacto';
import Eventos from './pages/Eventos';
import Favoritos from './pages/Favoritos';
import Admin from './pages/Admin';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/catalogo" element={<Catalogo />} />
              <Route path="/catalogo/:slug" element={<Producto />} />
              <Route path="/promociones" element={<Promociones />} />
              <Route path="/carrito" element={<Carrito />} />
              <Route path="/checkout" element={<Protected><Checkout /></Protected>} />
              <Route path="/ingresar" element={<Ingresar />} />
              <Route path="/registro" element={<Registro />} />
              <Route path="/contacto" element={<Contacto />} />
              <Route path="/eventos" element={<Eventos />} />
              <Route path="/cuenta/pedidos" element={<Protected><Pedidos /></Protected>} />
              <Route path="/cuenta/pedidos/:id" element={<Protected><PedidoDetalle /></Protected>} />
              <Route path="/cuenta/favoritos" element={<Protected><Favoritos /></Protected>} />
              <Route path="/admin" element={<Protected admin><Admin /></Protected>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
