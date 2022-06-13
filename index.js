const express = require('express')
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const app = express();

const workerTypeSchema = require('./model/workerType')
const workerSchema = require('./model/worker')
const userSchema = require('./model/user')
const bookingSchema = require('./model/booking')
const adminSchema = require('./model/admin')

app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'))
app.use(cookieParser())
app.use(express.urlencoded({extended: true}))
app.use(express.json())


// user routes

app.get('/register', (req, res) => {
  res.render('user/register', {
    message: ''
  })
})

app.post('/register', async (req, res) => {
  let User = new userSchema(req.body)
  let data = await User.save()
  res.render('user/register', {
    message: 'You are successfully registerd. Please Login'
  })
})

app.get('/login', (req, res) => {
  res.render('user/login', {
    message: ''
  })
})

app.get('/', async (req, res) => {
  let user = await userSchema.findOne({ _id: mongoose.Types.ObjectId(req.cookies.userId) })
  let data = await workerTypeSchema.find()
  let workerData = await workerSchema.find().populate('worker_type')
  res.render('user/home', {
    workerType: data,
    workerData,
    loginButton: user?.name ? user?.name : 'Login'
  })
})

app.post('/', async (req, res) => {
  try {
    let user = await userSchema.findOne({email: req.body.email, password: req.body.password})
    console.log(user)
    if(!user) {
      return res.render('user/login', {
        message: 'Wrong Email or Password'
      })
    }
    let data = await workerTypeSchema.find()
    let workerData = await workerSchema.find().populate('worker_type')
    res.cookie('userId', user._id.toString()).render('user/home', {
      workerType: data,
      workerData,
      loginButton: user.length != 0 ? user.name : 'Login'
    })
  } catch(e) {
    console.log(e);
    res.send(e);
  }
})

app.get('/filterworker/:workerTypeId', async (req, res) => {
  try {
    let user = await userSchema.findOne({_id: req.cookies.userId})
    let data = await workerTypeSchema.find()
    let workerData = await workerSchema.find({worker_type: mongoose.Types.ObjectId(req.params.workerTypeId)}).populate('worker_type')
    res.render('user/home', {
      workerType: data,
      workerData,
      loginButton: user ? user.name : 'Login'
    })
  } catch(e) {
    console.log(e);
    res.send(e);
  }
})

app.get('/searchworkerbyname', async (req, res) => {
  console.log(req.query)
  try {
    let regex = new RegExp(`^${req.query.worker}`, 'i')
    let user = await userSchema.findOne({_id: req.cookies.userId})
    let data = await workerTypeSchema.find()
    let workerData = await workerSchema.find({worker_name: regex}).populate('worker_type')
    res.render('user/home', {
      workerType: data,
      workerData,
      loginButton: user ? user.name : 'Login'
    })
  } catch(e) {
    console.log(e);
    res.send(e);
  }
})

app.post('/bookworker', async (req, res) => {
  let workerbooking = new bookingSchema(req.body)
  let data = await workerbooking.save()
  
  if(!data) res.json({status: 0, message: 'error while booking worker'})
  res.json({status: 1, message: 'worker booked'})
})

app.get('/mybooking', async (req, res) => {
  let userData = await userSchema.findOne({_id: mongoose.Types.ObjectId(req.cookies.userId)})
  let data2 = await bookingSchema.aggregate([
    {$match: {userId: mongoose.Types.ObjectId(req.cookies.userId)}},
    {
      $lookup: {
        from: 'workers',
        localField: 'workerId',
        foreignField: '_id',
        as: 'worker'
      }
    },
    { $unwind: "$worker" },
    {
      $lookup: {
        from: 'workertypes',
        localField: 'worker.worker_type',
        foreignField: '_id',
        as: 'worker.types'
      }
    },
    { $unwind: "$worker.types" }
  ])
  
  let result = data2.map(value => ({
    name: value.worker.worker_name,
    type: value.worker.types.worker_type,
    number: value.worker.worker_number,
    address: value.worker.worker_address,
    date: new Date(value.createdDate)
  }))
  res.render('user/mybooking', {
    data: result,
    loginButton: userData?.name ? userData?.name : 'Login'
  })
})

app.get('/user/logout', (req, res) => {
  res.clearCookie('userId').redirect('/login')
})


// admin routes

app.get('/admin/worker', async (req, res) => {
  let admin = await adminSchema.findOne({_id: mongoose.Types.ObjectId(req.cookies.adminId)})
  let data = await workerTypeSchema.find()
  res.render('admin/worker', {
    workerType: data,
    message: '',
    loginButton: admin ? admin.name : 'Login'
  })
})

