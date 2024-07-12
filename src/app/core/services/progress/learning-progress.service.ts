import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {UserService} from "../user/user.service";
import {TutorialService} from "../tutorial/tutorial.service";
import {BehaviorSubject, catchError, combineLatest, map, Observable, switchMap, take, tap} from "rxjs";
import {IProgress} from "../../models/progress/progress.model";
import {IProgressCardViewModel} from "../../models/view-models/progress-card-view.model";
import {ITutorial} from "../../models/learning-path/tutorial.model";


@Injectable({
  providedIn: 'root'
})
export class LearningProgressService {
  private readonly _progressDataApi: string = 'https://localhost:7018/api/progress';
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
    const userId = this._progressDataSubject.value.userId;
    if (!this.isTutorialCompleted(tutorialId)) {
      this._httpClient.post<IProgress>(`${this._progressDataApi}/complete-tutorial`, {
        userId,
        tutorialId
      }).subscribe({
        next: (progress) => {
          this._progressDataSubject.next(progress);
        },
        error: (err) => console.error('Error when marking tutorial as completed:', err)
      });
    }
  }

  setTutorialAsNotCompleted(tutorialId: number): void {
    const userId = this._progressDataSubject.value.userId;
    if (this.isTutorialCompleted(tutorialId)) {
      this._httpClient.delete(`${this._progressDataApi}/remove-completion`, {
        body: { userId, tutorialId }
      }).subscribe({
        next: () => {
          const filteredIds = this._progressDataSubject.value.completedTutorialIds.filter(id => id !== tutorialId);
          this._progressDataSubject.next({ ...this._progressDataSubject.value, completedTutorialIds: filteredIds });
        },
        error: (err) => console.error('Error when removing tutorial completion:', err)
      });
    }
  }

  resetLearningProgress(): void {
    const userId = this._progressDataSubject.value.userId;
    this._httpClient.delete(`${this._progressDataApi}/remove-all/${userId}`).subscribe({
      next: () => {
        this._progressDataSubject.next({ ...this._progressDataSubject.value, completedTutorialIds: [] });
      },
      error: (err) => console.error('Error when resetting learning progress:', err)
    });
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
        
        return this._httpClient.get<IProgress>(`${this._progressDataApi}/${user.uid}`).pipe(
          catchError((err) => { throw new Error(err) })
        )
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
