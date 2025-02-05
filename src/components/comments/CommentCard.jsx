import Image from "next/image";
import React, { useState } from "react";
import { CustomTimeAgo } from "../utils/timeago";
import { FaReply } from "react-icons/fa";
import { AiFillDislike, AiFillLike, AiOutlineDislike } from "react-icons/ai";
import { AiOutlineLike } from "react-icons/ai";
import {
  debounceGetComments,
  postComment,
  ReactComment,
} from "./utilFunctions";
import toast from "react-hot-toast";
import { Comment } from "react-loader-spinner";
import ReplyCommentCard from "./ReplyCommentCard";

export default function CommentCard({ animeId, comment, userId }) {
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
    parentCommentId: comment?.commentId,
    commentBody: "",
    epNo: comment?.epNo,
    isSpoiler: false,
    gogoEpId: comment?.gogoEpId,
    zoroEpId: comment?.zoroEpId,
  });
  const [showReplies, setShowReplies] = useState(false);
  const [params, setParams] = useState({
    animeId: animeId,
    parentCommentId: comment?.commentId,
    userId: userId,
    epNo: comment?.epNo,
    orderBy: 'createdAt ASC', // for replies we would want that older replies should be shown first and newer replies below them because they can be the replies of replies as well
    limit: 100,
    offset: 0,
  });
  const [replyComments, setReplyComments] = useState();
  // const [isLiked, setIsLiked] = useState(comment?.userReaction === "like");
  // const [isDisliked, setIsDisliked] = useState(comment?.userReaction === "dislike");

  const handleLike = async () => {
    setReactionStates((prev) => ({ ...prev, loading: true }));

    const res = await ReactComment({
      userId,
      commentId: comment?.commentId,
      reactionType: reactionStates?.isLiked ? null : "like",
    });
    console.log("res of handleLike funciton => ", res);

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

  //this function handles the on click trigger of show replies button
  const handleShowReply = async () => {
    setShowReplies(!showReplies);
    if (replyComments) {
      return;
    }
    const res = await debounceGetComments(params);
    setReplyComments(res);
    console.log("fetched comment reply data => ", res);
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
            <div className="name text-sky-400 font-semibold tracking-wide">
              {comment?.userName}
            </div>
            <div className="name text-gray-400 text-xs">
              {/* {console.log(new Date(comment?.createdAt))} */}
              <CustomTimeAgo date={new Date(comment?.createdAt + "Z")} />
            </div>
          </div>

          <div
            className={`body ${
              comment?.isSpoiler && !showSpoiler ? "blur-sm" : ""
            } text-gray-300 w-full text-wrap`}
          >
            {comment?.body}
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



            {comment?.replyCount > 0 && (
              <button
                className="view-replies text-primary-500 font-light"
                onClick={handleShowReply}
              >
                {showReplies
                  ? "Hide Replies"
                  : `Show ${comment.replyCount} Replies`}
              </button>
            )}


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


      {/* //below component renders all the replies of the current comment component */}
      {showReplies && (
        <div className="ml-24 my-4 border-l-[1.5px] border-gray-600 pl-4 flex flex-col gap-6">
          {replyComments?.length > 0 ? (
            replyComments?.map((replyComment) => {
              return (
                <ReplyCommentCard key={replyComment?.commentId} animeId={animeId} comment={replyComment} parentCommentId={comment.commentId} userId={userId}/>
              )
            })
          ) : (
            <div className="text-sm text-red-400">No Replies</div>
          )}
        </div>
      )}
    </div>
  );
}
