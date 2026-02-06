import { v4 as uuidv4 } from 'uuid';

export class Requirements {

  constructor(
    public name: string,
    public companyID: string,
    public succeed: boolean = true,
    public timestamp : number= Date.now(),
    public id: string = uuidv4()
  ) { }
}
