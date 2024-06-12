export interface ILearningPathDTO {
    modules: ICourseModuleDTO[];
}

export interface ICourseModuleDTO {
    id?: number;
    number: number;
    title: string;
    description: string;
    icon: string;
    color: string;
    tutorials: ITutorialDTO[];
}

export interface ITutorialDTO {
    id: number;
    moduleId: number;
    title: string;
    durationSeconds: number;
    videoUrl: string;
    starterCodeUrl: string;
    finishedCodeUrl: string;
}