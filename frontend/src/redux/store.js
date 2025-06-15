import {createSlice, configureStore} from '@reduxjs/toolkit';

const authSlice = createSlice({
    name: "auth",
    initialState:{
        isLogin: false,

    },
    reducers:{
        login(state){
            state.isLogin = true;
        },
        logout(state){
            state.isLogin = false
        },
        // we will use useSelector() hook to fetch isLogin current status.
        //const isLoggedIn = useSelector((state) => state.isLogin);  note: Modifying isLoggedIn will NOT update the Redux store. To update the isLogin actually, we will use login and logout.
    }
})

//export const { increment, decrement, incrementByAmount } = authSlice.actions;
export const authActions = authSlice.actions  // authAcations store all the functions

export const store = configureStore({
    reducer: authSlice.reducer,
})