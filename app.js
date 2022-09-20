const express = require("express");
const app = express()
const mongoose = require("mongoose")
require("dotenv").config({ path: ".env" }); // env 파일 사용을 위한 코드

//router
const developRouter = require("./routes/developer")
const projectRouter = require("./routes/project")
const insertRouter = require("./routes/insert")

app.use(express.json()); // body-parser의 역할
// application/x-www-form-urlencoded
app.use(express.urlencoded({extended: true}));


// mongoDB 연결
mongoose.connect(process.env.mongoURI, {
  //  useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err))

app.get('/', (req, res) => { // 루트 디렉토리에 라우트
res.send('mongoDB 연결 완료') // 출력
})


// connect router
app.use('/api/developer', developRouter)
app.use('/api/project', projectRouter)
app.use('/api/insert', insertRouter)


// swagger
const { swaggerUi, specs } = require("./swagger/swagger");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));


// port에서 서버 실행
app.listen(process.env.PORT, () => { // 포트(port)에서 실행
  console.log(`Example app listening on port ${process.env.PORT}`)
})