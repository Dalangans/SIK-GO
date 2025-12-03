import multer from "multer";

const storage = multer.memoryStorage(); // file langsung masuk ke backend (buffer)

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // optional: batas 5MB
});

export default upload;
