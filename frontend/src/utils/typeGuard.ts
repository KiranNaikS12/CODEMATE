import { TutorAdditonal } from "../types/tutorTypes";
import { UserAdditional } from "../types/userTypes";

export function isTutorAdditional(data: UserAdditional | TutorAdditonal) : data is TutorAdditonal {
    return (data as TutorAdditonal).certificate !== undefined
}