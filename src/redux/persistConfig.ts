import storage from 'redux-persist/lib/storage'; 

const persistConfig: any = {
  key: 'root',
  storage,
  whitelist: ['user',"userDetail"],
};

export default persistConfig;
