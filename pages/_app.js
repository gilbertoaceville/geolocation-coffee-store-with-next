import StoreProvider from "../context/store-context";
import "../styles/globals.css";

//represents the body and not the head (general head tag should be in _document.js)
function MyApp({ Component, pageProps }) {
  return (
    <StoreProvider>
      <Component {...pageProps} />
    </StoreProvider>
  );
}

export default MyApp;
