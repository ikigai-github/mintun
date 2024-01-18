// @refresh reload
import { Router } from '@solidjs/router';
import { FileRoutes } from '@solidjs/start';
import { Suspense } from 'solid-js';
import Nav from '~/components/Nav';
import './app.css';
import { WalletProvider } from './components/WalletContext';

export default function App() {
  return (
    <Router
      root={(props) => (
        <WalletProvider>
          <Nav />
          <Suspense>{props.children}</Suspense>
        </WalletProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
