
const _ = require('lodash');
const shopping = require('./shopping');


const DEFAULT_ANSWERS = event => [
  event.user.first_name + ", choose something from the menu below but please don't say words to me :)",
  "Help, words are not my strong point " + event.user.first_name,
  "Motivational videos are all I understand unfortunately",
  "I like you.  You say words to me that sound nice even if I don't understand them :s",
  "I hope you see how easy it is to create a bot on botpress " + event.user.first_name + ", clearly I'm in need of some nlp functionality though!"
];

module.exports = function(bp) {
  shopping.initialDB(bp);

  bp.middlewares.load();

  bp.hear(/start|hi|بازگشت/i, (event, next) => {
    bp.telegram.sendText(event.chat.id,
      shopping.config.botInfoMessage,
      shopping.config.homeOption);
    shopping.createCustomer({
      id: event.chat.id,
      items: [],
      firstname: event.user.first_name ,
      lastname:  event.user.last_name,
      fullname: event.user.first_name + ' ' + event.user.last_name
    });

  });

  bp.hear({
    type: /message|text/i,
    text: /تنظیمات/i,
  }, (event, next) => {
    shopping.customerInfo(event.chat.id).then(customer => {
      event.reply('#customerInfo', customer);
      bp.telegram.sendText(event.chat.id,
         ' اطلاعات شما در سامانه به شرح زیر است در صورتی که هر یک از این اطلاعات درست نیست لطفا اصلاح نمایید',
        shopping.config.customerOptions);
    });

  });

  bp.hear({
    type: /message|text/i,
    text: /سبد خرید/i,
  }, (event, next) => {
    shopping.order(event.chat.id,orderMessage=>{
      bp.telegram.sendText(event.chat.id, orderMessage,shopping.config.orderOption);
    });
  });

  bp.hear({
    type: /message|text/i,
    text: /پاک کردن سفارش/i,
  }, (event, next) => {
    shopping.removeOrder(event.chat.id,()=>{
    });
  });

  bp.hear({
    type: /message|text/i,
    text: /تایید سفارش/i,
  }, (event, next) => {
    shopping.saveOrder(event.chat.id,(paymentURL)=>{
      bp.telegram.sendText(event.chat.id, "سفارش شما در سامانه ثبت گردید برای اتمام فرایند سفارش پرداخت را انجام دهید ", {
        reply_markup: {
          inline_keyboard: [
            [{
              text: 'پرداخت الکترونیکی',
              url: paymentURL
            }]
          ]
        }
      });
    });
  });


  bp.hear({
    type: /contact/i,
    text: /./i,
  }, (event, next) => {
    let newCustomerInfo = Object.assign({}, { id: event.chat.id }, { phoneNumber: event.raw.contact.phone_number });
    shopping.updateCustomerInfo(newCustomerInfo, customer => {
      event.reply('#customerInfo', customer);
      event.reply('#message', {
        message: 'با موفقیت ذخیره شد',
      });
    });
  });

  bp.hear({
    type: /location/i,
    text: /./i,
  }, (event, next) => {
    let newCustomerInfo = Object.assign({}, { id: event.chat.id }, { location: event.raw.location.latitude + ',' + event.raw.location.longitude });
    shopping.updateCustomerInfo(newCustomerInfo, customer => {
      event.reply('#customerInfo', customer);
      event.reply('#message', {
        message: 'با موفقیت ذخیره شد',
      });
    });
  });
  
  bp.hear({
    type: /message|text/i,
    text: /تغییر نام و نام خانوادگی|تغییر شماره موبایل|تغییر آدرس|تغییر کد پستی|تغییر شماره کارت بانکی/i
  }, (event, next) => {
    var prop = _.find(shopping.config.customerProp, { value: event.text });
    const txt = txt => bp.telegram.createText(event.chat.id, txt);

    bp.convo.start(event, convo => {
      convo.threads['default'].addQuestion(txt(' لطفا اطلاعات '+event.text.replace('تغییر','')+' خود را وارد کنید '), [{ 
          pattern: /./i,
          callback: (response) => {
            let newCustomerInfo=Object.assign({}, {id:event.chat.id}, { [prop.key]: response.text });
            shopping.updateCustomerInfo(newCustomerInfo,customer=>{
              event.reply('#customerInfo', customer);
              event.reply('#message', {
                message: 'با موفقیت ذخیره شد',
              });
            });
            convo.stop();
          }
        },
      ]);
    });

  });

  bp.hear({
    type: /message|text/i,
    text: /محصولات/i,
  }, (event, next) => {

    shopping.products().then(products=>{
      bp.telegram.sendText(event.chat.id,'لیست محصولات',shopping.config.productDetailOption);
      _.forEach(products, (prod) => { 
        bp.telegram.sendAttachment(event.chat.id,
          shopping.config.imageUrl + prod.imageCode,
          shopping.productOption(prod)
        );
      });
    });

  });

  bp.hear({
    type: /message|callback_query/i,
    text: /prod/i,
  }, (event, next) => {
    const txt = txt => bp.telegram.createText(event.chat.id, txt);
    //'prod@@'+prod.id+'@@'+prod.name+'@@'+prod.price
    var prodArray=event.text.split('@@');
    var prod = {
      id: parseInt(prodArray[1]),
      name: prodArray[2],
      price: parseInt(prodArray[3])
    };
    bp.convo.start(event, convo => {
      convo.threads['default'].addQuestion(txt('تعداد '+prod.name+' را وارد نمایید'), [{
          pattern: /./i,
          callback: (response) => {
            shopping.addLineItem(event.chat.id, {
              product: { id: prod.id, name: prod.name },
              price: prod.price,
              quantity: parseInt(response.text)
            },()=>{
              shopping.order(event.chat.id,orderMessage=>{
                event.reply('#message', {
                  message:  orderMessage,
                });
                convo.stop();
              });
            });
          }
        },
      ]);
    });

  });

  bp.botDefaultResponse = event => {
    const text = _.sample(DEFAULT_ANSWERS(event));
    return bp.telegram.sendText(event.chat.id, text);
  };
};
