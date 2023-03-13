import { useDispatch, useSelector } from "react-redux";

import { getUrlListSlice } from "@/features/getUrlList/getUrlListSlice";
import { first2Up } from "@/tools";
const actions: Record<string, any> = {
  getUrlList: getUrlListSlice.actions,
};
export function useReduxValue(nameSpace: string, valueName: string) {
  const dispatch = useDispatch();
  const store = useSelector((state: any) => state[nameSpace]);
  const value = store[valueName];
  const setValue = (val: boolean) =>
    dispatch(actions[nameSpace][`dispatch${first2Up(valueName)}`](val));
  return [value, setValue];
}
