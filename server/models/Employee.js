const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define collection and schema
let Employee = new Schema({
   name: {
      type: String
   },
   address: {
      type: String
   },

   phoneNumber: {
      type: Number
   },
  state: {
    type: String
  },
  city : {
    type: String
  }
}, {
   collection: 'employees'
})

module.exports = mongoose.model('Employee', Employee)
