import path from 'path';
import crypto from 'crypto';
import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

const directoryUpload = path.resolve(__dirname, '..', '..', 'tmp');

export default {
  directoryUpload,
  storage: multer.diskStorage({
    destination: directoryUpload,
    filename: (req, file, cb) => {
      const hash = crypto.randomBytes(10).toString('hex');
      const slugOriginalFile = file.originalname
        .toLocaleLowerCase()
        .replace(' ', ' ')
        .split(' ')
        .join('-');
      const filename = `${hash}-${slugOriginalFile}`;
      return cb(null, filename);
    },
  }),
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ): void => {
    switch (file.mimetype) {
      case 'text/csv':
        return cb(null, true);
      default:
        return cb(new Error('File format should be CSV'));
    }
  },
};
