//import {DB} from './db';
const DB = require('./db')

const _ = require('lodash')
const axios = require('axios')



let db = null

module.exports = {
  products: async () => {
    const response = await axios
      .get('http://localhost:8082/app/shopify/product/public/pagingList', {
        params: {
          page: 0,
          size: 5,
          //searchFilter:'$$,$$e.shop.id$$1$$1$$,$$'
        }
      })
      .catch(err => 'not available')
    return response.data;
  },
  createCustomer:(chatId)=>{
    db.kvs.get(chatId)
    .then(customer => {
      if(!customer){
        db.kvs.set(chatId,{id:chatId});
      }
    });

    // if (db.hasCustomer(chatId)) {
    //   db.addCustommer({id:chatId});
    // } 
  },
  updateCustomerInfo: (customer)=>{
    db.kvs.set(customer.id,customer);
    return module.exports.customerInfo(customer.id);
    // if (db.hasCustomer(customer.id)) {
    //   db.addCustommer(customer);
    // } else {
    //   db.updateCustomerInfo(customer);
    // }
  },
  initialDB:(bp)=>{

    db=bp.db;
    // bp.db.get()
    // .then(k => {
    //   db = DB(k);
    //   db.initialize();
    // });
  },
  productOption: (prod) => {
    return {
      reply_markup: {
        inline_keyboard: [
          [{
            text: 'خرید',
            callback_data: 'prod_' + prod.id
          }]
        ]
      },
      caption: prod.name + " قیمت" + prod.price,
    };
  },
  customerInfo: (id) =>{
    return db.kvs.get(id);
    //return db.getCustommer(id);
  },
  config: {
    shopId: '1',
    imageUrl:'https://res.cloudinary.com/dgzibu5s6/image/upload/',
    botInfoMessage: ' این بات برای خرید محصولات تولید شده .ممنون که از بات ما استفاده میکنید',
    customerProp: [
          { key: 'fullname', value: 'تغییر نام و نام خانوادگی' },
          { key: 'mobileNumber', value: 'تغییر شماره موبایل' },
          { key: 'address', value: 'تغییر آدرس' },
          { key: 'postCode', value: 'تغییر کد پستی' },
          { key: 'cardNumber', value: 'تغییر شماره کارت بانکی' }
    ],
    customerOptions: {
      reply_markup: {
        keyboard: [
          ['تغییر نام و نام خانوادگی'],
          ['تغییر شماره موبایل'],
          ['تغییر آدرس'],
          ['تغییر کد پستی'],
          ['تغییر شماره کارت بانکی'],
          ['بازگشت'],
        ]
      }
    },
    homeOption: {
      reply_markup: {
        keyboard: [
          ['محصولات', 'تنظیمات'],
          ['سبد خرید', 'پیگیری سفارش'],
        ]
      }
    }
  }
}
