import { createSlice } from "@reduxjs/toolkit";
export interface GetUrlListState {
  loading: boolean;
}
export const getUrlListSlice = createSlice({
  name: "getUrlList",
  initialState: {
    loading: false,
  },
  reducers: {
    dispatchLoading: (state, action) => {
      return {
        ...state,
        loading: action.payload,
      };
    },
  },
});
// 每个 case reducer 函数会生成对应的 Action creators
export const { dispatchLoading } = getUrlListSlice.actions;

export default getUrlListSlice.reducer;
