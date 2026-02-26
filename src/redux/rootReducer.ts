import { combineReducers } from '@reduxjs/toolkit';
import userReducer from '@/redux/slice/authSlice';
import userDetail from "@/redux/slice/userDetailSlice"
const rootReducer = combineReducers({
  user: userReducer,
  userDetail:userDetail
});

export default rootReducer;
