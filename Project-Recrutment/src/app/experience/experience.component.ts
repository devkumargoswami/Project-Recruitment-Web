import { ExperienceService } from "../service/experince.service";

export class ExperienceComponent implements OnInit {

  userId: number = 1;

  experienceList: any[] = [];

  experience: any = {
    experienceId: 0,
    userId: 0,
    companyName: '',
    designation: '',
    startDate: '',
    endDate: null,
    isCurrent: false
  };

  isEditMode: boolean = false;

  constructor(private expService: ExperienceService) {}

  ngOnInit(): void {
    this.experience.userId = this.userId;
    this.loadExperiences();
  }

  loadExperiences() {
    this.expService.getExperiences(this.userId).subscribe({
      next: (data) => this.experienceList = data,
      error: (err) => console.error(err)
    });
  }

  onSubmit() {
    this.experience.userId = this.userId;

    if (this.isEditMode) {
      this.expService.updateExperience(this.experience).subscribe(() => {
        alert('Updated Successfully');
        this.resetForm();
        this.loadExperiences();
      });
    } else {
      this.expService.insertExperience(this.experience).subscribe(() => {
        alert('Inserted Successfully');
        this.resetForm();
        this.loadExperiences();
      });
    }
  }

  editRecord(exp: any) {
    this.isEditMode = true;
    this.experience = {
      ...exp,
      startDate: exp.startDate?.split('T')[0],
      endDate: exp.endDate?.split('T')[0]
    };
  }

  deleteRecord(id: number) {
    if (confirm('Are you sure?')) {
      this.expService.deleteExperience(id).subscribe(() => {
        this.loadExperiences();
      });
    }
  }

  resetForm() {
    this.isEditMode = false;
    this.experience = {
      experienceId: 0,
      userId: this.userId,
      companyName: '',
      designation: '',
      startDate: '',
      endDate: null,
      isCurrent: false
    };
  }

  onCurrentChange(event: any) {
    if (event.target.checked) {
      this.experience.endDate = null;
    }
  }
}