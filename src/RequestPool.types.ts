export interface IRequestPoolInitialProps {
  limit?: number;
  type?: 'pop' | 'shift';
}

export interface IRequestPoolPushProps {
  tube?: string;
  action: () => Promise<any>;
}

export interface IRequestPoolRemoveProps {
  id: number;
  tube?: string;
}

export interface IRequestPoolJob {
  id: number;
  action: () => Promise<any>;
}

export interface IRequestPoolTube {
  index: number;
  jobs: IRequestPoolJob[],
  limit: number;
  counter: number;
  enabled: boolean;
  type: 'pop' | 'shift';
}

export interface IRequestPoolCreateTubeProps {
  name: string;
  limit?: number;
  type?: 'pop' | 'shift';
}

export interface IRequestPoolRemoveTubeProps {
  name: string;
}

export interface IRequestPoolEnableTubeProps {
  name: string;
}

export interface IRequestPoolDisableTubeProps {
  name: string;
}