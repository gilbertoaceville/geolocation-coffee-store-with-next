import { useContext, useState } from "react";
import { ACTION_TYPES, StoreContext } from "../context/store-context";

const useTrackLocation = () => {
  const [logErrorMsg, setLogErrorMsg] = useState("");
  const [isFindingLoc, setIsFindingLoc] = useState(false);
  const { dispatch } = useContext(StoreContext);
  const success = (position) => {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    dispatch({
      type: ACTION_TYPES.SET_LAT_LONG,
      payload: {
        latLong: `${latitude}%2C${longitude}`,
      },
    });
    setLogErrorMsg("");
    setIsFindingLoc(false);
  };

  const error = () => {
    setLogErrorMsg("Unable to retrieve your location");
    setIsFindingLoc(false);
  };

  const handleTrackLocation = () => {
    setIsFindingLoc(true);
    if (!navigator.geolocation) {
      setLogErrorMsg("Geolocation is not supported by your browser");
      setIsFindingLoc(false);
      return;
    } else {
      navigator.geolocation.getCurrentPosition(success, error);
    }
  };
  return { logErrorMsg, handleTrackLocation, isFindingLoc };
};

export default useTrackLocation;
