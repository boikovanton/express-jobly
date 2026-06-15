const { sqlForPartialUpdate } = require("./sql");
const { BadRequestError } = require("../expressError");

describe("sqlForPartialUpdate", function () {
  test("works with one item", function () {
    const result = sqlForPartialUpdate(
      { name: "Apple" },
      {}
    );

    expect(result).toEqual({
      setCols: `"name"=$1`,
      values: ["Apple"]
    });
  });

  test("works with multiple items", function () {
    const result = sqlForPartialUpdate(
      { name: "Apple", numEmployees: 100 },
      { numEmployees: "num_employees" }
    );

    expect(result).toEqual({
      setCols: `"name"=$1, "num_employees"=$2`,
      values: ["Apple", 100]
    });
  });

  test("works without jsToSql mapping", function () {
    const result = sqlForPartialUpdate(
      { title: "Engineer", salary: 100000 },
      {}
    );

    expect(result).toEqual({
      setCols: `"title"=$1, "salary"=$2`,
      values: ["Engineer", 100000]
    });
  });

  test("throws BadRequestError with no data", function () {
    expect(() => sqlForPartialUpdate({}, {})).toThrow(BadRequestError);
  });
});