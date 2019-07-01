const express = require('express')
const app = express();
const bodyParser = require('body-parser');

/* Handling all the parsing */
app.use(bodyParser.json());

app.post('/',(req,res)=>{
  var email = req.body.email;
  var amount = req.body.amount;
  res.send({"amount":amount, "email": email});
})

app.listen(3000,()=>{
  console.log('Server is running on Port 3000');
})
