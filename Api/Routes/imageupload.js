// utils/uploadImage.js
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require('streamifier');
const User = require("./Model/user_model");
cloudinary.config({
  cloud_name: 'diwspe6yi',
  api_key: '457834299199625',
  api_secret: 'cOt4I5PxEZ7fPWOI0vmzXYzLt6o',
  secure: true,
});

const upload = multer().single("file");

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}


async function handleImageUpload(req, res) {
  try {
    await runMiddleware(req, res, upload);

    // console.log(req.file.buffer);
    const userId = req.params.id;
    const user = await User.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const stream = cloudinary.uploader.upload_stream(
      { folder: "flick-app-userimage" },
     async (error, result) => {
        if (error) {
          console.error(error);
          res.status(500).json({ error: 'Internal Server Error' });
        } else {
          console.log(result.url);

           user.userImage = result.url;
           const usersave = await user.save();
           res.status(200).json("Image saved");

        }
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(stream);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = { runMiddleware, handleImageUpload };

