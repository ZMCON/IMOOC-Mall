var mongoose = require('mongoose');
var productSchema = new mongoose.Schema({
    "productId": { type: String },
    "productName": { type: String },
    "salePrice": { type: Number },
    "productImage": { type: String },
    "checked": String,
    "productNum": String
})


module.exports = mongoose.model('Goods', productSchema);