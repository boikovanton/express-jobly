const { BadRequestError } = require("../expressError");

/** Generate SQL for partial update.
 *
 * Given an object of data to update and an optional mapping object that
 * converts JavaScript-style field names to database column names, this
 * returns an object with:
 *
 * - setCols: SQL fragment for the SET part of an UPDATE query
 * - values: array of values to pass into the query
 *
 * Example:
 *
 * sqlForPartialUpdate(
 *   { firstName: "Aliya", age: 32 },
 *   { firstName: "first_name" }
 * )
 *
 * Returns:
 *
 * {
 *   setCols: "\"first_name\"=$1, \"age\"=$2",
 *   values: ["Aliya", 32]
 * }
 *
 * Throws BadRequestError if no data is provided.
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
