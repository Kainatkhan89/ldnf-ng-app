import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {UserService} from "../user/user.service";
import {TutorialService} from "../tutorial/tutorial.service";
import {BehaviorSubject, catchError, combineLatest, from, map, Observable, switchMap, take, tap} from "rxjs";
import {IProgress} from "../../models/progress/progress.model";
import {IProgressCardViewModel} from "../../models/view-models/progress-card-view.model";
import {ITutorial} from "../../models/learning-path/tutorial.model";
import {environment} from "../../../../environments/environment.prod";


@Injectable({
  providedIn: 'root'
})
export class LearningProgressService {
  private readonly _progressDataApi: string = `${environment.apiUrl}/progress`;
  private readonly _preInitializationProgressData: IProgress = { userId: '', completedTutorialIds: [] };

  private _httpClient: HttpClient = inject(HttpClient);
  private _userService: UserService = inject(UserService);
  private _tutorialService: TutorialService = inject(TutorialService);

  private _progressDataSubject: BehaviorSubject<IProgress> = new BehaviorSubject<IProgress>(this._preInitializationProgressData);

  constructor() {
    this._fetchUserProgressData();
  }

  get currentProgress(): IProgress {
    return this._progressDataSubject.getValue();
  }

  getProgressData$(): Observable<IProgress> {
    return this._progressDataSubject.asObservable();
  }

  getPercentageProgress$(): Observable<number> {
    return combineLatest([this._tutorialService.getAllTutorials$(), this.getProgressData$()]).pipe(
      map(([allTutorials, progressData]) => {
        const tutorialsCount: number = allTutorials.length;
        const completedTutorialsCount: number = progressData.completedTutorialIds.length;

        return (completedTutorialsCount / tutorialsCount) * 100;
      })
    )
  }

  setTutorialAsCompleted(tutorialId: number): void {
    if (!this._alreadyCompleted(tutorialId)) {
      const updatedProgress: IProgress = {
        ...this.currentProgress,
        completedTutorialIds: [...this.currentProgress.completedTutorialIds, tutorialId]
      };

      this._callUpdateProgressAPI(updatedProgress);
    }
  }

  setTutorialAsNotCompleted(tutorialId: number): void {
    if (this._alreadyCompleted(tutorialId)) {
      const updatedCompletedTutorialIds: number[] = this.currentProgress.completedTutorialIds.filter(id => id !== tutorialId);

      const updatedProgress: IProgress = {
        ...this.currentProgress,
        completedTutorialIds: updatedCompletedTutorialIds
      };

      this._callUpdateProgressAPI(updatedProgress);
    }
  }

  resetLearningProgress(): void {
    const resetProgress: IProgress = {
      ...this.currentProgress,
      completedTutorialIds: []
    };

    this._callUpdateProgressAPI(resetProgress);
  }

  isTutorialCompleted(tutorialId: number): boolean {
    return this._alreadyCompleted(tutorialId);
  }

  getProgressCardData$(): Observable<IProgressCardViewModel> {
    return combineLatest([ this._tutorialService.getAllTutorials$(), this.getPercentageProgress$(), this.getProgressData$() ]).pipe(
      map(([allTutorialsOFLearningPath, progressPercentage, progressData]) => {
        const lastCompletedTutorial: ITutorial | undefined = this._getLastCompletedTutorial(progressData.completedTutorialIds, allTutorialsOFLearningPath);
        const tutorialToResumeFrom: ITutorial | undefined = this._getTutorialToResumeFrom(lastCompletedTutorial, allTutorialsOFLearningPath);

        return {
          progressPercentage,
          lastCompletedTutorial,
          tutorialToResumeFrom
        }
      }
    ));
  }

  private _fetchUserProgressData(): void {
    this._userService.user$.pipe(
      take(1),
      switchMap(user => {
        if (!user || !user.uid) {
          throw new Error('User ID not found');
        }

        return from(user.getIdToken()).pipe(
          switchMap(token => {
            const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
            return this._httpClient.get<IProgress>(`${this._progressDataApi}`, { headers }).pipe(
              catchError((err) => { throw new Error(err) })
            );
          })
        );
      }),
      tap(value => {
        this._progressDataSubject.next(value);
      })
    ).subscribe(
      {
        error: err => console.error('Failed to fetch user progress data', err)
      }
    );
  }

  private _callUpdateProgressAPI(updatedProgress: IProgress): void {
    this._userService.user$.pipe(
      take(1),
      switchMap(user => {
        if (!user || !user.uid) {
          throw new Error('User ID not found');
        }

        return from(user.getIdToken()).pipe(
          switchMap(token => {
            const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
            return this._httpClient.post(`${this._progressDataApi}`, { completedTutorials: updatedProgress.completedTutorialIds }, { headers }).pipe(
              tap(() => {
                this._progressDataSubject.next(updatedProgress);
              }),
              catchError((err) => { throw new Error(err) })
            );
          })
        );
      })
    ).subscribe(
      {
        error: err => console.error('Failed to update user progress', err)
      }
    );
  }

  private _alreadyCompleted(tutorialId: number): boolean {
    return this._progressDataSubject.getValue().completedTutorialIds.includes(tutorialId);
  }

  private _getLastCompletedTutorial(completedTutorialIds: number[], allTutorials: ITutorial[]): ITutorial | undefined {
    const lastCompletedTutorialId: number | undefined = completedTutorialIds[completedTutorialIds.length - 1];
    if (lastCompletedTutorialId === undefined) {
      return undefined;
    }

    return allTutorials.find(tutorial => tutorial.id === lastCompletedTutorialId);
  }

  private _getTutorialToResumeFrom(lastCompletedTutorial: ITutorial | undefined, allTutorials: ITutorial[]): ITutorial | undefined {
    if (lastCompletedTutorial) {
      const lastCompletedTutorialIndex = allTutorials.findIndex(tutorial => tutorial.id === lastCompletedTutorial.id);
      return allTutorials[lastCompletedTutorialIndex + 1];
    } else {
      const firstTutorialOfLearningPath: ITutorial = allTutorials[0];
      return firstTutorialOfLearningPath ? firstTutorialOfLearningPath : undefined;
    }
  }
}
