import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Définition de l'interface utilisateur
interface User {
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
}

interface UserState {
  userInfo: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const savedUser = localStorage.getItem("user");
const savedToken = localStorage.getItem("token");

const initialState: UserState = {
  // On parse l'utilisateur s'il existe, sinon null
  userInfo: savedUser ? JSON.parse(savedUser) : null,
  token: savedToken || null,
  // L'utilisateur est authentifié si un token existe
  isAuthenticated: !!savedToken,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    /* Action à appeler dans Login.tsx et Signup.tsx
     * Elle met à jour l'état global Redux.
     */
    /* stock User + token si login OK
     */
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>,
    ) => {
      const { user, token } = action.payload;
      state.userInfo = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },

    /**
     * Action pour déconnecter l'utilisateur.
     * Nettoie l'état Redux (le nettoyage du localStorage se fera dans le composant).
     */
    logout: (state) => {
      state.userInfo = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },

    /**
     * Optionnel : Action pour mettre à jour uniquement la photo de profil plus tard.
     */
    updateProfilePicture: (state, action: PayloadAction<string>) => {
      if (state.userInfo) {
        state.userInfo.profilePicture = action.payload;
      }
    },
  },
});

// Export des actions pour les utiliser avec useDispatch()
export const { setCredentials, logout, updateProfilePicture } =
  userSlice.actions;

// Export du reducer pour l'intégrer dans le store (dans App.tsx)
export default userSlice.reducer;
