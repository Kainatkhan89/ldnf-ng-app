import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {from, map, Observable, of, switchMap, tap} from "rxjs";
import {ILearningPath} from "../../models/learning-path/learning-path.model";
import { ILearningPathDTO } from '../../models/learning-path/learning-path-dto.model';
import { LearningPathMapperService } from '../mapper/learning-path-mapper.service';
import {UserService} from "../user/user.service";
import {environment} from "../../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class LearningPathService {
  private readonly _learningPathApi: string = `${environment.apiUrl}/learning-path`;

  private _httpClient: HttpClient = inject(HttpClient);
  private _userService: UserService = inject(UserService);
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
    return this._userService.user$.pipe(
      switchMap(user => {
        if (user) {
          return from(user.getIdToken()).pipe(
            switchMap(token => {
              const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
              return this._httpClient.get<ILearningPathDTO>(this._learningPathApi, { headers });
            })
          );
        } else {
          throw new Error('User not authenticated');
        }
      }),
      map(dto => this._learningPathMapperService.transformDtoToLearningPath(dto)),
      tap(value => {
        console.log(value);
        if (!this._cachedLearningPathData) {
          this._cachedLearningPathData = value;
        }
      })
    );
  }
}

