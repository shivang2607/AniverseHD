import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import useUserStore from '../ZustandStores/userStore'
import toast from 'react-hot-toast';
import { debounceGetComments, getComments, postComment } from './utilFunctions';
import { Comment } from 'react-loader-spinner';
import { orderBy } from 'lodash';
import CommentCard from './CommentCard';
import InputCommentDiv from './InputCommentDIv';

const commentLength =500;

export default function CommentsContainer({animeId, loggedInUserId, loggedInUserData, epNo, gogoEpId, zoroEpId}) {
    // const {loggedInUserId, loggedInUserData} = useUserStore();
    // console.log("loggedInUserData", loggedInUserData);
    const [loadingStates, setLoadingStates] = useState({
        addComment: false,

    })

    const [commentsData, setCommentsData] = useState();
    const [params, setParams] = useState({
        animeId: animeId,
        userId: loggedInUserId,
        epNo: epNo,
        orderBy: null,
        limit: 10,
        offset: 0
    })
    const [commentPayload, setCommentPayload] = useState({
        animeId: animeId,
        userId: null,
        commentBody: "",
        epNo: epNo,
        isSpoiler: false,
        gogoEpId: gogoEpId,
        zoroEpId: zoroEpId
    })

    useEffect(()=>{
        (async ()=>{
           
        })();
    }, [loggedInUserId])

    useEffect(()=>{
        (async ()=> {
            setCommentPayload(prev => ({...prev, userId: loggedInUserId, zoroEpId, gogoEpId, epNo}));
            
            //? For below code only loggedInUserId was needed as trigger but since we have implemented debounce function of 500ms delay this shouldn't cause any issue.
            if(!epNo)return;
            setParams(prev => ({...prev, userId:loggedInUserId, epNo:epNo}));
        })();
    }, [loggedInUserId, zoroEpId, gogoEpId, epNo])  //Adding zoro and gogo ids are not necessary, having said that its better to have this data as up to date as possible.


    useEffect(()=>{
        //This useEffect triggers whenever the params for comments api changes that means whenever we want to get the comments data from the comments api.
        (async ()=>{
            const res = await debounceGetComments(params);
            setCommentsData(res);
            console.log("fetched comments data => ", res);
        })();
    }, [params]);






  return (
    
    <div className='comments-container flex flex-col gap-4 mx-8 '>
        <h1 className='text-primary-300 text-2xl px-2 font-semibold tracking-wide'>Comments</h1>
        <div className="comments flex text-sm  rounded-xl px-6 py-4 bg-cbg-300/60 flex-col gap-4  min-h-48">

            {loggedInUserId && <div className="post-comment flex flex-col gap-2">
                <div className="user-id flex gap-2 items-center">
                    <div className='relative rounded-full overflow-hidden object-cover object-center h-10 w-10'>
                        <Image src={loggedInUserData?.photoUrl || ""} alt={loggedInUserData?.userName} fill/>
                    </div>
                    <div className="label">Comment as <b className='text-primary-400 font-normal'>{loggedInUserData?.userName}</b></div>
                </div>
            </div>
            }


            {/* //below is the div of adding the commment */}
            
            <InputCommentDiv commentPayload={commentPayload} setCommentPayload={setCommentPayload}/>
            {/* </div>  div for adding the comment ended here  */} 
            
            {/* //div for list of comments begins here */}
            <div className="w-3/5 flex flex-col gap-6 mt-8">
                {commentsData?.map(comment => {
                    return (
                        <CommentCard key={comment.commentId} animeId={animeId} comment={comment} userId={loggedInUserId}/>
                    )
                })}
            </div>

        </div>
    </div>
  )
}
