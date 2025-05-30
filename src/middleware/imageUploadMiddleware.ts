import multer from 'multer'
import { Request, Response, NextFunction } from 'express'

const ALLOWED_FORMATS = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// Configure multer storage
const storage = multer.memoryStorage()

// Configure multer upload
const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5 // Max 5 files per upload
  },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_FORMATS.includes(file.mimetype)) {
      cb(new Error('Invalid file type'))
      return
    }
    cb(null, true)
  }
})

// Middleware for handling image upload errors
export const handleImageUpload = (fieldName: string) => {
  return [
    upload.array(fieldName, 5),
    (error: any, req: Request, res: Response, next: NextFunction) => {
      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            error: `File too large. Max size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`
          })
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            error: 'Too many files. Max is 5 files'
          })
        }
      }
      if (error) {
        return res.status(400).json({ error: error.message })
      }
      next()
    }
  ]
}

export const validateImages = (req: Request, res: Response, next: NextFunction) => {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    return res.status(400).json({ error: 'At least one image is required' })
  }
  next()
}