const Boom = require('boom')
const { createToken } = require('../lib/authentication')
const { verifyPassword, generatePasswordHash } = require('../lib/password')
const { handleDatabaseError } = require('../lib/errors')

function getAll ({ db }) {
  return db.user.findAll()
}

function getOne ({ db }, userId) {
  return db.user.findById(userId)
}

async function create ({ db }, userData) {
  try {
    const createdUser = await db.user.create(userData)
    return createdUser
  } catch (error) {
    handleDatabaseError(error)
  }
}

async function update ({ db }, id, userData) {
  try {
    const updatedUser = await db.user.update({ where: { id } }, userData)
    return updatedUser
  } catch (error) {
    handleDatabaseError(error)
  }
}

async function login ({ db }, email, password) {
  let user = await db.user.scope('safe').findOne({ where: { email } })

  if (!user) {
    throw Boom.unauthorized("Email doesn't exist")
  }

  user = user.get({ plain: true })
  const doPasswordsMatch = await verifyPassword(password, user.password)

  if (!doPasswordsMatch) {
    throw Boom.unauthorized('Password is incorrect')
  }

  delete user.password
  const token = createToken(user)

  return {
    token,
    user
  }
}

async function register ({ db }, userData) {
  const password = await generatePasswordHash(userData.password)
  userData.password = password
  const user = await create({ db }, userData)
  return user
}

module.exports = {
  getAll,
  getOne,
  create,
  update,
  login,
  register
}
