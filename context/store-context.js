import { createContext, useReducer } from "react";

//context
export const StoreContext = createContext();

export const ACTION_TYPES = {
  SET_LAT_LONG: "SET_LAT_LONG",
  SET_COFFEE_STORES: "SET_COFFEE_STORES",
};

//reducer
const storeReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_LAT_LONG:
      return {
        ...state,
        latLong: action.payload.latLong,
      };
    case ACTION_TYPES.SET_COFFEE_STORES:
      return {
        ...state,
        coffeeStores: action.payload.coffeeStores,
      };
    default:
      throw new Error(`Unhandled Action Type: ${action.type}`);
  }
};

const StoreProvider = ({ children }) => {
  //init state
  const initialState = {
    latLong: "",
    coffeeStores: [],
  };
  //useReducer hook
  const [state, dispatch] = useReducer(storeReducer, initialState);
  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
};

export default StoreProvider;