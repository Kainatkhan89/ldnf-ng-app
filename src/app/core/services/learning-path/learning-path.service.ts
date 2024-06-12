import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map, Observable, of, tap} from "rxjs";
import {ILearningPath} from "../../models/learning-path/learning-path.model";
import { ILearningPathDTO } from '../../models/learning-path/learning-path-dto.model';
import { ModuleStyles } from '../../models/learning-path/module.model';
import { LearningPathMapperService } from '../mapper/learning-path-mapper.service';

@Injectable({
  providedIn: 'root'
})
export class LearningPathService {
  private readonly _learningPathApi: string = 'https://localhost:7018/api/course-modules/with-tutorials';

  private _httpClient: HttpClient = inject(HttpClient);
  private _learningPathMapperService: LearningPathMapperService = inject(LearningPathMapperService); 
  private _cachedLearningPathData: ILearningPath | undefined;

  constructor() { }

  getLearningPath$(): Observable<ILearningPath> {
    if (this._cachedLearningPathData) {
      return of(this._cachedLearningPathData);
    } else {
      return this._fetchLearningPath$();
    }
  }

  private _fetchLearningPath$(): Observable<ILearningPath> {
    return this._httpClient.get<ILearningPathDTO>(this._learningPathApi).pipe(
      map(dto => this._learningPathMapperService.transformDtoToLearningPath(dto)), 
      tap(value => {
        console.log(value)
        if (!this._cachedLearningPathData) {
          this._cachedLearningPathData = value;
        } if (!this._cachedLearningPathData) {
          this._cachedLearningPathData = value;
        }
      }),
    );
  }
 
}



