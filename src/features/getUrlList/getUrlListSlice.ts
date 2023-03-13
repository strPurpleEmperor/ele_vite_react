import { createSlice } from "@reduxjs/toolkit";
export interface GetUrlListState {
  loading: boolean;
}
export const getUrlListSlice = createSlice({
  name: "getUrlList",
  initialState: {
    loading: false,
    urlList: [],
  },
  reducers: {
    dispatchLoading: (state, action) => {
      return {
        ...state,
        loading: action.payload,
      };
    },
    dispatchUrlList: (state, action) => {
      return {
        ...state,
        urlList: action.payload,
      };
    },
  },
});
export const { dispatchLoading } = getUrlListSlice.actions;
export default getUrlListSlice.reducer;
