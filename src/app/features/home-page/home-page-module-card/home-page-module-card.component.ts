import {Component, inject, Input, OnInit} from '@angular/core';
import {IModule} from "../../../core/models/learning-path/module.model";
import {PillComponent} from "../../../shared/pill/pill.component";
import {ModuleIconComponent} from "../../../shared/icons/module-icon/module-icon.component";
import {DurationFormatPipe} from "../../../core/pipes/duration-format/duration-format.pipe";
import {Router, RouterLink} from "@angular/router";
import {NgIf} from "@angular/common";

@Component({
  selector: 'lsbf-home-page-module-card',
  standalone: true,
  imports: [
    PillComponent,
    ModuleIconComponent,
    DurationFormatPipe,
    RouterLink,
    NgIf
  ],
  templateUrl: './home-page-module-card.component.html',
  styleUrl: './home-page-module-card.component.css'
})
export class HomePageModuleCardComponent {
  @Input() moduleData: IModule | undefined;

  private _router: Router = inject(Router);

  get totalDurationInSeconds(): number {
    return this.moduleData ? this.moduleData.tutorials.reduce((total, tutorial) => total + tutorial.durationSeconds, 0) : 0;
  }

  get firstTutorialId(): number | undefined {
    return this.moduleData?.tutorials[0].id;
  }
}
