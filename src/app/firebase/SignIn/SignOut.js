import {
    signOut,
  } from "firebase/auth";
  
  import { auth } from "../firebaseinit";
  import Cookies from "js-cookie";
 
  
  export default async function SignOut() {
    try {
      await signOut(auth);
      Cookies.remove('user')
    } catch (error) {
      return { status: 'error', message: error.message, error };
    }
  }
  