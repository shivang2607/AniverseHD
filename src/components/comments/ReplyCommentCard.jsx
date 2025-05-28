import Image from "next/image";
import React, { useState } from "react";
import { FaReply } from "react-icons/fa";
import {
  AiFillDislike,
  AiFillLike,
  AiOutlineDislike,
  AiOutlineLike,
} from "react-icons/ai";
import { CustomTimeAgo } from "../utils/timeago";
import { postComment, ReactComment } from "./utilFunctions";
import { Comment } from "react-loader-spinner";
import InputCommentDiv from "./InputCommentDiv";
import { MdEdit } from "react-icons/md";
import Link from "next/link";

export default function ReplyCommentCard({
  parentCommentId,
  comment,
  animeId,
  userId,
}) {
  const [loadingStates, setLoadingStates] = useState({
    addComment: false,
  });
  const [showPostReply, setShowPostReply] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
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

  const [editCommentPayload, setEditCommentPayload] = useState({
    ...comment,
    animeId: animeId,
    editableBody: comment.body,
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

        <div className="contentContainer w-full flex flex-col gap-1 md:text-sm">
          <div className="first flex items-center gap-5">
                      <div className="name text-sky-400 font-semibold tracking-wide">
                        {comment?.userName}
                      </div>
                      <div className="name-edited flex gap-1 text-gray-400 text-xs">
                        {/* {console.log(new Date(comment?.createdAt))} */}
                        <CustomTimeAgo date={new Date(comment?.createdAt + "Z")} />
                      <div className="isEdited text-gray-400 text-xs">{comment?.isEdited>0 && "(edited)"}</div>
                      </div>
                    </div>

          {isEdit ? (
            <InputCommentDiv
              commentPayload={editCommentPayload}
              setCommentPayload={setEditCommentPayload}
              isEdit={true}
              setIsEdit={setIsEdit}
            />
          ) : (
            <div
  className={`body text-sm ${
    editCommentPayload?.isSpoiler && !showSpoiler ? "blur-sm" : ""
  } text-gray-300 w-full text-wrap`}
>
  <div className="flex">
    <span className="text-fuchsia-400 items-center  text-sm mr-1">
      <Link href={`/profile/${userId}`}> @{comment?.repliedToUserName}</Link>
    </span>
    <div className="flex-1">{editCommentPayload?.editableBody}</div>
  </div>
</div>
              // {/* in the abve expression since default value of editableBody is that of comment body initially so it workes even before editing, and after editing it changes so no need to reload the comment data */}
          )}
          {editCommentPayload?.isSpoiler > 0 && (
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
            {userId === comment?.userId && (
              <button
                className="edit flex items-center gap-1"
                onClick={() => setIsEdit((prev) => !prev)}
              >
                <MdEdit /> Edit
              </button>
            )}

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

          <InputCommentDiv
            commentPayload={commentPayload}
            setCommentPayload={setCommentPayload}
            isReply={true}
          />
        ) /* div for adding the reply comment ended here  */
      }
    </div>
  );
}
