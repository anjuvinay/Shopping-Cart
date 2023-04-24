var db=require('../config/connection')
var collection=require('../config/collections')
const { response } = require('../app')
var ObjectId = require('mongodb').ObjectId

module.exports={
    addProduct:(product,callback)=>{
        console.log(product)
        
        db.get().collection('product').insertOne(product).then((data)=>{
            callback(data.insertedId)

        })
    },
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },
    deleteProduct:(prodId)=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:new ObjectId(prodId)}).then((response)=>{
                console.log(response)
                resolve(response)
            })
        })
    },
    getProductDetails:(proId)=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:new ObjectId(proId)}).then((product)=>{
                resolve(product)
            })
        })
    },
    updateProduct:(proId, proDetails)=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).
            updateOne({_id:new ObjectId(proId)},{
                $set:{
                    Name:proDetails.Name,
                    Description:proDetails.Description,
                    Price:proDetails.Price,
                    Category:proDetails.Category
                }
            }).then((response)=>{
                resolve()
            })
        })
    },

   getAllUsers:(users)=>{
        return new Promise((resolve,reject)=>{
          let users= db.get().collection(collection.USER_COLLECTION).find().toArray()
          resolve(users)
        })
      },
      getAllOrders:(orders)=>{
        return new Promise((resolve,reject)=>{
          let orders= db.get().collection(collection.ORDER_COLLECTION).find().toArray()
          resolve(orders)
        })
      }
}