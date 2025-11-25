import { CartProvider } from '../context/CartContext'
import { UserProvider } from '../context/UserContext'
import { NotificationProvider } from '../context/NotificationContext'
import '../styles/globals.css'
function MyApp({ Component, pageProps }) {
  return (
    <UserProvider>
      <NotificationProvider>
        <CartProvider>
          <Component {...pageProps} />
        </CartProvider>
      </NotificationProvider>
    </UserProvider>
  )
}
export default MyApp
