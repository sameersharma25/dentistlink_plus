import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

import { CurrentUserService } from '../shared/services/current-user.service';
import { DataSourceService } from '../shared/services/data-source.service';
import {Email} from '../shared/model/common-model';

@Component({
  selector: 'app-patients',
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.scss']
})
export class PatientsComponent implements OnInit {

  patientAction: any = {};
  patientAptAction: any = {};
  selectedPatient: any = {};
  dateOfBirth: any = {};
  patientList: any = [];
  panelOpenState: Boolean = true;
  patientEditForm: FormGroup;
  patientDetailsEditForm: FormGroup;
  patientAppointmentForm: FormGroup;
  searchPatients: string;
  isCollapsed: Boolean = false;
  reqObj:any ={};
  appointmentList: any[];
  patientDetails:any = {};
  patientId: number;
  selectedAppointment: any;

  constructor(
    private cus: CurrentUserService,
    private dss: DataSourceService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.patientAction.label = "";
    this.patientAptAction.label = "";
    this.patientAction.isOpened = false;
    this.patientAction.collapsed = false;
    this.dateOfBirth.months = [
      {value: 1, viewValue:'JANUARY'},
      {value: 2, viewValue:'FEBUARY'},
      {value: 3, viewValue:'MARCH'},
      {value: 4, viewValue:'APRIL'},
      {value: 5, viewValue:'MAY'},
      {value: 6, viewValue:'JUNE'},
      {value: 7, viewValue:'JULY'},
      {value: 8, viewValue:'AUGUST'},
      {value: 9, viewValue:'SEPTEMBER'},
      {value: 10, viewValue:'OCTOBER'},
      {value: 11, viewValue:'NOVEMBER'},
      {value: 12, viewValue:'DECEMBER'}
    ];
    this.dateOfBirth.days = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30];
    this.dateOfBirth.years = [1985,1986,1987,1998,1999,2000];
    this.getAllPatients();
    this.createForm();
  }

  createForm(){
    this.patientEditForm = this.fb.group({
      notes: ['']
    });

    this.patientDetailsEditForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      month: [''],
      day: [''],
      year: [''],
      phoneNumber: [''],
      email: [''],
      preferredContact: [''],
    });

    this.patientAppointmentForm = this.fb.group({
      month: [''],
      day: [''],
      year: [''],
      reasonForVisit: [''],
      patientCoverage: [''],
      patientCoverageId: [''],
      notes: ['']
    });
  };

  getAllPatients(){
    let currentUserMail: Email;
    currentUserMail = this.cus.getCurrentUser();
    this.reqObj.email = currentUserMail;
    this.dss.getAllPatientList(this.reqObj).subscribe(res =>{
      const response:any = res;
      if(response.status == 'ok'){
        this.patientList = response.patients_details;
        //this.appointmentList = this.getAppointmentList(this.response);
      }
    }, err =>{
      console.log(err);
    });
  };

  // right panel action for patient
  openPatientAction(data) {
    if (data) {
      this.patientAction.label = 'Edit';
      this.selectedPatient = data;
      this.getPatientsDetails(data);

      this.getAppointments(data);
      //this.isAppointmentEdit = true;
    } else {
      this.patientAction.label = 'Create';
      this.createForm();
      this.reset();
    }
    this.patientAction.collapsed = true;
  }

  // open appoint form for patient
  openPatientAppointment(status,data){
    this.selectedAppointment = data;
    this.patientAction.isOpened = true;

    if(status === 'new'){
      this.createForm();
      this.patientAptAction.label = "new";

    } else if(status === 'edit'){
      let dateObj: any = this.getDateObject(this.selectedAppointment.date_of_appointment);
      this.patientAptAction.label = "edit";
      (<FormGroup>this.patientAppointmentForm)
      .patchValue({day: dateObj.day}, {onlySelf: true});
      (<FormGroup>this.patientAppointmentForm)
          .patchValue({month: dateObj.month}, {onlySelf: true});
      (<FormGroup>this.patientAppointmentForm)
          .patchValue({year: dateObj.year}, {onlySelf: true});
      // (<FormGroup>this.patientAppointmentForm)
      //     .patchValue({reasonForVisit: this.selectedAppointment.rov}, {onlySelf: true});
      (<FormGroup>this.patientAppointmentForm)
          .patchValue({reasonForVisit: this.selectedAppointment.rov}, {onlySelf: true});
        }
  }

  getPatientsDetails(data: any) {
    this.patientId = data.patient_id;
    this.reqObj.email = this.cus.getCurrentUser();
    this.reqObj.patient_id = this.patientId;
    this.dss.getPatientsDetails(this.reqObj).subscribe(res => {
      const response: any = res;
      console.log(res);
       if (response.status === 'ok') {
        this.patientDetails = response.patients_details;
        (<FormGroup>this.patientDetailsEditForm)
          .patchValue({firstName: this.patientDetails.first_name}, {onlySelf: true});
        (<FormGroup>this.patientDetailsEditForm)
          .patchValue({lastName: this.patientDetails.last_name}, {onlySelf: true});

        (<FormGroup>this.patientDetailsEditForm)
          .patchValue({phoneNumber: this.patientDetails.ph_number}, {onlySelf: true});

        (<FormGroup>this.patientDetailsEditForm)
          .patchValue({email: this.patientDetails.patient_email}, {onlySelf: true});

        const dateObj: any = this.getDateObject(this.patientDetails.date_of_birth);

         (<FormGroup>this.patientDetailsEditForm)
           .patchValue({day: dateObj.day}, {onlySelf: true});
         (<FormGroup>this.patientDetailsEditForm)
           .patchValue({month: dateObj.month}, {onlySelf: true});
         (<FormGroup>this.patientDetailsEditForm)
           .patchValue({year: dateObj.year}, {onlySelf: true});

         (<FormGroup>this.patientDetailsEditForm)
           .patchValue({preferredContact: this.patientDetails.mode_of_contact}, {onlySelf: true});
      }
    }, err => {
      console.log(err);
    });
  }

  patientAppointment(appointmentData) {
    if(this.patientAptAction.label == 'new'){
      let reqObj: any = {
        email: this.cus.getCurrentUser(),
        patient_id: this.patientId,
        date_of_appointment: this.getDate(this.patientAppointmentForm.value),
        reason_for_visit: this.patientAppointmentForm.value.reasonForVisit
      };
      this.dss.createPatientAppoint(reqObj).subscribe(res => {
        let response:any = res;
        if(response.status == 'ok'){
          this.getAllPatients()
          alert(response.message);
          this.patientAction.collapsed = false;
        }
      }, err => {
        console.log("Error in fetching data from server::" + err);
      })
    }else if(this.patientAptAction.label == 'edit'){
      let patientName = this.selectedAppointment.patient_name.split(' ');
      let reqObj: any = {
        email: this.cus.getCurrentUser(),
        reason_for_visit: this.patientAppointmentForm.value.reasonForVisit,
        appointment_id: this.selectedAppointment.appointment_id,
        date_of_appointment: this.getDate(this.patientAppointmentForm.value),
        first_name: patientName[0],
        last_name: patientName[1],
        patient_phone: this.selectedPatient.ph_number,
        dob: this.selectedAppointment.patient_dob,
        healthcare_coverage: this.patientAppointmentForm.value.patientCoverage
      };

      this.dss.updateAppointment(reqObj).subscribe(res => {
        let response:any = res;
        if(response.status == 'ok'){
          this.getAllPatients()
          alert(response.message);
          this.patientAction.collapsed = false;
        }
      }, err => {
        console.log("Error in fetching data from server::" + err)
      });
    }
  }

  // create & update patient info
  editPatientInfo() {
    if(this.patientAction.label == 'Create'){
      let patient_dob = this.getDate(this.patientDetailsEditForm.value);
      let reqObj: any = {
        email: this.cus.getCurrentUser(),
        first_name: this.patientDetailsEditForm.value.firstName,
        last_name: this.patientDetailsEditForm.value.lastName,
        date_of_birth: patient_dob,
        patient_email: this.patientDetailsEditForm.value.email,
        patient_phone: this.patientDetailsEditForm.value.phoneNumber,
        patient_coverage_id: null,
        healthcare_coverage: null,
        mode_of_contact: this.patientDetailsEditForm.value.preferredContact,
        patient_zipcode: null
      };
      this.dss.createPatient(reqObj).subscribe(res => {
        let response:any = res;
        if(response.status == 'ok'){
          this.getAllPatients()
          alert(response.message);
          this.patientAction.collapsed = false;
        }
      }, err => {
        console.log(err)
      });
    }else{
      var patientObj:any;
      patientObj = this.getPatientUpdate(this.patientDetailsEditForm, this.patientDetails);
      this.dss.updatePatient(patientObj).subscribe(res =>{
        let response:any = res;
        if(response.status == 'ok'){
          this.getAllPatients()
          alert(response.message);
          this.patientAction.collapsed = false;
        }
      }, err =>{
        console.log("Error in fetching data from server::" + err);
      })
    }

  }
  getPatientUpdate(formData, patientDetails){
    let patientObj:any = {};
    patientObj.patient_id = this.patientId;
    patientObj.first_name = formData.value.firstName;
    patientObj.last_name = formData.value.lastName;
    patientObj.date_of_birth = this.getDate(formData.value)? this.getDate(formData.value):patientDetails.date_of_birth;
    patientObj.patient_email = formData.value.email? formData.value.email : patientDetails.patient_email;
    patientObj.patient_phone = formData.value.phoneNumber? formData.value.phoneNumber : patientDetails.patient_phone;
    patientObj.patient_coverage_id = patientDetails.patient_coverage_id;
    patientObj.healthcare_coverage = patientDetails.healthcare_coverage;
    patientObj.mode_of_contact = formData.value.preferredContact;
    patientObj.patient_zipcode = null;

    return patientObj;
  }


  getAppointments(patient){
    this.reqObj = {};
    this.reqObj.patient_id = patient.patient_id;
    this.reqObj.email = this.cus.getCurrentUser();
    this.dss.getPatientsAppointments(this.reqObj).subscribe(res => {
      const response: any = res;
      if (response.status === 'ok') {
        this.appointmentList = response.details_array;
      }
    }, err => {
      console.log(err);
    });
  }

  // date format
  getDate(value){
    if(!value.day && !value.month && !value.year)
      return false;
    let tempDate: string ='';
    tempDate = `${value.year}-${value.month}-${value.day}`;
    return new Date(tempDate);
  }
  // get day,month & year by date format
  getDateObject(date){
    if(date){
      let tempDate:any = date;
      let dateObj: any = {
        day: new Date(tempDate).getDate(),
        month: new Date(tempDate).getMonth(),
        year: new Date(tempDate).getFullYear()
      };
      return dateObj;
    }
    return;
  }

  // reset data
  reset():void{
    this.appointmentList = [];
    this.selectedPatient = {};
    this.selectedAppointment = {};
  }

}
