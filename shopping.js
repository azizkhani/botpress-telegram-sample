//import {DB} from './db';
const DB = require('./db');

const _ = require('lodash');
const axios = require('axios');



let db = null;

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
      .catch(err => 'not available');
    return response.data;
  },
  createCustomer:(customer)=>{
    db.kvs.get(customer.id)
    .then(cu => {
      if(!cu){
        db.kvs.set(customer.id,customer);
      }
    });

    // if (db.hasCustomer(chatId)) {
    //   db.addCustommer({id:chatId});
    // } 
  },
  updateCustomerInfo: (customer,callback)=>{

    return db.kvs.get(customer.id).then(c=>{
      var updatedCustomer=Object.assign({}, c, customer);
      db.kvs.set(customer.id,updatedCustomer);
      callback(updatedCustomer);
    });

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
            text: 'خرید'+prod.id,
            callback_data: 'prod_'+prod.id
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
  addLineItem:(customerId,lineitem)=>{
    return db.kvs.get(customerId).then(c=>{
      var index = _.findIndex(c.items | [], { product:{id : lineitem.product.id }});
      if(index>=0){
        c.items.splice(index, 1, lineitem);
      }else if(c.items){
        c.items.push(lineitem);
      }else{
        c.items=[lineitem];
      }
      db.kvs.set(customerId,c);
    });
  },
  order:(customerId,callback)=>{
     db.kvs.get(customerId).then(c=>{
      var order=''
      _.forEach(c.items,item=>{
        order=order+item.product.name+' :تعداد'+item.quantity+' :قیمت'+item.price;
      });
      callback(order);
    });
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
          { key: 'cardNumber', value: 'تغییر شماره کارت بانکی' },
          { key: 'location', value: 'تغییر شماره کارت بانکی' }
    ],
    customerOptions: {
      reply_markup: {
        keyboard: [
          ['تغییر نام و نام خانوادگی'],
          [{ text: "تغییر شماره موبایل", request_contact: true }],
          ['تغییر آدرس'],
          ['تغییر کد پستی'],
          [{ text: "تغییر محل سکونت", request_location: true }],
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
