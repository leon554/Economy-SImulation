

const textarea= document.getElementById("activity") as HTMLTextAreaElement

export class ActivityMananger{
    static logActivity(message: string){
        textarea.value += message + "\n"
        textarea.scrollTop = textarea.scrollHeight;
    }
}