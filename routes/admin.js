var express = require('express');
var router = express.Router();
const { render, response } =require('../app');
const productHelpers = require('../helpers/product-helpers');
var productHelper=require('../helpers/product-helpers')
const adminHelpers=require('../helpers/admin-helpers')

const verifyLogin = (req, res, next)=>{
  if(req.session.adminLoggedIn){
    next()
  }else{
    res.redirect('admin/log-in')
  }
}

/* GET users listing. */
router.get('/',verifyLogin, function(req, res, next) {
  // let admin=req.session.admin
  productHelpers.getAllProducts().then((products)=>{
    console.log(products)
    res.render('admin/view-products',{admin:true, products})
  })
 
});

router.get('/add-product', function(req, res) {
  res.render('admin/add-product')
})

router.post('/add-product',(req,res)=>{
  console.log(req.body)
  console.log(req.files.Image)

  productHelpers.addProduct(req.body,(insertedId)=>{
    let image=req.files.Image
    
    image.mv('../SHOPPING CART/public/product-images/'+insertedId+'.jpg',(err,done)=>{
      if(!err){
        productHelpers.getAllProducts().then((products)=>{
          console.log(products)
          res.render('admin/view-products',{admin:true, products})
        })
      }else{
        console.log(err)
      }
    })
    
  })
})

router.get('/delete-product/:id',(req,res)=>{
  let proId=req.params.id
  console.log(proId)
  productHelpers.deleteProduct(proId).then((response)=>{
    productHelpers.getAllProducts().then((products)=>{
      console.log(products)
      res.render('admin/view-products',{admin:true, products})
    })
  })
 
})

router.get('/edit-product/:id', async(req,res)=>{
  let product= await productHelpers.getProductDetails(req.params.id)
  res.render('admin/edit-product',{admin:true,product})
})

router.post('/edit-product/:id',(req,res)=>{
  let insertedId=req.params.id
  productHelpers.updateProduct(req.params.id, req.body).then(()=>{
    productHelpers.getAllProducts().then((products)=>{
      res.render('admin/view-products',{admin:true, products})
    })

    if(req.files.Image){
      let image=req.files.Image
      image.mv('../SHOPPING CART/public/product-images/'+insertedId+'.jpg')
    }
  })
  
})

router.get('/log-in', function(req, res){
  if(req.session.admin){
  res.render('admin/log-in',{admin:true})
}else{
  res.render('admin/log-in',{"loginErr":req.session.adminLoginErr,admin:true})
  req.session.adminLoginErr=false
}

})

router.get('/sign-up', function(req, res){
res.render('admin/sign-up',{admin:true})
})

router.post('/sign-up', function(req, res){
  adminHelpers.doSign_up(req.body).then((response)=>{
   console.log(response)
   req.session.admin=response
   req.session.admin.loggedIn=true
   productHelpers.getAllProducts().then((products)=>{
    res.render('admin/view-products',{admin:true, products})
  })
   
  })
 })

 router.post('/log-in',(req, res)=>{
  adminHelpers.doLog_in(req.body).then((response)=>{  
    if(response.status){ 
      req.session.admin=response.admin
      req.session.admin.loggedIn=true
      // let admin=req.session.admin
  productHelpers.getAllProducts().then((products)=>{
    console.log(products)
    res.render('admin/view-products',{admin:true, products})
  })
    }else{
      req.session.adminLoginErr="Invalid username or Password"
      res.redirect('admin/log-in')
    }
   
})
})

router.get('/log-out',(req,res)=>{
  req.session.admin=null
  req.session.adminLoggedIn=false
  res.redirect('/admin/log-in')
})


module.exports = router;
