const Airtable = require("airtable");
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID
);

const table = base("coffee-stores");

const getMinifiedRecord = (record) => {
  return { id: record.id, ...record.fields };
};

const getMinifiedRecords = (records) => {
  return records.map((record) => getMinifiedRecord(record));
};

//filter Airtable records by id...
const findRecordByFilter = async (fsq_id) => {
  const findCoffeeRecords = await table
    .select({
      filterByFormula: `fsq_id="${fsq_id}"`,
    })
    .firstPage();

  //so as not to get an empty array if record does not exist, use .length
  //also if empty array is not returned, else condition passes
  // if (findCoffeeRecords.length !== 0) {
  //   return getMinifiedRecords(findCoffeeRecords);
  // }
  return getMinifiedRecords(findCoffeeRecords);
};

export { table, getMinifiedRecords, findRecordByFilter };
