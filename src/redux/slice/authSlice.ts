import { createSlice, PayloadAction } from '@reduxjs/toolkit'; 

const initialState: any = {
  user: {},
  token: null,
  permissions: [],
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login(state, action: any) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.permissions = action.payload.permissions || [];
    },
    // ✅ ADD THIS
    updateUser(state, action) {
      state.user = {
        ...state.user,
        ...action.payload,
      };
    },
    logout(state) {
      state.user={}
      state.token = null;
      state.permissions = [];
    },
  },
});

export const { login,logout, updateUser  } :any= userSlice.actions;
export default userSlice.reducer;


export const useSession=()=>{
    return
}