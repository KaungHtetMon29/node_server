const express = require("express");
const bodyparser = require("body-parser");
const cors = require("cors");

const app = express();
const http = require("http");
const { Server } = require("socket.io");

require("dotenv").config();
app.use(cors());
const server = http.createServer(app);
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = process.env;
const knex = require("knex")({
  client: "pg",
  connection: {
    host: "127.0.0.1",
    port: 5432,
    user: "postgres",
    password: "test",
    database: "socialmedia",
  },
});
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"],
  },
});
const PORT = process.env.PORT || 3000;
const connection = knex.client.connectionSettings;
const pgClient = new (require("pg").Client)(connection);
pgClient.connect();
app.use(bodyparser.json());
var user = "";
io.on("connection", (socket) => {
  pgClient.on("notification", (notification) => {
    // console.log(notification);
    pgClient
      .query("SELECT * FROM posts ORDER BY id DESC LIMIT(1)")
      .then((data) => {
        if (data.rows[0].name !== user) {
          socket.emit("latestpost", data.rows);
        } else {
        }
        // console.log(user);
        console.log(user);
      });

    console.log("running");
  });
});
pgClient.query("LISTEN updatepost");
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
// const users = [
//   {
//     name: "kaung",
//     pw: "123456",
//     feed: "Hi there! Nice to meet you all!. First time using social media. I am Kaung Htet!. I'm 21 years old wanna be tech guy",
//   },
// ];
var frilist = [];
var posts = [];

app.post("/profile", (req, res) => {
  console.log(req.body);

  knex
    .select(
      "indvusers.name",
      "posts.status",
      "posts.id",
      "posts.lke",
      "posts.haha",
      "posts.love"
    )
    .from("indvusers")
    .join("posts", "indvusers.name", "posts.name")
    .where("indvusers.name", req.body.name)
    .then((data) => {
      if (data.length > 0) {
        console.log(data);
        res.json({
          data,
          cmt: true,
        });
      } else {
        res.json({
          data: [
            {
              name: req.body.name,
            },
          ],
          cmt: false,
        });
      }
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
    });
  // knex.select('name,feed').from('indvusers').innerJoin('feed','indvusers.name','feed.name').where('indvusers.name',req.body.name).then(data=>{
  //     res.json(data);
  // }).catch(err=>console.log(err));
});

app.get("/viewfriends", (req, res) => {
  knex
    .select("*")
    .from("indvusers")
    .then((data) => {
      res.json(data);
      console.log(data);
    });
});
app.post("/friposts", (req, res) => {
  knex
    .select(
      "posts.name",
      "posts.status",
      "posts.id",
      "posts.lke",
      "posts.haha",
      "posts.love"
    )
    .from("friends")
    .join("indvusers", "friends.semail", "indvusers.email")
    .join("posts", "indvusers.name", "posts.name")
    .where("friends.pemail", req.body.email)
    .orderBy("posts.id", "desc")
    .then((data) => res.json(data));
});
app.post("/cmt", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  knex("comments")
    .insert({ cmter: req.body.cmter, postid: req.body.id, cmt: req.body.cmt })
    .then((data) => res.json(data));
});
app.post("/cmtupdate", (req, res) => {
  knex
    .select("cmtid", "cmter", "cmt")
    .from("comments")
    .where("postid", req.body.id)
    .then((data) => res.json(data));
});
app.post("/signin", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  console.log(req.body);
  // knex.select('*').from('indvusers').innerJoin('users','indvusers.email','users.email').where('users.email',req.body.email).where('users.pw',req.body.pw).then(data=>console.log(data))
  knex
    .select("indvusers.name")
    .from("indvusers")
    .innerJoin("users", "indvusers.email", "users.email")
    .where("users.email", req.body.email)
    .where("users.pw", String(req.body.pw))
    .then((data) => {
      if (data[0] != undefined) {
        res.json({ status: true, name: data[0].name });
        user = data[0].name;
      } else {
        res.json({ status: false });
      }
    })
    .catch((err) => {
      console.log(err);
    });
  // if(req.body.name===users[0].name && req.body.pw===users[0].pw){
  //     knex.select('*').from('indvusers').where({name:req.body.name}).then(data=>{
  //         console.log(data[0]);
  //     }).catch(err=>{console.log(err)})
  //     res.json({status:true,name:req.body.name,feed:users[0].feed});
  //     gname=users[0].name;
  // }else{
  //     res.json(false)
  // }
});
app.post("/reaction", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  knex("posts")
    .where("id", req.body.id)
    .increment(req.body.react, 1)
    .then((data) => res.json(data))
    .catch((err) => {
      res.json("error");
    });
});
app.post("/register", (req, res) => {
  const { email, name, pw } = req.body;
  knex.transaction((trx) => {
    return trx("users")
      .insert({
        email: email,
        pw: pw,
      })
      .then(() => {
        return trx("indvusers").insert({
          name: name,
          email: email,
        });
        console.log(email);
      })
      .then(() => {
        trx.commit;
        console.log("registered");
        res.json("users and indv update success");
      })
      .catch((err) => {
        trx.rollback();
        console.log(err);
      });
  });
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
});
app.post("/feedupload", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.body.status) {
    knex("posts")
      .insert({ name: req.body.name, status: req.body.status })
      .then(res.json("success"));
  } else {
    res.json("Type something in your mind");
  }
});
app.get("/home", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.json("success");
});
app.post("/liveupdate", (req, res) => {
  io.emit("dataUpdate", updatedata);
  res.send("successfull");
});
server.listen(PORT, () => {
  console.log(PORT);
});

/*
signin- fail or success post
regist -fail or success post
feeds - get req
profile- get
*/
