import { Component, OnInit } from '@angular/core';
import { ExperienceService } from '../service/experience.service';
import { Experience } from '../experience/experience.component';

@Component({
  selector: 'app-experience-list',
  templateUrl: './experience-list.component.html',
  styleUrls: ['./experience-list.component.css']
})
export class ExperienceListComponent implements OnInit {

  userId: number = 1;
  experienceList: Experience[] = [];

  constructor(private expService: ExperienceService) { }

  ngOnInit(): void {
    this.loadExperiences();
  }

  // 🔹 Load Data
  loadExperiences(): void {
    this.expService.getExperiences(this.userId).subscribe({
      next: (data: Experience[]) => {
        this.experienceList = data;
      },
      error: (err: any) => {
        console.error('Load Error:', err);
      }
    });
  }
}