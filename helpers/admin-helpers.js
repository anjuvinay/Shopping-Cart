var db=require('../config/connection')
var collection=require('../config/collections')
const bcrypt=require('bcrypt')
const { ADMIN_COLLECTION } = require('../config/collections')
const { response } = require('../app')
var objectId = require('mongodb').ObjectID
const { resolve } = require('path')


module.exports={

    doSign_up:(adminData)=>{
        return new Promise(async(resolve, reject)=>{
            adminData.Password=await bcrypt.hash(adminData.Password, 10)
        db.get().collection(collection.ADMIN_COLLECTION).insertOne(adminData).then((data)=>{
            resolve(adminData)
        })
            
        }) 

    },
    doLog_in:(adminData)=>{
        return new Promise(async(resolve, reject)=>{
            let loginStatus=false
            let response={}
            let admin=await db.get().collection(collection.ADMIN_COLLECTION).findOne({Email:adminData.Email})
            if(admin){
                bcrypt.compare(adminData.Password, admin.Password).then((status)=>{
                    if(status){
                        console.log("Login Success")
                        response.admin=admin
                        response.status=true
                        resolve(response)
                    }else{
                        console.log("Login Failed")
                        resolve({status:false})
                    }
                })

            }else{
                console.log("Login failed")
                resolve({status:false})
            }
        })
    },
    
    changeShippingStatus:(orderId)=>{
        return new Promise((resolve,reject)=>{
    
        db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(orderId)},
        {
            $set:{
                status:'Shipped'
            }
    
        }).then(()=>{
            console.log(" Status changed")
            resolve()
        })
    })
    },

    changeCancelledStatus:(orderId)=>{
        return new Promise((resolve,reject)=>{
    
        db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(orderId)},
        {
            $set:{
                status:'Cancelled'
            }
    
        }).then(()=>{
            resolve()
        })
    })
    }   


}