import { Injectable } from '@angular/core';
import { ILearningPathDTO } from '../../models/learning-path/learning-path-dto.model';
import { ILearningPath } from '../../models/learning-path/learning-path.model';
import { ModuleStyles } from '../../models/learning-path/module.model';

@Injectable({
  providedIn: 'root'
})
export class LearningPathMapperService {

  constructor() { }

  transformDtoToLearningPath(dto: ILearningPathDTO): ILearningPath {
    return {
      modules: dto.modules.map(module => ({
        id: module.id ? module.id : -1,
        number: module.number,
        title: module.title,
        description: module.description,
        styles: {
          icon: this._convertToIconEnum(module.icon),
          color: this._convertToColorEnum(module.color)
        },
        tutorials: module.tutorials.map(tutorial => ({
          id: tutorial.id,
          moduleId: tutorial.moduleId,
          title: tutorial.title,
          durationSeconds: tutorial.durationSeconds,
          videoUrl: tutorial.videoUrl,
          startFilesUrl: tutorial.starterCodeUrl,
          finishedFilesUrl: tutorial.finishedCodeUrl
        }))
      }))
    };
  }

  private _convertToIconEnum(value: string): ModuleStyles['icon'] {
    const validIcons: Record<string, ModuleStyles['icon']> = {
      BOOK: "BOOK", FLAG: "FLAG", TERMINAL: "TERMINAL", WARNING: "WARNING",
      SHIELD: "SHIELD", DATABASE: "DATABASE", LOCK: "LOCK", PLANE: "PLANE"
    };
    return validIcons[value.toUpperCase()] || 'BOOK';
  }
  
  private _convertToColorEnum(value: string): ModuleStyles['color'] {
    const validColors: Record<string, ModuleStyles['color']> = {
      INDIGO: "INDIGO", TEAL: "TEAL", PURPLE: "PURPLE", PINK: "PINK",
      YELLOW: "YELLOW", FUCHSIA: "FUCHSIA", ROSE: "ROSE", SKY: "SKY"
    };
    return validColors[value.toUpperCase()] || 'INDIGO';
  }
  
}


