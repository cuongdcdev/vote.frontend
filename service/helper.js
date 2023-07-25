import { toast } from "bulma-toast";

export const VToast = (msg, type)=>{
    toast( {
      message: msg,
      type: !type ? "is-success" : type,
      position: "bottom-right",
      dismissible: true 
    } );
}
