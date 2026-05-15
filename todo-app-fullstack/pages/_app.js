import '../styles/globals.css'
import { AppProvider } from '../context/AppContext'
import Layout from '../components/layout/Layout'

export default function App({ Component, pageProps }) {
  return (
    <AppProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AppProvider>
  )
}
