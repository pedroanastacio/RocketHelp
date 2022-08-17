import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export function dateFormat(timestamp: FirebaseFirestoreTypes.Timestamp) {
    if(timestamp) {
        const date = new Date(timestamp.toDate());
        const day = `${pad(date.getDate())}/${pad(date.getMonth()+1)}/${date.getFullYear()}`;
        const hour = date.toLocaleTimeString("pt-BR");

        return `${day} às ${hour}`;
    }
}

function pad(number: number) {
    return number < 10 ? `0${number}` : number;
}