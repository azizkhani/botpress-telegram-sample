//import { DatabaseHelpers } from 'botpress'
const DatabaseHelpers = require('botpress')

var knex = null

function initialize() {
  if (!knex) {
    throw new Error('you must initialize the database before')
  }
  
  return DatabaseHelpers(knex).createTableIfNotExists('customer', function (table) {
    table.string('id').primary()
    table.string('fullname')
    table.string('mobileNumber')
    table.string('address')
    table.string('postCode')
    table.string('cardNumber')
  }).then();
}

function addCustommer(customer) {
  return knex('customer')
  .insert({ customer})
  .then().get(0);
}

function updateCustomer(customer){
  knex('customer')
  .where('id', '=', customer.id)
  .update(customer) ;
}

function getCustommer(id) {
  return knex('customer')
  .where('id', id)
  .select('fullname')
  .then().get(0)
  .then(ret => {
    return ret && ret.fullname
  });
}

function hasCustommer(id) {
  return knex('customer')
  .where('id', id)
  .count('id as count')
  .then(ret => {
    return ret && ret[0] && ret[0].count === 1
  })
}

module.exports = (k) => {
  knex = k
  return { initialize, addCustommer, getCustommer,updateCustomer, hasCustommer }
}
