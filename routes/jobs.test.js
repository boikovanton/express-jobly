"use strict";

const request = require("supertest");

const app = require("../app");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("GET /jobs", function () {
  test("works for anon", async function () {
    const resp = await request(app).get("/jobs");

    expect(resp.statusCode).toEqual(200);
    expect(resp.body.jobs.length).toEqual(3);
  });

  test("works: filtering by title", async function () {
    const resp = await request(app).get("/jobs?title=Job1");

    expect(resp.statusCode).toEqual(200);
    expect(resp.body.jobs.length).toEqual(1);
    expect(resp.body.jobs[0].title).toEqual("Job1");
  });

  test("works: filtering by minSalary", async function () {
    const resp = await request(app).get("/jobs?minSalary=200000");

    expect(resp.statusCode).toEqual(200);
    expect(resp.body.jobs.length).toEqual(2);
  });

  test("works: filtering by hasEquity true", async function () {
    const resp = await request(app).get("/jobs?hasEquity=true");

    expect(resp.statusCode).toEqual(200);
    expect(resp.body.jobs.length).toEqual(1);
    expect(resp.body.jobs[0].equity).toEqual("0.05");
  });

  test("works: hasEquity false returns all jobs", async function () {
    const resp = await request(app).get("/jobs?hasEquity=false");

    expect(resp.statusCode).toEqual(200);
    expect(resp.body.jobs.length).toEqual(3);
  });

  test("bad request with invalid filter", async function () {
    const resp = await request(app).get("/jobs?minSalary=abc");

    expect(resp.statusCode).toEqual(400);
  });
});

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get("/jobs/1");

    expect(resp.body).toEqual({
      job: {
        id: 1,
        title: "Job1",
        salary: 100000,
        equity: "0",
        companyHandle: "c1",
      },
    });
  });

  test("not found for no such job", async function () {
    const resp = await request(app).get("/jobs/999");
    expect(resp.statusCode).toEqual(404);
  });
});

describe("POST /jobs", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "New Job",
        salary: 500000,
        equity: 0.1,
        companyHandle: "c1",
      })
      .set("authorization", `Bearer ${adminToken}`);

    expect(resp.statusCode).toEqual(201);
    expect(resp.body.job.title).toEqual("New Job");
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "New Job",
        salary: 500000,
        equity: 0.1,
        companyHandle: "c1",
      });

    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for non-admin", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "New Job",
        salary: 500000,
        equity: 0.1,
        companyHandle: "c1",
      })
      .set("authorization", `Bearer ${u1Token}`);

    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "New Job",
      })
      .set("authorization", `Bearer ${adminToken}`);

    expect(resp.statusCode).toEqual(400);
  });
});

describe("PATCH /jobs/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .patch("/jobs/1")
      .send({
        title: "Updated Job",
      })
      .set("authorization", `Bearer ${adminToken}`);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body.job.title).toEqual("Updated Job");
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .patch("/jobs/1")
      .send({
        title: "Updated Job",
      });

    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for non-admin", async function () {
    const resp = await request(app)
      .patch("/jobs/1")
      .send({
        title: "Updated Job",
      })
      .set("authorization", `Bearer ${u1Token}`);

    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
      .patch("/jobs/999")
      .send({
        title: "Updated Job",
      })
      .set("authorization", `Bearer ${adminToken}`);

    expect(resp.statusCode).toEqual(404);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .patch("/jobs/1")
      .send({
        salary: "not-a-number",
      })
      .set("authorization", `Bearer ${adminToken}`);

    expect(resp.statusCode).toEqual(400);
  });
});

describe("DELETE /jobs/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .delete("/jobs/1")
      .set("authorization", `Bearer ${adminToken}`);

    expect(resp.body).toEqual({ deleted: 1 });
  });

  test("unauth for anon", async function () {
    const resp = await request(app).delete("/jobs/1");
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for non-admin", async function () {
    const resp = await request(app)
      .delete("/jobs/1")
      .set("authorization", `Bearer ${u1Token}`);

    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
      .delete("/jobs/999")
      .set("authorization", `Bearer ${adminToken}`);

    expect(resp.statusCode).toEqual(404);
  });
});