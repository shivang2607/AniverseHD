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
     console.log(params);
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
        const res = await axios.post(`/api/v1/comments/${animeId}`, payload);
        // console.log("this is res of postComment function => ",res);

        if(res?.data?.result?.success===true){
            toast.success(res?.data?.message, {duration:3000});
        }

    } catch (error) {
        console.log(error);
        toast.error("Error : Couldn't Post your comment :(", {duration:3000});
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
