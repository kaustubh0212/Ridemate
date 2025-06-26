import { createSlice, configureStore } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isLogin: false,
    user: null,
  },
  reducers: {
    login(state, action) {
      state.isLogin = true;
      state.user = action.payload; // payload should be user object

      // we will use useSelector() hook to fetch isLogin current status.
      // const isLoggedIn = useSelector((state) => state.isLogin);  note: Modifying isLoggedIn will NOT update the Redux store. To update the isLogin actually, we will use login and logout.
    },
    logout(state) {
      state.isLogin = false;
      state.user = null;
    },
  },
});

export const authActions = authSlice.actions;
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
  },
});
