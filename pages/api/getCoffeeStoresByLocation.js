// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { fetchCoffeeStores } from "../../lib/coffee-stores";

//Note, the fetchCoffeeStores function can be used directly in the project (index.js)
//it was used here to test run serverless functions
const getCoffeeStoresByLocation = async (req, res) => {
  try {
    const {ll, limit } = req.query;
    const data = await fetchCoffeeStores(ll, limit);
    res.status(200).json(data);
  } catch (error) {
    if (error) {
      res.status(500).json({ message: `An error occurred: ${error}` });
    }
  }
};

export default getCoffeeStoresByLocation;

// "43.6532", "-79.3832"