"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Job {
  static async create({ title, salary, equity, companyHandle }) {
    const result = await db.query(
      `INSERT INTO jobs (title, salary, equity, company_handle)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
      [title, salary, equity, companyHandle]
    );
    return result.rows[0];
  }

  static async findAll({ title, minSalary, hasEquity } = {}) {
    let query = `
      SELECT id, title, salary, equity, company_handle AS "companyHandle"
      FROM jobs`;

    let where = [];
    let values = [];

    if (title) {
      values.push(`%${title}%`);
      where.push(`title ILIKE $${values.length}`);
    }

    if (minSalary !== undefined) {
      values.push(minSalary);
      where.push(`salary >= $${values.length}`);
    }

    if (hasEquity === true) {
      where.push(`equity > 0`);
    }

    if (where.length) {
      query += " WHERE " + where.join(" AND ");
    }

    query += " ORDER BY title";

    const result = await db.query(query, values);
    return result.rows;
  }

  static async get(id) {
    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
       FROM jobs
       WHERE id = $1`,
      [id]
    );

    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  static async update(id, data) {
    delete data.id;
    delete data.companyHandle;
    delete data.company_handle;

    const { setCols, values } = sqlForPartialUpdate(data, {});
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `
      UPDATE jobs
      SET ${setCols}
      WHERE id = ${idVarIdx}
      RETURNING id, title, salary, equity, company_handle AS "companyHandle"`;

    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  static async remove(id) {
    const result = await db.query(
      `DELETE FROM jobs
       WHERE id = $1
       RETURNING id`,
      [id]
    );

    if (!result.rows[0]) throw new NotFoundError(`No job: ${id}`);
  }
}

module.exports = Job;