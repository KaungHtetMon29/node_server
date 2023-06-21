const express = require('express');
const app=express();
const bodyparser=require('body-parser');
const cors=require('cors');
require('dotenv').config();
app.use(cors());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    // You can also use "*" to allow all domains, but use it cautiously.
    // res.setHeader('Access-Control-Allow-Origin', '*');
    next();
  });
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = process.env;
const knex= require('knex')({
    client:'pg',
    connection:{
    connectionString:`postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?options=project%3D${ENDPOINT_ID}`,
    ssl:true}
    
});
const PORT =process.env.PORT|| 3000;
app.use(bodyparser.json());

// {
    // connectionString:`postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?options=project%3D${ENDPOINT_ID}`,
    // ssl:true}
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
var frilist=[];
var posts=[];
app.post('/profile',(req,res)=>{
    console.log(req.body)
    knex.select('indvusers.name','posts.status','posts.id','posts.lke','posts.haha','posts.love').from('indvusers').join('posts','indvusers.name','posts.name').where('indvusers.name',req.body.name).then(data=>{
        //bf for buffer feeds
        // let bf=[];
        // let ids=[];
        // let like=[];
        // let haha=[];
        // let love=[]

        // data.map((f)=>{
        //     like.push(f.lke)
        //     haha.push(f.haha)
        //     love.push(f.love)
        //     bf.push(f.status)
        //     ids.push(f.id)
        // })
       res.json({
        data
       });
    })
    // knex.select('name,feed').from('indvusers').innerJoin('feed','indvusers.name','feed.name').where('indvusers.name',req.body.name).then(data=>{
    //     res.json(data);
    // }).catch(err=>console.log(err)); 
})
app.post('/friposts',(req,res)=>{
    knex.select('posts.name','posts.status','posts.id','posts.lke','posts.haha','posts.love').from('friends').join('indvusers','friends.semail','indvusers.email').join('posts','indvusers.name','posts.name')
    .where('friends.pemail',req.body.name).orderBy('posts.id')
    .then(data=>
        res.json(data)
    )
})
app.post('/cmt',(req,res)=>{
    knex('comments').insert({cmter:req.body.cmter,postid:req.body.id,cmt:req.body.cmt}).then(data=>res.json(data));
})
app.post('/cmtupdate',(req,res)=>{
    knex.select('cmtid','cmter','cmt').from('comments').where('postid',req.body.id).then(data=>res.json(data));
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
app.post('/reaction',(req,res)=>{
    knex('posts').where('id',req.body.id).increment(req.body.react,1).then(data=>res.json(data))
    .catch(err=>{
       res.json('error');
    })
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
app.post('/feedupload',(req,res)=>{
    if(req.body.post){
        knex('posts').insert({name:req.body.name,status:req.body.post}).then(res.json("success"));
    }else{
        res.json("Type something in your mind")
    }
    
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