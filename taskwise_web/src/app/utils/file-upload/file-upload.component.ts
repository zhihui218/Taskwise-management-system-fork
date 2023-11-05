import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AttachmentGetDTO } from 'src/app/DTOs/AttachmentDTO';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit{

  //* Store the file that are to be uploaded ("CREATE / UPDATE")
  fileList: File[] = [];
  //* To be displayed for user ("READ")
  displayedFile: AttachmentGetDTO[] = [];
  // Emits the list of selected files to the form
  @Output() onFileSelected: EventEmitter<File[]> = new EventEmitter<File[]>();
  // Emits the file which will be deleted if "X" is clicked when "UPDATE"
  @Output() onDeleteChosen: EventEmitter<AttachmentGetDTO> = new EventEmitter<AttachmentGetDTO>();
  // To display the uploaded files when "project / task / ticket" is in view (Actual List)
  @Input() uploadedFile: AttachmentGetDTO[];
  @Input() isEditMode: boolean;

  ngOnInit(): void {
    if(this.uploadedFile){
      for(const attachment of this.uploadedFile) this.displayedFile.push(attachment);
    }
  }

  //* Invoked when either file is selected / not selected
  fileSelect($event: any): void{
    if($event.target.files.length > 0){
      // Store the file (if any selected)
      for(const file of $event.target.files){ this.fileList.push(file); }
      // Whenever there's change in the file list, we should update the form of parent's component as well
      this.onFileSelected.emit(this.fileList);
    }
  }

  //* Invoked when the "X" icon of the file is clicked
  removeFile(index: number){
    this.fileList.splice(index, 1);
    this.onFileSelected.emit(this.fileList);
  }

  //* Invoked when the "X" icon of the "UPLOADED" file is clicked
  removeUploadedFile(index: number){
    const removedFile = this.displayedFile.splice(index, 1)
    // Send the deleted file to parent component
    this.onDeleteChosen.emit(removedFile[0]);
  }

  //* Invoked when a "project / task / ticket" is "CREATED" successfully
  clear(){
    this.fileList = [];
    this.onFileSelected.emit(this.fileList);
  }

  //* Invoked when "project / task / ticket" updated successfully
  setUploadedFiles(attachments: AttachmentGetDTO[]){
    this.uploadedFile = attachments;
    // If there's file uploaded in "EDIT" Mode, replace the file to be displayed with the new list
    this.displayedFile = [];
    for(const attachment of this.uploadedFile) this.displayedFile.push(attachment);
  }

  // Check file extension of each uploaded file from its "fileName"
  isRawType(fileName: string): boolean{
    const paths = fileName.split(".");
    // Get its extension
    const extension = paths[paths.length - 1]
    return extension == "doc" || extension == "docx" || extension == "ppt" || extension == "pptx";
  }
}
