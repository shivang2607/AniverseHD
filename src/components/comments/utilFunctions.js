import { getAbsoluteURLPath } from "@/app/watch/[id]/utilFunctions";
import axios from "axios";
import toast from "react-hot-toast";



const commentLength = 500;
const delay = 500;

export function debounce(func, delay) {
    let timer;
    return function (...args) {
      return new Promise((resolve, reject) => {
        clearTimeout(timer);
        timer = setTimeout(async () => {
          try {
            const result = await func.apply(this, args);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }, delay);
      });
    };
  }
  
  
  export async function getCommentById(commentId, userId){
    try {
      if(!userId){
        toast.error("Please Login to view comments");
        return;
      }
      if(!commentId){
        toast.error("Comment Id not found");
        return;
      }
      const res = await axios.get(`/api/v1/comments/id/${commentId}`, {
        headers: {
          'user-id': userId || null
        },
      });
      if(res?.data?.success===true){
            return res?.data?.results?.[0]; //since the output array will always have one element we will return the first element of the array itself
        }
      
    } catch (error) {
      console.log("Error faced while fetching comments => ", error);
        return null;
    }

  }

export async function getComments(params){

    const { 
        animeId,
        epNo,
        // parentCommentId,
        // limit,
        // offset,
        // orderBy,
        // userId,
     } = params;
    //  console.log(params);
     if(!animeId || !epNo){
        toast.error("AnimeId or episode Number not found");
        return;
     }

     try {
        const res = await axios.get(`/api/v1/comments/${animeId}`, {
           params: {...params, userId:null, animeId:null},
            headers: {
              'user-id': params?.userId || null
            },
          });
        // console.log("this is res of getComment function => ",res);

        if(res?.data?.success===true){
            return res?.data?.results;
        }

    } catch (error) {
        console.log("Error faced while fetching comments => ", error);
        return null;
    }
     
    
    
    // Get userId from headers
    // const userId = req.headers.get('user-id');
}

export const debounceGetComments = debounce(getComments, delay); 

export async function postComment(payload){
    const {
        animeId,
        commentBody,
        // repliedToUId,
        // parentCommentId,
        // isSpoiler,
        // epNo,
        // zoroEpId,
        // gogoEpId,
    } = payload;
    
    if(commentBody.trim()===""){
        toast.error("Please type some text");
        return;
    }
    if(commentBody?.length > commentLength){
        toast.error(`Cannot contain more than ${commentLength} characters!`);
        return;
    }
    // console.log(payload);
    // return;

    
    try {
        const searchParams = new URLSearchParams(window.location.search);
        const pathname = window.location.pathname;
        const res = await axios.post(`/api/v1/comments/${animeId}`, {url: getAbsoluteURLPath(pathname, searchParams), ...payload});
        // console.log("this is res of postComment function => ",res);

        if(res?.data?.result?.success===true){
            toast.success(res?.data?.message, {duration:3000});
        }

    } catch (error) {
        console.log(error);
        toast.error("Error : Couldn't Post your comment :(", {duration:3000});
    }
}


export async function putComment(payload){
  const {
      animeId,  
      isSpoiler,
      commentId,
      editableBody,
  } = payload;
  
  if(editableBody.trim()===""){
      toast.error("Please type some text");
      return;
  }
  if(editableBody?.length > commentLength){
      toast.error(`Cannot contain more than ${commentLength} characters!`);
      return;
  }

  if(!commentId){
    toast.error("Comment Id not in the payload.")
  }
  // console.log(payload);
  // return;
  
  try {
      const res = await axios.put(`/api/v1/comments/${animeId}`, { commentId, isSpoiler, commentBody: editableBody});
      // console.log("this is res of postComment function => ",res);

      if(res?.data?.success===true){
          toast.success("Comment Updated successfully", {duration:3000});
      }

  } catch (error) {
      console.log(error);
      toast.error("Error : Couldn't Edit your comment :(", {duration:3000});
  }
}


export  async function ReactComment(payload){
  // const {userId, commentId, reactionType} = payload;
  if(!payload.userId){
    toast.error("Please Login to React :)");
    return;
  }
  try {
    const res = await axios.post(`/api/v1/comments/react`, payload);

    if(res?.data?.success===true){
        // toast.success(res?.data?.message, {duration:3000});
        return res;
    }

} catch (error) {
    console.log(error);
    toast.error("Error : Something went wrong! ", {duration:3000});
    
}
}
