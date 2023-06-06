const express = require('express');
const app=express();
const bodyparser=require('body-parser');
const cors=require('cors');
require('dotenv').config();
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = process.env;
const knex= require('knex')({
    client:'pg',
    connection:
    {
        connectionString:'postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?options=project%3D${ENDPOINT_ID}',
        ssl:true}
});
const PORT =process.env.PORT|| 3000;
app.use(bodyparser.json());
app.use(cors());
// {
        
//     host:'127.0.0.1',
//     port:5432,
//     user:'postgres',
//     password:'test',
//     database:'socialmedia'
// }
// knex.select('*').from('indvusers').then(data=>{
//     console.log(data);
// });
// knex.select('indvusers.name').from('indvusers').join('users','indvusers.email','=','users.email').where({'users.email':'kaung@gmail.com','users.pw':'1234567'}).then(data=>{
//     console.log(data[0])
// })
const users=[
    {
        name:"kaung",
        pw:"123456",
        feed: "Hi there! Nice to meet you all!. First time using social media. I am Kaung Htet!. I'm 21 years old wanna be tech guy"
    },
]
var gname="";
app.get('/profile',(req,res)=>{
    if(gname===users[0].name){
        res.json({name:users[0].name,feed:users[0].feed});
    }
    knex.select('*').from('indvusers').where({name:req})
})
app.post('/signin',(req,res)=>{
    // knex.select('*').from('indvusers').innerJoin('users','indvusers.email','users.email').where('users.email',req.body.email).where('users.pw',req.body.pw).then(data=>console.log(data))
    knex.select('indvusers.name').from('indvusers').innerJoin('users','indvusers.email','users.email').where('users.email',req.body.email).where('users.pw',String(req.body.pw)).then(data=>{
        if(data[0]!=undefined){
            console.log(data[0]);res.json({status:true,name:data[0].name});
        }else{
            res.json({status:false});
        }
    }).catch(err=>{console.log(err)})
    // if(req.body.name===users[0].name && req.body.pw===users[0].pw){
    //     knex.select('*').from('indvusers').where({name:req.body.name}).then(data=>{
    //         console.log(data[0]);
    //     }).catch(err=>{console.log(err)})
    //     res.json({status:true,name:req.body.name,feed:users[0].feed});
    //     gname=users[0].name;
    // }else{
    //     res.json(false)
    // }
})

app.post('/register',(req,res)=>{
    const {email,name,pw}=req.body;
    knex.transaction((trx)=>{
        return trx('users').insert({
            'email':email,
            'pw':pw
        }).then(()=>{
            return trx('indvusers').insert({
                'name':name,
                'email':email
            })
        })
        .then(()=>{
            trx.commit;
            res.json('users and indv update success');
        }).catch(err=>{
            trx.rollback();
            console.log(err)
        })
    })
    // users.push({
    //     name:name,
    //     pw:pw
    // })
    // knex.transaction((trx)=>{
    //     trx('users').insert({
    //         email:email,
    //         pw:pw
    //     }).then(()=>{
    //         trx('indvusers').insert({
    //             email:email,
    //             name:name
    //         }).then(()=>{
    //             trx.commit();res.json('done');
    //             console.log('success');
    //         })
    //     })
    //     .catch((err)=>{
    //         trx.rollback();
    //         console.error('Error inserting data:', err);
    //     }).finally(()=>{
    //         knex.destroy();
    //     })
    // })
    // knex('users').insert({email:email,pw:pw}).then(()=>{
    //     res.json("success");
    // }).catch((err)=>{
    //     console.log(err)
    // })
   
})
app.get('/feeds',(req,res)=>{
    res.json(users[0].feed);
})
app.get('/home',(req,res)=>{
    res.json("success")
})
app.listen(PORT,()=>{
    console.log(PORT);
})


/*
signin- fail or success post
regist -fail or success post
feeds - get req
profile- get
*/