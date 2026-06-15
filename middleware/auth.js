"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals.
 *
 * Payload includes:
 * {
 *   username,
 *   isAdmin
 * }
 *
 * It's not an error if no token was provided or if the token is invalid.
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;

    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }

    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware: user must be logged in.
 *
 * If not, raises UnauthorizedError.
 */

function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();

    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware: user must be an admin.
 *
 * If not, raises UnauthorizedError.
 */

function ensureAdmin(req, res, next) {
  try {
    if (!res.locals.user || !res.locals.user.isAdmin) {
      throw new UnauthorizedError();
    }

    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware:
 *
 * Allows access if:
 * - user is admin
 * OR
 * - username in route matches logged-in user
 *
 * Otherwise raises UnauthorizedError.
 */

function ensureCorrectUserOrAdmin(req, res, next) {
  try {
    const user = res.locals.user;

    if (
      !user ||
      !(user.isAdmin || user.username === req.params.username)
    ) {
      throw new UnauthorizedError();
    }

    return next();
  } catch (err) {
    return next(err);
  }
}


module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureCorrectUserOrAdmin,
};