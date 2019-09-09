var express = require('express');
var router = express.Router();
var User = require('../models/user');
const bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({
  extended: false
}))

require('./../util/time')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// 登录
router.post('/login', (req, res, next) => {
  var param = {
    userName: req.body.userName,
    userPwd: req.body.userPwd
  }
  // console.log('param.userName: ' + param.userName)
  // console.log('param.userPwd: ' + param.userPwd)

  User.findOne(param, (err, doc) => {
    // console.log('err: ' + err);
    // console.log('doc: ' + doc);
    if(err)
    {
      res.json({
        status: '1',
        msg: err.message
      })
    }
    else{
      if(doc)
      {
        // console.log('doc.userName: ' + doc.userName)

        res.cookie("userId", doc.userId, {
          path: '/',
          maxAge: 1000 * 60 * 60
        })

        res.cookie("userName", doc.userName, {
          path: '/',
          maxAge: 1000 * 60 * 60
        })

        // req.session.user = doc;

        res.json({
          status: '0',
          msg: '',
          result: {
            userName: doc.userName
          }
        })
      }
      else{
        res.json({
          status: '1',
          msg: '账户或密码错误',
          result: ''
        })
      }
    }

  })
})

// 登出
router.post('/logout', (req, res, next) => {
  res.cookie('userId', '', {
    path: '/',
    maxAge: -1
  })
  res.cookie('userName', '', {
    path: '/',
    maxAge: -1
  })
  res.json({
    status: '0',
    msg: '',
    result: ''
  })
})

// 校验用户信息
router.get('/checkLogin', (req, res, next) => {
  // console.log('req.cookies.userId: ' + req.cookies.userId)
  if(req.cookies.userId)
  {
    res.json({
      status: '0',
      msg: '',
      result: req.cookies.userName || ''
    })
  }
  else
  {
    res.json({
      status: '1',
      msg: '当前未登录',
      result: ''
    })
  }
})

// 查询当前用户的购物车数据
router.get('/cartList', (req, res, next) => {
  var userId = req.cookies.userId;

  User.findOne({ userId: userId }, (err, doc) => {
    if(err)
    {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    }
    else{
      if(doc)
      {
        res.json({
          status: '0',
          msg: '',
          result: doc.cartList
        })
      }
    }
  })
})

// 购物车删除
router.post('/cartDel', (req, res, next) => {
  // console.log('进入删除购物车路由');
  var userId = req.cookies.userId;
  // console.log('userId: ' + userId);
  var productId = req.body.productId;
  // console.log('req.body.productId: ' + req.body.productId);
  
  User.update({ userId: userId }, { $pull: { 'cartList': { 'productId': productId } } }, (err, doc) => {
    if(err)
    {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    }
    else
    {
      res.json({
        status: '0',
        msg: '',
        result: '删除成功'
      })
    }
  })
})

// 购物车编辑
router.post('/cartEdit', (req, res, next) => {
  var userId = req.cookies.userId;
  var productId = req.body.productId;
  var productNum = req.body.productNum;
  var checked = req.body.checked;

  User.update({ userId: userId, "cartList.productId": productId }, 
  { 
    "cartList.$.productNum": productNum ,
    "cartList.$.checked": checked
  }, (err, doc) => {
    if(err)
    {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    }
    else
    {
      res.json({
        status: '0',
        nsg: '',
        result: '购物车编辑成功'
      })
    }
  })
})

// 购物车选中状态修改
router.post('/editCheckAll', (req, res, next) => {
  let userId = req.cookies.userId;
  let checkAll = req.body.checkAll;
  let flag = checkAll == 'false' ?'0':'1';
  // console.log('ckeckAll: ' + checkAll)
  // console.log('checkAll类型: ' + typeof(Boolean(checkAll)))
  // console.log('flag: ' + flag)

  User.findOne({ userId: userId }, (err, user) => {
    if(err)
    {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    }
    else
    {
      if(user)
      {
        user.cartList.forEach((item) => {
          item.checked = flag;
        })
        user.save((err1, doc) => {
          if(err1)
          {
            res.json({
              status: '1',
              msg: err1.message,
              result: ''
            })
          }
          else
          {
            res.json({
              status: '0',
              msg: '',
              result: '状态修改成功'
            })
          }
        })
      }
    }
  })
})

// 查询用户地址接口
router.get('/addressList', (req, res, next) => {
  let userId = req.cookies.userId;

  User.findOne({ userId: userId }, (err, doc) => {
    if(err)
    {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    }
    else
    {
      res.json({
        status: '1',
        msg: '',
        result: doc.addressList
      })
    }
  })
})

