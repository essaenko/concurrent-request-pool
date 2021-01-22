import {
  IRequestPoolCreateTubeProps,
  IRequestPoolDisableTubeProps,
  IRequestPoolEnableTubeProps,
  IRequestPoolInitialProps,
  IRequestPoolJob,
  IRequestPoolPushProps,
  IRequestPoolRemoveProps,
  IRequestPoolRemoveTubeProps,
  IRequestPoolTube
} from "./RequestPool.types";


export class ConcurrentRequestPool {
  private readonly limit;
  private readonly type: 'pop' | 'shift';
  private counter: number = 0;
  private tubes: Record<string, IRequestPoolTube> = {
    default: {
      index: 1,
      jobs: [],
      counter: 0,
      limit: 0,
      enabled: true,
      type: 'pop',
    }
  };

  public constructor({
    limit,
    type,
                     }: IRequestPoolInitialProps = {}) {
    this.limit = limit || 0;
    this.type = type || 'pop';
    this.tubes.default.limit = limit || 0;
    this.tubes.default.type = type || 'pop';
  }

  public get state(): {
    tubes: {
      [x: string]: IRequestPoolTube,
    };
    limit: number;
    type: 'pop' | 'shift';
    counter: number;
  } {
    return {
      tubes: { ...this.tubes },
      limit: this.limit,
      type: this.type,
      counter: this.counter,
    }
  };

  public push = ({
    tube,
    action,
                 }: IRequestPoolPushProps): number | false => {
    let id: number;
    if (!action) {
      console.log(`RequestPool->push: You must provide action field with async action to push new job`);

      return false
    }
    if (!tube) {
      id = this.tubes.default.index++;
      this.tubes.default.jobs.push({
        id,
        action
      });
    } else if (this.tubes[tube]) {
      if (this.tubes[tube].enabled) {
        id = this.tubes[tube].index++;
        this.tubes[tube].jobs.push({
          id,
          action
        });
      } else {
        console.log(`RequestPool->push: Tube with name ${tube} is disabled, enable tube before push new jobs inside`);

        return false;
      }

    } else {
      console.log(`RequestPool->push: There are no tube with name ${tube}, create tube before push jobs inside`)

      return false;
    }

    this.processQueue();

    return id;
  }

  public remove = ({
    tube,
    id,
  }: IRequestPoolRemoveProps): boolean => {
    if (!tube) {
      this.tubes.default.jobs = this.tubes.default.jobs.filter((job: IRequestPoolJob) => job.id !== id);
    } else if (this.tubes[tube]) {
      this.tubes[tube].jobs = this.tubes[tube].jobs.filter((job: IRequestPoolJob) => job.id !== id);
    } else {
      console.log(`RequestPool->remove: There are no tube with name ${tube}, create tube before remove jobs from it`);

      return false;
    }

    return true;
  }

  public createTube = ({
    name,
    limit = 0,
    type,
  }: IRequestPoolCreateTubeProps): boolean => {
    if (this.tubes[name]) {
      console.log(`RequestPool->createTube: Tube with name ${name} already exists`);

      return false
    }
    this.tubes[name] = {
      limit,
      index: 1,
      counter: 0,
      jobs: [],
      enabled: true,
      type: type ? type : this.type,
    };

    return true;
  }

  public removeTube = ({
    name,
  }: IRequestPoolRemoveTubeProps): IRequestPoolJob[] | false => {
    if (name === 'default') {
      console.log(`RequestPool->push: Can't remove default tube`);

      return false;
    }
    if (this.tubes[name]) {
      const jobs: IRequestPoolJob[] = [...this.tubes[name].jobs];
      delete this.tubes[name];

      return jobs;
    } else {
      console.log(`RequestPool->removeTube: There are no tube with name ${name}, create tube before remove it`);

      return false
    }
  }

  public enableTube = ({
    name
  }: IRequestPoolEnableTubeProps): boolean => {
    if (this.tubes[name]) {
      this.tubes[name].enabled = true;
      this.processTube(this.tubes[name]);

      return true;
    } else {
      console.log(`RequestPool->enableTube: There are no tube with name ${name}, create tube before enable it`);

      return false;
    }
  }

  public disableTube = ({
    name,
  }: IRequestPoolDisableTubeProps): boolean => {
    if (this.tubes[name]) {
      this.tubes[name].enabled = false;

      return true;
    } else {
      console.log(`RequestPool->disableTube: There are no tube with name ${name}, create tube before disable it`);

      return false;
    }
  }

  private processTube = (tube: IRequestPoolTube) => {
    if (this.limit === 0 || (this.counter < this.limit)) {
      if (tube.enabled) {
        if (tube.limit === 0 || (tube.counter < tube.limit)) {
          if (tube.jobs.length) {
            let job: IRequestPoolJob;
            if (tube.type === 'pop') {
              job = tube.jobs.pop() as IRequestPoolJob;
            } else {
              job = tube.jobs.shift() as IRequestPoolJob;
            }

            tube.counter++;
            this.counter++;
            job.action().finally(() => {
              this.counter--;
              tube.counter--;

              this.processTube(tube);
            });

            this.processTube(tube);
          }
        }
      }
    }
  }

  private processQueue = () => {
    const tubes: string[] = Object.keys(this.tubes);

    tubes.forEach((tube: string) => {
      this.processTube(this.tubes[tube]);
    });
  }
}