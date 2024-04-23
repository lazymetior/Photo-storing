const express = require("express");
const conn = require("../db/conn");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const moment = require("moment");
const fs = require('fs');

const bodyParser = require("body-parser");


router.use(bodyParser.json());


var imgconfig = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, callback) => {
    callback(null, `image-${Date.now()}.${file.originalname}`);
  },
});

const isImage = (req, file, callback) => {
  if (file.mimetype.startsWith("image")) {
    callback(null, true);
  } else {
    callback(new Error("Only images are allowed"));
  }
};

var upload = multer({
  storage: imgconfig,
  fileFilter: isImage,
});

router.post("/submit", upload.single("filename"), async (req, res) => {
  const { userId } = req.body;
  const { desc } = req.body;
  const { filename } = req.file;

  try {
    const date = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");
    await conn.query('INSERT INTO posts ("desc", filename, date, user_id) VALUES ($1, $2, $3, $4)', [desc, filename, date, userId]);

    console.log('Data added');
    res.status(201).json({ status: 201, data: req.body });
  } catch (error) {
    console.error(error);
    res.status(422).json({ status: 422, error: 'Database error' });
  }
});


router.get("/getdata/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const query = "SELECT posts.*, users.username FROM posts JOIN users ON posts.user_id = users.user_id WHERE posts.user_id = $1 ORDER BY posts.post_id ASC";
    const result = await conn.query(query, [userId]);

    res.status(200).json({ status: 200, data: result.rows });
  } catch (error) {
    console.error(error);
    res
      .status(422)
      .json({ status: 422, error: "Error fetching data from the database" });
  }
});

router.post("/delete", async (req, res) => {
  const { deleteItemId } = req.body; // Extract deleteItemId from the request body
  console.log(deleteItemId); // Check if the ID is properly received

  try {
    const result = await conn.query("SELECT filename FROM posts WHERE post_id = $1", [deleteItemId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ status: 404, error: "Post not found" });
    }

    const filename = result.rows[0].filename;
    const filePath = path.join(__dirname, "../uploads", filename);

    fs.unlinkSync(filePath);
    await conn.query("DELETE FROM posts WHERE post_id = $1", [deleteItemId]); // Use deleteItemId instead of id

    res.status(200).json({ status: 200 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 500, error: "Internal Server Error" });
  }
});





module.exports = router;
