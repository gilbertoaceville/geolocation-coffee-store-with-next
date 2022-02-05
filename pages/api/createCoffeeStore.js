import {
  findRecordByFilter,
  getMinifiedRecords,
  table
} from "../../lib/airtable";

const createCoffeeStore = async (req, res) => {
  //find a record (check if a record has already been created)

  const { fsq_id, name, address, neighbourhood, voting, imgUrl } = req.body;

  if (req.method === "POST") {
    try {
      if (fsq_id) {
        const records = await findRecordByFilter(fsq_id);

        //so as not to get an empty array if record does not exist, use .length
        //also if empty array is not returned, else condition passes
        if (records.length !== 0) {
          res.status(200).json(records);
        } else {
          //create a record (if && only if it's not been created)
          if (name) {
            const createRecords = await table.create([
              {
                fields: {
                  fsq_id,
                  name,
                  address,
                  neighbourhood,
                  voting,
                  imgUrl,
                },
              },
            ]);
            const records = getMinifiedRecords(createRecords);
            res.status(201).json({ message: "created records", records });
          } else {
            res.status(400).json({ message: "name is missing" });
          }
        }
      } else {
        res.status(400).json({ message: "fsq_id is missing" });
      }
    } catch (error) {
      console.error(
        "An error occurred while creating or finding store: ",
        error
      );
      res
        .status(500)
        .json({ message: `Error finding or creating store: ${error}` });
    }
  }
};

export default createCoffeeStore;
