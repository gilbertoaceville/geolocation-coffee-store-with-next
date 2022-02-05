import {
  findRecordByFilter
} from "../../lib/airtable";

const getCoffeeStoreById = async (req, res) => {
  const { fsq_id } = req.query;

  try {
    if (fsq_id) {
      const records = await findRecordByFilter(fsq_id);

      //so as not to get an empty array if record does not exist, use .length
      //also if empty array is not returned, else condition passes
      if (records.length !== 0) {
        res.status(200).json(records);
      } else {
        res.status(400).json({ message: `fsq_id could not be found` });
      }
    } else {
      res.status(400).json({ message: "fsq_id not found" });
    }
  } catch (error) {
    console.error("An error occurred: ", error);
    res
      .status(500)
      .json({ message: `Error getting coffee store by id: ${error}` });
  }
};

export default getCoffeeStoreById;
