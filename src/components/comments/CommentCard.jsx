import Image from "next/image";
import React, { useState } from "react";
import { CustomTimeAgo } from "../utils/timeago";
import { FaReply } from "react-icons/fa";
import { AiFillDislike, AiFillLike, AiOutlineDislike } from "react-icons/ai";
import { AiOutlineLike } from "react-icons/ai";
import {
  debounceGetComments,
  ReactComment,
} from "./utilFunctions";
import { Comment, TailSpin } from "react-loader-spinner";
import ReplyCommentCard from "./ReplyCommentCard";
import InputCommentDiv from "./InputCommentDiv";
import { MdEdit } from "react-icons/md";
import Link from "next/link";

export default function CommentCard({ animeId, comment, userId, loggedInUserData }) {
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
    parentCommentId: comment?.commentId,
    commentBody: "",
    editableBody: comment?.body,
    userName: loggedInUserData?.userName || "",
    epNo: comment?.epNo,
    isSpoiler: false,
    gogoEpId: comment?.gogoEpId,
    zoroEpId: comment?.zoroEpId,
  });
  const [editCommentPayload, setEditCommentPayload] = useState({
    ...comment, animeId: animeId, editableBody: comment.body
  })
  const [showReplies, setShowReplies] = useState(false);
  const [params, setParams] = useState({
    animeId: animeId,
    parentCommentId: comment?.commentId,
    userId: userId,
    epNo: comment?.epNo,
    orderBy: "createdAt ASC", // for replies we would want that older replies should be shown first and newer replies below them because they can be the replies of replies as well
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
          <Link
            href={`/profile/${comment.userId}`}
            className="img relative w-9 h-9 rounded-full overflow-hidden object-cover "
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src={comment?.userProfileUrl || "/logo-teal-stretched.png"}
              alt="Profile Image"
              fill
              className="object-cover "
            />
          </Link>
        </div>

        <div className="contentContainer w-full flex flex-col gap-1 md:text-sm">
          <div className="first flex items-center gap-5">
            <div className="name text-sky-400 font-semibold tracking-wide">
              {comment?.userName}
            </div>
            <div className="name-edited flex gap-1 text-gray-400 text-xs">
              <CustomTimeAgo date={new Date(comment?.createdAt + "Z")} />
              <div className="isEdited text-gray-400 text-xs">
                {comment?.isEdited > 0 && "(edited)"}
              </div>
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
              className={`body ${
                editCommentPayload?.isSpoiler && !showSpoiler ? "blur-sm" : ""
              } text-gray-300 w-full text-wrap`}
            >
              {editCommentPayload?.editableBody}
            </div>
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

          <div className="reply-reaction flex my-1 text-gray-400 md:text-xs text-sm gap-6 items-center">
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
              className="like flex items-center disabled:cursor-progress gap-1 "
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
              className="dislike flex items-center disabled:cursor-progress gap-1 "
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

      {showPostReply && (
        <InputCommentDiv
          commentPayload={commentPayload}
          setCommentPayload={setCommentPayload}
          isReply={true}
        />
      )}

      {showReplies && (
        <div className="md:ml-24 ml-8 my-4 border-l-[1.5px] border-gray-600 pl-4 flex flex-col md:gap-6 gap-2">
          {replyComments?.length > 0 ? (
            replyComments?.map((replyComment) => {
              return (
                <ReplyCommentCard
                  animeId={animeId}
                  key={replyComment.commentId}
                  id={replyComment.commentId}
                  comment={replyComment}
                  loggedInUserData={loggedInUserData}
                  parentCommentId={comment.commentId}
                  userId={userId}
                />
              );
            })
          ) : (
            <div className="text-sm text-red-400">
              <div className="flex m-8 mx-12">
                <TailSpin
                  visible={loadingStates.loadMore}
                  height="32"
                  width="32"
                  color=" #0ea5e9"
                  ariaLabel="tail-spin-loading"
                  radius="2"
                  wrapperStyle={{}}
                  wrapperClass=""
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
