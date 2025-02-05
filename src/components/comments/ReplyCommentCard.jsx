import Image from 'next/image'
import React, { useState } from 'react'
import { FaReply } from "react-icons/fa";
import { AiFillDislike, AiFillLike, AiOutlineDislike, AiOutlineLike } from 'react-icons/ai'
import { CustomTimeAgo } from '../utils/timeago'
import { postComment, ReactComment } from './utilFunctions';
import { Comment } from 'react-loader-spinner';

export default function ReplyCommentCard({parentCommentId, comment, animeId, userId}) {

    const [loadingStates, setLoadingStates] = useState({
        addComment: false,
      });
      const [showPostReply, setShowPostReply] = useState(false);
      const [showSpoiler, setShowSpoiler] = useState(!comment?.isSpoiler);
      const [reactionStates, setReactionStates] = useState({
        loading: false,
        isLiked: comment?.userReaction === "like",
        isDisliked: comment?.userReaction === "dislike",
        likesCount: comment?.likes,
        dislikeCount: comment?.dislikes,
      });


      const [commentPayload, setCommentPayload] = useState({
        animeId: animeId,
        userId: userId,
        repliedToUId: comment?.userId,
        parentCommentId: parentCommentId,
        commentBody: "",
        epNo: comment?.epNo,
        isSpoiler: false,
        gogoEpId: comment?.gogoEpId,
        zoroEpId: comment?.zoroEpId,
      });

      const handleLike = async () => {
        setReactionStates((prev) => ({ ...prev, loading: true }));
    
        const res = await ReactComment({
          userId,
          commentId: comment?.commentId,
          reactionType: reactionStates?.isLiked ? null : "like",
        });
        console.log("res of handleLike function => ", res);
    
        if (res?.data?.success) {
          setReactionStates((prev) => ({
            ...prev,
            likesCount: prev?.isLiked ? prev?.likesCount - 1 : prev?.likesCount + 1,
            dislikeCount:
              prev?.dislikeCount !== comment?.dislikes || prev.isDisliked
                ? prev?.dislikeCount - 1
                : prev.dislikeCount,
            isLiked: !prev?.isLiked,
            isDisliked: false,
          }));
        }
    
        setReactionStates((prev) => ({ ...prev, loading: false }));
      };
    
      const handleDislike = async () => {
        setReactionStates((prev) => ({ ...prev, loading: true }));
    
        const res = await ReactComment({
          userId,
          commentId: comment?.commentId,
          reactionType: reactionStates?.isDisliked ? null : "dislike",
        });
        console.log("res of handleDislike funciton => ", res);
    
        if (res?.data?.success) {
          setReactionStates((prev) => ({
            ...prev,
            dislikeCount: prev?.isDisliked
              ? prev?.dislikeCount - 1
              : prev?.dislikeCount + 1,
            likesCount:
              prev?.likesCount !== comment?.likes || prev.isLiked
                ? prev?.likesCount - 1
                : prev.likesCount,
            isDisliked: !prev?.isDisliked,
            isLiked: false,
          }));
        }
    
        setReactionStates((prev) => ({ ...prev, loading: false }));
      };
    
      const handleOnChangeComment = (e) => {
        const body = e.target.value;
        if (body.length > 500) {
          toast.error(`Comment length cannot exceed ${commentLength} characters!`);
          return;
        }
        setCommentPayload((prev) => ({ ...prev, commentBody: body }));
      };
    
      const handleAddComment = async () => {
        //set the add comment loader to true
        setLoadingStates({ ...loadingStates, addComment: true });
    
        const res = await postComment(commentPayload);
        //set the add comment loader to false and reset the comment body and spoiler flag
        setLoadingStates({ ...loadingStates, addComment: false });
        setCommentPayload((prev) => ({
          ...prev,
          commentBody: "",
          isSpoiler: false,
        }));
      };
    



  return (
    <div>
        
        <div className="w-full flex gap-2 items-center my-3">
                <div className="profile p-1 justify-center h-full flex">
                  <div className="img relative w-9 h-9 rounded-full overflow-hidden object-cover ">
                    <Image
                      src={comment?.userProfileUrl || "/logo-teal-stretched.png"}
                      alt="Profile Image"
                      fill
                      className="object-cover "
                    />
                  </div>
                </div>
        
                <div className="contentContainer w-full flex flex-col gap-1 text-sm">
                  <div className="first flex items-center gap-5">
                    <div className="name text-sky-400  font-semibold tracking-wide">
                      {comment?.userName}
                    </div>
                    <div className="name text-gray-400 text-xs">
                      {/* {console.log(new Date(comment?.createdAt))} */}
                      <CustomTimeAgo date={new Date(comment?.createdAt + "Z")} />
                    </div>
                  </div>
        
                  <div
                    className={`body text-sm ${
                      comment?.isSpoiler && !showSpoiler ? "blur-sm" : ""
                    } text-gray-300 w-full text-wrap flex gap-1 items-center`}
                  >
                    <span className='text-fuchsia-400 text-xs flex  '>@{comment?.repliedToUserName}</span> <div> {comment?.body} </div>
                  </div>
                  {comment?.isSpoiler > 0 && (
                    <div className="flex">
                      <button
                        className="spoiler px-1 py-1 my-1 rounded-md !text-xs bg-white text-gray-800"
                        onClick={() => setShowSpoiler((prev) => !prev)}
                      >
                        {showSpoiler ? "Hide Spoiler" : "Unhide Spoiler"}
                      </button>
                    </div>
                  )}
        
                  <div className="reply-reaction flex my-1 text-gray-400 text-xs gap-6 items-center">
                    <button
                      className="reply flex gap-1  items-center"
                      onClick={() => setShowPostReply((prev) => !prev)}
                    >
                      <FaReply /> Reply
                    </button>
        
        
                    <button
                      className="like flex items-center disabled:cursor-progress gap-1 text-xs"
                      disabled={reactionStates.loading}
                      onClick={handleLike}
                    >
                      {reactionStates.isLiked ? (
                        <AiFillLike size={15} className="text-primary-200" />
                      ) : (
                        <AiOutlineLike size={15} />
                      )}
                      {reactionStates?.likesCount > 0 ? reactionStates?.likesCount : ""}
                    </button>
        
        
        
                    <button
                      className="dislike flex items-center disabled:cursor-progress gap-1 text-xs"
                      disabled={reactionStates.loading}
                      onClick={handleDislike}
                    >
                      {reactionStates.isDisliked ? (
                        <AiFillDislike size={15} className="text-red-400" />
                      ) : (
                        <AiOutlineDislike size={15} />
                      )}
                      {reactionStates?.dislikeCount > 0
                        ? reactionStates?.dislikeCount
                        : ""}
                    </button>
        

        
                  </div>
                </div>
              </div>



              {/* //below code is for the posting the reply to the comment  */}
                    {
                      showPostReply && (
                        /* //below is the div of adding the commment */
                        <div className="addcomment flex flex-col w-full ml-12 gap-2">
                          <div className="textarea">
                            <textarea
                              name="add-comment"
                              id=""
                              value={commentPayload.commentBody}
                              disabled={loadingStates.addComment}
                              onChange={handleOnChangeComment}
                              placeholder="Type your Reply here.."
                              className="w-full resize-none rounded-xl p-2 bg-cbg-100/40 focus:outline-none focus:border-2 border-primary-100 text-gray-300"
                            />
                          </div>
                          <div className="buttons flex gap-4 text-gray-400 items-center ml-auto">
                            <label className="flex cursor-pointer items-center gap-1 text-gray-400">
                              <input
                                type="checkbox"
                                checked={commentPayload.isSpoiler}
                                onChange={(e) =>
                                  setCommentPayload((prev) => ({
                                    ...prev,
                                    isSpoiler: e.target.checked,
                                  }))
                                }
                                className="w-3 h-3  rounded-full bg-cbg-400 accent-primary-100"
                                id="spoiler-checkbox"
                              />
                              Spoiler?
                            </label>
              
                            {/* Add Comment Button */}
                            {loadingStates.addComment ? (
                              <Comment
                                visible={true}
                                ariaLabel="comment-loading"
                                wrapperStyle={{}}
                                wrapperClass="comment-wrapper h-8 flex"
                                color="#fff"
                                backgroundColor="#57a6a1"
                              />
                            ) : (
                              <button
                                type="button"
                                className=" text-cbg-200 font-semibold bg-primary-100 px-2 py-1 rounded-md hover:bg-primary-200 transition"
                                onClick={handleAddComment}
                              >
                                Post Reply
                              </button>
                            )}
                          </div>{" "}
                          {/*buttons div ends here*/}
                        </div>
                      ) /* div for adding the reply comment ended here  */
                    }
              




        </div>
  )
}
