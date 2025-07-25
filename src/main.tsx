import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from '@/contexts/DemoAuthContext'
import { DataProvider } from '@/contexts/DataContext'

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <DataProvider>
      <App />
    </DataProvider>
  </AuthProvider>
);
