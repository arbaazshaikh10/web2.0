var db = require('../db.js');

save_user_information = (data) => new Promise((resolve,reject) => {

  db.query('INSERT INTO lottery_information SET ?', data,function(err,results,fields){
    if(err){
      reject('Could not insert into lottery information');
    }
    resolve('Succesful');
  });
})

get_total_amount = (data) => new Promise((resolve,reject) => {

  db.query('Select sum(amount) as total_amount from lottery_information', null,function(err,results,fields){
    if(err){
      reject('Could not get total amount');
    }
    resolve(results);
  });
})

module.exports = {
  save_user_information
}
