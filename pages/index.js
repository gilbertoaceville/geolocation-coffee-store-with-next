import Head from "next/head";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import Banner from "../components/banner";
import Card from "../components/card";
import { ACTION_TYPES, StoreContext } from "../context/store-context";
import useTrackLocation from "../hooks/use-track-location";
import { fetchCoffeeStores } from "../lib/coffee-stores";
import styles from "../styles/Home.module.css";

export async function getStaticProps(context) {
  const coffeeStores = await fetchCoffeeStores();
  return {
    props: {
      coffeeStores,
    },
  };
}

export default function Home(props) {
  const [coffeeStoresError, setCoffeesStoreError] = useState("");

  //Although the coffeeStores is provided by default from getStaticProps,
  //on user geolocation interaction, we want to get new stores close to the user
  //now coffeeStores replaces props.coffeeStores from getStaticProps...
  //state from context (created lat and long using useReducer) - dispatch was made in use-track-loc custom hook.
  const {
    state: { latLong, coffeeStores },
    dispatch,
  } = useContext(StoreContext);

  const { handleTrackLocation, logErrorMsg, isFindingLoc } = useTrackLocation();

  //click to obtain user's location - latLong
  const handleOnBannerBtnClick = () => {
    handleTrackLocation();
  };

  useEffect(() => {
    //fetch stores based on latitude and longitude if button "view stores is clicked"
    //data was fetched directly from the serverless function
    async function fetchData() {
      if (latLong) {
        try {
          const response = await fetch(
            `/api/getCoffeeStoresByLocation?ll=${latLong}&&limit=10`
          );

          const storesNearMe = await response.json();
          dispatch({
            type: ACTION_TYPES.SET_COFFEE_STORES,
            payload: {
              coffeeStores: storesNearMe,
            },
          });
          setCoffeesStoreError("");
        } catch (error) {
          if (error) setCoffeesStoreError(error.message);
        }
      }
    }
    fetchData();
  }, [latLong, dispatch]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Coffee Connoisseur</title>
        <meta name="description" content="Geolocation discovery of coffee stores" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Banner
          buttonText={isFindingLoc ? "Locating..." : "View stores nearby"}
          handleOnClick={handleOnBannerBtnClick}
        />
        <div className={styles.heroImage}>
          <Image
            src="/static/hero-image.png"
            width="700"
            height="400"
            alt="hero image"
          />
        </div>
        {logErrorMsg && <p>Something went wrong: {logErrorMsg}</p>}
        {coffeeStoresError && <p>Something went wrong: {coffeeStoresError}</p>}
        {coffeeStores.length > 0 && (
          <div className={styles.sectionWrapper}>
            <h2 className={styles.heading2}>Coffee Shops Near Me</h2>
            <div className={styles.cardLayout}>
              {coffeeStores?.map((coffeeStore) => (
                <Card
                  key={coffeeStore.fsq_id}
                  name={coffeeStore.name}
                  imgUrl={
                    coffeeStore.imgUrl ||
                    "https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80"
                  }
                  className={styles.card}
                  href={`/coffee-store/${coffeeStore.fsq_id}`}
                />
              ))}
            </div>
          </div>
        )}
        {props.coffeeStores.length > 0 && (
          <div className={styles.sectionWrapper}>
            <h2 className={styles.heading2}>New York Coffee Shops</h2>
            <div className={styles.cardLayout}>
              {props.coffeeStores?.map((coffeeStore) => (
                <Card
                  key={coffeeStore.fsq_id}
                  name={coffeeStore.name}
                  imgUrl={
                    coffeeStore.imgUrl ||
                    "https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80"
                  }
                  className={styles.card}
                  href={`/coffee-store/${coffeeStore.fsq_id}`}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
