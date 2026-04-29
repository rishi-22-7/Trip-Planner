/*
  App.jsx – Root component. Wraps the application in Context providers and
  renders the centralised route configuration from routes.jsx.
  Provider order: BrowserRouter > AuthProvider > TripProvider > AppRoutes.
*/
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider }  from './context/AuthContext';
import { TripProvider }  from './context/TripContext';
import AppRoutes         from './routes';

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <TripProvider>
        <AppRoutes />
      </TripProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
