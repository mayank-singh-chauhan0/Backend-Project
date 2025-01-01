import multer from "multer";

 const storage = multer.diskStorage({  
    // file ka access multer k pas hi hota h isi liye multer use hota h cb mtlab callback
    destination: function (req, file, cb) {
        cb(null, './public/temp')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname

        )
    }
 })
 export const upload = multer({ storage});