import mongoose from "mongoose";
import { conn } from "./conn.js";

await conn();
const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  contact: {
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
  },
  bloodGroup: {
    type: String,
    required: true,
  },
  sex: {
    type: String,
    required: true,
  },
  userid: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  payment: {
    type: Number,
    default: 0,
  },
  reports: [
    {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Report",
      },
      _id: false,
    },
  ],
});

const Patient = mongoose.model("Patient", patientSchema);

// const samplePatient = {
//     name: "John Doe",
//     address: "123 Main Street, Cityville",
//     age: 30,
//     contact: {
//       phone: "123-456-7890",
//       email: "john.doe@example.com"
//     },
//     bloodGroup: "O+",
//     sex: "Male",
//     userid: "john123",
//     password: "securePassword123",
//     reports: [],
//   };

//   Patient.insertMany(samplePatient)
//       .then((result) => {
//           console.log('Documents inserted:', result);
//       })
//       .catch((error) => {
//           console.error('Error inserting documents:', error);
//       });

export default Patient;