//import {DB} from './db';
const DB = require('./db');
const _ = require('lodash');
const axios = require('axios');

let db = null;

module.exports = {
  products: async () => {
    const response = await axios
      .get(module.exports.config.api + '/shopify/product/public/pagingList', {
        params: {
          page: 0,
          size: 5,
          sort: 'e.id',
          searchFilter: '$$,$$e.shop.id$$' + module.exports.config.shopId + '$$1$$,$$'
        }
      })
      .catch(err => 'not available');
    return response.data;
  },
  saveOrder:  (customerId,callback) => {
    module.exports.customerInfo(customerId).then(customer => {
      if (customer.items.length > 0) {
        customer.lastname = customer.fullname;
        customer.username = customerId;
        //customer.id=-1;
        var order = {
          customer: customer,
          shop: { id: module.exports.config.shopId },
          items: customer.items
        };
        axios.post(module.exports.config.api + '/shopify/order/public', order)
          .catch(err => 'not available').then(result => {
            if (result) {
              //module.exports.saveOrderTest(result.data);
              callback('https://pay.ir/payment/gateway/' + result.data);
              // module.exports.removeOrder(customerId, ()=>{
              //   callback('https://pay.ir/payment/gateway/' + result.data);
              // });
            }
          });
      }
    });
  },
  saveOrderTest:  (tId) => {
      axios.post(module.exports.config.api + '/shopify/order/public/pay.ir/payment/verify', {
        params: {
          status: 0,
          transId: tId,
          factorNumber: '9f95be97-3fbe-4495-8d80-4d0f4f4c3095'
        }
      }).catch(err => 'not available').then(result => {
    });
  },
  createCustomer:(customer)=>{
    db.kvs.get(customer.id)
      .then(cu => {
        if (!cu) {
          db.kvs.set(customer.id, customer);
        }
      });
  },
  updateCustomerInfo: (customer,callback)=>{
    return db.kvs.get(customer.id).then(c => {
      var updatedCustomer = Object.assign({}, c, customer);
      db.kvs.set(customer.id, updatedCustomer);
      callback(updatedCustomer);
    });
  },
  initialDB:(bp)=>{
    db=bp.db;
  },
  productOption: (prod) => {
    return {
      reply_markup: {
        inline_keyboard: [
          [{
            text: 'سفارش محصول',
            callback_data: 'prod@@' + prod.id + '@@' + prod.name + '@@' + prod.price
          }]
        ]
      },
      caption: prod.name + " قیمت" + prod.price,
    };
  },
  customerInfo: (id) =>{
    return db.kvs.get(id);
  },
  addLineItem:(customerId,lineitem,callback)=>{
    return db.kvs.get(customerId).then(c => {
      //var index = _.findIndex(c.items | [], { product: { id: lineitem.product.id } });
      var index = -1
      _.forEach(c.items, (item, i) => {
        if (item.product.id == lineitem.product.id)
          index = i;
      });
      if (index >= 0) {
        c.items.splice(index, 1, lineitem);
      } else if (c.items) {
        c.items.push(lineitem);
      } else {
        c.items = [lineitem];
      }
      db.kvs.set(customerId, c).then(callback());
    });
  },
  order:(customerId,callback)=>{
    db.kvs.get(customerId).then(c => {
      var order = '';
      var price = 0;
      _.forEach(c.items, item => {
        price = price + (item.price * item.quantity);
        order = order +  item.product.name + '  تعداد:' + item.quantity + '  قیمت:' + item.price + `\r\n
        
        `;
      });
      order = order + 'جمع کل ' + price;
      if (price === 0) {
        order = 'هیج کالایی برای خرید انتخاب نشده است';
      }
      callback(order);
    });
  },
  removeOrder:(customerId,callback)=>{
    return db.kvs.get(customerId).then(c => {
      c.items = [];
      db.kvs.set(customerId, c).then(callback() );
    });
  },
  config: {
    shopId: '1',
    api: 'http://botchain.ir/app',
    //api: 'http://localhost:8082/app',
    imageUrl: 'https://res.cloudinary.com/dgzibu5s6/image/upload/',
    botInfoMessage: ' این بات برای خرید محصولات تولید شده .ممنون که از بات ما استفاده میکنید',
    customerProp: [
      { key: 'fullname', value: 'تغییر نام و نام خانوادگی' },
      { key: 'phoneNumber', value: 'تغییر شماره موبایل' },
      { key: 'address', value: 'تغییر آدرس' },
      { key: 'postalCode', value: 'تغییر کد پستی' },
      { key: 'location', value: 'تغییر محل سکونت' }
    ],
    customerOptions: {
      reply_markup: {
        keyboard: [
          ['تغییر نام و نام خانوادگی',{ text: "تغییر شماره موبایل", request_contact: true }],
          ['تغییر آدرس','تغییر کد پستی'],
          ['🔙بازگشت',{ text: "تغییر محل تحویل", request_location: true }],
        ],
        resize_keyboard: true
      }
    },
    homeOption: {
      reply_markup: {
        keyboard: [
          [' 🍱  محصولات', '🛠 تنظیمات'],
          ['🛒 سبد خرید', '🚛 پیگیری سفارش'],
        ],
        resize_keyboard:true
      }
    },
    productDetailOption: {
      reply_markup: {
        keyboard: [
          ['⬇️محصولات بیشتر '],
          ['🔙بازگشت'],
        ],
        resize_keyboard:true
      }
    },
    orderOption: {
      reply_markup: {
        keyboard: [
          ['✅تایید سفارش'],
          ['❌پاک کردن سفارش'],
          ['🔙بازگشت'],
        ],
        resize_keyboard:true
      }
    }
  }
};
