/* eslint-disable react-hooks/rules-of-hooks */
import cls from "classnames";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import useSWR from "swr";
import { StoreContext } from "../../context/store-context";
import { fetchCoffeeStores } from "../../lib/coffee-stores";
import styles from "../../styles/coffee-store.module.css";

export async function getStaticProps(staticProps) {
  const params = staticProps.params;
  const coffeeStores = await fetchCoffeeStores();
  const findCoffeeStoreById = coffeeStores.find(
    (coffeeStore) => coffeeStore.fsq_id.toString() === params.id
  );
  return {
    props: {
      coffeeStore: findCoffeeStoreById
        ? findCoffeeStoreById
        : {
            location: "",
            imgUrl: "",
            name: "",
          },
    },
  };
}

export async function getStaticPaths() {
  const coffeeStores = await fetchCoffeeStores();
  const paths = coffeeStores.map((coffeeStore) => {
    return {
      params: {
        id: coffeeStore.fsq_id.toString(),
      },
    };
  });
  return {
    paths,
    fallback: true,
  };
}

const CoffeeStore = (initialProps) => {
  const router = useRouter();

  const [coffeeStore, setCoffeeStore] = useState(initialProps.coffeeStore);

  const [votingCount, setVotingCount] = useState(0);

  const fsq_id = router.query.id;

  //context
  const {
    state: { coffeeStores },
  } = useContext(StoreContext);

  //FETCH AIRTABLE DATA MODEL - empty at first
  //POPULATE AIRTABLE DATA MODEL WITH COFFEESTORES FROM CSR AND INITIALPROPS.COFFEESTORE IN SSG
  const handleCreateCoffeeStoreWithAirtable = async (data) => {
    //data is coming from either coffeeStores.find(id) ( coffeeStores in context) for CSR - i.e dynamic data
    //OR
    //data is coming from initialProps.coffeeStore for SSG - i.e static props data
    const { fsq_id, name, voting, imgUrl, neighbourhood, address } = data;
    try {
      const response = await fetch("/api/createCoffeeStore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fsq_id,
          name,
          neighbourhood: neighbourhood || "",
          address: address || "",
          imgUrl,
          voting: 0,
        }),
      });
      const dbCoffeeStore = await response.json();
    } catch (error) {
      console.error(
        "An error occurred with handleCreateCoffeeWithAirtable: ",
        error
      );
    }
  };

  useEffect(() => {
    //if initialProps.coffeeStore coming from getStaticProps is not used (now name property in initialProps.coffeeStore is empty as other properties too)
    //i.e to say data is gotten from useContext and not getStaticProps
    //using "CLIENT-SIDE-RENDERING", we get id from comparing query-params to id of array coming from useContext and populate data
    //since it'll not be available in getStaticPaths
    if (!initialProps.coffeeStore.name) {
      if (coffeeStores.length > 0) {
        const coffeeStoreFromContext = coffeeStores.find(
          (coffeeStore) => coffeeStore.fsq_id.toString() === fsq_id
        );

        if (coffeeStoreFromContext) {
          setCoffeeStore(coffeeStoreFromContext);
          //populate Airtable with data from coffeeStores
          handleCreateCoffeeStoreWithAirtable(coffeeStoreFromContext);
        }
      }
    } else {
      //if data is finally fetched from statically site route (SSG)
      handleCreateCoffeeStoreWithAirtable(initialProps.coffeeStore);
    }
  }, [coffeeStores, fsq_id, initialProps.coffeeStore]);

  //Using SWR to cache data and updating voting count via fsq_id
  //servers real time data by polling with intcoffeeStore.erval(update data after an interval)
  //since we want to update the voting count and persist data we use SWR to fetch the id of the particular data we need
  const fetcher = (url) => fetch(url).then((r) => r.json());
  const { data, error } = useSWR(
    `/api/getCoffeeStoreById?fsq_id=${fsq_id}`,
    fetcher
  );

  //this populates data from API route via Airtable
  //Update coffeeStore which had initial data from getStaticProps (initialProps.coffeeStore) and CSR (called in the first useEffect)
  //to data gotten from SWR
  //Update votingCount with the voting property from the data (Airtable data)
  useEffect(() => {
    if (data && data.length > 0) {
      setCoffeeStore(data[0]);
      setVotingCount(data[0].voting);
    }
  }, [data]);

  //INCREASE VOTE COUNT FOR A PARTICULAR COFFEE STORE BY ID
  //the main functionality for increase happened at the backend (api folder)
  //so data is fetched and updated with the unique id of the coffeeStore to update via PUT req
  //setVoting count is called to ceremoniously update the count in the UI which is to say
  //without the API called, it won't update in the Airtable database
  const handleUpvoteButton = async () => {
    try {
      const response = await fetch("/api/upVoteCoffeeStoreById", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fsq_id,
        }),
      });
      const dbCoffeeStore = await response.json();
      if (dbCoffeeStore && dbCoffeeStore.length > 0) {
        setVotingCount((count) => count + 1);
      }
    } catch (error) {
      console.error("An error occurred with handling upvote: ", error);
    }
  };

  //if fallback in getStaticPaths === true, return a loader and load necessary page
  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>An error occurred via SWR</div>;
  }

  return (
    <div className={styles.layout}>
      <Head>
        <title>{coffeeStore.name}</title>
        <meta name="description" content={`${coffeeStore.name} coffee store`}></meta>
      </Head>
      <div className={styles.container}>
        <div className={styles.col1}>
          <div className={styles.backToHomeLink}>
            <Link href="/">
              <a>← Back to home</a>
            </Link>
          </div>
          <div className={styles.nameWrapper}>
            <h1 className={styles.name}>{coffeeStore.name}</h1>
          </div>
          <Image
            src={
              coffeeStore.imgUrl ||
              "https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80"
            }
            width="600"
            height="360"
            className={styles.storeImg}
            alt={coffeeStore.name}
          />
        </div>
        <div className={cls("glass", styles.col2)}>
          {coffeeStore.address && (
            <div className={styles.iconWrapper}>
              <Image
                src="/static/icons/places.svg"
                width="24"
                height="24"
                alt="places icon"
              />
              <p className={styles.text}>{coffeeStore.address}</p>
            </div>
          )}
          {coffeeStore.neighbourhood && (
            <div className={styles.iconWrapper}>
              <Image
                src="/static/icons/nearMe.svg"
                width="24"
                height="24"
                alt="near me icon"
              />
              <p className={styles.text}>{coffeeStore.neighbourhood}</p>
            </div>
          )}
          <div className={styles.iconWrapper}>
            <Image
              src="/static/icons/star.svg"
              width="24"
              height="24"
              alt="star icon"
            />
            <p className={styles.text}>{votingCount}</p>
          </div>

          <button className={styles.upvoteButton} onClick={handleUpvoteButton}>
            Up vote!
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoffeeStore;
