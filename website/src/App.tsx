// src/App.tsx
// Root component — wraps RouterProvider with AuthContext.

import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { router } from './router';

function App(): JSX.Element {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
