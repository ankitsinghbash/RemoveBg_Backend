require('dotenv').config();
const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const cors = require("cors");
const fs = require('fs');
const port = 5000;
const app = express();
app.use(cors()); 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const upload = multer({ storage: multer.memoryStorage() });
const sharp = require('sharp');
const path = require('path');


const corsOptions = {
  origin: 'https://bg-remove-frontend-1b3a.vercel.app/', // Frontend URL
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
};

// Use the CORS middleware with the configured options
app.use(cors(corsOptions));


app.post("/upload", upload.single("myimage"), async (req, res) => {
  console.log("Come in uplaod backend")
  console.log("Uploaded Image Info:", req.file);
  if (!req.file) {
    return res.status(400).json({ success: false, error: "No file uploaded" });
  }
  try {
    const formData = new FormData();
    formData.append("image", req.file.buffer, req.file.originalname);
    const response = await axios.post(
        process.env.URL,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          ' x-rapidapi-key' :  process.env.VALUE_KEY,
          'x-rapidapi-host' :  process.env.VALUE_HOST,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
         responseType: "arraybuffer",
      }
    );

  console.log("Request Go successfull");  
  if(!response){
     console.log("Faild in Getting Remove Background Image")
  }
    // Return the processed image to the frontend
    if (response && response.data) {
      const imageBuffer = Buffer.from(response.data, "base64");
      res.setHeader("Content-Type", "image/png"); // Change if API returns other formats
      res.send(imageBuffer);
    } else {
      console.error("Failed to get processed image");
      res.status(500).json({ success: false, error: "Image processing failed" });
    }
  
  } 
    catch (error) {
      // Log only essential error information, avoiding circular structure
      console.error("Error processing the image:", error.message);
      res.status(500).json({ success: false, error: "Server Error" });
    }
  
});










app.post('/upload/image', upload.single("output_image"), async (req, res) => {
  const format = req.body.format;
  const width = parseInt(req.body.width);
  const height = parseInt(req.body.height);


  const myfile = req.file;

  if (!myfile) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
  }

  const originalfilewithoutext = myfile.fieldname;
  console.log("Original File name without extension", originalfilewithoutext);

  const newname = `${originalfilewithoutext}-convert.${format}`;
  console.log("New Name is", newname);

  const outputDir = path.join(__dirname, 'Generate_Image');

  if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, `${myfile.originalname}`);


  try {
      const imageBuffer = myfile.buffer;


      await sharp(imageBuffer)
  .resize({
      width: width || null,
      height: height || null,
      fit: 'contain', // Ensures image fits within the given dimensions
      background: { r: 255, g: 255, b: 255 }, // White background for padding areas
  })
  .extend({
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      background: { r: 255, g: 255, b: 255 }, // Ensures outside areas are white
  })
  .flatten({ background: { r: 255, g: 255, b: 255 } }) // Replace transparency with white if needed
  .toFormat(format, { quality: 100 }) // Maximize quality for output format
  .toFile(outputPath);


      console.log("Image successfully converted and saved:", outputPath);

    
      res.download(outputPath, newname, (err) => {
          if (err) {
              console.error("Error sending the file:", err);
          }
       
          console.log("Before",outputPath)
         
          fs.unlink(outputPath, (unlinkErr) => {
              if (unlinkErr) console.error("Error deleting temporary file:", unlinkErr);
          });
          console.log("After",outputPath)
      });

      
  } catch (err) {
      console.error("Image not converted:", err.message);
      return res.status(500).json({ success: false, error: "Image processing failed." });
  }
});













app.get('/',(req,res)=>{
   res.json({message : "Hello world from backend"})
})









app.listen(port, () => {
  console.log("Server running on",`${port}`);
});





















{/*
 This is backend
 
 app.post('/upload/image', upload.single("output_image"), async (req, res) => {
  const format = req.body.format;
  const width = parseInt(req.body.width);
  const height = parseInt(req.body.height);


  const myfile = req.file;

  if (!myfile) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
  }

  const originalfilewithoutext = myfile.fieldname;
  console.log("Original File name without extension", originalfilewithoutext);

  const newname = `${originalfilewithoutext}-convert.${format}`;
  console.log("New Name is", newname);

  const outputDir = path.join(__dirname, 'Generate_Image');

  if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, newname);


  try {
      const imageBuffer = myfile.buffer;

      await sharp(imageBuffer)
      .resize({
          width: width || null,
          height: height || null, 
          fit: 'contain', 
          background: { r: 255, g: 255, b: 255, alpha: 1 }, 
      })
      .toFormat(format)
      .toFile(outputPath);

      console.log("Image successfully converted and saved:", outputPath);

    
      res.download(outputPath, newname, (err) => {
          if (err) {
              console.error("Error sending the file:", err);
          }
       
          console.log("Before",outputPath)
         
          fs.unlink(outputPath, (unlinkErr) => {
              if (unlinkErr) console.error("Error deleting temporary file:", unlinkErr);
          });
          console.log("After",outputPath)
      });

      
  } catch (err) {
      console.error("Image not converted:", err.message);
      return res.status(500).json({ success: false, error: "Image processing failed." });
  }
});

  
  */}
