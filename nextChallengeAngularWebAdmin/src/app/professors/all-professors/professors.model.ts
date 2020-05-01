import { formatDate } from '@angular/common';
export class Professors {
  id: number;
  img: string;
  name: string;
  email: string;
  date: string;
  gender: string;
  mobile: string;
  department: string;
  degree: string;
  constructor(professors) {
    {
      this.id = professors.id || this.getRandomID();
      this.img = professors.avatar || 'assets/images/user/user1.jpg';
      this.name = professors.name || '';
      this.email = professors.email || '';
      this.date = formatDate(new Date(), 'yyyy-MM-dd', 'en') || '';
      this.gender = professors.gender || '';
      this.mobile = professors.mobile || '';
      this.department = professors.department || '';
      this.degree = professors.degree || '';
    }
  }
  public getRandomID(): string {
    const S4 = () => {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return S4() + S4();
  }
}
