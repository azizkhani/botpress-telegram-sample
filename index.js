
const _ = require('lodash')
const shopping = require('./shopping')


const DEFAULT_ANSWERS = event => [
  event.user.first_name + ", choose something from the menu below but please don't say words to me :)",
  "Help, words are not my strong point " + event.user.first_name,
  "Motivational videos are all I understand unfortunately",
  "I like you.  You say words to me that sound nice even if I don't understand them :s",
  "I hope you see how easy it is to create a bot on botpress " + event.user.first_name + ", clearly I'm in need of some nlp functionality though!"
]
module.exports = function(bp) {
  shopping.initialDB(bp);

  bp.middlewares.load();

  bp.hear(/start|hi|بازگشت/i, (event, next) => {
    bp.telegram.sendText(event.chat.id,
      shopping.config.botInfoMessage,
      shopping.config.homeOption);
    shopping.createCustomer(event.chat.id);
  });

  bp.hear({
    type: /message|text/i,
    text: /تنظیمات/i,
  }, (event, next) => {
    shopping.customerInfo(event.chat.id).then(customer => {
      event.reply('#customerInfo', customer);
      bp.telegram.sendText(event.chat.id,
        customer.fullname || 'اطلاعات',
        shopping.config.customerOptions);
    });

  });

  bp.hear({
    type: /message|text/i,
    text: /تغییر نام و نام خانوادگی/i,
    text: /تغییر شماره موبایل/i,
  }, (event, next) => {
    const question=event.text;
    var prop = _.find(shopping.config.customerProp, { value: question });

    const txt = txt => bp.telegram.createText(event.chat.id, txt);

    bp.convo.start(event, convo => {
      convo.threads['default'].addQuestion(txt('لطفا اطلاعات خود را وارد کنید'+event.text), [
        { 
          pattern: /(\d+)/i,
          callback: (response) => {
            let newCustomerInfo=Object.assign({}, {id:event.chat.id}, { [prop.key]: response.match });
            shopping.updateCustomerInfo(newCustomerInfo).then(customer=>{
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

    // bp.hear({
    //     type: /message|text/i,
    //     text: /.+/g,
    //   }, (event, next) => {
    //     console.log(event);
    //     let newCustomerInfo=Object.assign({}, {id:event.chat.id}, { [prop.key]: event.text });
    //     shopping.updateCustomerInfo(newCustomerInfo).then(customer=>{
    //       event.reply('#customerInfo', customer);
    //       event.reply('#message', {
    //         message: 'با موفقیت ذخیره شد',
    //       });
    //       //todo will disable hear here
    //     });
    // });

  });

  bp.hear({
    type: /message|text/i,
    text: /محصولات/i,
  }, (event, next) => {

    bp.telegram.sendText(event.chat.id,'test',{
      request_location:true
    });

    shopping.products().then(products=>{
      _.forEach(products, (prod) => { 
        bp.telegram.sendAttachment(event.chat.id,
          shopping.config.imageUrl + prod.imageCode,
          shopping.productOption(prod)
        );
      });
    });

  });




  bp.botDefaultResponse = event => {
    const text = _.sample(DEFAULT_ANSWERS(event));
    return bp.telegram.sendText(event.chat.id, text);
  }
}



  