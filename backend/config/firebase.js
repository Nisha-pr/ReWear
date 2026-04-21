import admin from "firebase-admin"
import { createRequire } from "module"
import dotenv from "dotenv"

dotenv.config()

const require = createRequire(import.meta.url)
const serviceAccount = require("../rewear-e0247-firebase-adminsdk-fbsvc-aaca2f2e46.json")

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

export default admin