// 设置默认地址
router.post('/setDefault', (req, res, next) => {
  // console.log('进入设置默认地址接口')
  var userId = req.cookies.userId;
  var addressId = req.body.addressId;
  // console.log('addressId: ' + addressId)
  if(!addressId)
  {
    // console.log(11)
    res.json({
      status: '1003',
      msg: 'addressId is null',
      result: ''
    })
  }
  else{
    // console.log(22)
    User.findOne({ userId: userId }, (err, doc) => {
      if(err)
      {
        res.json({
          status: '1',
          msg: err.message,
          result: ''
        })
      }
      else{
        // console.log('doc: ' + doc);
        var addressList = doc.addressList;
        addressList.forEach((item) => {
          if(item.addressId == addressId)
          {
            console.log(33)
            item.isDefault = true;
          }
          else
          {
            // console.log(44)
            item.isDefault = false;
          }
        })

        doc.save((err1, doc1) => {
          if(err1)
          {
            res.json({
            status: '1',
            msg: err.message,
            result: ''
            })
          }
          else
          {
            res.json({
              status: '0',
              msg: '',
              result: ''
            })
  
          }
        })
      }
    })
  }
})

// 删除地址
router.post('/delAddress', (req, res, next) => {
  var userId = req.cookies.userId;
  var addressId = req.body.addressId;

  User.update({ userId: userId }, { $pull: { 'addressList': { addressId: addressId } } }, (err, doc) => {
    if(err)
    {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    }
    else{
      res.json({
        status: '0',
        msg: '',
        result: ''
      })
    }
  })
})

// 支付操作接口
router.post('/payMent', (req, res, next) => {
  var userId = req.cookies.userId;
  var orderTotal = req.body.orderTotal;
  var addressId = req.body.addressId;

  User.findOne({ userId: userId }, (err, doc) => {
    if(err)
    {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    }
    else{
      var address = '';
      var goodsList = [];
      // 获取当前用户的地址信息
      doc.addressList.forEach((item) => {
        if(addressId == item.addressId)
        {
          address = item;
        }
      })

      // 获取用户购物车的购买商品
      doc.cartList.filter((item) => {
        if(item.checked == '1')
        {
          goodsList.push(item);
        }
      })

      // 创建订单ID
      var platform = '622';
      var r1 = Math.floor(Math.random() * 10);
      var r2 = Math.floor(Math.random() * 10);
      var sysDate = new Date().Format('yyyyMMddhhmmss');
      var createDate = new Date().Format('yyyy-MM-dd hh:mm:ss');
      var orderId = platform + r1 + sysDate + r2;


      // 创建订单
      var order = {
        orderId: orderId,
        orderTotal: orderTotal,
        addressInfo: address,
        goodsList: goodsList,
        orderStatus: '1',
        createDate: createDate
      }

      // 把订单保存到数据库中
      doc.orderList.push(order)
      doc.save((err1, doc1) => {
        if(err1)
        {
          res.json({
            status: '1',
            msg: err1.message,
            result: ''
          })
        }
        else
        {
          res.json({
            status: '0',
            msg: '',
            result: {
              orderId: order.orderId,
              orderTotal: order.orderTotal
            }
          })
        }
      })
    }
  })
})

// 根据订单ID查询订单信息
router.get('/orderDetail', (req, res, next) => {
  var userId = req.cookies.userId;
  var orderId = req.query.orderId;
  // console.log('userId: ' + userId)
  // console.log('orderId: ' + orderId)

  User.findOne({ userId: userId }, (err, userInfo) => {
    if(err)
    {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    }
    else{
      var orderList = userInfo.orderList;
      if(orderList.length > 0)
      {
        var orderTotal = 0;
        orderList.forEach((item) => {
          if(item.orderId == orderId)
          {
            orderTotal = item.orderTotal;
          }
        })

        if(orderTotal){
          res.json({
            status: '0',
            msg: '',
            result: {
              orderId: orderId,
              orderTotal: orderTotal
            }
          })
        }
        else
        {
          res.json({
            statua: '120002',
            msg: '无此订单',
            result: ''
          })
        }
      }
      else{
        res.json({
          status: '120001',
          msg: '当前用户未创建订单',
          result: ''
        })
      }
    }
  })
})

// 查询购物车商品数量
router.get('/getCartCount', (req, res, next) => {
  if(req.cookies && req.cookies.userId)
  {
    var userId = req.cookies.userId;

    User.findOne({ userId: userId }, (err, doc) => {
      if(err)
      {
        res.json({
          status: '1',
          msg: err.message,
          result: ''
        })
      }
      else{
        var cartList = doc.cartList;
        let cartCount = 0;
        cartList.map((item) => {
          cartCount += parseInt(item.productNum);
        })
        res.json({
          status: '0',
          msg: '',
          result: cartCount
        })
      }
    })
  }
})

module.exports = router;
