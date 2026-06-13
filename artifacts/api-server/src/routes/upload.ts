import { Router, type Request, type Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

// Use process.cwd() which is artifacts/api-server when running pnpm start
const uploadDir = path.resolve(process.cwd(), "../uploads");

console.log("SAVING uploads to:", uploadDir);

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => {
    cb(null, uploadDir);
  },
  filename: (_req: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req: any, file: any, cb: any) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only images are allowed (jpeg, jpg, png, webp, gif)"));
  },
});

const uploadDocument = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  fileFilter: (_req: any, file: any, cb: any) => {
    const allowedTypes = /pdf|doc|docx|xls|xlsx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const allowedMime = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ];
    const mimetype = allowedMime.includes(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only documents are allowed (pdf, doc, docx, xls, xlsx)"));
  },
});

const router = Router();

router.post("/upload", upload.single("file"), (req: any, res: Response) => {
  try {
    console.log("Upload request received");
    if (!req.file) {
      console.log("No file in request");
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("File uploaded successfully:", req.file.filename);
    // Return the relative URL to the uploaded file
    const fileUrl = `/uploads/${req.file.filename}`;
    return res.json({ url: fileUrl });
  } catch (err) {
    console.error("Upload route error:", err);
    return res.status(500).json({ message: (err as Error).message });
  }
});

router.post("/upload-document", uploadDocument.single("file"), (req: any, res: Response) => {
  try {
    console.log("Document upload request received");
    if (!req.file) {
      return res.status(400).json({ message: "No document uploaded" });
    }

    console.log("Document uploaded successfully:", req.file.filename);
    const fileUrl = `/uploads/${req.file.filename}`;
    
    // Determine document type
    const ext = path.extname(req.file.originalname).toLowerCase();
    let fileType = "pdf";
    if (ext === ".xls" || ext === ".xlsx") {
      fileType = "excel";
    } else if (ext === ".doc" || ext === ".docx") {
      fileType = "word";
    }

    return res.json({
      url: fileUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileType: fileType
    });
  } catch (err) {
    console.error("Document upload route error:", err);
    return res.status(500).json({ message: (err as Error).message });
  }
});

export default router;
