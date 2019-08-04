const express = require('express')
const app = express();
const bodyParser = require('body-parser');
const {save_user_information} = require('./models/server_db');
const path = require('path');
const publicPath = path.join(__dirname,'./public');
const paypal = require('paypal-rest-sdk');
const session = require('express-session');
/* Handling all the parsing */
app.use(bodyParser.json());
app.use(express.static(publicPath));
app.use(session(
  { secret:'my web app',
    cookie:{maxAge:60000}
  }
));
//PayPal Configuration
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AW1A9VKeSsCxrstOaonFGsZUjJYrmN2XftEAjz5zZW8koJHAImrPqQd8CJpwAbVXIZIXjZFYnlZOWGmq',
  'client_secret': 'EEK3gukxB3FNCfRikZ5-3XDGuigUr3U_qfaaPSezu5oNBqAqHYz4fOWN3KUrSx29NuRq7knjr_Ym1cbx'
});

app.post('/post_info', async (req,res)=>{
  var email = req.body.email;
  var amount = req.body.amount;

  if(amount <= 1){
    return_info ={};
    return_info.error = true;
    return_info.message = "The amount should be greater than 1";
    return res.send(return_info);
  }
  var fee_amount = amount * 0.9;
  var result = await save_user_information ({"amount":fee_amount,"email":email});
  req.session.paypal_amount = amount;

  var create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": "http://localhost:3000/success",
        "cancel_url": "http://localhost:3000/cancel"
    },
    "transactions": [{
        "item_list": {
            "items": [{
                "name": "Lottery",
                "sku": "Funding",
                "price": amount,
                "currency": "USD",
                "quantity": 1
            }]
        },
        "amount": {
            "currency": "USD",
            "total": amount
        },
        'payee':{
          'email':'lotteryapp@lotteryapp.com'
        },
        "description": "Lottery Purchase"
    }]
};


paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
        throw error;
    } else {
        console.log("Create Payment Response");
        console.log(payment);

        for(var i = 0; i < payment.links.length; i++){
          if(payment.links[i].rel == 'approval_url'){
            return res.send(payment.links[i].href);
          }
        }
    }
});

});

app.get('/success',(req,res)=>{
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  var execute_payment_json ={
    "payer_id":payerId,
    "transactions":[{
      "amount":{
        "currency":"USD",
        "total":req.session.paypal_amount
      }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function(error,payment){
    if(error){
      console.log(error,response);
      throw error;
    }else{
      console.log(payment);
    }
  });
  res.redirect('http://localhost:3000');
});

app.get('/get_total_amount', async (req,res) => {
  var result = await get_total_amount();
  res.send(result);
});

app.listen(3000,()=>{
  console.log('Server is running on Port 3000');
})
