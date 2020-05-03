import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { ChallengesService } from './../../../challenges.service';
import {
  FormControl,
  Validators,
  FormGroup,
  FormBuilder
} from '@angular/forms';
import { Challenge } from './../../../challenge.model';
import { MAT_DATE_LOCALE } from '@angular/material/core';
@Component({
  selector: 'app-form-dialog',
  templateUrl: './form-dialog.component.html',
  styleUrls: ['./form-dialog.component.sass'],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'en-GB' }]
})
export class FormDialogComponent {
  action: string;
  dialogTitle: string;
  departmentForm: FormGroup;
  department: Challenge;
  constructor(
    public dialogRef: MatDialogRef<FormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public departmentService: ChallengesService,
    private fb: FormBuilder
  ) {
    // Set the defaults
    this.action = data.action;
    if (this.action === 'edit') {
      console.log(data.department.date);
      this.dialogTitle = data.department.Question;
      this.department = data.department;
    } else {
      this.dialogTitle = 'New Challenge';
      this.department = new Challenge({});
    }
    this.departmentForm = this.createContactForm();
  }
  formControl = new FormControl('', [
    Validators.required
  ]);
  getErrorMessage() {
    return this.formControl.hasError('required')
      ? 'Required field'
      : this.formControl.hasError('email')
        ? 'Not a valid email'
        : '';
  }
  createContactForm(): FormGroup {
    return this.fb.group({
      _id: [this.department._id],
      Category: [this.department.Category, [Validators.required]],
      Points: [this.department.Points, [Validators.required]],
      Question: [this.department.Question, [Validators.required]],
      TimeInSeconds: [this.department.TimeInSeconds, [Validators.required]],
      Answer: [this.department.Answer, [Validators.required]],
      Clue: [this.department.Clue == null ? '' : this.department.Clue.Description, [Validators.required]],
      clueFile: [''],
      Source: [this.department.Clue == null ? '' : this.department.Clue.Source],
      By: [this.department.Clue == null ? '' : this.department.Clue.By],
      Licence: [this.department.Clue == null ? '' : this.department.Clue.Licence],
      LicenceReference: [this.department.Clue == null ? '' : this.department.Clue.LicenceReference],
    });
  }
  submit() {
    // emppty stuff
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
  public confirmAdd(): void {
    let formDataRaw = this.departmentForm.getRawValue();
    let formData = new FormData();
    let fileType = 'none';
    if (this.departmentForm.value.clueFile.files != undefined) {
      let mimeType = this.departmentForm.value.clueFile.files[0]["type"];
      if (mimeType.split("/")[0] === "video") {
        fileType = "video";
        formData.append("File", this.departmentForm.value.clueFile.files[0]);
      } else if (mimeType.split("/")[0] === "image") {
        fileType = "image";
        formData.append("File", this.departmentForm.value.clueFile.files[0]);
      }
    }
    formData.append("FileType", fileType);
    formData.append("ChallengeCreatorID", "5e6d10044842ce46dc5ed185");
    formData.append("Answer", formDataRaw.Answer);
    formData.append("Category", formDataRaw.Category);
    formData.append("Points", formDataRaw.Points);
    formData.append("Question", formDataRaw.Question);
    formData.append("TimeInSeconds", formDataRaw.TimeInSeconds);
    formData.append("Description", formDataRaw.Clue);
    formData.append("_id", formDataRaw._id);
    formData.append("Source", formDataRaw.Source);
    formData.append("By", formDataRaw.By);
    formData.append("Licence", formDataRaw.Licence);
    formData.append("LicenceReference", formDataRaw.LicenceReference);
    console.log(formDataRaw._id);
    if (formDataRaw._id != null) {
      let newClue = this.department.Clue;
      newClue.Description = formDataRaw.Clue;
      newClue.Source = formDataRaw.Source;
      newClue.By = formDataRaw.By;
      newClue.Licence = formDataRaw.Licence;
      newClue.LicenceReference = formDataRaw.LicenceReference;
      formDataRaw.Clue = newClue;
    } else {
      let clueNew = {
        Description: formDataRaw.Clue,
        Files: null,
        Type: fileType,
        Source: formDataRaw.Source,
        By: formDataRaw.By,
        Licence: formDataRaw.Licence,
        LicenceReference: formDataRaw.LicenceReference,
      };
      formDataRaw.Clue = clueNew;
    }
    console.log(formDataRaw);
    this.departmentService.addDepartment(formDataRaw);
    this.departmentService.createdefaultsessionchallenge(formData);
  }
}