app.post('/admin/worker', async (req, res) => {
  let admin = await adminSchema.findOne({_id: mongoose.Types.ObjectId(req.cookies.adminId)})
  let data = await workerTypeSchema.find()
  let newWorker = new workerSchema(req.body)
  let data2 = await newWorker.save()
  res.render('admin/worker', {
    workerType: data,
    message: 'Worker Data added successfully',
    loginButton: admin ? admin.name : 'Login'
  })
})

app.get('/admin/register', async (req, res) => {
  res.render('admin/register', {
    message: ''
  })
})

app.post('/admin/register', async (req, res) => {
  let admin = new adminSchema(req.body)
  let data = await admin.save()
  if(!data) {
    return res.render('admin/register', {
      message: ''
    })
  }
  res.render('admin/register', {
    message: 'Successfully Registered.'
  })
})

app.get('/admin', (req, res) => {
  res.render('admin/login', {
    message: ''
  })
})

app.get('/logout', (req, res) => {
  res.clearCookie('adminId').render('admin/login', {
    message: ''
  })
})

app.get('/admin/dashboard', async (req, res) => {
  let admin = await adminSchema.findOne({ _id: mongoose.Types.ObjectId(req.cookies.adminId) })
  if(!admin) {
    return res.render('admin/dashboard', {
      loginButton: 'Login'
    })
  }
  res.render('admin/dashboard', {
    loginButton: admin.name ? admin.name : 'Login'
  })
})

app.post('/admin/dashboard', async (req, res) => {
  let admin = await adminSchema.findOne({ email: req.body.email, password: req.body.password })
  if(!admin) {
    return res.render('admin/login', {
      loginButton: 'Login',
      message: 'Wrong Email or Password'
    })
  }
  res.cookie('adminId', admin._id.toString()).render('admin/dashboard', {
    loginButton: admin.name
  })
})

app.get('/admin/workertype', async (req, res) => {
  let admin = await adminSchema.findOne({_id: mongoose.Types.ObjectId(req.cookies.adminId)})
  res.render('admin/worker_type', {
    message: '',
    loginButton: admin ? admin.name : 'Login'
  })
})

app.post('/admin/workertype', async (req, res) => {
  let admin = await adminSchema.findOne({_id: mongoose.Types.ObjectId(req.cookies.adminId)})
  let newWorkerType = new workerTypeSchema(req.body)
  let data = await newWorkerType.save()
  res.render('admin/worker_type', {
    message: data ? 'Worker Type Added successfully' : '',
    loginButton: admin ? admin.name : 'Login'
  })
})


app.get('/admin/getallusers', async (req, res) => {
  let admin = await adminSchema.findOne({_id: mongoose.Types.ObjectId(req.cookies.adminId)})
  let users = await userSchema.find();
  let data = users.map(value => ({
    name: value.name,
    email: value.email,
    password: value.password,
    mobileno: value.number,
    fullAddress: value.fullAddress
  }))
  res.render('admin/allusers', {
    data,
    loginButton: admin ? admin.name : 'Login'
  })
})

app.get('/admin/getallbookings', async (req, res) => {
  let admin = await adminSchema.findOne({_id: mongoose.Types.ObjectId(req.cookies.adminId)})
  let data2 = await bookingSchema.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: "$user" },
    {
      $lookup: {
        from: 'workers',
        localField: 'workerId',
        foreignField: '_id',
        as: 'worker'
      }
    },
    { $unwind: "$worker" },
    {
      $lookup: {
        from: 'workertypes',
        localField: 'worker.worker_type',
        foreignField: '_id',
        as: 'worker.types'
      }
    },
    { $unwind: "$worker.types" }
  ])
  let data = data2.map(value => ({
    uName: value.user.name,
    uEmail: value.user.email,
    uNumber: value.user.number,
    wName: value.worker.worker_name,
    number: value.worker.worker_number,
    type: value.worker.types.worker_type,
    date: new Date(value.createdDate)
  }))
  res.render('admin/allbookings', {
    data,
    loginButton: admin ? admin.name : 'Login'
  })
})


mongoose.connect('mongodb://localhost:27017/owbs')
.then(() => {
  console.log('database is connected')
  app.listen(3000, () => {
      console.log('server is running on port 3000')
  })
}).catch(err => {
  console.log(err);
})
