// import { useContext } from "react";
// import { Navigate } from "react-router-dom";
// import { AuthContext } from "../context/Authcontext";
// import { isAuthenticated } from "../services/authService";

// export default function PrivateRoute({ children }) {
//   const { user } = useContext(AuthContext);

//   // Double check: React state OR localStorage token (handles page refresh)
//   if (!user && !isAuthenticated()) {
//     return <Navigate to="/login" replace />;
//   }

//   return children;
// }

import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../services/authService";

export default function PrivateRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
