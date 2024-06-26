import Doctor from "../models/doctor.js";
import Patient from "../models/patient.js";
import MedicalReport from "../models/report.js";
import { asyncErrorHandler } from "../middleware/asyncErrorHandler.js";
import Appointment from "../models/appointment.js";

const searchTreatedPatients = asyncErrorHandler(async (req, res) => {
  if (req.authenticated) {
    if (req.user.role == "Doctor") {
      const doctorId = req.user.id;
      // const patientList = [];
      const doctor = await Doctor.findById(doctorId);
      const p = doctor.patientID.map(async (patientId) => {
        const patient = await Patient.findById(patientId);
        return patient;
      });
      const patientList = await Promise.all(p);

      res.status(201).json({
        patientList: patientList,
      });
    } else {
      res.status(300).json({
        success: "false",
        message: "Not a doctor",
      });
    }
  } else {
    res.status(300).json({
      message: "Not authenticated, please login",
    });
  }
});

const createReport = asyncErrorHandler(async (req, res) => {
  if (req.authenticated) {
    if ((await Doctor.findById(req.user.id)) != null) {
      // console.log("aa");
      const medicalReport = new MedicalReport({
        patientID: req.params.id,
        doctorID: req.user.id,
        reportDate: new Date(),
        chiefComplaint: req.body.formData.chiefComplaint,
        symptoms: req.body.formData.symptoms,
        tests: req.body.formData.tests,
        diagnosis: req.body.formData.diagnosis,
        medications: req.body.formData.medications,
        followUpInstructions: req.body.formData.followUpInstructions,
        treatmentDuration: req.body.formData.treatmentDuration,
      });

      const doctor = await Doctor.findById(req.user.id);

      if (!doctor.patientID.includes(req.params.id)) {
        console.log(req.params.id);
        doctor.patientID.push(req.params.id);
        await doctor.save();
      }

      await MedicalReport.insertMany(medicalReport)
        .then(async (savedReport) => {
          const a = savedReport[0]._id.toString();

          const patient = await Patient.findById(req.params.id);
          if (patient) {
            patient.reports.push(a);
            patient.save();
            res.status(200).json({
              message: "Medical report saved successfully",
              savedReport,
            });
          } else {
            res.status(300).json({
              message: "Patient not found",
            });
          }
        })
        .catch((err) => {
          console.error("Error saving medical report:", err);
          return res
            .status(500)
            .json({ message: "Error saving medical report", err: err });
        });
    } else {
      res.status(300).json({
        message: "Not a doctor, please login",
      });
    }
  } else {
    res.status(300).json({
      message: "Not authenticated, please login",
    });
  }
});

const viewAppointment = asyncErrorHandler(async (req, res) => {

  if (req.authenticated && req.user.role == "Doctor") {
    try {
      const appointmentList = await Appointment.find({ doctorID: req.user.id })
      .populate('patientID', 'name')
      .exec();;
      res.status(201).json({
        success: true,
        data: appointmentList,
      });
    } catch (err) {
      res.status(400).json({
        success: "false",
        err: err.message,
      });
    }
  } else {
    res.status(300).json({
      message: "Please login as a Doctor",
    });
  }
});

const removeAppointment = asyncErrorHandler(async (req, res) => {

  if (req.authenticated && req.user.role == "Doctor") {
    try {
      await Appointment.findByIdAndDelete(req.params.id).then(()=>{
        res.status(201).json({
          success: true,
        });
      })
    } catch (err) {
      res.status(400).json({
        success: "false",
        err: err.message,
      });
    }
  } else {
    res.status(300).json({
      message: "Please login as a Doctor",
    });
  }
});

const editDoctor = asyncErrorHandler(async (req, res) => {
  if (req.authenticated) {
    try {
      const patientId = req.params.id;
      const updatedPatientData = {};
      if (req.body.formData.name) {
        updatedPatientData.name = req.body.formData.name;
      }
      if (req.body.formData.address) {
        updatedPatientData.address = req.body.formData.address;
      }
      if (req.body.formData.age) {
        updatedPatientData.age = req.body.formData.age;
      }
      if (req.body.formData.phone) {
        // updatedPatientData.contact = updatedPatientData.contact || {};
        updatedPatientData.contact.phone = req.body.formData.phone;
      }
      if (req.body.formData.email) {
        // updatedPatientData.contact.email = updatedPatientData.contact || {};
        updatedPatientData.contact.email = req.body.formData.email;
      }
      if (req.body.formData.bloodGroup) {
        updatedPatientData.bloodGroup = req.body.formData.bloodGroup;
      }
      if (req.body.formData.sex) {
        updatedPatientData.sex = req.body.formData.sex;
      }
      if (req.body.formData.userid) {
        updatedPatientData.userid = req.body.formData.userid;
      }
      if (req.body.formData.password) {
        updatedPatientData.password = req.body.formData.password;
      }
      const updatedPatient = await Patient.findOneAndUpdate(
        { _id: patientId },
        { $set: updatedPatientData },
        { new: true }
      ).catch((err) => {
        console.error(err);
        res.status(400).json({ success: false, err: err.message });
      });

      if (!updatedPatient) {
        return res
          .status(404)
          .json({ success: false, message: "Patient not found" });
      }

      res.json({
        success: true,
        message: "Patient data updated",
        data: updatedPatient,
      });
    } catch (err) {
      console.error(err);
      res.status(400).json({ success: false, err: err.message });
    }
  } else {
    res.status(300).json({
      message: "Not authenticated, please login",
    });
  }
});

export { searchTreatedPatients, createReport,viewAppointment,removeAppointment,editDoctor };
