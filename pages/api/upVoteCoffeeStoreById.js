import {
    findRecordByFilter,
    getMinifiedRecords,
    table
} from "../../lib/airtable";

const upVoteCoffeeStoreById = async (req, res) => {
  const { fsq_id } = req.body;

  if (req.method === "PUT") {
    try {
      if (fsq_id) {
        const records = await findRecordByFilter(fsq_id);

        //so as not to get an empty array if record does not exist, use .length
        //also if empty array is not returned, else condition passes
        if (records.length !== 0) {
          const record = records[0];
          const calculateVoting = parseInt(record.voting) + 1;

          const updateRecord = await table.update([
            {
              id: record.id,
              fields: {
                fsq_id: record.fsq_id,
                voting: calculateVoting,
              },
            },
          ]);

          if (updateRecord) {
            const record = getMinifiedRecords(updateRecord);
            res.status(201).json(record);
          }
        } else {
          res
            .status(400)
            .json({ message: `Coffee store fsq_id does not exist: ${fsq_id}` });
        }
      } else {
        res.status(400).json({ message: "fsq_id is missing" });
      }
    } catch (err) {
      console.error("Error occurred on put req: ", err);
      res.status(500).json({ message: `Error upvoting coffee store: ${err}` });
    }
  }
};

export default upVoteCoffeeStoreById;
