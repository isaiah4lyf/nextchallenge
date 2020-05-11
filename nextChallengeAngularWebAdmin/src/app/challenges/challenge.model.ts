export class Challenge {
  _id: string;
  Clue: Clue;
  Category: string;
  Points: number;
  CreateDateTime: string;
  Question: string;
  TimeInSeconds: number;
  Answer: string;
  Active: boolean;
  ChallengeType: string;
  MultipleAnswers: [];
  _Levels: [];
  constructor(challenge) {
    {
      this._id = challenge._id || null;
      this.Category = challenge.Category || '';
      this.Points = challenge.Points || '';
      this.CreateDateTime = challenge.CreateDateTime || '';
      this.Question = challenge.Question || '';
      this.TimeInSeconds = challenge.TimeInSeconds || '';
      this.Answer = challenge.Answer || '';
      this.Clue = challenge.Clue || null;
      this.Active = challenge.Active;
      this.ChallengeType = challenge.ChallengeType || "";
      this.MultipleAnswers = challenge.MultipleAnswers || [];
      this._Levels = challenge._Levels || [];
    }
  }

  public getRandomID(): string {
    const S4 = () => {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return S4() + S4();
  }
}
class _Levels {
  _level: string;
  _checked: boolean;
  constructor(level) {
    this._level = level._level || '';
    this._checked = level._checked || false;
  }
}
class Clue {
  Description: string;
  Files: File[];
  Type: string;
  Source: string;
  By: string;
  Licence: string;
  LicenceReference: string;
  constructor(clue) {
    this.Description = clue.Description || '';
    this.Files = clue.Files || null;
    this.Type = clue.Type || '';
    this.Source = clue.Source || '';
    this.By = clue.By || '';
    this.Licence = clue.Licence || '';
    this.LicenceReference = clue.LicenceReference || '';
  }
}

class File {
  _id: string;
  FileBaseUrls: any;
  FileName: string;
  FilePosterUrls: any;
  FileType: string;
  UploadDateTime: string;
  UserID: string;
  constructor(file) {
    this._id = file._id || null;
    this.FileBaseUrls = file.FileBaseUrls || '';
    this.FileName = file.FileName || '';
    this.FilePosterUrls = file.FilePosterUrls || '';
    this.FileType = file.FileType || '';
    this.UploadDateTime = file.UploadDateTime || '';
    this.UserID = file.UserID || null;
  }
}
