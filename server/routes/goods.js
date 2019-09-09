let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let Goods = require('../models/goods');

const bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({
  extended: false
}))
// let User = require('../models/user');

// 连接MongoDB数据库
mongoose.connect('mongodb://127.0.0.1:27017/db_demo', { useNewUrlParser: true });

mongoose.connection.on('connected', () => {
    console.log('MongoDB connected success.')
});

mongoose.connection.on('error', () => {
    console.log('MongoDB connected failed.')
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB connected disconnected.')
});

// 查询商品列表数据
router.get('/list', (req, res, next) => {
    let page = parseInt(req.query.page); 
    let pageSize = parseInt(req.query.pageSize);
    let priceLevel = req.query.priceLevel;
    let skip = (page - 1) * pageSize;
    let sort = req.query.sort;
    let params = {};
    var priceGt = '', priceLte = '';
    // console.log('hello' + ' ' + skip);
    // let page = parseInt(req.params('page')); 
    // let pageSize = parseInt(req.params('pageSize'));
    // let priceLever = req.params('priceLever');
    // let skip = (page - 1) * pageSize;
    // let sort = req.params('sort');
    // let params = {};
    // var priceGt = '', priceLte = '';
    // console.log('priceLever = ' + priceLevel);
    if(priceLevel != 'all')
    {
        switch(priceLevel)
        {
            case '0': priceGt = 0; priceLte = 100; break;
            case '1': priceGt = 100; priceLte = 500; break;
            case '2': priceGt = 500; priceLte = 1000; break;
            case '3': priceGt = 1000; priceLte = 5000; break;
        }
        params = {
            salePrice: {
                $gt: priceGt,
                $lte: priceLte
            }
        }
    }

   
 
    let goodsModel = Goods.find(params).skip(skip).limit(pageSize);
    goodsModel.sort({ 'salePrice': sort });

    goodsModel.exec((err, doc) => {
        // Goods.find({}, (err, doc) => {
        if(err)
        {
            res.json({
                status: '1',
                msg: err.message
            })
        }
        else{
            res.json({
                status: '0',
                msg: '',
                result: {
                    count: doc.length,
                    list: doc
                }
            })
        }
    })
});

// 加入购物车
router.post("/addCart", function (req,res,next) {
    var userId = '100000077';
    // var productId = req.body.productId;
    let productId = req.body.productId;
    console.log('req.body.productId: ' + req.body.productId);
    var User = require('../models/user');
    // let productId = '201710007';
    console.log('访问成功');
    User.findOne({userId:userId}, function (err,userDoc) {
      if(err){
          res.json({
              status:"1",
              msg:err.message
          })
      }else{
          // console.log("userDoc:"+userDoc);
          if(userDoc){
            // console.log('userDoc.cartList: ' + userDoc.cartList)
            var goodsItem = '';
            userDoc.cartList.forEach(function (item) {
              // console.log('item.productId: ' + item.productId)
              // console.log('productId: ' + productId);
              // console.log('item.productId类型：' + typeof(item.productId))
              // console.log('productId类型：' + typeof(productId))
              // if(`item.productId == ${productId}`)
              // {
              //   console.log('相等')
              // }
              // console.log('id: ' + item.productId == parseInt(productId) ? 1:-1)
                if(item.productId == productId){
                  console.log('购物车已有该商品');
                  goodsItem = item;
                  item.productNum ++;
                }
            });
            console.log('goodsItem: ' + goodsItem)


            if(goodsItem){
              // console.log(22)
              userDoc.save(function (err2,doc2) {
                if(err2){
                  res.json({
                    status:"1",
                    msg:err2.message
                  })
                }else{
                  res.json({
                    status:'0',
                    msg:'',
                    result:'suc'
                  })
                }
              })
            }
            else{
              // console.log(44);
              // console.log('productId = ' + productId);
              Goods.find({ $where: `this.productId == ${productId}` }, (err1, doc) => {  // ？
                // console.log('Goods.find(): ' + err1);
                // console.log('doc1: ' + doc);
              
                if(err1){
                  // console.log(55)
                  res.json({
                    status:"1",
                    msg:err1.message
                  })
                }else{
                  if(doc){
                    newobj = {//新创建一个对象，实现转换mongoose不能直接增加属性的坑
                      productNum: 1,
                      checked: "1",
                      productId: doc[0].productId,
                      producName: doc[0].producName,
                      salePrice: doc[0].salePrice,
                      productName: doc[0].productName,
                      productImage: doc[0].productImage,
                    }
                    // console.log(66)
                    // doc.productNum = 1;
                    // doc.checked = 1;
                    // doc._id = mongoose.Types.ObjectId(doc._id);
                    // console.log('修改后的doc： ' + doc);
                    userDoc.cartList.push(newobj);

                    console.log('userDoc.cartList.push(doc)后：' + userDoc.cartList)

                    userDoc.save(function (err2,doc2) {
                      if(err2){
                        // console.log('err2：' + err2.message)
                        res.json({
                          status:"1",
                          msg:err2.message
                        })
                      }else{
                        // console.log(88)
                        res.json({
                          status:'0',
                          msg:'',
                          result:'suc'
                        })
                      }
                    })
                  }
                  else{
                    res.json({
                      statua: '5',
                      msg: '没有查询到相关信息'
                    })
                  }
                }
              });
            }
          }
      }
    })
  });
module.exports = router;