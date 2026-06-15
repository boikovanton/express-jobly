"use strict";

const db = require("../db");
const Job = require("./job");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("get", function () {
  test("works", async function () {
    const job = await Job.get(1);

    expect(job).toEqual({
      id: 1,
      title: "Job1",
      salary: 100000,
      equity: "0",
      companyHandle: "c1",
    });
  });
});

describe("findAll", function () {
  test("works", async function () {
    const jobs = await Job.findAll();

    expect(jobs.length).toBe(3);
  });
});

describe("create", function () {
  test("works", async function () {
    const job = await Job.create({
      title: "New Job",
      salary: 500000,
      equity: "0.1",
      companyHandle: "c1",
    });

    expect(job.title).toEqual("New Job");
  });
});

describe("update", function () {
  test("works", async function () {
    const job = await Job.update(1, {
      title: "Updated Job",
    });

    expect(job.title).toEqual("Updated Job");
  });
});

describe("remove", function () {
  test("works", async function () {
    await Job.remove(1);

    const result = await db.query(
      "SELECT id FROM jobs WHERE id = 1"
    );

    expect(result.rows.length).toEqual(0);
  });
});