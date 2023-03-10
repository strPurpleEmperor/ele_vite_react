import { configureStore } from "@reduxjs/toolkit";

import counterSlice from "@/features/counter/counterSlice";
import getUrlListSlice from "@/features/getUrlList/getUrlListSlice";
export default configureStore({
  reducer: {
    counter: counterSlice,
    getUrlList: getUrlListSlice,
  },
});
