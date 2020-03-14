import { DateOfBirth } from "./date-of-birth";

export class User {
    constructor(
        public DateOfBirth: DateOfBirth,
        public Gender: string
    ){}
}
